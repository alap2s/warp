import { Timestamp } from 'firebase/firestore';

export type NotificationType = 'new_warp' | 'warp_join';

export interface Notification {
  id: string;
  userId: string; // The ID of the user who should receive the notification
  type: NotificationType;
  warpId: string;
  actorId: string; // The ID of the user who triggered the notification
  createdAt: Timestamp;
  read: boolean;
} 