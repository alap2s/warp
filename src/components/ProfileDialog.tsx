'use client';

import { useState, useEffect, useCallback } from 'react';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import { Check, AtSign, Loader2, CheckCircle2 } from 'lucide-react';
import Dialog from './ui/Dialog';
import ThumbavatarSelector from './ui/ThumbavatarSelector';
import { debounce } from 'lodash';
import { isUsernameAvailable } from '@/lib/user';


export const ProfileDialog = ({
  onSave,
  onClose,
  onSizeChange,
}: {
  onSave: (data: { username:string; icon: string }) => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
}) => {
  const [username, setUsername] = useState('');
  const [selectedIconSeed, setSelectedIconSeed] = useState<string>('Thumbs01.svg');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckUsername = useCallback(
    debounce(async (name) => {
      if (name.length >= 3) {
        setIsLoading(true);
        const available = await isUsernameAvailable(name);
        setIsAvailable(available);
        setIsValid(available);
        setIsLoading(false);
      } else {
        setIsAvailable(null);
        setIsValid(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedCheckUsername(username);
  }, [username, debouncedCheckUsername]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 7);
    setUsername(value);
    
    if (value.length < 3) {
      setIsValid(false);
      setIsAvailable(null);
    } else {
      setIsLoading(true);
    }
  };

  const handleSave = () => {
    if (username.trim() && selectedIconSeed && isValid && isAvailable) {
      onSave({ username: username.trim(), icon: selectedIconSeed });
    }
  };

  const handleIconSelect = (seed: string) => {
    setSelectedIconSeed(seed);
  };

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal>
      <div className="flex items-start justify-between">
        <div className="dialog-title">
          <p>Be</p>
          <p>You</p>
        </div>
        <div className="flex gap-2">
          <IconButton variant="default" onClick={handleSave} disabled={!isValid || isLoading}>
            <Check size={16} strokeWidth={2.25} />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative flex items-center">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={16} strokeWidth={2.25} />
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            className="pl-10 pr-10" // Added pr-10 for spacing
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/40" />
            ) : isAvailable === true ? (
              <CheckCircle2 className="h-5 w-5 text-white" />
            ) : isAvailable === false && username.length > 0 ? (
              <span className="text-white text-xs font-bold">Taken</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-2xl p-3">
          <p className="text-xs font-medium text-white/40 -mt-1">Choose your thumbavatar</p>
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