'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { enrollUserInClass } from '@/lib/firestore/enrollment';
import { useAuth } from '@/context/AuthContext'; // Make sure this is correctly set up

export default function ClassCard({ classData }: { classData: any }) {
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const { currentUser } = useAuth(); // Access the logged-in user

  useEffect(() => {
    const fetchCreator = async () => {
      if (!classData.creatorId) return;

      const ref = doc(db, 'users', classData.creatorId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setCreator(snap.data());
      }
    };

    fetchCreator();
  }, [classData.creatorId]);

  const handleEnroll = async () => {
    if (!currentUser) return alert('Please log in first.');

    try {
      setLoading(true);
      const userId = currentUser.uid!;
      await enrollUserInClass(classData.id as string, userId);
      setEnrolled(true);

      // Optional: Navigate to a classroom page after enrollment
      // router.push(`/classroom/${classData.id}`);
    } catch (err) {
      console.error('Enrollment failed:', err);
      alert('Failed to enroll. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111] p-5 rounded-md border border-gray-800 space-y-3">
      <h3 className="text-lg font-semibold">{classData.title}</h3>

      {creator && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Image
            src={creator.avatar || '/default-avatar.png'}
            alt="Avatar"
            width={24}
            height={24}
            className="rounded-full object-cover border border-gray-700"
          />
          <span className="font-medium">{creator.username}</span>
        </div>
      )}

      <p className="text-green-500 font-medium">${classData.price.toFixed(2)}</p>

      <Button
        className="w-full"
        onClick={handleEnroll}
        disabled={loading || enrolled}
      >
        {enrolled ? 'Enrolled 🎉' : loading ? 'Enrolling...' : 'Enroll'}
      </Button>
    </div>
  );
}
