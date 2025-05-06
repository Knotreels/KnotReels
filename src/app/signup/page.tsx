// src/app/signup/page.tsx
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
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

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { checkUserLimit } from '@/lib/firestore/checkUserLimit';

const MAX_USERS = 100;

const signupSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 chars'),
});

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') || 'viewer';
  const role =
    roleParam.charAt(0).toUpperCase() + roleParam.slice(1).toLowerCase();

  const [signupsClosed, setSignupsClosed] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    checkUserLimit().then((count) => {
      if (count >= MAX_USERS) setSignupsClosed(true);
    });
  }, []);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    if ((await checkUserLimit()) >= MAX_USERS) {
      alert('🚫 Sign-ups closed');
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await setDoc(doc(db, 'users', cred.user.uid), {
        username: values.username,
        email: values.email,
        avatar: '/default-avatar.png',
        boosts: 0,
        tips: 0,
        views: 0,
        role,
        createdAt: serverTimestamp(),
      });

      // send them into the app instead of pricing
      startTransition(() => {
        router.push('/dashboard/browse');
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (signupsClosed) {
    return (
      <div className="p-8 mx-auto mt-20 max-w-md bg-[#0a0a0a] rounded text-white text-center">
        <h1 className="text-2xl font-bold mb-4">🚧 Early Access Closed</h1>
        <p>Thanks for your interest!</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      <div className="relative z-10 max-w-md w-full bg-[#0a0a0a] p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create Your KnotReels {role} Account
        </h1>
        <FormProviderWrapper methods={form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField name="username">
              {({ value, onChange }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input value={value} onChange={onChange} />
                  <FormMessage
                    message={form.formState.errors.username?.message}
                  />
                </FormItem>
              )}
            </FormField>
            <FormField name="email">
              {({ value, onChange }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input value={value} onChange={onChange} />
                  <FormMessage
                    message={form.formState.errors.email?.message}
                  />
                </FormItem>
              )}
            </FormField>
            <FormField name="password">
              {({ value, onChange }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={value}
                    onChange={onChange}
                  />
                  <FormMessage
                    message={form.formState.errors.password?.message}
                  />
                </FormItem>
              )}
            </FormField>
            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              {isPending ? 'Signing up…' : 'Join KnotReels'}
            </Button>
          </form>
        </FormProviderWrapper>
      </div>
    </div>
  );
}
