'use client';

import React, { useState } from 'react';
import { IconButton } from './ui/IconButton';
import { Button } from './ui/Button';
import { Bell, BellOff, Trash2, X } from 'lucide-react';
import Dialog from './ui/Dialog';
import Image from 'next/image';
import NotificationToggle from './ui/NotificationToggle';
import UpdateAvatarDialog from './UpdateAvatarDialog';

const MeDialog = ({
  userProfile,
  onClose,
  onSizeChange,
  onUpdateAvatar,
  onDeleteAccount,
}: {
  userProfile: { username: string; icon: string };
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onUpdateAvatar: (icon: string) => void;
  onDeleteAccount: () => void;
}) => {
  const [notifications, setNotifications] = useState(true);
  const [isUpdatingAvatar, setUpdatingAvatar] = useState(false);

  const handleAvatarSave = (newIcon: string) => {
    onUpdateAvatar(newIcon);
    setUpdatingAvatar(false);
  };

  return (
    <>
      <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setUpdatingAvatar(true)}>
                <Image
                  src={`/Thumbs/${userProfile.icon}`}
                  alt="Avatar"
                  width={64}
                  height={80}
                  className="rounded-2xl"
                />
              </button>
              <h2 className="font-title text-6xl tracking-[-0.08em] font-normal text-white">{userProfile.username}</h2>
            </div>
            <IconButton variant="ghost" size="icon" onClick={onClose} className="self-start">
              <X size={16} strokeWidth={2.25} />
            </IconButton>
          </div>
          <hr className="border-white/20" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notifications ? (
                <Bell size={16} strokeWidth={2.25} className="text-white/80" />
              ) : (
                <BellOff size={16} strokeWidth={2.25} className="text-white/80" />
              )}
              <p className="text-white/80 font-medium">Notifications</p>
            </div>
            <NotificationToggle value={notifications} onChange={setNotifications} />
          </div>
          <hr className="border-white/20" />
          <div>
            <h3 className="text-sm font-medium text-white/40 mb-2">About this app</h3>
            <p className="text-white/80 text-sm">
              This app is inspired by Einstein&apos;s theory of relativity. It&apos;s about creating your reality warp in space and time fabric. You can let friends join in your reality by sharing your warp anywhere. This is a hobby project created by me (<a href="https://www.instagram.com/test_alap_final/" target="_blank" rel="noopener noreferrer" className="underline">@alap</a>), a designer and experimentor based in Berlin.
            </p>
          </div>
          <hr className="border-white/20" />
          <Button
            variant="tertiary"
            onClick={onDeleteAccount}
            className="w-full justify-center"
          >
            <Trash2 size={16} strokeWidth={2.25} className="mr-2 text-white/40" />
            <span className="text-white/40">Delete account</span>
          </Button>
        </div>
      </Dialog>
      {isUpdatingAvatar && (
        <UpdateAvatarDialog
          defaultValue={userProfile.icon}
          onSave={handleAvatarSave}
          onClose={() => setUpdatingAvatar(false)}
        />
      )}
    </>
  );
};

export default MeDialog; 