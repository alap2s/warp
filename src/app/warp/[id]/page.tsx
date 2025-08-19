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

  useEffect(() => {
    if (loading) {
      return;
    }

    // If there's no profile, it's a new user. Redirect to onboarding on the main page.
    if (!profile) {
      window.location.href = `/?redirectTo=/warp/${id}`;
      return;
    }

    // Existing user: fetch the warp data directly.
    const fetchWarp = async () => {
      const warpData = await getWarp(id);
      if (warpData) {
        const users = await getUsersByIds([warpData.ownerId]);
        const warpWithUser = { ...warpData, user: users[warpData.ownerId] };
        setWarp(warpWithUser as Warp);
      } else {
        // If the warp doesn't exist for an existing user, just go home.
        router.push('/');
      }
    };

    fetchWarp();
  }, [id, loading, profile, router]);

  // For existing users, show a loading state while fetching.
  if (loading || !warp) {
    return <div className="w-screen h-screen bg-black" />;
  }
  
  // Existing users see the warp UI directly on this page.
  return <GridUIManager sharedWarp={warp} />;
};


const SharedWarpApp = () => {
  const [filter, setFilter] = useState<'all' | 'friends'>('all');
  const { warps, saving, createWarp, updateWarp, deleteWarp } = useWarps({ filter });

  return (
    <GridStateProvider
      warps={warps}
      createWarp={createWarp}
      updateWarp={updateWarp}
      deleteWarp={deleteWarp}
      isSaving={saving}
      filter={filter}
      setFilter={setFilter}
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
