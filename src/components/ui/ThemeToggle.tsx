'use client';

import React from 'react';

interface ThemeToggleProps {
  value: 'light' | 'dark';
  onChange: (value: 'light' | 'dark') => void;
  disabled?: boolean;
}

const ThemeToggle = ({ value, onChange, disabled }: ThemeToggleProps) => {
  return (
    <div className={`flex rounded-lg border border-white/20 p-0.5 bg-black ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          value === 'light' ? 'bg-white text-black font-medium' : 'text-white/40'
        }`}
        onClick={() => !disabled && onChange('light')}
        disabled={disabled}
      >
        Light
      </button>
      <button
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          value === 'dark' ? 'bg-white/20 text-white' : 'text-white/40'
        }`}
        onClick={() => !disabled && onChange('dark')}
        disabled={disabled}
      >
        Dark
      </button>
    </div>
  );
};

export default ThemeToggle;
