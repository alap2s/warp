'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WelcomeDialog from '@/components/WelcomeDialog';
import { signInAnonymously } from '@/lib/auth';
import { createUserProfile } from '@/lib/user';
import ProfileDialog from '@/components/ProfileDialog';
import { GridStateProvider, useGridState } from '@/context/GridStateContext';
import { useWarps } from '@/lib/hooks/useWarps';

const InteractiveGrid = dynamic(() => import('@/components/InteractiveGrid'), {
  ssr: false,
});

const OnboardingManager = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { setDialogSize, setProfileDialogSize } = useGridState();
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('welcomeShown') === 'true';
    }
    return false;
  });

  const handleSignIn = async () => {
    await signInAnonymously();
  };

  const handleWelcomeNext = () => {
    sessionStorage.setItem('welcomeShown', 'true');
    setWelcomeDismissed(true);
    if (!user) {
      handleSignIn();
    }
  };

  const handleProfileCreate = async (data: { username: string; icon: string }) => {
    if (user) {
      await createUserProfile(user.uid, data);
      await refreshProfile();
    }
  };

  useEffect(() => {
    if (user) {
      setDialogSize(null);
    }
    if (profile) {
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

  if (!welcomeDismissed) {
    return <WelcomeDialog onNext={handleWelcomeNext} onClose={() => {}} onSizeChange={setDialogSize} />;
  }

  if (!user) {
    return <WelcomeDialog onNext={handleWelcomeNext} onClose={() => {}} onSizeChange={setDialogSize} />;
  }

  if (!profile) {
    return <ProfileDialog initialData={null} onSave={handleProfileCreate} onClose={() => {}} onSizeChange={setProfileDialogSize} />;
  }

  return null;
};

const Home = () => {
  const { warps, loading, saving, refreshWarps, createWarp, updateWarp, deleteWarp } = useWarps();

  return (
    <GridStateProvider warps={warps} createWarp={createWarp} updateWarp={updateWarp} deleteWarp={deleteWarp} isSaving={saving}>
      <InteractiveGrid />
      <OnboardingManager />
    </GridStateProvider>
  )
};

export default Home;
