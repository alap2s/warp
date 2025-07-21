import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from "./firebase";

export const createUserProfile = async (uid: string, data: { username: string; icon: string; photoURL?: string }) => {
  try {
    await setDoc(doc(db, "users", uid), {
      ...data,
      uid,
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: { username?: string; icon?: string; photoURL?: string }) => {
  try {
    const docRef = doc(db, "users",uid);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
}; 