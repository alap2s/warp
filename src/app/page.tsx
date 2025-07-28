'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import WelcomeDialog from '@/components/WelcomeDialog';
import ProfileDialog from '@/components/ProfileDialog';
import { useSearchParams } from 'next/navigation';
import { GridStateProvider, useGridState } from '@/context/GridStateContext';
import { useWarps } from '@/lib/hooks/useWarps';
import { createUserProfile } from '@/lib/user';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
  const { profile, loading } = useAuth();
  const searchParams = useSearchParams();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && profile && onboardingComplete) {
      const redirectTo = searchParams.get('redirectTo');
      if (redirectTo) {
        setRedirecting(true);
        window.location.href = redirectTo;
      }
    }
  }, [loading, profile, onboardingComplete, searchParams]);

  if (loading || redirecting) {
    return <div className="w-screen h-screen bg-black" />;
  }

  return (
    <>
      <GridCanvas />
      {!profile && <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />}
    </>
  );
}

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
