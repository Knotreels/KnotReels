'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import CreateClassForm from '@/components/CreateClassForm';
import ClassCard from '@/components/ClassCard'; // Optional component to display each class

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const q = query(collection(db, 'classes'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <div className="px-6 pt-10 text-white space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎓 AI Classes</h1>
        <Button onClick={toggleForm}>
          {showForm ? 'Cancel' : '+ Create Class'}
        </Button>
      </div>

      {/* Form */}
      {showForm && <CreateClassForm onCreated={() => setShowForm(false)} />}

      {/* Classes */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <ClassCard key={c.id} classData={c} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No classes published yet.</p>
      )}
    </div>
  );
}
