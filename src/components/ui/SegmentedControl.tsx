'use client';

import React, { useState, forwardRef } from 'react';

interface SegmentedControlProps {
  options: string[];
  onSelect: (option: string) => void;
}

const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(({ options, onSelect }, ref) => {
  const [selected, setSelected] = useState(options[0]);

  const handleSelect = (option: string) => {
    setSelected(option);
    onSelect(option);
  };

  return (
    <div ref={ref} className="flex items-center justify-center p-1 bg-[#1f1f1f] rounded-xl border-2 border-white">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === option
              ? 'bg-white text-black'
              : 'bg-transparent text-white'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
});

SegmentedControl.displayName = 'SegmentedControl';

export default SegmentedControl; 