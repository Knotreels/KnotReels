import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function getBoostedCreators() {
  const now = Timestamp.now();
  const cutoff = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000); // 24 hours ago

  const q = query(
    collection(db, "users"),
    where("isFeatured", "==", true),
    where("lastBoostedAt", ">=", cutoff)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.username || "Untitled",
      username: data.username || "",
      thumbnail: data.avatar || "/default-avatar.png",
      description: "Boosted Creator",
    };
  });
}
