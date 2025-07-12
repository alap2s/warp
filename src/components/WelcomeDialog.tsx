'use client';

import React from 'react';
import { Button } from './ui/Button';
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
        <h2 className="text-5xl font-black leading-none text-white">The Warp</h2>
        <Button variant="default" size="icon" onClick={onNext}>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Button>
      </div>
      <div className="mt-6">
        <p className="text-white/80">
          Mark warp - let friends join in your reality.
        </p>
      </div>
    </Dialog>
  );
};

export default WelcomeDialog;
