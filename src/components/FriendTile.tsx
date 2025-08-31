'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';
import { motion } from 'framer-motion';
import DynamicIcon from './ui/DynamicIcon';
import Image from 'next/image';

interface FriendTileProps {
  friend: UserProfile;
  position?: { x: number; y: number };
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const FriendTile = React.forwardRef<HTMLDivElement, FriendTileProps>(({ 
  friend, 
  position,
  onClick,
}, ref) => {

  const tileContent = (
    <div 
      className="w-[84px] h-[84px] bg-black border-2 border-white/40 rounded-[24px] p-2 flex flex-col items-center justify-center gap-1 cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      {friend.photoURL ? (
        <Image
          src={friend.photoURL}
          alt={friend.username}
          layout="fill"
          objectFit="cover"
        />
      ) : (
        <>
          <div className="w-5 h-5 text-white/70">
            <DynamicIcon name="User" size={20} />
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <p className="text-white/70 text-xs font-medium truncate w-full">{friend.username}</p>
            <p className="text-white/70 text-[10px] font-light w-full truncate">Idle</p>
          </div>
        </>
      )}
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

FriendTile.displayName = 'FriendTile';

export default FriendTile;
