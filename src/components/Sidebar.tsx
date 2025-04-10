"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { FaTimes } from "react-icons/fa";
import { navItems } from "@/components/navItems";
import { collection, getDocs } from "firebase/firestore";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      const snapshot = await getDocs(collection(db, "users"));
      const query = searchTerm.toLowerCase();

      const matched = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user: any) =>
          user.username?.toLowerCase().includes(query)
        );

      setSearchResults(matched);
    };

    fetchUsers();
  }, [searchTerm]);

  const handleStripeOnboard = async () => {
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser?.uid }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start Stripe onboarding.");
      }
    } catch (err) {
      console.error("Stripe onboarding error:", err);
      alert("Something went wrong while connecting to Stripe.");
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] text-white p-6 z-50 transform transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:flex md:flex-col md:translate-x-0`}
      >
        <button
          className="text-white text-xl absolute top-4 right-4 md:hidden"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="bg-zinc-900 p-2 rounded mb-4 max-h-48 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="text-sm text-blue-400 hover:underline cursor-pointer"
                onClick={() => {
                  router.push(`/creator/${user.username}`);
                  onClose();
                }}
              >
                @{user.username}
              </div>
            ))}
          </div>
        )}

        {/* 🔗 Stripe Onboarding Link */}
        <button
          onClick={handleStripeOnboard}
          className="w-full mb-4 p-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-medium transition"
        >
          💼 Set Up Stripe
        </button>

        <div className="space-y-4 mt-4 overflow-y-auto max-h-full">
          {navItems.map(({ label, icon: Icon, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              className={`flex items-center gap-3 p-2 rounded hover:bg-zinc-800 transition ${
                pathname === href ? "bg-blue-700 text-white" : "text-gray-300"
              }`}
              onClick={onClose}
            >
              <Icon className="text-lg" />
              <span>{label}</span>
            </Link>
          ))}

          <Link href="/dashboard/orin">
            <div className="relative w-full rounded-xl overflow-hidden mt-8 shadow-lg group transition hover:shadow-[0_0_20px_4px_rgba(59,130,246,0.8)]">
              <img
                src="/orin-poster.jpg"
                alt="Tales of Orin"
                className="w-full h-40 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-lg font-bold text-white drop-shadow-sm">
                  Tales of Orin
                </h3>
                <p className="text-xs text-gray-300">
                  Step into the cinematic saga
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/terms"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition mt-6"
          >
            Terms & Conditions
          </Link>

          <button
            onClick={async () => {
              try {
                await signOut(auth);
                onClose?.();
                router.push("/login");
              } catch (error) {
                console.error("Sign out failed:", error);
              }
            }}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-white transition mt-2"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
