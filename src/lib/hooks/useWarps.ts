'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWarps as fetchWarps, createWarp as addWarp, deleteWarp as removeWarp, getWarpsByOwner, updateWarp as updateWarpInDb } from '@/lib/warp';
import { useAuth } from '@/context/AuthContext';
import { FormData } from '@/components/MakeWarpDialog';
import { getUsersByIds } from '@/lib/user';

export const useWarps = () => {
  const { user } = useAuth();
  const [warps, setWarps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refreshWarps = useCallback(async () => {
    if (!user) {
      setWarps([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const allWarps = await fetchWarps();
    if (allWarps.length > 0) {
      const ownerIds = [...new Set(allWarps.map(warp => warp.ownerId))].filter(Boolean) as string[];
      const users = await getUsersByIds(ownerIds);
      const warpsWithUser = allWarps.map(warp => ({ ...warp, user: users[warp.ownerId] }));
      setWarps(warpsWithUser);
    } else {
        setWarps([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshWarps();
  }, [refreshWarps]);

  const createWarp = async (data: Omit<FormData, 'icon'> & { icon: string }) => {
    if (!user) return;
    setSaving(true);

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
    setSaving(false);
  };

  const updateWarp = async (id: string, data: Partial<FormData>) => {
    setSaving(true);
    await updateWarpInDb(id, data);
    await refreshWarps();
    setSaving(false);
  };

  const deleteWarp = async (id: string) => {
    await removeWarp(id);
    await refreshWarps();
  };

  return { warps, loading, saving, refreshWarps, createWarp, updateWarp, deleteWarp };
}; 