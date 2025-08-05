'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GridCanvas from '@/components/InteractiveGrid';
import { GridStateProvider } from '@/context/GridStateContext';
import { getWarp } from '@/lib/warp';
import { getUsersByIds } from '@/lib/user';
import { Warp } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useWarps } from '@/lib/hooks/useWarps';
import GridUIManager from '@/components/GridUIManager';

const WarpLoader = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [warp, setWarp] = useState<Warp | null>(null);
  const [warpExists, setWarpExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return; // Wait for auth to resolve

    const fetchWarp = async () => {
      const warpData = await getWarp(id);
      if (warpData) {
        const users = await getUsersByIds([warpData.ownerId]);
        const warpWithUser = { ...warpData, user: users[warpData.ownerId] };
        setWarp(warpWithUser as Warp);
        setWarpExists(true);
      } else {
        setWarpExists(false);
      }
    };
    fetchWarp();
  }, [id, loading]);

  useEffect(() => {
    if (warpExists === false) {
      router.push('/');
    }
  }, [warpExists, router]);

  // If we're still determining if the warp exists, or if auth is loading, or if the warp is being fetched, show a blank screen.
  if (warpExists === null || loading || !warp) {
    return <div className="w-screen h-screen bg-black" />;
  }
  
  // Pass the loaded warp to the UI manager and let it handle the logic
  // If there's no profile, it's a preview.
  return <GridUIManager sharedWarp={warp} isPreview={!profile} />;
};


const SharedWarpApp = () => {
  const { warps, saving, createWarp, updateWarp, deleteWarp } = useWarps();

  return (
    <GridStateProvider
      warps={warps}
      createWarp={createWarp}
      updateWarp={updateWarp}
      deleteWarp={deleteWarp}
      isSaving={saving}
    >
      <GridCanvas />
      <WarpLoader />
    </GridStateProvider>
  );
  }


const SharedWarpPage = () => {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
        <SharedWarpApp />
    </Suspense>
  );
};

export default SharedWarpPage;
