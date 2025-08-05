import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@/lib/types';
import { playNotification } from '@/lib/audio';

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const prevNotificationCountRef = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userNotifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          userNotifications.push({ id: doc.id, ...doc.data() } as Notification);
        });

        if (!isInitialLoad.current && userNotifications.length > prevNotificationCountRef.current) {
            playNotification();
        }
        
        prevNotificationCountRef.current = userNotifications.length;
        isInitialLoad.current = false;

        setNotifications(userNotifications);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
        isInitialLoad.current = true;
        unsubscribe();
    }
  }, [userId]);

  return { notifications, loading, error };
};
