import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createWarp = async (data: { what: string; when: Date; where: string; icon: string; ownerId: string }) => {
  try {
    const docRef = await addDoc(collection(db, "warps"), {
      ...data,
      when: data.when, // Firestore will convert this to a Timestamp
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating warp:", error);
    return null;
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
    return [];
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
    return null;
  }
};

export const updateWarp = async (id: string, data: Partial<{ what: string; when: Date; where: string; icon: string }>) => {
  try {
    const warpRef = doc(db, "warps", id);
    await updateDoc(warpRef, data);
  } catch (error) {
    console.error("Error updating warp:", error);
  }
};

export const deleteWarp = async (id: string) => {
  try {
    await deleteDoc(doc(db, "warps", id));
  } catch (error) {
    console.error("Error deleting warp:", error);
  }
}; 