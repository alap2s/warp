'use client';

import React, { useEffect } from 'react';
import { IconButton } from './ui/IconButton';
import { ArrowRight } from 'lucide-react';
import Dialog from './ui/Dialog';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const WelcomeDialog = ({
  onNext,
  onClose,
  onSizeChange,
}: {
  onNext: () => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
}) => {
  useEffect(() => {
    const signIn = async () => {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    };
    signIn();
  }, []);

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal>
      <div className="flex items-start justify-between">
        <div className="dialog-title">
          <p>The</p>
          <p>Warp</p>
        </div>
        <IconButton variant="outline" onClick={onNext}>
          <ArrowRight size={16} strokeWidth={2.25} />
        </IconButton>
      </div>
      <div className="mt-6">
        <p className="text-white/80">
          To share your reality!
        </p>
      </div>
    </Dialog>
  );
};

export default WelcomeDialog;
