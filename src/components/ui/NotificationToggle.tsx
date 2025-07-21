'use client';

import React from 'react';

interface NotificationToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const NotificationToggle = ({ value, onChange }: NotificationToggleProps) => {
  return (
    <div className="flex rounded-lg border border-white/20 p-0.5 bg-black">
      <button
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          !value ? 'bg-white/20 text-white' : 'text-white/40'
        }`}
        onClick={() => onChange(false)}
      >
        Off
      </button>
      <button
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          value ? 'bg-white text-black font-medium' : 'text-white/40'
        }`}
        onClick={() => onChange(true)}
      >
        On
      </button>
    </div>
  );
};

export default NotificationToggle; 