'use client';

import { useEffect, useState } from 'react';
import { getWarp } from '@/lib/warp';
import WarpTile from '@/components/WarpTile';
import { getIcon } from '@/components/MakeWarpDialog';

const WarpPage = ({ params }: { params: { id: string } }) => {
  const [warp, setWarp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarp = async () => {
      const warpData = await getWarp(params.id);
      setWarp(warpData);
      setLoading(false);
    };
    fetchWarp();
  }, [params.id]);

  if (loading) {
    return <div>Loading warp...</div>;
  }

  if (!warp) {
    return <div>Warp not found</div>;
  }

  const IconComponent = getIcon(warp.what);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center">
      <WarpTile warp={{...warp, icon: IconComponent}} username={''} onRemove={() => {}} />
    </div>
  );
};

export default WarpPage; 