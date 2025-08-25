'use client';

import React, { useEffect } from 'react';
import { IconButton } from './ui/IconButton';
import { ArrowRight, Share, PlusSquare } from 'lucide-react';
import Dialog from './ui/Dialog';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePWA } from '@/lib/hooks/usePWA';
import { triggerHapticFeedback } from '@/lib/haptics';

const InstallInstructions = ({ platform }: { platform: 'iOS' | 'Android' | 'Desktop' | 'other' }) => {
  if (platform === 'iOS') {
    return (
      <div className="mt-8 border-t border-white/20">
        <p className="py-2 text-xs text-white/40">For the best experience, follow the steps</p>
        <div className="text-white/80 font-medium">
          <div className="flex items-start justify-between py-2 border-b border-t border-white/10">
            <div className="flex items-start gap-2">
              <span>1.</span>
              <span>Tap &quot;Share icon&quot; in browser</span>
            </div>
            <Share size={20} className="flex-shrink-0" />
          </div>
          <div className="flex items-start justify-between py-2">
            <div className="flex items-start gap-2">
              <span>2.</span>
              <span>Tap &quot;Add to Home Screen&quot;</span>
            </div>
            <PlusSquare size={20} className="flex-shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'Android') {
    return (
      <div className="mt-8 border-t border-white/20">
        <p className="py-2 text-xs text-white/40">For the best experience, install the app</p>
        <div className="text-white/80 font-medium">
          <div className="flex items-start justify-between py-2 border-b border-t border-white/10">
            <div className="flex items-start gap-2">
              <span>1.</span>
              <span>Tap the &quot;Menu button&quot; in your browser</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical flex-shrink-0"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>
          <div className="flex items-start justify-between py-2">
            <div className="flex items-start gap-2">
              <span>2.</span>
              <span>Tap &quot;Install app&quot;</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download flex-shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </div>
        </div>
      </div>
    );
  }

  return null; // Desktop and other platforms don't get instructions
};


export const WelcomeDialog = ({
  onNext,
  onClose,
  onSizeChange,
}: {
  onNext: () => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
}) => {
  const { displayMode, platform } = usePWA();
  
  useEffect(() => {
    const signIn = async () => {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    };
    signIn();
  }, []);

  const handleNextClick = () => {
    triggerHapticFeedback();
    onNext();
  };

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal>
      <div className="flex items-start justify-between">
        <div className="dialog-title">
          <p>The</p>
          <p>Warp</p>
        </div>
        {(displayMode === 'standalone' || platform === 'Desktop') && (
          <IconButton variant="outline" onClick={handleNextClick} icon={ArrowRight} />
        )}
      </div>
      <div className="mt-0">
        <p className="text-white/80">
          To share your reality!
        </p>
        {displayMode === 'browser' && (
          <InstallInstructions platform={platform} />
        )}
      </div>
    </Dialog>
  );
};

export default WelcomeDialog;
