'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface Props {
  clipId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export default function ClipCommentModal({ clipId, isOpen, onClose }: Props) {
  const { user: currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  // subscribe to comments for this clip
  useEffect(() => {
    if (!clipId) return;
    const q = query(
      collection(db, 'comments'),
      where('clipId', '==', clipId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setComments(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as Comment))
      );
    });
    return () => unsub();
  }, [clipId]);

  const handlePost = async () => {
    if (!newComment.trim() || !currentUser?.uid) return;
    setPosting(true);
    try {
      // grab your user’s record to get their username/avatar
      const userDoc = await db.doc(`users/${currentUser.uid}`).get();
      const u = userDoc.data() || {};
      await addDoc(collection(db, 'comments'), {
        clipId,
        user: u.username || 'Unknown',
        avatar: u.avatar || '/default-avatar.png',
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-[#121212] w-full max-w-md rounded-lg p-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-semibold mb-4">Comments</h2>

        <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
          {comments.length > 0 ? (
            comments.map(c => (
              <div key={c.id} className="flex items-start gap-3">
                <Image
                  src={c.avatar!}
                  alt={c.user}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
                <div className="bg-zinc-800 p-2 rounded-lg flex-1">
                  <p className="text-xs font-semibold">{c.user}</p>
                  <p className="text-sm">{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No comments yet</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 bg-zinc-800 rounded border border-zinc-600 outline-none"
            placeholder="Write a comment…"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={posting}
          />
          <button
            onClick={handlePost}
            disabled={posting}
            className={`px-4 py-2 rounded text-white ${
              posting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {posting ? 'Posting…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
