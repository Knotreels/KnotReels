'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center px-6 text-center space-y-6">
      <h1 className="text-4xl font-bold">Welcome to KnotReels 👋</h1>

      <p className="text-gray-300 max-w-md">
        We’re a creative community built for filmmakers, storytellers, and dreamers. 🌍✨
        <br /><br />
        Get <span className="text-blue-400 font-semibold">2 months FREE</span> —
        then just <span className="text-green-400 font-semibold">$2.99/month</span> to stay in the loop.
      </p>

      <Link href="/signup">
        <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg rounded-md transition">
          🎬 Start Free Trial
        </Button>
      </Link>

      <Link
        href="/login"
        className="text-blue-400 hover:underline text-sm mt-2"
      >
        Already have an account? Sign in here
      </Link>

      <p className="text-sm text-gray-500">
        You won’t be charged until after your free trial ends.
      </p>
    </div>
  );
}
