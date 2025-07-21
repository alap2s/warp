'use client';

import React, { useState } from 'react';
import { IconButton } from './ui/IconButton';
import { Check } from 'lucide-react';
import Dialog from './ui/Dialog';
import HorizontalPicker from './ui/HorizontalPicker';
import DialogHeader from './ui/DialogHeader';

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
      <DialogHeader title={['Update', 'Thumbavatar']}>
        <IconButton
          variant="default"
          onClick={() => onSave(selectedIcon)}
        >
          <Check size={16} strokeWidth={2.25} />
        </IconButton>
      </DialogHeader>
      <div className="mt-6">
        <HorizontalPicker
          onIconSelect={setSelectedIcon}
          defaultValue={defaultValue}
        />
      </div>
    </Dialog>
  );
};

export default UpdateAvatarDialog; 