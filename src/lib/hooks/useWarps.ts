'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWarps as subscribeToWarps, createWarp as addWarp, deleteWarp as removeWarp, getWarpsByOwner, updateWarp as updateWarpInDb } from '@/lib/warp';
import { useAuth } from '@/context/AuthContext';
import { FormData } from '@/components/MakeWarpDialog';
import { getUsersByIds } from '@/lib/user';
import { Warp } from '@/lib/types';

export const useWarps = () => {
  const { user } = useAuth();
  const [warps, setWarps] = useState<Warp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setWarps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToWarps(async (allWarps) => {
      if (allWarps.length > 0) {
        const ownerIds = [...new Set(allWarps.map(warp => warp.ownerId))].filter(Boolean) as string[];
        const users = await getUsersByIds(ownerIds);
        const warpsWithUser = allWarps.map(warp => ({ ...warp, user: users[warp.ownerId] }));
        setWarps(warpsWithUser);
      } else {
        setWarps([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createWarp = async (data: Omit<FormData, 'icon'> & { icon: string }) => {
    if (!user) return;
    setSaving(true);
    const existingWarps = await getWarpsByOwner(user.uid);
    for (const warp of existingWarps) {
      await removeWarp(warp.id);
    }
    await addWarp({
      ...data,
      ownerId: user.uid,
    });
    setSaving(false);
  };

  const updateWarp = async (id: string, data: Partial<FormData>) => {
    setSaving(true);
    await updateWarpInDb(id, data);
    setSaving(false);
  };

  const deleteWarp = async (id: string) => {
    await removeWarp(id);
  };

  return { warps, loading, saving, createWarp, updateWarp, deleteWarp };
}; 