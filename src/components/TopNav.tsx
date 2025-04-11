'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import rawNavItems from './Sidebar'; // Ensure rawNavItems is correctly typed or transformed

// Transform rawNavItems to match NavItem[] if necessary
const navItems: NavItem[] = Array.isArray(rawNavItems)
  ? rawNavItems.map(item => ({
      label: item.label,
      icon: item.icon,
      href: item.href,
      external: item.external || false,
    }))
  : [];

interface NavItem {
  label: string;
  icon: JSX.Element; // Explicitly typing icon as JSX.Element
  href: string;
  external?: boolean;
}

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-black text-white px-4 py-3 flex justify-between items-center shadow">
      <h1 className="text-lg font-bold">KnotReels</h1>

      <button onClick={() => setIsOpen(!isOpen)} className="text-white">
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-3/4 h-full bg-[#0a0a0a] p-6 z-40 flex flex-col gap-6 shadow-xl transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>

          {navItems.map(({ label, icon, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              className={`flex items-center gap-3 text-sm font-medium transition ${
                pathname === href ? 'text-blue-500' : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 mt-6 text-red-400 hover:text-white transition text-sm"
          >
            <span className="text-base">⎋</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}