'use client';

import { useState, useEffect } from 'react';

type DisplayMode = 'standalone' | 'browser';
type Platform = 'iOS' | 'Android' | 'Desktop' | 'other';

export const usePWA = () => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('browser');
  const [platform, setPlatform] = useState<Platform>('other');

  useEffect(() => {
    const windowWithOpera = window as Window & { opera?: unknown; MSStream?: unknown };
    // This effect runs only on the client-side
    
    // Check display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setDisplayMode(isStandalone ? 'standalone' : 'browser');

    // Check platform
    const userAgent = navigator.userAgent || navigator.vendor || windowWithOpera.opera;
    if (/iPad|iPhone|iPod/.test(userAgent as string) && !windowWithOpera.MSStream) {
      setPlatform('iOS');
    } else if (/android/i.test(userAgent as string)) {
      setPlatform('Android');
    } else {
      setPlatform('Desktop');
    }

  }, []);

  return { displayMode, platform };
}; 