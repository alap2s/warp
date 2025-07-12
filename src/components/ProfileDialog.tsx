'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
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

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

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
        <div className="font-title font-black text-5xl leading-none text-white">
          <p>Be</p>
          <p>You</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="icon" onClick={handleSave}>
            <Check className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <HorizontalPicker
          onIconSelect={handleIconSelect}
        />
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" strokeWidth={1.5} />
          <Input
            ref={usernameInputRef}
            type="text"
            placeholder="Name"
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