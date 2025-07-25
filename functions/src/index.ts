import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Notifies all users (except the creator) when a new warp is created.
 */
export const sendNotificationOnWarpCreate = functions.firestore
  .document("warps/{warpId}")
  .onCreate(async (snap, context) => {
    const newWarp = snap.data();
    const ownerId = newWarp.ownerId;

    // Get all users except the owner
    const usersSnapshot = await db.collection("users").where("uid", "!=", ownerId).get();

    const notifications: Promise<any>[] = [];

    usersSnapshot.forEach((userDoc) => {
      const user = userDoc.data();
      // Send notification only if the user has them enabled
      if (user.notificationsEnabled) {
        const notification = {
          userId: user.uid,
          type: "new_warp",
          warpId: context.params.warpId,
          actorId: ownerId, // The actor is the person who created the warp
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        notifications.push(db.collection("notifications").add(notification));
      }
    });

    return Promise.all(notifications);
  });

/**
 * Notifies the warp owner when another user joins their warp.
 */
export const sendNotificationOnWarpJoin = functions.firestore
  .document("warps/{warpId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if the participants array has grown
    if (afterData.participants.length > beforeData.participants.length) {
      // Find the new participant by comparing the before and after arrays
      const newParticipantId = afterData.participants.find(
        (p: string) => !beforeData.participants.includes(p)
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
            warpId: context.params.warpId,
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
