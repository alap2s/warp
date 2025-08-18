'use client';

import { useState } from 'react';
import Dialog from './ui/Dialog';
import DialogHeader from './ui/DialogHeader';
import { Button } from './ui/Button';
import { Loader2, X, Upload } from 'lucide-react';
import { IconButton } from './ui/IconButton';

interface AddFriendsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendsDialog = ({ isOpen, onClose }: AddFriendsDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleShareInvite = async () => {
    setIsLoading(true);
    // This is a placeholder.
    setTimeout(() => {
      const mockInviteCode = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
      const inviteUrl = `${window.location.origin}/invite/${mockInviteCode}`;
      setIsLoading(false);

      if (navigator.share) {
        navigator.share({
          title: 'Join me on Dots',
          text: 'Join me on Dots and lets warp together!',
          url: inviteUrl,
        });
      } else {
        navigator.clipboard.writeText(inviteUrl);
        alert('Invite link copied to clipboard!');
      }
    }, 1000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title={["Add", "Friends"]}>
        <IconButton variant="outline" onClick={onClose}>
            <X size={16} strokeWidth={2.25} />
        </IconButton>
      </DialogHeader>
      <div className="flex flex-col items-center text-left">
        <p className="text-sm text-gray-400 mb-6">
          Share this temporary and unique link with your friends to add them on the app.
        </p>
        <div className="flex w-full items-center space-x-2">
            <Button variant="secondary" onClick={handleShareInvite} disabled={isLoading} className="w-full">
                {isLoading ? (
                <Loader2 className="animate-spin" />
                ) : (
                <>
                    <Upload size={16} strokeWidth={2.25} className="mr-2" />
                    Share invite
                </>
                )}
            </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddFriendsDialog;
