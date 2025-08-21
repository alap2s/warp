import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {QueryDocumentSnapshot} from "firebase-admin/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getMessaging} from "firebase-admin/messaging";
import {getAuth} from "firebase-admin/auth";
import {RETENTION_PERIODS} from "./config";

admin.initializeApp();

const db = admin.firestore();

export const acceptInvite = onCall({region: "europe-west3"}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to accept an invite.");
  }

  const { code } = request.data;
  if (!code || typeof code !== "string") {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'code' argument.");
  }

  const acceptingUserId = request.auth.uid;

  const invitesRef = db.collection("invites");
  const q = invitesRef.where("code", "==", code).where("used", "==", false);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    throw new HttpsError("not-found", "Invalid or expired invite code.");
  }

  const inviteDoc = querySnapshot.docs[0];
  const inviteData = inviteDoc.data();

  if (new Date() > inviteData.expiresAt.toDate()) {
    throw new HttpsError("deadline-exceeded", "Expired invite code.");
  }

  if (inviteData.userId === acceptingUserId) {
    throw new HttpsError("failed-precondition", "You cannot accept your own invite code.");
  }

  const batch = db.batch();

  // Add each user to the other's friends subcollection
  const user1Ref = db.collection("users").doc(inviteData.userId);
  const user2Ref = db.collection("users").doc(acceptingUserId);

  const user1FriendRef = user1Ref.collection("friends").doc(acceptingUserId);
  batch.set(user1FriendRef, { friendSince: admin.firestore.FieldValue.serverTimestamp() });
  
  const user2FriendRef = user2Ref.collection("friends").doc(inviteData.userId);
  batch.set(user2FriendRef, { friendSince: admin.firestore.FieldValue.serverTimestamp() });
  
  // Mark the invite code as used
  batch.update(inviteDoc.ref, { used: true });

  await batch.commit();

  return { success: true };
});

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

  // Get all users
  const usersSnapshot = await db.collection("users").get();

  const notifications: Promise<any>[] = [];
  const fcmMessages: Promise<any>[] = [];

  usersSnapshot.forEach((userDoc: QueryDocumentSnapshot) => {
    const user = userDoc.data();
    if (user.uid === ownerId) {
      return;
    }

    // if (user.notificationsEnabled) {
      const notification = {
        userId: user.uid,
        type: "new_warp",
        warpId: warpId,
        actorId: ownerId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      notifications.push(db.collection("notifications").add(notification));

      if (user.fcmTokens && user.fcmTokens.length > 0) {
        const message = {
          notification: {
            title: "A new warp has appeared!",
            body: "Check it out!",
          },
          tokens: user.fcmTokens,
        };
        fcmMessages.push(getMessaging().sendEachForMulticast(message));
      }
    // }
  });

  await Promise.all([...notifications, ...fcmMessages]);
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

  if (afterData.participants.length > beforeData.participants.length) {
    const newParticipantId = afterData.participants.find(
      (p: string) => !beforeData.participants.includes(p),
    );

    if (newParticipantId) {
      const ownerId = afterData.ownerId;
      const ownerProfileDoc = await db.collection("users").doc(ownerId).get();
      const ownerProfile = ownerProfileDoc.data();

      if (ownerProfile) {
        const notification = {
          userId: ownerId,
          type: "warp_join",
          warpId: warpId,
          actorId: newParticipantId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const notificationPromise = db.collection("notifications").add(notification);
        const promises: (Promise<any>)[] = [notificationPromise];

        if (ownerProfile.fcmTokens && ownerProfile.fcmTokens.length > 0) {
            const actorProfileDoc = await db.collection("users").doc(newParticipantId).get();
            const actorProfile = actorProfileDoc.data();
            const warpName = afterData.what || "a warp";

            if (actorProfile) {
                const message = {
                    notification: {
                        title: "Someone joined your warp!",
                        body: `${actorProfile.username} just joined ${warpName}.`,
                    },
                    tokens: ownerProfile.fcmTokens,
                };
                promises.push(getMessaging().sendEachForMulticast(message));
            }
        }
        return Promise.all(promises);
      }
    }
  }
  return null;
});

