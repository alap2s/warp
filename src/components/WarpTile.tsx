'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FormData } from './MakeWarpDialog';

const formatTileDate = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tileDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (today.getTime() === tileDate.getTime()) {
    return "Today";
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (tomorrow.getTime() === tileDate.getTime()) {
    return "Tomorrow";
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

const WarpTile = ({ 
  warp, 
  username, 
  onRemove,
  position,
  onClick,
}: { 
  warp: any, 
  username: string, 
  onRemove: () => void,
  position?: { x: number, y: number },
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
}) => {
  const { what, when, icon: Icon } = warp;
  
  // Firestore Timestamps have a toDate() method
  const date = when && typeof when.toDate === 'function' ? when.toDate() : when;
  const dateLabel = formatTileDate(date);

  const tileContent = (
    <div 
      className="w-[84px] h-[84px] bg-black border-2 border-white/40 rounded-[24px] p-4 flex flex-col items-center justify-between cursor-pointer"
      onClick={onClick || onRemove}
    >
      <div className="w-5 h-5 text-white">
        {Icon && <Icon size={20} />}
      </div>
      <div className="flex flex-col items-center text-center">
        <p className="text-white text-xs font-medium truncate w-full">{username}</p>
        <p className="text-white/70 text-[10px] font-light">{dateLabel}</p>
      </div>
    </div>
  );

  if (position) {
    return (
      <motion.div
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