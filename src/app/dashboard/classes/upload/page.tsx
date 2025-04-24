'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { db, auth } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// ✅ Fix: use z.coerce.number to properly handle input from form
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Give a short class description'),
  price: z.coerce.number().min(1, 'Minimum price is $1'),
});

export default function UploadClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      price: 10,
    },
  });

  const onSubmit = async (data: any) => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to create a class");
  
    setLoading(true);
  
    try {
      // ✅ 1. Create a Daily.co room
      const res = await fetch('/api/daily/create-room', { method: 'POST' });
      const dailyData = await res.json();
  
      if (!dailyData.url) {
        throw new Error('Failed to create Daily room');
      }
  
      // ✅ 2. Create the class in Firestore with the room link
      await addDoc(collection(db, 'classes'), {
        ...data,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        enrolled: [],
        revenue: 0,
        dailyUrl: dailyData.url, // 👈 Save the room link here
      });
  
      alert('🎉 Class published and live room ready!');
      router.push('/dashboard/classes');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating class');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-xl mx-auto mt-16 text-white space-y-6 px-6">
      <h1 className="text-3xl font-bold">📚 Create AI Class</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-1">Class Title</label>
          <Input {...register('title')} />
          {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1">Description</label>
          <Textarea rows={4} {...register('description')} />
          {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1">Price ($)</label>
          <Input type="number" step="0.01" {...register('price')} />
          {errors.price && <p className="text-red-400 text-sm">{errors.price.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Class'}
        </Button>
      </form>
    </div>
  );
}
