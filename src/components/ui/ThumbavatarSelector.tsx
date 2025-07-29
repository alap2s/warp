'use client';

import React from 'react';
import Image from 'next/image';

interface ThumbavatarSelectorProps {
  onIconSelect: (seed: string) => void;
  defaultValue?: string;
}

const ThumbavatarSelector = ({ onIconSelect, defaultValue }: ThumbavatarSelectorProps) => {
  const avatarSeeds = [
    'Thumbs01.svg',
    'Thumbs02.svg',
    'Thumbs03.svg',
    'Thumbs04.svg',
    'Thumbs05.svg',
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {avatarSeeds.map((seed) => (
        <div
          key={seed}
          className={`flex items-center justify-center h-full cursor-pointer rounded-xl ${
            defaultValue === seed ? 'border-2 border-white' : ''
          }`}
          onClick={() => onIconSelect(seed)}
        >
          <Image
            src={`/Thumbs/${seed}`}
            alt="Avatar"
            width={0}
            height={0}
            className="w-full h-auto object-contain"
          />
        </div>
      ))}
    </div>
  );
};

export default ThumbavatarSelector;
