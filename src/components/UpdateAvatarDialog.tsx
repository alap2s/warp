'use client';

import React, { useState } from 'react';
import { IconButton } from './ui/IconButton';
import { Check } from 'lucide-react';
import Dialog from './ui/Dialog';
import HorizontalPicker from './ui/HorizontalPicker';

const UpdateAvatarDialog = ({
  defaultValue,
  onSave,
  onClose,
}: {
  defaultValue: string;
  onSave: (icon: string) => void;
  onClose: () => void;
}) => {
  const [selectedIcon, setSelectedIcon] = useState(defaultValue);

  return (
    <Dialog onClose={onClose} isModal={true} zIndex={60}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="dialog-title">
            <p>Update</p>
            <p>Thumbavatar</p>
          </div>
          <IconButton
            variant="default"
            size="icon"
            onClick={() => onSave(selectedIcon)}
          >
            <Check size={16} strokeWidth={2.25} />
          </IconButton>
        </div>
        <HorizontalPicker
          onIconSelect={setSelectedIcon}
          defaultValue={defaultValue}
        />
      </div>
    </Dialog>
  );
};

export default UpdateAvatarDialog; 