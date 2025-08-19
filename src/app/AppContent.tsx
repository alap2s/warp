'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import WelcomeDialog from '@/components/WelcomeDialog';
import ProfileDialog from '@/components/ProfileDialog';
import { useSearchParams } from 'next/navigation';
import { useGridState } from '@/context/GridStateContext';
import { createUserProfile, updateUserProfile, getUsersByIds } from '@/lib/user';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import GridUIManager from '@/components/GridUIManager';
import { playDialogSound } from '@/lib/audio';
import { Warp } from '@/lib/types';
import { getWarp } from '@/lib/warp';

const GridCanvas = dynamic(() => import('@/components/InteractiveGrid'), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-black" />,
});

const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const { setUsername, setIcon } = useGridState();
  const [step] = useState(0);

  const handleWelcomeComplete = (username: string, icon: string) => {
    setUsername(username);
    setIcon(icon);
    onComplete();
  };

  if (step === 0) {
    return <WelcomeDialog onComplete={handleWelcomeComplete} />;
  }

  return null;
};


const AppContent = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  const { 
    setSelectedWarp,
    username,
    icon,
    isMeDialogOpen,
    setMeDialogOpen,
  } = useGridState();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialWarpId, setInitialWarpId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const warpId = searchParams.get('warpId');
    if (warpId) {
      setInitialWarpId(warpId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (initialWarpId && !loading && !profileLoading) {
      const fetchWarp = async () => {
        const warpData = await getWarp(initialWarpId) as Warp | null;
        if (warpData) {
          const users = await getUsersByIds([warpData.ownerId, ...warpData.participants]);
          const ownerUser = users[warpData.ownerId];
          if (ownerUser) {
            warpData.user = ownerUser;
          }
          setSelectedWarp(warpData);
          playDialogSound('open');
        }
        // Clear the initial warp ID to prevent re-triggering
        setInitialWarpId(null);
      };
      fetchWarp();
    }
  }, [initialWarpId, loading, profileLoading, setSelectedWarp]);


  useEffect(() => {
    if (!loading && !user) {
      signInAnonymously(auth).catch(console.error);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!profileLoading && user && !profile) {
      setShowOnboarding(true);
    }
  }, [profile, user, profileLoading]);

  const handleOnboardingComplete = () => {
    if (user && username && icon) {
      createUserProfile(user.uid, { username, icon }).then(() => {
        setShowOnboarding(false);
      });
    }
  };

  const handleProfileUpdate = (newUsername: string, newIcon: string) => {
    if (user) {
      updateUserProfile(user.uid, { username: newUsername, icon: newIcon }).then(() => {
        setMeDialogOpen(false);
      });
    }
  };

  return (
    <>
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
      {profile && <GridUIManager />}
      {isMeDialogOpen && profile && (
        <ProfileDialog
          userProfile={profile}
          onClose={() => setMeDialogOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
      <GridCanvas />
    </>
  );
};

export default AppContent;
