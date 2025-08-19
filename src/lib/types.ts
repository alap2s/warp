import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
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
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  warpId?: string;
  type?: 'new_warp' | 'warp_join';
}
