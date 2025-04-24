// src/app/api/tip/route.ts

import { stripe } from "@/lib/stripe";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, creatorId } = await req.json();
  if (!amount || !creatorId) {
    return NextResponse.json({ error: "Missing required data" }, { status: 400 });
  }

  // lookup creator…
  const creatorSnap = await getDoc(doc(db, "users", creatorId));
  if (!creatorSnap.exists()) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }
  const creator = creatorSnap.data();
  if (!creator?.stripeAccountId) {
    return NextResponse.json({ error: "Creator not connected to Stripe" }, { status: 400 });
  }

  // derive origin (http://localhost:3000 or your prod domain)
  const origin = req.headers.get("origin") || "";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `Tip to ${creator.username}` },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url:  `${origin}/dashboard?tip=success`,
    cancel_url:   `${origin}/dashboard?tip=cancel`,
    payment_intent_data: {
      application_fee_amount: Math.round(amount * 0.2),
      transfer_data: {
        destination: creator.stripeAccountId,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
