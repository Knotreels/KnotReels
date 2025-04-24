'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import FlipComicReader, { ComicPage } from './FlipComicReader'

interface Comic {
  slug: string
  coverUrl: string
  author: string
}

interface Props {
  slug: string
  issueNumber: number
  onClose: () => void
}

export default function ComicReader({ slug, issueNumber, onClose }: Props) {
  const [pages, setPages] = useState<ComicPage[]>([])
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadIssue() {
      try {
        // 1) fetch comic doc to get coverUrl (and author if you need)
        const comicSnap = await getDocs(query(collection(db, 'comics'), where('slug', '==', slug)))
        if (!comicSnap.empty) {
          setCoverUrl(comicSnap.docs[0].data().coverUrl)
        }

        // 2) fetch the exact issue by slug + number
        const q = query(
          collection(db, 'issues'),
          where('comicSlug', '==', slug),
          where('issueNumber', '==', issueNumber)
        )
        const snap = await getDocs(q)
        if (snap.empty) {
          console.warn('No such issue!')
          return
        }

        // 3) there should be exactly one
        const issueData = snap.docs[0].data()
        const formatted = (issueData.pages as any[]).map(page => ({
          layout: page.layout,
          panels: page.panels.map((p: any) => ({
            url: `${p.url}?nocache=${Date.now()}`,
            rotation: p.rotation ?? 0,
          })),
        })) as ComicPage[]

        setPages(formatted)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadIssue()
  }, [slug, issueNumber])

  if (loading) return <p className="text-white">Loading...</p>
  if (pages.length === 0) return <p className="text-white">Issue not found.</p>

  return (
    <FlipComicReader
      coverImage={coverUrl}
      pages={pages}
      onClose={onClose}
    />
  )
}
