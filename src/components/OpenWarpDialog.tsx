'use client';

import React from 'react';
import Dialog from './ui/Dialog';
import { getIcon, FormData } from './MakeWarpDialog';
import { X } from 'lucide-react';
import { IconButton } from './ui/IconButton';
import DialogHeader from './ui/DialogHeader';

const OpenWarpDialog = ({
  warp,
  onClose,
  onSizeChange,
}: {
  warp: any;
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}) => {
  const { what, when, where, icon } = warp;
  const IconComponent = getIcon(icon);
  const date = when.toDate ? when.toDate() : new Date(when);

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <DialogHeader title={[what]}>
          <IconButton variant="ghost" onClick={onClose}>
            <X size={16} strokeWidth={2.25} />
          </IconButton>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <IconComponent size={24} />
            </div>
            <p className="text-lg font-medium">{what}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-medium">{date.toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-medium">{where}</p>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default OpenWarpDialog; 