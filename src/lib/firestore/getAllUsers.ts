// src/lib/firestore/getAllUsers.ts
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

export interface UserRecord {
  id: string
  username: string
  avatar?: string
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const qs = await getDocs(collection(db, 'users'))
  return qs.docs.map((snap) => {
    const data = snap.data()
    return {
      id:   snap.id,
      // cast to the fields you know exist
      username: data.username as string,
      avatar:   data.avatar   as string | undefined,
    }
  })
}
