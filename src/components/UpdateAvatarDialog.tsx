'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Check } from 'lucide-react';
import Dialog from './ui/Dialog';
import ThumbavatarSelector from './ui/ThumbavatarSelector';
import DialogHeader from './ui/DialogHeader';

const UpdateAvatarDialog = ({
  defaultValue,
  onSave,
  onClose,
  onSizeChange,
}: {
  defaultValue: string;
  onSave: (icon: string) => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}) => {
  const [selectedIcon, setSelectedIcon] = useState(defaultValue);

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange}>
      <DialogHeader title={['Update', 'Thumbavatar']}>
        <Button
          variant="primary"
          onClick={() => onSave(selectedIcon)}
        >
          <Check size={16} strokeWidth={2.25} />
        </Button>
      </DialogHeader>
      <div className="mt-1">
        <ThumbavatarSelector
          onIconSelect={setSelectedIcon}
          defaultValue={selectedIcon}
        />
      </div>
    </Dialog>
  );
};

export default UpdateAvatarDialog; 