'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { navSections } from '@/components/navItems';
import { collection, getDocs } from 'firebase/firestore';
import { FaXTwitter, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa6';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      const snapshot = await getDocs(collection(db, 'users'));
      const q = searchTerm.toLowerCase();
      const matched = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((user: any) =>
          user.username?.toLowerCase().includes(q)
        );
      setSearchResults(matched);
    }
    fetchUsers();
  }, [searchTerm]);

  const handleStripeOnboard = async () => {
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.currentUser?.uid }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start Stripe onboarding.');
      }
    } catch (err) {
      console.error('Stripe onboarding error:', err);
      alert('Something went wrong while connecting to Stripe.');
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.changedTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX == null || touchEndX == null) return;
    const delta = touchEndX - touchStartX;
    if (delta > 70) setCollapsed(false);
    if (delta < -70) setCollapsed(true);
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          sticky top-0 h-screen bg-[#0a0a0a] text-white p-4 z-50
          transform transition-all duration-300
          ${isOpen ? 'translate-x-30' : '-translate-x-full'}
          ${collapsed ? 'w-20' : 'w-[300px]'}
          md:flex md:flex-col
        `}
      >
        {/* Collapse toggle */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar"
            className="p-2 rounded-md bg-zinc-800 text-gray-400 hover:text-white transition"
          >
            {collapsed ? (
              <FaChevronRight className="w-4 h-4" />
            ) : (
              <FaChevronLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            aria-label="Close Sidebar"
            className="md:hidden text-white text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Featured Creator Card */}
        {!collapsed && (
          <Link href="/dashboard/orin">
            <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden shadow-lg group transition hover:shadow-[0_0_20px_4px_rgba(59,130,246,0.8)]">
              <img
                src="/orin-poster.jpg"
                alt="Tales of Orin"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                <h3 className="text-sm font-bold text-white">Tales of Orin</h3>
                <p className="text-xs text-gray-300">
                  Step into the cinematic saga
                </p>
              </div>
            </div>
          </Link>
        )}

        <div className="flex-1 overflow-y-hidden hover:overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {/* Search */}
          {!collapsed && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search creators..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {searchResults.length > 0 && !collapsed && (
            <div className="bg-zinc-900 p-2 rounded mb-4 max-h-48 overflow-y-auto">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    router.push(`/creator/${user.username}`);
                    onClose();
                  }}
                  className="text-sm text-blue-400 hover:underline cursor-pointer"
                >
                  @{user.username}
                </div>
              ))}
            </div>
          )}

          {/* Monetization */}
          <div className="space-y-2">
            {!collapsed && (
              <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wide mt-6">
                Monetization
              </h3>
            )}
            <button
              onClick={handleStripeOnboard}
              className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm font-medium"
            >
              {!collapsed ? 'Get Tipped!' : <FaXTwitter className="w-5 h-5" />}
            </button>
          </div>

          {/* Nav Sections */}
          {navSections.map(({ heading, items }) => (
            <div key={heading} className="space-y-2">
              {!collapsed && (
                <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wide mt-6">
                  {heading}
                </h3>
              )}
              {items.map(({ label, icon: Icon, href, external }) => {
                const finalHref =
                  label === 'Comic Books' ? '/comics' : href;
                const isActive = pathname === finalHref;
                return (
                  <Link
                    key={label}
                    href={finalHref}
                    target={external ? '_blank' : undefined}
                    onClick={onClose}
                    className={`flex items-center gap-3 p-2 rounded transition hover:bg-zinc-800 ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="text-lg" />
                    {!collapsed && (
                      <span className="text-sm font-light tracking-wide">
                        {label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Socials */}
          <div className="space-y-2">
            {!collapsed && (
              <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wide mt-6">
                Socials
              </h3>
            )}
            <div className="flex flex-col gap-3 px-2 text-white">
              <a
                href="https://x.com/KnotReels"
                target="_blank"
                className="flex items-center gap-2 hover:text-white"
              >
                <FaXTwitter className="w-5 h-5" />
                {!collapsed && <span className="text-sm">X</span>}
              </a>
              <a
                href="https://www.instagram.com/__knotreels__"
                target="_blank"
                className="flex items-center gap-2 hover:text-pink-500"
              >
                <FaInstagram className="w-5 h-5 text-pink-500" />
                {!collapsed && <span className="text-sm">Instagram</span>}
              </a>
              <a
                href="https://facebook.com/yourhandle"
                target="_blank"
                className="flex items-center gap-2 hover:text-blue-500"
              >
                <FaFacebook className="w-5 h-5 text-blue-500" />
                {!collapsed && <span className="text-sm">Facebook</span>}
              </a>
              <a
                href="https://www.tiktok.com/@knotreels"
                target="_blank"
                className="flex items-center gap-2 hover:text-white"
              >
                <FaTiktok className="w-5 h-5" />
                {!collapsed && <span className="text-sm">TikTok</span>}
              </a>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-6">
            {!collapsed && (
              <Link
                href="/terms"
                onClick={onClose}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white"
              >
                Terms & Conditions
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={async () => {
              await signOut(auth);
              onClose();
              router.push('/login');
            }}
            className="flex items-center gap-2 mt-2 text-xs text-red-400 hover:text-white transition"
          >
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Coming Soon Modal */}
      <Transition appear show={showComingSoon} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowComingSoon(false)}
        >
          <div className="fixed inset-0 bg-black/30" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Coming Soon
                </Dialog.Title>
                <p className="mt-2 text-sm text-gray-500">
                  This feature is under development. Stay tuned!
                </p>
                <div className="mt-4">
                  <Button onClick={() => setShowComingSoon(false)}>
                    Got it, thanks!
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
