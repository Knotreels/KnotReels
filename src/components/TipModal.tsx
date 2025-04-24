// src/components/TipModal.tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';

export function TipModal({ creatorId, username }: { creatorId: string; username: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  const sendTip = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ amount, creatorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        toast({
          title: 'Tip failed',
          description: data.error || 'Could not start payment.',
        });
      } else {
        window.location.href = data.url;
      }
    } catch (e) {
      toast({ title: 'Network error', description: 'Could not reach server.' });
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
        <div className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700">
            <Dialog.Title className="text-lg font-bold text-white mb-4">
              Tip {username}
            </Dialog.Title>
            <select
              className="w-full bg-[#111] border border-gray-600 text-white p-2 rounded mb-4"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            >
              {[100,300,500,1000,2000].map(v => (
                <option key={v} value={v}>${v/100}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <Button
                onClick={sendTip}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Sending...' : 'Send Tip'}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
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
