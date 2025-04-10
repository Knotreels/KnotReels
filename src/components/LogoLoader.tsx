'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LogoLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: [0.8, 1.05, 1] }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <Image
          src="/logo-kr.jpg" // ✅ Make sure this matches the file in /public
          alt="KnotReels Logo"
          width={120}
          height={120}
          className="rounded-md"
        />
      </motion.div>
    </div>
  );
}
