'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProviderWrapper,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { checkUserLimit } from '@/lib/firestore/checkUserLimit';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username is required'),
});
const MAX_USERS = 100;

// 🚀 Your two video filenames here:
const BACKGROUNDS = [
  '/videos/bg1.mp4',
  '/videos/bg2.mp4',
];

export default function SignUpPage() {
  const router = useRouter();
  const [signupsClosed, setSignupsClosed] = useState(false);
  const [bgVideo, setBgVideo] = useState<string>('');

  // pick a random video on mount
  useEffect(() => {
    const n = Math.floor(Math.random() * BACKGROUNDS.length);
    setBgVideo(BACKGROUNDS[n]);
  }, []);

  useEffect(() => {
    (async () => {
      if (await checkUserLimit() >= MAX_USERS) {
        setSignupsClosed(true);
      }
    })();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', username: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (await checkUserLimit() >= MAX_USERS) {
        alert('🚫 Sign-ups are closed.');
        return;
      }
      const userCred = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email: values.email,
        username: values.username,
        avatar: '/default-avatar.png',
        boosts: 0,
        tips: 0,
        views: 0,
        role: 'Creator',
        createdAt: serverTimestamp(),
      });
      router.push('/dashboard/browse');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (signupsClosed) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-[#0a0a0a] p-8 rounded-lg shadow-lg text-white text-center">
        <h1 className="text-2xl font-bold mb-4">🚧 Early Access Closed</h1>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      {/* 🎥 Looping background */}
      {bgVideo && (
        <video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}

      {/* 🔳 Modal */}
      <div className="relative z-10 max-w-md w-full bg-[#0a0a0a] p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-white">Join KnotReels</h1>
        <FormProviderWrapper methods={form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="email">
              {({ value, onChange }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input value={value} onChange={onChange} />
                  <FormMessage message={form.formState.errors.email?.message} />
                </FormItem>
              )}
            </FormField>

            <FormField name="username">
              {({ value, onChange }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input value={value} onChange={onChange} />
                  <FormMessage message={form.formState.errors.username?.message} />
                </FormItem>
              )}
            </FormField>

            <FormField name="password">
              {({ value, onChange }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" value={value} onChange={onChange} />
                  <FormMessage message={form.formState.errors.password?.message} />
                </FormItem>
              )}
            </FormField>

            <Button type="submit" className="w-full mt-4">
              Join the Community
            </Button>
          </form>
        </FormProviderWrapper>
      </div>
    </div>
  );
}
