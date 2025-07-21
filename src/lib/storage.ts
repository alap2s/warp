import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadProfilePhoto = async (file: File, uid: string) => {
  try {
    const storageRef = ref(storage, `profile-photos/${uid}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return null;
  }
}; 