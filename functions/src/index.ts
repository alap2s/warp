import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {QueryDocumentSnapshot} from "firebase-admin/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {RETENTION_PERIODS} from "./config";
import {getMessaging} from "firebase-admin/messaging";

admin.initializeApp();
const db = admin.firestore();
const messaging = getMessaging();

/**
 * Sends a push notification to a user's device and handles stale tokens.
 * @param {string} token The FCM registration token.
 * @param {string} title The title of the notification.
 * @param {string} body The body of the notification.
 * @param {string} url The URL to open when the notification is clicked.
 * @param {string} userId The ID of the user to clean up the token for if it's stale.
 */
const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  url: string,
  userId: string
) => {
  try {
    await messaging.send({
      token,
      notification: {title, body},
      webpush: {
        notification: {
          icon: "/icon-192.png",
        },
        fcmOptions: {
          link: url,
        },
      },
      data: {
        url,
      },
    });
  } catch (error: any) {
    // A "registration-token-not-registered" error indicates the token is stale.
    if (error.code === "messaging/registration-token-not-registered") {
      console.log(`Stale token found for user ${userId}. Removing it.`);
      // Remove the stale token from the user's profile.
      await db.collection("users").doc(userId).update({fcmToken: ""});
    } else {
      console.error("Error sending push notification:", error);
    }
  }
};


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
  const ownerProfileDoc = await db.collection("users").doc(ownerId).get();
  const ownerProfile = ownerProfileDoc.data();

  usersSnapshot.forEach((userDoc: QueryDocumentSnapshot) => {
    const user = userDoc.data();
    if (user.notificationsEnabled && user.fcmToken) {
      const warpUrl = `https://dots-rouge.vercel.app/warp/${warpId}`;
      sendPushNotification(
        user.fcmToken,
        `New Warp by ${ownerProfile?.username || "a user"}!`,
        newWarp.what,
        warpUrl,
        user.uid
      );
    }
  });
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
    const newParticipantId = afterData.participants.find(
      (p: string) => !beforeData.participants.includes(p),
    );

    if (newParticipantId) {
      const ownerId = afterData.ownerId;
      const ownerProfileDoc = await db.collection("users").doc(ownerId).get();
      const ownerProfile = ownerProfileDoc.data();
      const joinerProfileDoc = await db.collection("users").doc(newParticipantId).get();
      const joinerProfile = joinerProfileDoc.data();

      if (ownerProfile && ownerProfile.notificationsEnabled && ownerProfile.fcmToken) {
        const warpUrl = `https://dots-rouge.vercel.app/warp/${warpId}`;
        sendPushNotification(
          ownerProfile.fcmToken,
          `New Joiner!`,
          `${joinerProfile?.username || "Someone"} joined your warp: ${afterData.what}`,
          warpUrl,
          ownerId,
        );
      }
    }
  }
  return null;
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
