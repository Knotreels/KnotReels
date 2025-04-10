// src/components/Footer.tsx

import Link from "next/link";
import { FaXTwitter, FaInstagram, FaFacebook } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#0e0e0e] text-gray-400 py-8 px-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* 🔗 Social Links */}
        <div className="flex gap-6 text-xl">
          <a href="https://x.com/yourhandle" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            <FaXTwitter />
          </a>
          <a href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            <FaInstagram />
          </a>
          <a href="https://facebook.com/yourhandle" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            <FaFacebook />
          </a>
        </div>

        {/* 📄 Terms Link */}
        <div className="text-sm">
          <Link href="/terms" className="hover:underline hover:text-white">
            KnotReels Terms of Use
          </Link>
        </div>
      </div>

      {/* 🔒 Bottom note */}
      <div className="text-xs text-center mt-6 text-gray-500">
        © {new Date().getFullYear()} KnotReels, Inc. All rights reserved.
      </div>
    </footer>
  );
}
