'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipId: string;
}

interface CommentData {
  id: string;
  clipId: string;
  text: string;
  userId?: string;
  user?: string;
  username?: string;
  avatar?: string;
  createdAt: Timestamp;
}

export default function CommentModal({
  isOpen,
  onClose,
  clipId,
}: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<CommentData[]>([]);
  // grab `user` from context, rename to `currentUser`
  const { user: currentUser } = useAuth();

  // load comments
  useEffect(() => {
    if (!clipId) return;
    const q = query(
      collection(db, 'comments'),
      where('clipId', '==', clipId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const all: CommentData[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setComments(all);
    });
    return () => unsub();
  }, [clipId]);

  // submit new comment
  const handleSubmit = async () => {
    if (!comment.trim() || !currentUser?.uid) return;

    // load the Firestore user doc to get the real username
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.warn('No user doc found');
      return;
    }
    const userData = userSnap.data() as any;
    const username = userData.username;
    const avatar = userData.avatar || '/default-avatar.png';

    if (!username || typeof username !== 'string') {
      console.warn('Username missing on user doc:', userData);
      return;
    }

    // write the comment
    await addDoc(collection(db, 'comments'), {
      clipId,
      text: comment.trim(),
      userId: currentUser.uid,
      username,                // ← real user name
      avatar,
      createdAt: Timestamp.now(),
    });

    setComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-[#0a0a0a] text-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Comments</h2>

        {/* Comments list */}
        <div className="max-h-64 overflow-y-auto mb-4 space-y-3 bg-zinc-900/60 p-2 rounded scrollbar-thin scrollbar-thumb-zinc-600">
          {comments.length ? (
            comments.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 text-sm text-gray-300"
              >
                <Image
                  src={c.avatar!}
                  alt={c.username ?? c.user ?? 'avatar'}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
                <div className="bg-zinc-800 px-3 py-2 rounded-lg w-full">
                  {/* render the new username field (fallback to old user) */}
                  <p className="text-xs text-white font-semibold">
                    {c.username ?? c.user}
                  </p>
                  <p className="text-sm text-gray-300">{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No comments yet. Be the first!
            </p>
          )}
        </div>

        {/* Add comment */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-800 text-white border border-zinc-600 outline-none"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
