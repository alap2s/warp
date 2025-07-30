'use client';

import { useState, useEffect } from 'react';
import { getWarps as subscribeToWarps, createWarp as addWarp, deleteWarp as removeWarp, getWarpsByOwner, updateWarp as updateWarpInDb } from '@/lib/warp';
import { useAuth } from '@/context/AuthContext';
import { FormData } from '@/components/MakeWarpDialog';
import { getUsersByIds } from '@/lib/user';
import { Warp } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export const useWarps = () => {
  const { user, profile } = useAuth();
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
    if (!user || !profile) return;
    setSaving(true);
    const existingWarps = await getWarpsByOwner(user.uid);
    for (const warp of existingWarps) {
      await removeWarp(warp.id);
    }
    const newWarpData = {
      ...data,
      ownerId: user.uid,
    };
    const newWarpId = await addWarp(newWarpData);
    
    // Optimistic update
    const newWarp: Warp = {
      ...newWarpData,
      id: newWarpId,
      when: Timestamp.fromDate(data.when),
      participants: [],
      user: {
        username: profile.username,
        icon: profile.icon,
      },
      coordinates: data.coordinates || undefined,
    };

    setWarps(prevWarps => [...prevWarps.filter(w => w.ownerId !== user.uid), newWarp]);
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