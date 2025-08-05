'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GridCanvas from '@/components/InteractiveGrid';
import { useGridState, GridStateProvider } from '@/context/GridStateContext';
import { getWarp } from '@/lib/warp';
import { getUsersByIds } from '@/lib/user';
import { Warp } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useWarps } from '@/lib/hooks/useWarps';
import GridUIManager from '@/components/GridUIManager';

const WarpLoader = () => {
  const { id } = useParams<{ id: string }>();
  const { setActiveWarp, openWarpDialog } = useGridState();
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchAndDisplayWarp = async () => {
      const warpData = await getWarp(id);
      if (warpData) {
        const users = await getUsersByIds([warpData.ownerId]);
        const warpWithUser = { ...warpData, user: users[warpData.ownerId] };
        
        setActiveWarp(warpWithUser as Warp);
        openWarpDialog();
      }
    };

    if (!authLoading) {
        fetchAndDisplayWarp();
    }
  }, [id, setActiveWarp, openWarpDialog, authLoading, profile, router]);

  return <GridUIManager />;
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
