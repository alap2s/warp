'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Dialog from './ui/Dialog';
import { AtSign, Check } from 'lucide-react';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import { debounce } from 'lodash';
import { isUsernameAvailable } from '@/lib/user';
import PhotoUpload from './PhotoUpload';
import { useAuth } from '@/context/AuthContext';
import { dataURLtoBlob } from '@/lib/utils';
import { uploadProfilePhoto } from '@/lib/storage';

export const ProfileDialog = ({
  onSave,
  onClose,
  onSizeChange,
}: {
  onSave: (data: { username: string; photoURL: string }) => void;
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
}) => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Debounced username check... (code is unchanged)
  const debouncedCheckUsername = useMemo(
    () =>
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

  const handleSave = async () => {
    if (!isValid || !selectedPhoto || !user) return;
    
    setIsUploading(true);
    try {
      const photoBlob = dataURLtoBlob(selectedPhoto);
      const fileName = `${new Date().getTime()}.png`;
      const file = new File([photoBlob], fileName, { type: 'image/png' });

      const downloadURL = await uploadProfilePhoto(file, user.uid);

      if (downloadURL) {
        onSave({ username: username.trim(), photoURL: downloadURL });
      } else {
        console.error("Photo upload failed.");
      }
    } catch (error) {
      console.error("Error during save process:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal>
      <div className="flex items-start justify-between">
        <div className="dialog-title">
          <p>Be</p>
          <p>You</p>
        </div>
        <div className="flex gap-2">
          <IconButton 
            variant="default" 
            onClick={handleSave} 
            disabled={!isValid || !selectedPhoto || isLoading || isUploading} 
            icon={Check} 
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          icon={<AtSign size={16} strokeWidth={2.25} />}
          autoComplete="off"
          helperText={
            isLoading ? (
              <p className="text-xs text-gray-400">Checking...</p>
            ) : isAvailable === true && username.length >=3 ? (
              <p className="text-xs text-gray-400">Available</p>
            ) : isAvailable === false && username.length > 0 ? (
              <p className="text-xs text-gray-400">Unavailable</p>
            ) : null
          }
        />
        <PhotoUpload onPhotoSelect={setSelectedPhoto} />
      </div>
    </Dialog>
  );
};

export default ProfileDialog; 