'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideProps } from 'lucide-react';

interface SegmentedControlProps {
  options: { label: string; icon?: React.ComponentType<LucideProps> }[];
  value: string;
  onSelect: (option: string) => void;
}

const SegmentedControl = ({ options, value, onSelect }: SegmentedControlProps) => {
  const selectedIndex = options.findIndex(option => option.label === value);

  return (
    <div className="relative flex items-center w-full h-12 rounded-lg bg-[#2D2D2D] p-1 text-base font-medium text-white/60">
      {selectedIndex !== -1 && (
        <motion.div
          className="absolute top-1 bottom-1 left-1 h-auto w-[calc(50%-4px)] rounded-md bg-black border border-white/20"
          layoutId="selected-segment"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          initial={false}
          animate={{ x: `${selectedIndex * 100}%` }}
        />
      )}
      {options.map(option => (
        <button
          key={option.label}
          className={`relative z-10 flex-1 h-full flex items-center justify-center text-sm transition-colors ${
            value === option.label ? 'text-white' : 'text-white/60'
          }`}
          onClick={() => onSelect(option.label)}
        >
          {option.icon && <option.icon className="mr-2" size={16} strokeWidth={2.25} />}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
