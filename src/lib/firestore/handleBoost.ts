'use client'
import { doc, updateDoc, increment, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { canUserBoost } from "./canUserBoost";
import { toast } from "@/hooks/use-toast";
// @ts-ignore
import confetti from "canvas-confetti";

export async function handleBoost(creatorId: string, userId: string): Promise<boolean> {
  console.log("🚀 Starting boost for creator:", creatorId, "by user:", userId);

  const allowed = await canUserBoost(creatorId, userId);
  if (!allowed) {
    toast({
      title: "⏳ Slow down!",
      description: "You can only boost this creator once every 24 hours.",
    });
    return false;
  }

  const creatorRef = doc(db, "users", creatorId);
  const creatorSnap = await getDoc(creatorRef);

  if (!creatorSnap.exists()) {
    toast({
      title: "❌ Creator Not Found",
      description: "This creator doesn't exist anymore.",
    });
    return false;
  }

  const currentBoosts = Number(creatorSnap.data()?.boosts || 0);
  console.log("💥 Current boosts:", currentBoosts);

  try {
    // 1️⃣ Log boost to prevent spamming
    const boostLogRef = doc(db, "boosts", creatorId);
    await setDoc(boostLogRef, { [userId]: new Date().toISOString() }, { merge: true });

    // 2️⃣ Handle the 20th boost milestone
    if (currentBoosts + 1 === 20) {
      await updateDoc(creatorRef, {
        isFeatured: true,
        lastBoostedAt: Timestamp.now(),
        boosts: 0, // RESET boost count
      });

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

      toast({
        title: "🌟 Creator Featured!",
        description: "They've hit 20 boosts and made the front page!",
      });
    } else {
      // 3️⃣ Normal boost
      await updateDoc(creatorRef, {
        boosts: increment(1),
      });

      toast({
        title: "🚀 Boost Sent!",
        description: "Thanks for supporting this creator!",
      });
    }

    return true;

  } catch (err: any) {
    console.error("🔥 Boost error caught:", err);

    toast({
      title: "⚠️ Boost Failed",
      description: err?.message || "Something went wrong. Please try again.",
    });

    return false;
  }
}