export const deleteUserAccount = onCall({region: "europe-west3", cors: true}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to delete your account.");
    }

    const userId = request.auth.uid;
    const batch = db.batch();

    // 1. Remove the user from any warps they've joined
    const warpsJoinedSnapshot = await db.collection("warps")
        .where("participants", "array-contains", userId)
        .get();
    warpsJoinedSnapshot.forEach((doc) => {
        batch.update(doc.ref, { participants: admin.firestore.FieldValue.arrayRemove(userId) });
    });

    // 2. Delete any warps owned by the user
    const warpsOwnedSnapshot = await db.collection("warps")
        .where("ownerId", "==", userId)
        .get();
    warpsOwnedSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // 3. Delete notifications for and by the user
    const notificationsForUserSnapshot = await db.collection("notifications").where("userId", "==", userId).get();
    notificationsForUserSnapshot.forEach((doc) => { batch.delete(doc.ref); });
    const notificationsByUserSnapshot = await db.collection("notifications").where("actorId", "==", userId).get();
    notificationsByUserSnapshot.forEach((doc) => { batch.delete(doc.ref); });

    // 4. Delete the user's profile
    const userProfileRef = db.collection("users").doc(userId);
    batch.delete(userProfileRef);
    
    // Commit all Firestore deletions
    await batch.commit();

    // 5. Finally, delete the user from Firebase Auth
    await getAuth().deleteUser(userId);

    return { success: true };
});

export const cleanupOrphanedData = onSchedule({
  schedule: "every 24 hours",
  region: "europe-west3",
}, async () => {
    const batchSize = 100;
    let userIds = new Set<string>();

    // Step 1: Gather all unique user IDs from warps and notifications
    const warpsSnapshot = await db.collection("warps").get();
    warpsSnapshot.forEach(doc => {
        const data = doc.data();
        userIds.add(data.ownerId);
        if (data.participants) {
            data.participants.forEach((p: string) => userIds.add(p));
        }
    });

    const notificationsSnapshot = await db.collection("notifications").get();
    notificationsSnapshot.forEach(doc => {
        const data = doc.data();
        userIds.add(data.userId);
        userIds.add(data.actorId);
    });

    const uniqueUserIds = Array.from(userIds);
    const existingUserIds = new Set<string>();

    // Step 2: Check for user existence in batches
    for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
        const batchIds = uniqueUserIds.slice(i, i + batchSize);
        const userResults = await getAuth().getUsers(batchIds.map(uid => ({ uid })));
        userResults.users.forEach(user => existingUserIds.add(user.uid));
    }

    // Step 3: Identify orphaned user IDs
    const orphanedIds = uniqueUserIds.filter(uid => !existingUserIds.has(uid));

    if (orphanedIds.length === 0) {
        console.log("No orphaned data found.");
        return;
    }

    // Step 4: Delete orphaned data
    const batch = db.batch();
    for (const userId of orphanedIds) {
        // Delete user profile
        batch.delete(db.collection("users").doc(userId));
        
        // Delete warps owned by user
        const warpsOwnedSnapshot = await db.collection("warps").where("ownerId", "==", userId).get();
        warpsOwnedSnapshot.forEach(doc => batch.delete(doc.ref));

        // Remove from participants
        const warpsJoinedSnapshot = await db.collection("warps").where("participants", "array-contains", userId).get();
        warpsJoinedSnapshot.forEach(doc => batch.update(doc.ref, { participants: admin.firestore.FieldValue.arrayRemove(userId) }));

        // Delete notifications
        const notificationsForUserSnapshot = await db.collection("notifications").where("userId", "==", userId).get();
        notificationsForUserSnapshot.forEach(doc => batch.delete(doc.ref));
        const notificationsByUserSnapshot = await db.collection("notifications").where("actorId", "==", userId).get();
        notificationsByUserSnapshot.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();
    console.log(`Cleaned up orphaned data for ${orphanedIds.length} users.`);
});

export const cleanupExpiredWarps = onSchedule({
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

export const cleanupOrphanedNotifications = onSchedule({
  schedule: "every 24 hours",
  region: "europe-west3",
}, async () => {
  // 1. Get all existing warp IDs
  const warpIds = new Set<string>();
  const warpsSnapshot = await db.collection("warps").select().get();
  warpsSnapshot.forEach((doc) => warpIds.add(doc.id));

  // 2. Find and delete notifications with non-existent warp IDs in chunks
  const notificationsQuery = db.collection("notifications");
  let lastVisible: admin.firestore.QueryDocumentSnapshot | null = null;
  let totalOrphanedCount = 0;
  const batchLimit = 400; // Firestore batch limit is 500, use a safe number

  while (true) {
    let query = notificationsQuery.limit(batchLimit);
    if (lastVisible) {
      query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();
    let batchDeletes = 0;
    snapshot.forEach((doc) => {
      const notification = doc.data();
      if (notification.warpId && !warpIds.has(notification.warpId)) {
        batch.delete(doc.ref);
        batchDeletes++;
      }
    });

    if (batchDeletes > 0) {
      await batch.commit();
      totalOrphanedCount += batchDeletes;
    }

    lastVisible = snapshot.docs[snapshot.docs.length - 1];
  }

  if (totalOrphanedCount > 0) {
    console.log(`Cleaned up ${totalOrphanedCount} orphaned notifications.`);
  } else {
    console.log("No orphaned notifications found.");
  }
});
