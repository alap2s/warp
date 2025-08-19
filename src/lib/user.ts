import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { auth, db } from "./firebase";
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
      users[doc.id] = { ...doc.data(), uid: doc.id } as UserProfile;
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

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is signed in to delete.");
  }

  try {
    // Deleting the user from Firebase Authentication will trigger
    // the onUserDelete cloud function to clean up all their data.
    await deleteFirebaseUser(user);
    console.log("User account deleted successfully. Backend cleanup initiated.");
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw new Error('Failed to delete user account. This may require you to sign in again.');
  }
};
