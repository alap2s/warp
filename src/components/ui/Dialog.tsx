
import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Dialog = ({ children, onClose, onSizeChange }: { 
  children: React.ReactNode, 
  onClose: () => void,
  onSizeChange?: (size: { width: number, height: number }) => void,
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

  return (
    <motion.div 
      className="fixed inset-0 bg-transparent z-50 flex items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        ref={dialogRef}
        className="bg-black rounded-2xl shadow-xl w-[340px] p-4 flex flex-col gap-3 border border-[#555]"
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

