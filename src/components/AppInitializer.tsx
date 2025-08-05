// src/components/AppInitializer.tsx
'use client';

import React, { useEffect } from 'react';
import { initAudio, playAppOpen } from '@/lib/audio';

export const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleFirstInteraction = async (event: Event) => {
        // Prevent sound from playing if the user is typing in an input.
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            return;
        }

      // Always initialize audio on the first user gesture.
      // This function is idempotent, so it's safe to call.
      await initAudio();

      const hasUnlockedBefore = localStorage.getItem('audioUnlocked') === 'true';

      if (hasUnlockedBefore) {
        // This is a return visit. The first interaction plays the sound.
        playAppOpen();
      } else {
        // This is the very first visit. Set the flag for future visits.
        localStorage.setItem('audioUnlocked', 'true');
      }
    };

    // These listeners will only fire once, then automatically remove themselves.
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

  }, []); // The empty dependency array ensures this setup runs only once when the component mounts.

  return <>{children}</>;
};
