'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import WelcomeDialog from '@/components/WelcomeDialog';
import { signInAnonymously } from '@/lib/auth';
import { createUserProfile } from '@/lib/user';
import ProfileDialog from '@/components/ProfileDialog';
import { GridStateProvider, useGridState } from '@/context/GridStateContext';

const InteractiveGrid = dynamic(() => import('@/components/InteractiveGrid'), {
  ssr: false,
});

const OnboardingManager = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { setDialogSize, setProfileDialogSize } = useGridState();

  const handleSignIn = async () => {
    await signInAnonymously();
  };

  const handleProfileCreate = async (data: { username: string; icon: string }) => {
    if (user) {
      await createUserProfile(user.uid, data);
      await refreshProfile();
    }
  };

  useEffect(() => {
    // When the user's auth or profile state changes, we clean up the depressions
    // left by the onboarding dialogs.
    if (user) {
      // User has signed in, so we can remove the welcome dialog's depression.
      setDialogSize(null);
    }
    if (profile) {
      // User has created a profile, so we can remove the profile dialog's depression.
      setProfileDialogSize(null);
    }
  }, [user, profile, setDialogSize, setProfileDialogSize]);


  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <WelcomeDialog onNext={handleSignIn} onClose={() => {}} onSizeChange={setDialogSize} />;
  }

  if (!profile) {
    return <ProfileDialog initialData={null} onSave={handleProfileCreate} onClose={() => {}} onSizeChange={setProfileDialogSize} />;
  }

  return null;
}

export default function Home() {
  return (
    <div className="relative w-screen h-screen">
      <GridStateProvider>
        <InteractiveGrid />
        <OnboardingManager />
      </GridStateProvider>
    </div>
  );
}
