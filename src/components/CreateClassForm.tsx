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

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Give a short class description'),
  price: z.number().min(1, 'Minimum price is $1'),
});

export default function CreateClassForm({ onCreated }: { onCreated: () => void }) {
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
    if (!user) return alert('You must be logged in to create a class');

    setLoading(true);
    try {
      await addDoc(collection(db, 'classes'), {
        ...data,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        enrolled: [],
        revenue: 0,
      });

      alert('🎉 Class published!');
      onCreated(); // closes the form
    } catch (err) {
      console.error(err);
      alert('Error creating class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-[#1c1c1c] p-6 rounded-lg mt-6">
      <div>
        <label className="block mb-1">Class Title</label>
        <Input {...register('title')} />
        {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <Textarea rows={4} {...register('description')} />
        {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block mb-1">Price ($)</label>
        <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
        {errors.price && <p className="text-red-400 text-sm">{errors.price.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Publishing...' : 'Publish Class'}
      </Button>
    </form>
  );
}
