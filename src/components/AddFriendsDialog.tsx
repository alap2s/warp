'use client';

import { useState, useEffect } from 'react';
import Dialog from './ui/Dialog';
import DialogHeader from './ui/DialogHeader';
import { Button } from './ui/Button';
import { Loader2, X, Upload, Copy, RefreshCw, UserPlus } from 'lucide-react';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import { useAuth } from '@/context/AuthContext';
import { generateInviteCode } from '@/lib/friends';

interface AddFriendsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendsDialog = ({ isOpen, onClose }: AddFriendsDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const createNewCode = async () => {
    if (user) {
      const newCode = await generateInviteCode(user.uid);
      setInviteCode(newCode);
    }
  };

  useEffect(() => {
    if (isOpen) {
      createNewCode();
    }
  }, [isOpen, user]);

  // Placeholder functions for button actions
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      alert('Copied to clipboard!'); // Or use a more subtle notification
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy!');
    }
  };
  const handleRefresh = async () => {
    await createNewCode();
  };
  const handleShare = async () => {
    const shareData = {
      title: 'Join me on Dots!',
      text: `Here is my friend code: ${inviteCode}`,
      url: window.location.origin,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support the share API
        await navigator.clipboard.writeText(inviteCode);
        alert('Friend code copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Failed to share.');
    }
  };
  const handleAddFriend = () => alert('Friend added!');

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title={["Add", "Friends"]}>
        <IconButton variant="outline" onClick={onClose} icon={X} />
      </DialogHeader>
      <div className="flex flex-col text-left space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-2">
            Share this one time code with your friends to add them on the app.
          </p>
          <div className="flex items-center space-x-2">
            <Input
              id="invite-code"
              name="invite-code"
              value={inviteCode}
              disabled
              className="flex-grow p-3 rounded-lg font-mono text-lg"
              icon={<RefreshCw size={16} className="text-gray-400" />}
              onIconClick={handleRefresh}
            />
            <IconButton variant="outline" onClick={handleCopy} className="flex-shrink-0" icon={Copy} />
            <IconButton variant="outline" onClick={handleShare} className="flex-shrink-0" icon={Upload} />
          </div>
        </div>
        <div className="border-t border-gray-700 mt-4"></div>
        <div>
          <p className="text-sm text-gray-400 mb-2">
            Or enter a code a friend shared with you.
          </p>
          <div className="flex items-center space-x-2">
            <Input 
              id="friend-code"
              name="friend-code"
              placeholder="Friend's code" 
              className="flex-grow p-3 rounded-lg"
              icon={<UserPlus size={16} className="text-gray-400" />}
            />
            <IconButton variant="outline" onClick={handleAddFriend} className="flex-shrink-0" icon={UserPlus} />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AddFriendsDialog;
