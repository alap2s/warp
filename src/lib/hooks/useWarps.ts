'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWarps as fetchWarps, createWarp as addWarp, deleteWarp as removeWarp, getWarpsByOwner } from '@/lib/warp';
import { useAuth } from '@/context/AuthContext';
import { FormData } from '@/components/MakeWarpDialog';
import { getUsersByIds } from '@/lib/user';

export const useWarps = () => {
  const { user } = useAuth();
  const [warps, setWarps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWarps = useCallback(async () => {
    setLoading(true);
    const allWarps = await fetchWarps();
    const ownerIds = allWarps.map(warp => warp.ownerId).filter((id, index, self) => self.indexOf(id) === index);
    const users = await getUsersByIds(ownerIds);
    const warpsWithUser = allWarps.map(warp => ({ ...warp, user: users[warp.ownerId] }));
    setWarps(warpsWithUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshWarps();
  }, [refreshWarps]);

  const createWarp = async (data: Omit<FormData, 'icon'> & { icon: string }) => {
    if (!user) return;

    // --- V1 Release: One warp per user ---
    // In the future, we can remove this block to allow multiple warps.
    const existingWarps = await getWarpsByOwner(user.uid);
    for (const warp of existingWarps) {
      await removeWarp(warp.id);
    }
    // --- End V1 Release ---

    const warpId = await addWarp({
      ...data,
      ownerId: user.uid,
    });
    if (warpId) {
      await refreshWarps();
    }
  };

  const deleteWarp = async (id: string) => {
    await removeWarp(id);
    await refreshWarps();
  };

  return { warps, loading, refreshWarps, createWarp, deleteWarp };
}; 