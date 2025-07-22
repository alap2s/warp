'use client';

import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingDialog = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </motion.div>
  );
};

export default LoadingDialog; 