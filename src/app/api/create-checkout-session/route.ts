import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email provided.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: 'price_1RBYqUAnGL77r8VrHqPsZOoz', quantity: 1 }], // ✅ Your Stripe price ID
      subscription_data: {
        trial_period_days: 60, // ✅ Adds your 2-month (60-day) free trial
      },
      success_url: 'https://knotreels.com/dashboard/browse',
cancel_url: 'https://knotreels.com/subscribe?cancelled=true',


    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
