import * as functions from "firebase-functions/v1"; // ✅ Correct version for scheduled functions
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const resetFeaturedBoosts = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("UTC") // Optional: Adjust time zone if needed
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const cutoff = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - 24 * 60 * 60 * 1000 // 24 hours ago
    );

    const snapshot = await db
      .collection("users")
      .where("isFeatured", "==", true)
      .where("lastBoostedAt", "<", cutoff)
      .get();

    if (snapshot.empty) {
      console.log("⏳ No featured creators to reset.");
      return null;
    }

    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        isFeatured: false,
        boosts: 0,
      });
    });

    await batch.commit();
    console.log(`✅ Reset ${snapshot.size} featured creators.`);
    return null;
  });
