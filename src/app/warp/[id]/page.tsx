'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GridCanvas from '@/components/InteractiveGrid';
import { useGridState, GridStateProvider } from '@/context/GridStateContext';
import { getWarp } from '@/lib/warp';
import { getUsersByIds } from '@/lib/user';
import { Warp } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useWarps } from '@/lib/hooks/useWarps';

const WarpLoader = () => {
  const { id } = useParams<{ id: string }>();
  const { setActiveWarp, openWarpDialog } = useGridState();
  const { user, loading: authLoading } = useAuth();
  const [warpLoaded, setWarpLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || warpLoaded) return;

    const fetchAndSetWarp = async () => {
      const warpData = await getWarp(id);
      if (warpData) {
        // We need to fetch the owner's profile to display it correctly
        const users = await getUsersByIds([warpData.ownerId]);
        const warpWithUser = { ...warpData, user: users[warpData.ownerId] };
        
        setActiveWarp(warpWithUser as Warp);
        openWarpDialog();
        setWarpLoaded(true);
      }
    };
    fetchAndSetWarp();
  }, [id, setActiveWarp, openWarpDialog, user, authLoading, warpLoaded]);

  return null;
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
    <SharedWarpApp />
  );
};

export default SharedWarpPage; 