'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db, auth } from '@/firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export default function ClassDetailPage() {
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchClass = async () => {
      if (!id) return;

      const docRef = doc(db, 'classes', id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setClassInfo(data);

        const user = auth.currentUser;
        if (user && data.enrolled?.includes(user.uid)) {
          setEnrolled(true);
        }
      }

      setLoading(false);
    };

    fetchClass();
  }, [id]);

  const handleEnroll = async () => {
    const user = auth.currentUser;
    if (!user) return alert('You must be logged in to enroll.');

    try {
      const docRef = doc(db, 'classes', id as string);
      await updateDoc(docRef, {
        enrolled: arrayUnion(user.uid),
        revenue: (classInfo.revenue || 0) + classInfo.price,
      });

      alert('🎉 Enrolled successfully!');
      setEnrolled(true);
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Something went wrong.');
    }
  };

  if (loading) return <div className="p-6 text-white">Loading class info...</div>;
  if (!classInfo) return <div className="p-6 text-white">Class not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 text-white space-y-6">
      <h1 className="text-3xl font-bold">{classInfo.title}</h1>
      <p className="text-gray-300">{classInfo.description}</p>
      <p className="text-blue-400 font-semibold text-lg">${classInfo.price?.toFixed(2)}</p>
  
      {!enrolled ? (
        <Button onClick={handleEnroll} className="mt-4">
          🎓 Enroll in Class
        </Button>
      ) : (
        <p className="text-green-400 font-medium mt-4">✅ You’re enrolled in this class!</p>
      )}
  
      {enrolled && classInfo.dailyUrl && (
        <div className="mt-8 aspect-video w-full rounded-lg overflow-hidden border border-gray-700">
          <iframe
            src={classInfo.dailyUrl}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
  
}
