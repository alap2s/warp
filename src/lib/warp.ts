import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Warp } from "./types";
import { getUserProfile } from './user';

export const createWarp = async (data: { what: string; when: Date; where: string; icon: string; ownerId: string; coordinates?: { lat: number; lng: number } | null }) => {
  try {
    const docRef = await addDoc(collection(db, "warps"), {
      ...data,
      participants: [],
      when: data.when, 
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating warp:", error);
    throw new Error('Failed to create warp. Please try again.');
  }
};

export const createNotification = async (
  userId: string,
  type: 'warp_join',
  warpId: string,
  actorId: string
) => {
  try {
    const userProfile = (await getUserProfile(userId)) as UserProfile | null;
    if (userProfile?.notificationsEnabled) {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        warpId,
        actorId,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]) => {
  if (!userId || notificationIds.length === 0) {
    return;
  }
  
  try {
    const batch: Promise<void>[] = [];
    notificationIds.forEach((notificationId) => {
      const notificationRef = doc(db, 'notifications', notificationId);
      batch.push(updateDoc(notificationRef, { read: true }));
    });

    await Promise.all(batch);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
};


export const getWarps = (onUpdate: (warps: Warp[]) => void) => {
    const warpsCol = collection(db, "warps");
  return onSnapshot(warpsCol, (snapshot) => {
    const warpsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Warp[];
    onUpdate(warpsList);
  });
};

export const getWarpsByOwner = async (ownerId: string) => {
  try {
    const warpsCol = collection(db, "warps");
    const q = query(warpsCol, where("ownerId", "==", ownerId));
    const warpsSnapshot = await getDocs(q);
    const warpsList = warpsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return warpsList;
  } catch (error) {
    console.error("Error getting warps by owner:", error);
    throw new Error('Failed to get warps. Please try again.');
  }
};

export const getWarp = async (id: string) => {
  try {
    const warpRef = doc(db, "warps", id);
    const warpSnap = await getDoc(warpRef);
    if (warpSnap.exists()) {
      return { id: warpSnap.id, ...warpSnap.data() } as Warp;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting warp:", error);
    throw new Error('Failed to get warp. Please try again.');
  }
};

export const updateWarp = async (id: string, data: Partial<{ what: string; when: Date; where: string; icon: string; coordinates?: { lat: number; lng: number } | null }>) => {
  try {
    const warpRef = doc(db, "warps", id);
    await updateDoc(warpRef, data);
  } catch (error) {
    console.error("Error updating warp:", error);
    throw new Error('Failed to update warp. Please try again.');
  }
};

export const deleteWarp = async (id: string) => {
  try {
    await deleteDoc(doc(db, "warps", id));
  } catch (error) {
    console.error("Error deleting warp:", error);
    throw new Error('Failed to delete warp. Please try again.');
  }
};

export const joinWarp = async (warpId: string, userId: string) => {
  try {
    const warpRef = doc(db, "warps", warpId);
    await updateDoc(warpRef, {
      participants: arrayUnion(userId)
    });
  } catch (error) {
    console.error("Error joining warp:", error);
    throw new Error('Failed to join warp. Please try again.');
  }
};

export const leaveWarp = async (warpId: string, userId: string) => {
  try {
    const warpRef = doc(db, "warps", warpId);
    await updateDoc(warpRef, {
      participants: arrayRemove(userId)
    });
  } catch (error) {
    console.error("Error leaving warp:", error);
    throw new Error('Failed to leave warp. Please try again.');
  }
}; 