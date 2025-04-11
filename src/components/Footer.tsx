// src/components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0e0e0e] text-gray-400 py-8 px-6 border-t border-gray-800">
      
      {/* 🔒 Bottom note */}
      <div className="text-xs text-center mt-6 text-gray-500">
        © {new Date().getFullYear()} KnotReels, Inc. All rights reserved.
      </div>
    </footer>
  );
}
