import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
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

  if (currentBoosts >= 10) {
    toast({
      title: "🎉 Boost Limit Reached!",
      description: "This creator already has 10 boosts.",
    });
    return false;
  }

  try {
    // 1️⃣ Increment boosts
    await updateDoc(creatorRef, { boosts: increment(1) });

    // 2️⃣ Log boost to prevent spamming
    const boostLogRef = doc(db, "boosts", creatorId);
    await setDoc(boostLogRef, { [userId]: new Date().toISOString() }, { merge: true });

    console.log("✅ Boost logged successfully");

    // 3️⃣ Handle 10th boost special case
    if (currentBoosts + 1 === 10) {
      await updateDoc(creatorRef, { isFeatured: true });

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

      toast({
        title: "🌟 Creator Featured!",
        description: "They've hit 10 boosts and made the front page!",
      });
    } else {
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
