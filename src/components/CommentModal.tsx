'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { FaTimes, FaSmile } from 'react-icons/fa';
import Image from 'next/image';
import EmojiPicker, { IEmojiData } from 'emoji-picker-react';

interface CommentData {
  id: string;
  clipId: string;
  text: string;
  userId: string;
  username: string;
  avatar: string;
  createdAt: any;
}

interface Props {
  isOpen: boolean;
  onClose(): void;
  clipId: string;
}

export default function CommentModal({ isOpen, onClose, clipId }: Props) {
  const { user: currentUser } = useAuth();

  // ── TOP-LEVEL INPUT STATE ─────────────────────────────────────────────
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  // ── universal emoji picker state ──────────────────────────────────────
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  // ── WHICH INPUT IS ACTIVE: "top" or a commentID ──────────────────────
  const [activeInputId, setActiveInputId] = useState<'top' | string>('top');

  // ── COMMENTS & REPLIES ────────────────────────────────────────────────
  const [comments, setComments] = useState<CommentData[]>([]);
  const [replies, setReplies] = useState<Record<string, CommentData[]>>({});

  // ── REPLY INPUTS ──────────────────────────────────────────────────────
  const [replyInputs, setReplyInputs] = useState<{
    [cid: string]: string;
  }>({});
  const [replying, setReplying] = useState(false);

  // ── LOAD TOP-LEVEL COMMENTS ───────────────────────────────────────────
  useEffect(() => {
    if (!clipId) return;
    const q = query(
      collection(db, 'comments'),
      where('clipId', '==', clipId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap =>
      setComments(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    );
  }, [clipId]);

  // ── SUBSCRIBE TO EACH COMMENT’S REPLIES ──────────────────────────────
  useEffect(() => {
    const unsub = comments.map(c =>
      onSnapshot(
        collection(db, 'comments', c.id, 'replies'),
        snap =>
          setReplies(prev => ({
            ...prev,
            [c.id]: snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
          }))
      )
    );
    return () => unsub.forEach(u => u());
  }, [comments]);

  // ── CLOSE EMOJI PICKER ON OUTSIDE CLICK ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showEmoji &&
        emojiRef.current &&
        !emojiRef.current.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  // ── POST NEW COMMENT ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!commentText.trim() || !currentUser?.uid) return;
    setPosting(true);
    try {
      const udoc = await getDoc(doc(db, 'users', currentUser.uid));
      const u = (udoc.data() as any) || {};
      await addDoc(collection(db, 'comments'), {
        clipId,
        text: commentText.trim(),
        userId: currentUser.uid,
        username: u.username || currentUser.uid,
        avatar: u.avatar || '/default-avatar.png',
        createdAt: serverTimestamp()
      });
      setCommentText('');
    } catch {
      alert('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  // ── OPEN REPLY BOX ───────────────────────────────────────────────────
  const openReplyBox = (cid: string) => {
    setActiveInputId(cid);
    setReplyInputs(prev => ({ ...prev, [cid]: prev[cid] || '' }));
  };

  // ── POST REPLY ───────────────────────────────────────────────────────
  const handleReply = async (parentId: string) => {
    const text = replyInputs[parentId]?.trim();
    if (!text || !currentUser?.uid) return;
    setReplying(true);
    try {
      const udoc = await getDoc(doc(db, 'users', currentUser.uid));
      const u = (udoc.data() as any) || {};
      await addDoc(collection(db, 'comments', parentId, 'replies'), {
        text,
        userId: currentUser.uid,
        username: u.username || currentUser.uid,
        avatar: u.avatar || '/default-avatar.png',
        createdAt: serverTimestamp()
      });
      setReplyInputs(prev => ({ ...prev, [parentId]: '' }));
      setActiveInputId('top');
    } catch {
      alert('Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md bg-[#0a0a0a] p-6 rounded-lg text-white">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="mb-4 text-xl font-semibold">Comments</h2>

        {/* COMMENTS LIST */}
        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-center text-gray-500">No comments yet.</p>
          )}

          {comments.map(c => (
            <div key={c.id} className="space-y-2">
              {/* single comment */}
              <div className="flex items-start gap-3">
                <Image
                  src={c.avatar}
                  alt={`${c.username} avatar`}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div className="flex-1 bg-zinc-800 p-2 rounded-lg">
                  <p className="text-xs font-semibold">{c.username}</p>
                  <p className="text-sm">{c.text}</p>
                </div>
              </div>

              {/* reply / show replies */}
              <div className="ml-11 flex gap-4 text-xs">
                <button
                  onClick={() => openReplyBox(c.id)}
                  className="text-blue-400 hover:underline"
                >
                  Reply
                </button>
                {replies[c.id]?.length > 0 && (
                  <button
                    onClick={() =>
                      setReplies(prev => ({
                        ...prev,
                        [c.id]: prev[c.id]?.length ? [] : replies[c.id]
                      }))
                    }
                    className="text-blue-400 hover:underline"
                  >
                    {replies[c.id].length
                      ? 'Hide replies'
                      : `Show replies (${replies[c.id].length})`}
                  </button>
                )}
              </div>

              {/* nested replies */}
              {replies[c.id]?.map(r => (
                <div
                  key={r.id}
                  className="ml-11 flex items-start gap-3 mt-2"
                >
                  <Image
                    src={r.avatar}
                    alt={`${r.username} avatar`}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div className="bg-zinc-800 p-2 rounded-lg flex-1">
                    <p className="text-xs font-semibold">{r.username}</p>
                    <p className="text-sm">{r.text}</p>
                  </div>
                </div>
              ))}

              {/* REPLY INPUT */}
              {activeInputId === c.id && (
                <div className="ml-11 space-y-2 mt-2">
                  <input
                    type="text"
                    value={replyInputs[c.id]}
                    onFocus={() => setActiveInputId(c.id)}
                    onChange={e =>
                      setReplyInputs(prev => ({
                        ...prev,
                        [c.id]: e.target.value
                      }))
                    }
                    placeholder="Write a reply…"
                    disabled={replying}
                    className="w-full rounded border border-zinc-600 bg-zinc-800 p-2 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveInputId('top')}
                      className="text-gray-400 hover:underline text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(c.id)}
                      disabled={replying}
                      className="rounded bg-blue-600 px-4 py-2 text-white text-sm"
                    >
                      {replying ? 'Posting…' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* NEW COMMENT + EMOJI PICKER */}
        <div className="flex items-center gap-2 border-t border-zinc-700 pt-4 relative">
          <input
            type="text"
            value={commentText}
            onFocus={() => setActiveInputId('top')}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment…"
            disabled={posting}
            className="flex-1 rounded border border-zinc-600 bg-zinc-800 p-2 outline-none"
          />

          {/* single shared emoji button */}
          <button
            onClick={() => setShowEmoji(v => !v)}
            className="text-blue-400 hover:text-white"
          >
            <FaSmile size={18} />
          </button>

          {/* the Send button */}
          <button
            onClick={handleSubmit}
            disabled={posting}
            className={`rounded px-4 py-2 text-white ${
              posting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {posting ? 'Posting…' : 'Send'}
          </button>

          {/* shared EmojiPicker */}
          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-full left-0 z-50">
              <EmojiPicker
                onEmojiClick={(_e, data) => {
                  if (activeInputId === 'top') {
                    setCommentText(t => t + data.emoji);
                  } else {
                    setReplyInputs(prev => ({
                      ...prev,
                      [activeInputId]: prev[activeInputId] + data.emoji
                    }));
                  }
                }}
                theme="dark"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
