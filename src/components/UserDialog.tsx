'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/lib/types';
import Dialog from './ui/Dialog';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { X, UserMinus } from 'lucide-react';
import useAutoFitFontSize from '@/lib/hooks/useAutoFitFontSize';

interface UserDialogProps {
  user: UserProfile;
  friends: UserProfile[];
  isUpdatingFriendship: boolean;
  onClose: () => void;
  onUnfriend: (userId: string) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

const UserDialog = ({ user, friends, isUpdatingFriendship, onClose, onUnfriend, onSizeChange }: UserDialogProps) => {
  if (!user) return null;

  const usernameRef = useRef<HTMLDivElement>(null);
  useAutoFitFontSize(user.username || '', usernameRef);

  const isFriend = friends.some(friend => friend.uid === user.uid);

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
      <div className="flex flex-col items-start gap-4">
        <Image
          src={user.photoURL || '/icon-192.png'}
          alt={user.username || 'User'}
          width={120}
          height={120}
          className="rounded-2xl object-cover"
        />
        <div ref={usernameRef} className="w-full">
          <h2 
            className="dialog-title break-all"
            style={{ lineHeight: '1.1' }}
          >
            {user.username}
          </h2>
        </div>
        <hr className="w-full border-white/20" />
        <div className="flex justify-between w-full">
          <IconButton variant="outline" onClick={onClose} icon={X} />
          {isFriend && (
            <Button variant="secondary" onClick={() => onUnfriend(user.uid)} disabled={isUpdatingFriendship}>
              {isUpdatingFriendship ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <UserMinus size={16} className="mr-2" />
                  Unfriend
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default UserDialog;
