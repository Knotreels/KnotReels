'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';

interface Issue {
  id: string;
  issueNumber: number;
}

export default function ComicSlugPage() {
  const { slug } = useParams() as { slug: string };
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, 'issues'),
        where('comicSlug', '==', slug),
        orderBy('issueNumber', 'asc')
      );
      const snap = await getDocs(q);
      setIssues(
        snap.docs.map(d => ({
          id: d.id,
          issueNumber: (d.data() as any).issueNumber,
        }))
      );
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return <div className="p-8 text-white bg-black">Loading issues…</div>;
  if (issues.length === 0) return <div className="p-8 text-white bg-black">No issues found.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-6 capitalize">{slug.replace(/-/g, ' ')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {issues.map(issue => (
          <Link
            key={issue.id}
            href={`/comics/${slug}/${issue.issueNumber}`}
            className="p-6 bg-zinc-900 rounded-lg text-center hover:bg-zinc-800 transition"
          >
            <span className="text-xl font-medium">Issue {issue.issueNumber}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
