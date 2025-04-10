'use client';

import { doc, setDoc, collection, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const enrollUserInClass = async (classId: string, userId: string) => {
  try {
    // Create enrollment under: classes/{classId}/enrollments/{userId}
    const enrollmentRef = doc(collection(doc(db, 'classes', classId), 'enrollments'), userId);

    await setDoc(enrollmentRef, {
      userId,
      enrolledAt: serverTimestamp(),
      progress: 0,
    });

    // Update class revenue + enrolled list
    const classRef = doc(db, 'classes', classId);

    await updateDoc(classRef, {
      revenue: increment(10), // or dynamically use classData.price
      [`enrolled.${userId}`]: true
    });

    console.log('✅ Enrollment successful');
  } catch (error) {
    console.error('🔥 Enrollment failed:', error);
    throw error;
  }
};
