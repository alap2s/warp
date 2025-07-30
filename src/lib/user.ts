import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { auth, db } from "./firebase";
import { getWarpsByOwner, deleteWarp } from "./warp";
import { deleteUser as deleteFirebaseUser } from "firebase/auth";
import { UserProfile } from "./types";

export const createUserProfile = async (uid: string, data: { username: string; icon: string; photoURL?: string }) => {
  try {
    await setDoc(doc(db, "users", uid), {
      ...data,
      uid,
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw new Error('Failed to create user profile. Please try again.');
  }
};

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

export const getUsersByIds = async (uids: string[]) => {
  if (uids.length === 0) {
    return {};
  }
  try {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where('uid', 'in', uids));
  const querySnapshot = await getDocs(q);
    const users: { [key: string]: UserProfile } = {};
  querySnapshot.forEach((doc) => {
      users[doc.id] = doc.data() as UserProfile;
  });
  return users;
  } catch (error) {
    console.error("Error getting user profiles by IDs:", error);
    throw new Error('Failed to retrieve user profiles. Please try again.');
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new Error('Failed to get user profile. Please try again.');
  }
};

export const updateUserProfile = async (
  userId: string,
  data: {
    username?: string;
    icon?: string;
    photoURL?: string;
    notificationsEnabled?: boolean;
  }
) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

export const deleteUserProfile = async (uid: string) => {
  try {
    await deleteDoc(doc(db, "users", uid));
  } catch (error) {
    console.error("Error deleting user profile:", error);
    throw new Error('Failed to delete user profile. Please try again.');
  }
};

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is signed in to delete.");
  }

  try {
    // 1. Delete all warps owned by the user
    const userWarps = await getWarpsByOwner(user.uid);
    for (const warp of userWarps) {
      await deleteWarp(warp.id);
    }

    // 2. Delete the user's profile document
    await deleteUserProfile(user.uid);

    // 3. Delete the user from Firebase Authentication
    await deleteFirebaseUser(user);

    console.log("User account deleted successfully.");
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw new Error('Failed to delete user account. This may require you to sign in again.');
  }
}; 