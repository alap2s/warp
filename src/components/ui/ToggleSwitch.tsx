'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSwitch = ({ value, onChange }: ToggleSwitchProps) => {
  return (
    <div
      className={`flex items-center w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
        value ? 'bg-white justify-end' : 'bg-white/20 justify-start'
      }`}
      onClick={() => onChange(!value)}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-black"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      />
    </div>
  );
};

export default ToggleSwitch; 