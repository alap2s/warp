'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import WelcomeDialog from '@/components/WelcomeDialog';
import { signInAnonymously } from '@/lib/auth';
import { getUserProfile, createUserProfile } from '@/lib/user';
import { useEffect, useState } from 'react';
import ProfileDialog from '@/components/ProfileDialog';

const InteractiveGrid = dynamic(() => import('@/components/InteractiveGrid'), {
  ssr: false,
});

export default function Home() {
  const { user, loading } = useAuth();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      const checkProfile = async () => {
        const profile = await getUserProfile(user.uid);
        setProfileExists(!!profile);
      };
      checkProfile();
    }
  }, [user]);

  if (loading || profileExists === null) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  const handleSignIn = async () => {
    await signInAnonymously();
  };

  const handleProfileCreate = async (data: { username: string; icon: string }) => {
    if (user) {
      await createUserProfile(user.uid, data);
      setProfileExists(true);
    }
  };

  if (!user) {
    return (
      <div className="relative w-screen h-screen">
        <WelcomeDialog onNext={handleSignIn} onClose={() => {}} />
      </div>
    );
  }

  if (!profileExists) {
    return (
      <div className="relative w-screen h-screen">
        <ProfileDialog initialData={null} onSave={handleProfileCreate} onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen">
      <InteractiveGrid />
    </div>
  );
}
