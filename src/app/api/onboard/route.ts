// src/app/api/onboard/route.ts

import { stripe } from "@/lib/stripe";
import { db } from "@/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Get user data
type Creator = {
  id: string;
  stripeAccountId?: string; // Optional if it might not exist
  [key: string]: any; // To allow other fields from Firestore
};

async function getCreatorById(userId: string): Promise<Creator> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("User not found");
  return { id: snap.id, ...snap.data() } as Creator;
}

// Save Stripe Account ID
async function saveStripeId(userId: string, stripeAccountId: string) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { stripeAccountId });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const creator = await getCreatorById(userId);
    let stripeAccountId = creator.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({ type: "standard" });
      stripeAccountId = account.id;
      await saveStripeId(userId, stripeAccountId);
    }

    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: "https://knotreels.com/dashboard?error=1",
      return_url: "https://knotreels.com/dashboard?onboarded=1",
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("🔥 Onboarding failed:", err);
    return NextResponse.json({ error: "Stripe onboarding failed" }, { status: 500 });
  }
}
