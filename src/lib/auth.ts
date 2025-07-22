import { signInAnonymously as firebaseSignInAnonymously } from "firebase/auth";
import { auth } from "./firebase";

export const signInAnonymously = async () => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw new Error('Anonymous sign-in failed. Please try again.');
  }
}; 