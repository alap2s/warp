'use client';

import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Check, Tag } from 'lucide-react';
import Dialog from './ui/Dialog';
import HorizontalPicker from './ui/HorizontalPicker';

export const ProfileDialog = ({
  initialData,
  onSave,
  onClose,
  onSizeChange,
  isModal,
}: {
  initialData: { username: string; icon: string } | null;
  onSave: (data: { username:string; icon: string }) => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
  isModal?: boolean;
}) => {
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(initialData?.username || '');
  const [selectedIconSeed, setSelectedIconSeed] = useState<string>(initialData?.icon || 'adrian');

  const handleSave = () => {
    if (username.trim()) {
      onSave({ username, icon: selectedIconSeed });
    }
  };

  const handleIconSelect = (seed: string) => {
    setSelectedIconSeed(seed);
  };

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={isModal}>
      <div className="flex items-start justify-between">
        <div className="dialog-title">
          <p>Be</p>
          <p>You</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="icon" onClick={handleSave}>
            <Check size={16} strokeWidth={2.25} />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <HorizontalPicker
            onIconSelect={handleIconSelect}
          />
          <p className="text-white/40 mt-2">Select your thumbavtar</p>
        </div>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={16} strokeWidth={2.25} />
          <Input
            ref={usernameInputRef}
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ProfileDialog; 