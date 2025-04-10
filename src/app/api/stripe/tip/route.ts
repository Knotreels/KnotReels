// src/app/api/tip/route.ts

import { stripe } from "@/lib/stripe"; // ✅ Stripe setup
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, creatorId } = await req.json();

  if (!amount || !creatorId) {
    return NextResponse.json({ error: "Missing required data" }, { status: 400 });
  }

  // 🔍 Lookup creator
  const creatorRef = doc(db, "users", creatorId);
  const creatorSnap = await getDoc(creatorRef);

  if (!creatorSnap.exists()) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const creator = creatorSnap.data();
  const stripeAccountId = creator?.stripeAccountId;
  const username = creator?.username || "Creator";

  if (!stripeAccountId) {
    return NextResponse.json({ error: "Creator not connected to Stripe" }, { status: 400 });
  }

  // 💸 Create tip Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tip to ${username}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://knotreels.com/dashboard?tip=success",
    cancel_url: "https://knotreels.com/dashboard?tip=cancel",
    payment_intent_data: {
      application_fee_amount: Math.round(amount * 0.2),
      transfer_data: {
        destination: stripeAccountId,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
