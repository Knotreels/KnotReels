'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StripeProvider({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️ Missing Stripe publishable key');
    return <>{children}</>; // render children even if Stripe not initialized
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
