'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function SubscribePage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=subscribe'); // <-- 👈 Send to LOGIN
    }
  }, [loading, currentUser, router]);
  

  const handleSubscribe = async () => {
    if (loading || isSubmitting) return;

    // ✅ Extract the email freshly here
    const email =
      currentUser?.email ||
      currentUser?.providerData?.[0]?.email ||
      null;

    console.log('📧 About to send email to Stripe:', email);

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      alert('❌ Could not find a valid email. Please sign in again.');
      console.warn('⛔️ Email missing or invalid:', email);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❌ Stripe API Error:', data.error);
        throw new Error(data.error || 'Stripe session failed');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('❌ Stripe session failed. Please try again.');
      }
    } catch (error) {
      console.error('🔥 Subscribe Error:', error);
      alert('❌ An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center px-6 text-center space-y-6">
      <h1 className="text-4xl font-bold">Welcome to KnotReels 👋</h1>

      <p className="text-gray-300 max-w-md">
        We’re a creative community built for filmmakers, storytellers, and dreamers. 🌍✨
        <br /><br />
        Get <span className="text-blue-400 font-semibold">2 months FREE</span> — then just{' '}
        <span className="text-green-400 font-semibold">$2.99/month</span> to stay in the loop.
      </p>

      {currentUser && (
        <Button
          onClick={handleSubscribe}
          disabled={loading || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg rounded-md transition"
        >
          {isSubmitting ? 'Processing...' : '🎬 Start Free Trial'}
        </Button>
      )}

      <p className="text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="text-blue-400 hover:underline">Sign in here</a>
      </p>

      <p className="text-sm text-gray-500">
        You won’t be charged until after your free trial ends.
      </p>
    </div>
  );
}
