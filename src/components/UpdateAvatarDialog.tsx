'use client';

import React, { useState } from 'react';
import Dialog from './ui/Dialog';
import { Check, X } from 'lucide-react';
import { IconButton } from './ui/IconButton';
import PhotoUpload from './PhotoUpload';
import { useAuth } from '@/context/AuthContext';
import { dataURLtoBlob } from '@/lib/utils';
import { uploadProfilePhoto } from '@/lib/storage';
import { updateUserProfile } from '@/lib/user';
import DialogHeader from './ui/DialogHeader';

export const UpdateAvatarDialog = ({
  onClose,
  onSizeChange,
}: {
  onClose: () => void;
  onSizeChange?: (size: { width: number, height: number }) => void;
}) => {
  const { user, refreshProfile } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleSave = async () => {
    if (!selectedPhoto || !user) return;
    
    setIsUploading(true);
    try {
      const photoBlob = dataURLtoBlob(selectedPhoto);
      const fileName = `${new Date().getTime()}.png`;
      const file = new File([photoBlob], fileName, { type: 'image/png' });

      const downloadURL = await uploadProfilePhoto(file, user.uid);

      if (downloadURL) {
        await updateUserProfile(user.uid, { photoURL: downloadURL });
        await refreshProfile();
        onClose();
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
      <div className="w-[300px]">
        <DialogHeader title={['Update', 'Photo']}>
            {!isCameraActive && (
              <div className="flex items-center gap-2">
                <IconButton onClick={handleSave} icon={Check} disabled={!selectedPhoto || isUploading} variant="outline" className="text-white/80 hover:text-white" />
                <IconButton onClick={onClose} icon={X} variant="outline" className="text-white/80 hover:text-white" />
              </div>
            )}
        </DialogHeader>
        <div className="pb-4 pt-2">
          <PhotoUpload onPhotoSelect={setSelectedPhoto} onViewChange={(view) => setIsCameraActive(view === 'camera')} />
        </div>
      </div>
    </Dialog>
  );
};

export default UpdateAvatarDialog; 