'use client';

import { useRef, useState } from 'react';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import { Check, AtSign } from 'lucide-react';
import Dialog from './ui/Dialog';
import ThumbavatarSelector from './ui/ThumbavatarSelector';

export const ProfileDialog = ({
  initialData,
  onSave,
  onClose,
  onSizeChange,
  children,
}: {
  initialData: { username: string; icon: string } | null;
  onSave: (data: { username:string; icon: string }) => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
  children?: React.ReactNode;
}) => {
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(initialData?.username || '');
  const [selectedIconSeed, setSelectedIconSeed] = useState<string>(initialData?.icon || 'Thumbs01.svg');

  const handleSave = () => {
    if (username.trim()) {
      onSave({ username: username.trim(), icon: selectedIconSeed });
    }
  };

  const handleIconSelect = (seed: string) => {
    setSelectedIconSeed(seed);
  };

  if (children) {
    return (
      <Dialog onClose={onClose} onSizeChange={onSizeChange}>
        {children}
      </Dialog>
    );
  }

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange}>
      <div className="flex items-start justify-between">
        <div className="dialog-title">
          <p>Be</p>
          <p>You</p>
        </div>
        <div className="flex gap-2">
          <IconButton variant="default" onClick={handleSave}>
            <Check size={16} strokeWidth={2.25} />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={16} strokeWidth={2.25} />
          <Input
            ref={usernameInputRef}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              if (e.target.value.length <= 7) {
                setUsername(e.target.value);
              }
            }}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium text-white/40 mt-1">Choose your thumbavatar</p>
          <ThumbavatarSelector
            onIconSelect={handleIconSelect}
            defaultValue={selectedIconSeed}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ProfileDialog; 