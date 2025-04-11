"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { navSections } from "@/components/navItems";
import { collection, getDocs } from "firebase/firestore";

// Socials
import { FaXTwitter, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

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

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchEndX - touchStartX;

    if (distance > 70) setCollapsed(false);
    if (distance < -70) setCollapsed(true);

    setTouchStartX(null);
    setTouchEndX(null);
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
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className={`sticky top-0 h-screen bg-[#0a0a0a] text-white p-4 z-50 transform transition-all duration-300
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  ${collapsed ? "w-20" : "w-64"} md:flex md:flex-col`}
>
  {/* Collapse toggle */}
  <div className="flex justify-between items-center mb-4">
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="p-2 rounded-md bg-zinc-800 text-gray-400 hover:text-white transition"
      aria-label="Toggle Sidebar"
    >
      {collapsed ? <FaChevronRight className="w-4 h-4" /> : <FaChevronLeft className="w-4 h-4" />}
    </button>
    <button
      className="text-white text-xl md:hidden"
      onClick={onClose}
      aria-label="Close Sidebar"
    >
      <FaTimes />
    </button>
  </div>

  {/* Featured Section */}
  {!collapsed && (
    <Link href="/dashboard/orin">
      <div className="relative w-full rounded-xl overflow-hidden mb-4 shadow-lg group transition hover:shadow-[0_0_20px_4px_rgba(59,130,246,0.8)]">
        <img
          src="/orin-poster.jpg"
          alt="Tales of Orin"
          className="w-full h-40 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
          <h3 className="text-sm font-bold text-white">Tales of Orin</h3>
          <p className="text-xs text-gray-300">Step into the cinematic saga</p>
        </div>
      </div>
    </Link>
  )}

  {/* Scrollable area with hover scrollbar */}
  <div className="flex-1 overflow-y-hidden hover:overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 space-y-4">
    {/* Search */}
    {!collapsed && (
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search creators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )}

    {searchResults.length > 0 && !collapsed && (
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

    {/* Monetization */}
    <div className="space-y-2">
      {!collapsed && (
        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wide mt-6">Monetization</h3>
      )}
      <button
        onClick={handleStripeOnboard}
        className="w-full p-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm font-medium transition flex items-center justify-center gap-2"
      >
        {!collapsed && "Get Tipped!"}
      </button>
    </div>

    {/* Nav Sections */}
    {navSections.map(({ heading, items }) => (
      <div key={heading} className="space-y-2">
        {!collapsed && (
          <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wide mt-6">{heading}</h3>
        )}
        {items.map(({ label, icon: Icon, href, external }) => (
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
            {!collapsed && <span className="text-sm font-light tracking-wide">{label}</span>}
          </Link>
        ))}
      </div>
    ))}

    {/* Socials */}
    <div className="space-y-2">
      {!collapsed && (
        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wide mt-6">Socials</h3>
      )}
      <div className="flex flex-col gap-3 px-2 text-white">
        <a href="https://x.com/KnotReels" target="_blank" className="flex items-center gap-2 hover:text-white transition">
          <FaXTwitter className="w-5 h-5 text-white" />
          {!collapsed && <span className="text-sm"></span>}
        </a>
        <a href="https://www.instagram.com/__knotreels__" target="_blank" className="flex items-center gap-2 hover:text-pink-500 transition">
          <FaInstagram className="w-5 h-5 text-pink-500" />
          {!collapsed && <span className="text-sm">Instagram</span>}
        </a>
        <a href="https://facebook.com/yourhandle" target="_blank" className="flex items-center gap-2 hover:text-blue-500 transition">
          <FaFacebook className="w-5 h-5 text-blue-500" />
          {!collapsed && <span className="text-sm">Facebook</span>}
        </a>
        <a href="https://www.tiktok.com/@knotreels" target="_blank" className="flex items-center gap-2 hover:text-white transition">
          <FaTiktok className="w-5 h-5 text-white" />
          {!collapsed && <span className="text-sm">TikTok</span>}
        </a>
      </div>
    </div>
  </div>

  {/* Footer - always visible below */}
  <div className="mt-6">
    {!collapsed && (
      <Link
        href="/terms"
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
      >
        Terms & Conditions
      </Link>
    )}
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
      {!collapsed && "Sign Out"}
    </button>
  </div>
</aside>
    </>
  );
}