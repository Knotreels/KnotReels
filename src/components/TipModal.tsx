'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';

export function TipModal({ creatorId, username }: { creatorId: string; username: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(500); // default to $5
  const [loading, setLoading] = useState(false);

  const sendTip = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, creatorId }),
      });
  
      // ✅ Handle non-OK responses safely
      if (!res.ok) {
        const error = await res.json();
        toast({
          title: 'Tip failed',
          description: error?.error || 'Something went wrong',
        });
        return;
      }
  
      const data = await res.json();
  
      if (data?.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        toast({
          title: 'Tip failed',
          description: data.error || 'Something went wrong',
        });
      }
    } catch (err) {
      console.error('💸 Tip error:', err);
      toast({ title: 'Something went wrong while tipping.' });
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };
  

  return (
    <>
      <Button
        variant="outline"
        className="border-blue-400 text-blue-400 hover:bg-blue-900"
        onClick={() => setIsOpen(true)}
      >
        💸 Tip Creator
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1a1a1a] rounded-lg max-w-sm w-full p-6 border border-gray-700 shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-4 text-white">
              Tip {username}
            </Dialog.Title>

            <select
              className="w-full bg-[#111] border border-gray-600 text-white p-2 rounded mb-4"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            >
              <option value={100}>$1</option>
              <option value={300}>$3</option>
              <option value={500}>$5</option>
              <option value={1000}>$10</option>
              <option value={2000}>$20</option>
            </select>

            <div className="flex justify-between gap-3">
              <Button
                onClick={sendTip}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Sending...' : 'Send Tip'}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
