import { db, functions } from './firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, writeBatch, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { UserProfile } from './types';

/**
 * Generates a unique 8-character hexadecimal invite code that is not currently in use.
 * @param userId The ID of the user generating the code.
 * @returns A promise that resolves to the generated invite code.
 */
export const generateInviteCode = async (userId: string): Promise<string> => {
  let code: string = '';
  let isUnique = false;
  
  while (!isUnique) {
    code = [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const q = query(collection(db, 'invites'), where('code', '==', code));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      isUnique = true;
    }
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await addDoc(collection(db, 'invites'), {
    code,
    userId,
    expiresAt,
    used: false,
  });

  return code;
};

export const acceptInviteCode = async (code: string): Promise<void> => {
  try {
    const acceptInviteFunction = httpsCallable(functions, 'acceptInvite');
    await acceptInviteFunction({ code });
  } catch (error: any) {
    // It's good practice to re-throw a more user-friendly error
    // or an error that's consistent with your app's error handling.
    console.error("Error calling acceptInvite function:", error);
    throw new Error(error.message || 'Failed to accept invite code.');
  }
};

export const getFriends = async (userId: string): Promise<UserProfile[]> => {
  const friendsRef = collection(db, 'users', userId, 'friends');
  const querySnapshot = await getDocs(friendsRef);
  
  const friendIds = querySnapshot.docs.map(doc => doc.id);
  
  if (friendIds.length === 0) {
    return [];
  }

  // Firestore 'in' queries are limited to 10 items. We need to handle more.
  const friendProfiles: UserProfile[] = [];
  const chunks = [];
  for (let i = 0; i < friendIds.length; i += 10) {
    chunks.push(friendIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', 'in', chunk));
    const usersSnapshot = await getDocs(q);
    usersSnapshot.forEach(doc => {
      friendProfiles.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });
  }
  
  return friendProfiles;
};

export const onFriendsUpdate = (userId: string, callback: (friends: UserProfile[]) => void) => {
  const friendsRef = collection(db, 'users', userId, 'friends');
  
  return onSnapshot(friendsRef, async () => {
    const friends = await getFriends(userId);
    callback(friends);
  });
};
