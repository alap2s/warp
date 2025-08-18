// src/components/AppInitializer.tsx
'use client';

import React, { useEffect } from 'react';
import { initAudio } from '@/lib/audio';

export const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleFirstInteraction = async () => {
      // Initialize audio on the first user gesture.
      // This function is idempotent, so it's safe to call.
      await initAudio();
    };

    // Add event listeners for the first user interaction.
    // These will be removed automatically after the first call.
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    // Cleanup function to remove event listeners if the component unmounts.
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []); // The empty dependency array ensures this setup runs only once.

  return <>{children}</>;
};
