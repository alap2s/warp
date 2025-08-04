import { getMessaging, getToken } from 'firebase/messaging';
import { app } from './firebase';
import { updateUserProfile } from './user';
import { auth } from './firebase';

export const initializeFcm = async () => {
    const messaging = getMessaging(app);
    try {
        // Get the service worker registration.
        const serviceWorkerRegistration = await navigator.serviceWorker.ready;
        const currentToken = await getToken(messaging, { 
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration, // Pass the registration to getToken
        });

        if (currentToken) {
            console.log('FCM Token:', currentToken);
            const user = auth.currentUser;
            if (user) {
                await updateUserProfile(user.uid, { fcmToken: currentToken, notificationsEnabled: true });
            }
            return currentToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        return null;
    }
};
