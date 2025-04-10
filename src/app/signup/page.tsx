'use client';

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
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { checkUserLimit } from '@/lib/firestore/checkUserLimit';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  username: z.string().min(3, { message: 'Username is required' }),
});

const MAX_USERS = 100;

export default function SignUpPage() {
  const router = useRouter();
  const [signupsClosed, setSignupsClosed] = useState(false);
  const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { email: '', password: '', username: '' } });

  useEffect(() => {
    (async () => setSignupsClosed(await checkUserLimit() >= MAX_USERS))();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (await checkUserLimit() >= MAX_USERS) {
        alert('🚫 Sign-ups are currently closed.');
        return;
      }

      const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);

      await setDoc(doc(db, 'users', userCred.user.uid), {
        email: values.email,
        username: values.username,
        avatar: '/default-avatar.png',
        boosts: 0,
        tips: 0,
        views: 0,
        hasPaid: false,
        trialActive: true,
        trialStartedAt: serverTimestamp(),
        role: 'Creator',
        createdAt: serverTimestamp(),
      });

      // After signup, directly send user to Stripe checkout clearly:
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url; // ✅ Redirect to Stripe checkout immediately
      } else {
        throw new Error(data.error || 'Failed to initiate payment.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (signupsClosed) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-[#0a0a0a] p-8 rounded-lg shadow-lg text-white text-center">
        <h1 className="text-2xl font-bold mb-4">🚧 Early Access Closed</h1>
        <p className="text-gray-400 mb-4">We've reached our early access limit.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-[#0a0a0a] p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-white">Sign Up to KnotReels</h1>
      <FormProviderWrapper methods={form}>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
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
          <Button type="submit" className="w-full mt-4">Start Free Trial</Button>
        </Form>
      </FormProviderWrapper>
    </div>
  );
}
