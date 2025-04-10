'use client';

import { motion } from 'framer-motion';

const OrinPage = () => {
  return (
    <main className="relative bg-black text-white px-6 py-12 flex flex-col items-center justify-center overflow-hidden min-h-screen">
      {/* 🌌 Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-top opacity-70"
        style={{ backgroundImage: "url('/orin-poster.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/30" />

      <div className="relative z-10 max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold text-blue-500 drop-shadow mb-6"
        >
          🌀 Tales of Orin
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl italic max-w-2xl mx-auto text-gray-300 mb-12"
        >
          An open-world, AI-powered story universe. Enter the multiverse, shape your own version of Orin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-[#111] bg-opacity-90 border border-blue-600 rounded-lg p-6 space-y-5 text-left"
        >
          <h2 className="text-2xl font-semibold text-blue-400">What is Tales of Orin?</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>It's a structured story with a defined start and end — created by you.</li>
            <li>AI creators & viewers can jump in and fill the gaps however they want.</li>
            <li>Each entry costs <span className="text-blue-300 font-medium">$1</span> to join — or is <span className="text-green-400">free for KnotReels subscribers</span> ($2/month).</li>
            <li>The world is open and decentralized — creators build their own paths.</li>
            <li>Think of it like an evolving AI film/game multiverse 🌌</li>
            <li>Orin morphs into new versions of themselves every <span className="text-blue-300">10 seconds</span>.</li>
            <li>Visual + narrative flexibility for creators experimenting with character evolution.</li>
            <li>Encourages wild collaboration, chaos, and storytelling freedom.</li>
          </ul>

          <div className="mt-8 p-4 bg-blue-950 border border-blue-700 rounded-md text-center">
            <p className="text-lg font-semibold text-blue-400 mb-2">🎬 Coming Soon</p>
            <p className="text-gray-400">Enter the Orinverse soon... stay tuned.</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default OrinPage;
