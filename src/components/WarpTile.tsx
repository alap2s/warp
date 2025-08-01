'use client';

import React from 'react';
import { Warp } from '@/lib/types';
import { motion } from 'framer-motion';
import { formatShortDate } from '@/lib/utils';
import { formatDistance, getCurrentCoordinates } from '@/lib/location';
import { Timestamp } from 'firebase/firestore';
import DynamicIcon from './ui/DynamicIcon';
import { getIconName } from '@/lib/icon-map';

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

const WarpTile = React.forwardRef<HTMLDivElement, WarpTileProps>(({ 
  warp, 
  username, 
  position,
  onClick,
  onSizeChange,
  isNew,
  joinerCount,
  participantCount,
}, ref) => {
  const iconName = getIconName(warp.what);
  const [userCoords, setUserCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  React.useLayoutEffect(() => {
    const currentRef = ref && 'current' in ref ? ref.current : null;
    if (onSizeChange && currentRef) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          onSizeChange({ width, height });
        }
      });
      observer.observe(currentRef);
      return () => observer.disconnect();
    }
  }, [onSizeChange, ref]);

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

  const formatWarpTime = (when: Date | Timestamp) => {
    const date = when instanceof Timestamp ? when.toDate() : new Date(when);
    const now = new Date();

    const diffMinutes = (date.getTime() - now.getTime()) / 60000;

    if (diffMinutes > -120 && diffMinutes <= 15) {
      return "Now";
    }

    const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return formatShortDate(date);
    }
  };

  const dateLabel = formatWarpTime(warp.when);
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
        <DynamicIcon name={iconName} size={20} />
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
        ref={ref}
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
      ref={ref}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
    >
      {tileContent}
    </motion.div>
  );
});

WarpTile.displayName = 'WarpTile';

export default WarpTile; 