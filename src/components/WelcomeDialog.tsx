'use client';

import React from 'react';
import { IconButton } from './ui/IconButton';
import { ArrowRight } from 'lucide-react';
import Dialog from './ui/Dialog';

export const WelcomeDialog = ({
  onNext,
  onClose,
  onSizeChange,
  isModal,
}: {
  onNext: () => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
  isModal?: boolean;
}) => {
  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={isModal}>
      <div className="flex items-start justify-between">
        <div className="dialog-title">
          <p>The</p>
          <p>Warp</p>
        </div>
        <IconButton variant="default" onClick={onNext}>
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
