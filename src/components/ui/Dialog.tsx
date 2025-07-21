'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Dialog = ({ children, onClose, onSizeChange, isModal = false, zIndex = 50 }: { 
  children: React.ReactNode, 
  onClose: () => void,
  onSizeChange?: (size: { width: number, height: number }) => void,
  isModal?: boolean,
  zIndex?: number,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (dialogRef.current && onSizeChange) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          onSizeChange({ width, height });
        }
      });
      observer.observe(dialogRef.current);
      return () => observer.disconnect();
    }
  }, [onSizeChange]);

  const handleOverlayClick = () => {
    if (!isModal) {
      onClose();
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-transparent"
      style={{ zIndex }}
      onClick={handleOverlayClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        ref={dialogRef}
        className="bg-[#111111] rounded-2xl shadow-xl w-[300px] sm:w-[340px] p-4 flex flex-col gap-3 border-2 border-[#555]"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Dialog;

