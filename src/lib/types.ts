import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  username: string;
  icon: string;
  photoURL?: string;
  notificationsEnabled?: boolean;
}

export interface Warp {
  id: string;
  what: string;
  when: Timestamp;
  where: string;
  icon: string;
  ownerId: string;
  participants: string[];
  user?: UserProfile;
}
