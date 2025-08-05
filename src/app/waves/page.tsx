// src/app/waves/page.tsx
'use client';

import React from 'react';
import { 
  playAppOpen, 
  playCreateWarp, 
  playDeleteWarp,
  playDialogSound,
  playNotification,
  playJoinWarp,
  playUnjoinWarp,
} from '@/lib/audio';
import { Button } from '@/components/ui/Button';

const WavesPage = () => {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Audio Test Page</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => playAppOpen()}>
                App Open
            </Button>
            <Button onClick={() => playCreateWarp()}>
                Create Warp
            </Button>
            <Button onClick={() => playDeleteWarp()}>
                Delete Warp
            </Button>
            <Button onClick={() => playNotification()}>
                Notification
            </Button>
            <Button onClick={() => playDialogSound('open')}>
                Dialog Open
            </Button>
            <Button onClick={() => playDialogSound('close')}>
                Dialog Close
            </Button>
            <Button onClick={() => playJoinWarp()}>
                Join Warp
            </Button>
            <Button onClick={() => playUnjoinWarp()}>
                Unjoin Warp
            </Button>
        </div>
    </div>
  );
};

export default WavesPage;
