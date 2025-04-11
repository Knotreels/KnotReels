'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipId: string;
}

export default function CommentModal({ isOpen, onClose, clipId }: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!clipId) return;

    const q = query(
      collection(db, 'comments'),
      where('clipId', '==', clipId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => doc.data());
      setComments(all);
    });

    return () => unsubscribe();
  }, [clipId]);

  const handleSubmit = async () => {
    if (!comment.trim() || !currentUser?.uid) return;

    await addDoc(collection(db, 'comments'), {
      clipId,
      text: comment,
      user: currentUser.displayName || 'Anonymous',
      avatar: currentUser.photoURL || '/default-avatar.png',
      createdAt: Timestamp.now(),
    });

    setComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-[#0a0a0a] text-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-semibold mb-4">💬 Comments</h2>

        {/* Comments list */}
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4 border border-zinc-800 p-2 rounded bg-zinc-900/60 scrollbar-thin scrollbar-thumb-zinc-600">
          {comments.length > 0 ? (
            comments.map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <Image
                  src={c.avatar || '/default-avatar.png'}
                  alt="user"
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
                <div className="bg-zinc-800 px-3 py-2 rounded-lg w-full">
                  <p className="text-xs text-white font-semibold">{c.user}</p>
                  <p className="text-sm text-gray-300">{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
          )}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-800 text-white outline-none border border-zinc-600"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded font-medium transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
