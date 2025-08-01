import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {QueryDocumentSnapshot} from "firebase-admin/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {RETENTION_PERIODS} from "./config";

admin.initializeApp();

const db = admin.firestore();

/**
 * Notifies all users (except the creator) when a new warp is created.
 */
export const sendNotificationOnWarpCreate = onDocumentCreated({
  document: "warps/{warpId}",
  region: "europe-west3",
}, async (event) => {
  const snap = event.data;
  if (!snap) {
    console.log("No data associated with the event");
    return;
  }
  const newWarp = snap.data();
  const ownerId = newWarp.ownerId;
  const warpId = event.params.warpId;

  // Get all users except the owner
  const usersSnapshot = await db.collection("users").where("uid", "!=", ownerId).get();

  const notifications: Promise<any>[] = [];

  usersSnapshot.forEach((userDoc: QueryDocumentSnapshot) => {
    const user = userDoc.data();
    // Send notification only if the user has them enabled
    if (user.notificationsEnabled) {
      const notification = {
        userId: user.uid,
        type: "new_warp",
        warpId: warpId,
        actorId: ownerId, // The actor is the person who created the warp
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      notifications.push(db.collection("notifications").add(notification));
    }
  });

  await Promise.all(notifications);
});

/**
 * Notifies the warp owner when another user joins their warp.
 */
export const sendNotificationOnWarpJoin = onDocumentUpdated({
  document: "warps/{warpId}",
  region: "europe-west3",
}, async (event) => {
  const beforeSnap = event.data?.before;
  const afterSnap = event.data?.after;

  if (!beforeSnap || !afterSnap) {
    console.log("No data associated with the event");
    return;
  }

  const beforeData = beforeSnap.data();
  const afterData = afterSnap.data();
  const warpId = event.params.warpId;

  // Check if the participants array has grown
  if (afterData.participants.length > beforeData.participants.length) {
    // Find the new participant by comparing the before and after arrays
    const newParticipantId = afterData.participants.find(
      (p: string) => !beforeData.participants.includes(p),
    );

    if (newParticipantId) {
      const ownerId = afterData.ownerId;

      // Get the owner's profile to check if they have notifications enabled
      const ownerProfileDoc = await db.collection("users").doc(ownerId).get();
      const ownerProfile = ownerProfileDoc.data();

      if (ownerProfile && ownerProfile.notificationsEnabled) {
        const notification = {
          userId: ownerId, // The notification is for the warp owner
          type: "warp_join",
          warpId: warpId,
          actorId: newParticipantId, // The actor is the person who joined
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        return db.collection("notifications").add(notification);
      }
    }
  }
  return null; // No change in participants, so no notification
});

export const cleanupOldData = onSchedule({
  schedule: "every 1 hours",
  region: "europe-west3",
}, async () => {
  const now = admin.firestore.Timestamp.now();
  const cutoff = new admin.firestore.Timestamp(
    now.seconds - RETENTION_PERIODS.WARP * 60 * 60,
    now.nanoseconds
  );

  const oldWarpsSnapshot = await db.collection("warps")
    .where("when", "<", cutoff)
    .get();

  const batch = db.batch();
  const warpIdsToDelete: string[] = [];

  oldWarpsSnapshot.forEach((doc) => {
    warpIdsToDelete.push(doc.id);
    batch.delete(doc.ref);
  });

  if (warpIdsToDelete.length > 0) {
    const notificationsSnapshot = await db.collection("notifications")
      .where("warpId", "in", warpIdsToDelete)
      .get();

    notificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
  }

  await batch.commit();
});
