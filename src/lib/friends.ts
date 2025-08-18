import { db } from './firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { UserProfile } from './types';

/**
 * Generates a unique 8-character hexadecimal invite code.
 * This is a placeholder and should be replaced with a more robust
 * and secure method for a production environment.
 * @param userId The ID of the user generating the code.
 * @returns A promise that resolves to the generated invite code.
 */
export const generateInviteCode = async (userId: string): Promise<string> => {
  // Generate a random 8-character hex string
  const code = [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await addDoc(collection(db, 'invites'), {
    code,
    userId,
    expiresAt,
    used: false,
  });

  return code;
};

export const acceptInviteCode = async (code: string, acceptingUserId: string): Promise<void> => {
  const invitesRef = collection(db, 'invites');
  const q = query(invitesRef, where('code', '==', code), where('used', '==', false));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Invalid or expired invite code.');
  }

  const inviteDoc = querySnapshot.docs[0];
  const inviteData = inviteDoc.data();

  if (new Date() > inviteData.expiresAt.toDate()) {
    throw new Error('Expired invite code.');
  }

  if (inviteData.userId === acceptingUserId) {
    throw new Error('You cannot accept your own invite code.');
  }

  const batch = writeBatch(db);

  // Add each user to the other's friends list
  const user1Ref = doc(db, 'users', inviteData.userId);
  const user2Ref = doc(db, 'users', acceptingUserId);

  // Assuming 'friends' is a subcollection. Let's add a document to it.
  // This is more scalable than an array of friend IDs.
  const user1FriendRef = doc(collection(user1Ref, 'friends'), acceptingUserId);
  batch.set(user1FriendRef, { friendSince: serverTimestamp() });
  
  const user2FriendRef = doc(collection(user2Ref, 'friends'), inviteData.userId);
  batch.set(user2FriendRef, { friendSince: serverTimestamp() });
  
  // Mark the invite code as used
  batch.update(inviteDoc.ref, { used: true });

  await batch.commit();
};

export const getFriends = async (userId: string): Promise<UserProfile[]> => {
  const friendsRef = collection(db, 'users', userId, 'friends');
  const querySnapshot = await getDocs(friendsRef);
  
  const friendIds = querySnapshot.docs.map(doc => doc.id);
  
  if (friendIds.length === 0) {
    return [];
  }

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('uid', 'in', friendIds));
  const usersSnapshot = await getDocs(q);
  
  return usersSnapshot.docs.map(doc => doc.data() as UserProfile);
};

export const onFriendsUpdate = (userId: string, callback: (friends: UserProfile[]) => void) => {
  const friendsRef = collection(db, 'users', userId, 'friends');
  
  return onSnapshot(friendsRef, async () => {
    const friends = await getFriends(userId);
    callback(friends);
  });
};
