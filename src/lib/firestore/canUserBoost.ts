import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function canUserBoost(creatorId: string, userId: string): Promise<boolean> {
  const ref = doc(db, "boosts", creatorId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return true;

  const lastBoostTime = snap.data()?.[userId];
  if (!lastBoostTime) return true;

  const now = new Date();
  const last = new Date(lastBoostTime);
  const hoursPassed = (now.getTime() - last.getTime()) / 3600000;

  return hoursPassed >= 24;
}
