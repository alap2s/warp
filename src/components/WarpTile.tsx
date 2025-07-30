'use client';

import React from 'react';
import { Warp } from '@/lib/types';
import { motion } from 'framer-motion';
import { getIcon } from './MakeWarpDialog';
import { formatShortDate } from '@/lib/utils';
import { formatDistance, getCurrentCoordinates } from '@/lib/location';

interface WarpTileProps {
  warp: Warp;
  username: string;
  position?: { x: number; y: number };
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSizeChange?: (size: { width: number; height: number } | null) => void;
  isNew?: boolean;
  joinerCount?: number;
  participantCount?: number;
}

const WarpTile = ({ 
  warp, 
  username, 
  position,
  onClick,
  onSizeChange,
  isNew,
  joinerCount,
  participantCount,
}: WarpTileProps) => {
  const Icon = getIcon(warp.icon);
  const tileRef = React.useRef<HTMLDivElement>(null);
  const [userCoords, setUserCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    if (onSizeChange && tileRef.current) {
      const { width, height } = tileRef.current.getBoundingClientRect();
      onSizeChange({ width, height });
    }
    return () => {
      if (onSizeChange) {
        onSizeChange(null);
      }
    }
  }, [onSizeChange]);

  React.useEffect(() => {
    getCurrentCoordinates()
      .then(coords => {
        setUserCoords(coords);
      })
      .catch(error => {
        // It's okay if this fails, we just won't show the distance.
        console.error("Could not get user coordinates for WarpTile:", error);
      });
  }, []);

  // Firestore Timestamps have a toDate() method
  const date = warp.when.toDate();
  const dateLabel = formatShortDate(date);
  const distanceLabel = userCoords ? formatDistance(userCoords, warp) : null;

  const tileContent = (
    <div 
      className="w-[84px] h-[84px] bg-black border-2 border-white/40 rounded-[24px] p-2 flex flex-col items-center justify-center gap-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute -top-2 -right-2">
        {joinerCount && joinerCount > 0 ? (
          <div className="bg-white rounded-full px-2 py-1">
            <p className="text-black text-xs font-bold">+1</p>
          </div>
        ) : isNew ? (
          <div className="bg-white rounded-full px-2 py-1">
            <p className="text-black text-xs font-bold">New</p>
          </div>
        ) : participantCount && participantCount > 0 ? (
          <div className="w-6 h-6 bg-black border-2 border-white/40 rounded-full flex items-center justify-center">
            <p className="text-white text-[10px] font-bold">{participantCount}</p>
          </div>
        ) : null}
      </div>
      <div className="w-5 h-5 text-white">
        {Icon && <Icon size={20} />}
      </div>
      <div className="flex flex-col items-center text-center">
        <p className="text-white text-xs font-medium truncate w-full">{username}</p>
        <p className="text-white/70 text-[10px] font-light w-full truncate">
          {dateLabel}{distanceLabel && `, ${distanceLabel}`}
        </p>
      </div>
    </div>
  );

  if (position) {
    return (
      <motion.div
        ref={tileRef}
        className="absolute"
        style={{ top: position.y, left: position.x }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {tileContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={tileRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
    >
      {tileContent}
    </motion.div>
  );
};

export default WarpTile; 