'use client'

import React, { useEffect, useState } from 'react'
import { getAllUsers, UserRecord } from '@/lib/firestore/getAllUsers'
import Link from 'next/link'

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => console.error('Failed to load users:', err))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All User Profiles</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {users.map((u) => (
          <Link
            key={u.id}
            href={`/creator/${u.username}`}
            className="bg-zinc-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 flex flex-col w-full max-w-[160px] mx-auto"
          >
            <div className="w-full aspect-[4/5] overflow-hidden">
              <img
                src={u.avatar?.startsWith('http') ? u.avatar : '/default-avatar.png'}
                alt={u.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2 text-center">
              <span className="text-white font-medium text-xs break-words w-full leading-tight">
                {u.username}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
