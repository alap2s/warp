'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import WelcomeDialog from '@/components/WelcomeDialog';
import ProfileDialog from '@/components/ProfileDialog';
import { useSearchParams } from 'next/navigation';
import { GridStateProvider, useGridState } from '@/context/GridStateContext';
import { useWarps } from '@/lib/hooks/useWarps';
import { createUserProfile, updateUserProfile } from '@/lib/user';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import GridUIManager from '@/components/GridUIManager';

const GridCanvas = dynamic(() => import('@/components/InteractiveGrid'), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-black" />,
});

const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const { setDialogSize } = useGridState();
  const { user, loading, refreshProfile } = useAuth();
  const [step, setStep] = useState<'welcome' | 'profile' | 'done'>('welcome');

  useEffect(() => {
    const signIn = async () => {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    };
    signIn();
  }, []);
  
  const handleNext = () => setStep('profile');
  
  const handleProfileSave = async (data: { username: string, icon: string }) => {
    if (user) {
      await createUserProfile(user.uid, data);
      await refreshProfile();
      onComplete();
      setStep('done');
      setDialogSize(null);
    }
  };

  if (loading || step === 'done') return null;

  if (step === 'welcome') {
    return (
      <WelcomeDialog
        onNext={handleNext}
        onClose={() => {}}
        onSizeChange={setDialogSize}
      />
    );
  }

  if (step === 'profile' && user) {
    return (
      <ProfileDialog
        onSave={handleProfileSave}
        onClose={() => setStep('welcome')}
        onSizeChange={setDialogSize}
      />
    );
  }

  return null;
};

const AppContent = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // This effect is for redirecting users who arrived from a shared link
    // after they complete onboarding.
    if (!loading && profile) {
      const redirectTo = searchParams.get('redirectTo');
      if (redirectTo) {
        setRedirecting(true);
        window.location.href = redirectTo;
      }
    }
  }, [loading, profile, searchParams]);

  const handleOnboardingComplete = () => {
    if (Notification.permission === 'default') {
      setTimeout(async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && user) {
          await updateUserProfile(user.uid, { notificationsEnabled: true });
          await refreshProfile();
        }
      }, 20000); // 20 seconds
    }
  };

  if (loading || redirecting) {
    return <div className="w-screen h-screen bg-black" />;
  }

  return (
    <>
      <GridCanvas />
      {user && profile && <GridUIManager />}
      {!profile && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

const HomeApp = () => {
  const { warps, saving, createWarp, updateWarp, deleteWarp } = useWarps();
  return (
    <GridStateProvider
      warps={warps}
      createWarp={createWarp}
      updateWarp={updateWarp}
      deleteWarp={deleteWarp}
      isSaving={saving}
    >
      <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
        <AppContent />
      </Suspense>
    </GridStateProvider>
  );
};


export default function Home() {
  return <HomeApp />;
}
