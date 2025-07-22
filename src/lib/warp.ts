import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./firebase";

export const createWarp = async (data: { what: string; when: Date; where: string; icon: string; ownerId: string }) => {
  try {
    const docRef = await addDoc(collection(db, "warps"), {
      ...data,
      when: data.when, 
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating warp:", error);
    throw new Error('Failed to create warp. Please try again.');
  }
};

export const getWarps = async () => {
  try {
    const warpsCol = collection(db, "warps");
    const warpsSnapshot = await getDocs(warpsCol);
    const warpsList = warpsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return warpsList;
  } catch (error) {
    console.error("Error getting warps:", error);
    throw new Error('Failed to get warps. Please try again.');
  }
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
      return { id: warpSnap.id, ...warpSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting warp:", error);
    throw new Error('Failed to get warp. Please try again.');
  }
};

export const updateWarp = async (id: string, data: Partial<{ what: string; when: Date; where: string; icon: string }>) => {
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