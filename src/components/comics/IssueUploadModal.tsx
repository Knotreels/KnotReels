'use client';

import { useEffect, useState } from 'react';
import {
  collection, getDocs, doc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface PanelData {
  file: File | null;
  rotation: number;
}

interface Page {
  layout: string;
  panels: PanelData[];
}

// now including Spider & Moose layouts (both 2 panels side-by-side)
const layouts = [
  { key: 'full-page-splash', label: 'Full-page splash', panelCount: 1 },
  { key: 'two-up-single',    label: 'Two-up + single',    panelCount: 3 },
  { key: 'tall-two-stack',   label: 'Tall + two stack',    panelCount: 3 },
  { key: 'spider-page',      label: 'Spider layout (2-up)', panelCount: 2 },
  { key: 'moose-page',       label: 'Moose layout (2-up)',  panelCount: 2 },
];

export default function IssueUploadModal({ isOpen, onClose }: Props) {
  const [comics, setComics] = useState<{ slug: string; title: string }[]>([]);
  const [selectedComic, setSelectedComic] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [pages, setPages] = useState<Page[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchComics() {
      const snap = await getDocs(collection(db, 'comics'));
      setComics(snap.docs.map(d => ({ slug: d.id, title: d.data().title })));
    }
    if (isOpen) fetchComics();
  }, [isOpen]);

  const panelCountForLayout = (key: string) =>
    layouts.find(l => l.key === key)?.panelCount || 1;

  const addPage = () => {
    const defaultLayout = layouts[0].key;
    const count = panelCountForLayout(defaultLayout);
    const emptyPanels = Array.from({ length: count }, () => ({ file: null, rotation: 0 }));
    setPages(p => [...p, { layout: defaultLayout, panels: emptyPanels }]);
  };

  const updatePanelFile = (pageIdx: number, panelIdx: number, file: File | null) => {
    setPages(p => {
      const cp = [...p];
      cp[pageIdx].panels[panelIdx].file = file;
      return cp;
    });
  };

  const updatePanelRotation = (pageIdx: number, panelIdx: number, rotation: number) => {
    setPages(p => {
      const cp = [...p];
      cp[pageIdx].panels[panelIdx].rotation = rotation;
      return cp;
    });
  };

  const updatePageLayout = (pageIdx: number, newLayout: string) => {
    setPages(p => {
      const cp = [...p];
      const count = panelCountForLayout(newLayout);
      cp[pageIdx].layout = newLayout;
      cp[pageIdx].panels = Array.from({ length: count }, () => ({ file: null, rotation: 0 }));
      return cp;
    });
  };

  const handleSubmit = async () => {
    if (!selectedComic || !issueNumber || pages.length === 0 || !user) {
      return alert('Please fill out all fields and add at least one page.');
    }
    setUploading(true);
    try {
      const formattedPages: { layout: string; panels: any[] }[] = [];
      for (let page of pages) {
        const uploaded: any[] = [];
        for (let panel of page.panels) {
          if (!panel.file) continue;
          const id = uuidv4();
          const refPath = ref(storage, `comic-panels/${selectedComic}/issue-${issueNumber}/${id}`);
          await uploadBytes(refPath, panel.file);
          const url = await getDownloadURL(refPath);
          uploaded.push({ url, rotation: panel.rotation });
        }
        formattedPages.push({ layout: page.layout, panels: uploaded });
      }
      const issueId = uuidv4();
      await setDoc(doc(db, 'issues', issueId), {
        comicSlug: selectedComic,
        issueNumber: parseInt(issueNumber, 10),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        pages: formattedPages,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to upload issue.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center overflow-auto">
      <div className="bg-white text-black w-full max-w-3xl rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Upload Comic Issue</h2>

        <label className="block mb-1">Select Comic</label>
        <select
          className="w-full mb-4 p-2 border rounded"
          value={selectedComic}
          onChange={e => setSelectedComic(e.target.value)}
        >
          <option value="">-- Select Comic --</option>
          {comics.map(c => (
            <option key={c.slug} value={c.slug}>{c.title}</option>
          ))}
        </select>

        <label className="block mb-1">Issue Number</label>
        <input
          type="number"
          className="w-full mb-4 p-2 border rounded"
          value={issueNumber}
          onChange={e => setIssueNumber(e.target.value)}
        />

        <button
          onClick={addPage}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          + Add Page
        </button>

        {pages.map((page, pi) => (
          <div key={pi} className="mb-6 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Page {pi + 1}</h3>
              <select
                value={page.layout}
                onChange={e => updatePageLayout(pi, e.target.value)}
                className="p-1 border rounded"
              >
                {layouts.map(l => (
                  <option key={l.key} value={l.key}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* grid adjusts to all five layouts */}
            <div className={
              page.layout === 'full-page-splash'  ? 'grid grid-cols-1 gap-4' :
              page.layout === 'two-up-single'     ? 'grid grid-cols-2 gap-4' :
              page.layout === 'tall-two-stack'    ? 'grid grid-cols-[2fr_1fr] grid-rows-2 gap-4' :
              /* spider-page and moose-page both side-by-side */ 
              page.layout === 'spider-page'      ? 'grid grid-cols-2 gap-4' :
              page.layout === 'moose-page'       ? 'grid grid-cols-2 gap-4' :
              'grid grid-cols-1 gap-4'
            }>
              {page.panels.map((panel, idx) => (
                <div
                  key={idx}
                  className="relative border-2 border-dashed border-gray-300 rounded p-2 h-40 flex items-center justify-center"
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={e => updatePanelFile(pi, idx, e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {panel.file
                    ? <span className="text-sm truncate">{panel.file.name}</span>
                    : <span className="text-gray-400 text-xs text-center">
                        Drop or click to add
                      </span>
                  }
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1">
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                className="w-full"
                value={page.panels[0]?.rotation || 0}
                onChange={e => updatePanelRotation(pi, 0, +e.target.value)}
              />
              <div className="text-xs text-gray-600">Rotate panels</div>
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Issue'}
          </button>
        </div>
      </div>
    </div>
  );
}
