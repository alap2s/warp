'use client';

import { useState, Suspense } from 'react';
import { GridStateProvider } from '@/context/GridStateContext';
import { useWarps } from '@/lib/hooks/useWarps';
import AppContent from './AppContent';

const HomeApp = () => {
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
      <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
        <AppContent />
      </Suspense>
    </GridStateProvider>
  );
};

export default HomeApp;
