'use client';

import { useState, useEffect } from 'react';

type DisplayMode = 'standalone' | 'browser';
type Platform = 'iOS' | 'Android' | 'Desktop' | 'other';

export const usePWA = () => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('browser');
  const [platform, setPlatform] = useState<Platform>('other');

  useEffect(() => {
    // This effect runs only on the client-side
    
    // Check display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setDisplayMode(isStandalone ? 'standalone' : 'browser');

    // Check platform
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform('iOS');
    } else if (/android/i.test(userAgent)) {
      setPlatform('Android');
    } else {
      setPlatform('Desktop');
    }

  }, []);

  return { displayMode, platform };
}; 