import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function getBoostedCreators() {
  const q = query(
    collection(db, "users"),
    where("boosts", ">=", 10)
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
