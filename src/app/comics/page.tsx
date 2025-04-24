// app/comics/page.tsx
'use client';

import { useState } from 'react';
import UploadComicModal from '@/components/comics/ComicUploadModal';
import UploadIssueModal from '@/components/comics/IssueUploadModal';
import ComicGrid from '../../components/comics/ComicGrid';

export default function ComicsPage() {
  const [isComicModalOpen, setIsComicModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* ─── Upload Controls ───────────────────────── */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setIsComicModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Upload Comic
        </button>
        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Upload Issue
        </button>
      </div>

      {/* ─── Modals ───────────────────────────────────── */}
      <UploadComicModal
        isOpen={isComicModalOpen}
        onClose={() => setIsComicModalOpen(false)}
      />
      <UploadIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
      />

      {/* ─── Comic Grid ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto">
        <ComicGrid />
      </div>
    </div>
  );
}
