'use client';

import React from 'react';
import { Button } from './ui/Button';
import { Trash2, Sun, Moon, UserSquare } from 'lucide-react';
import Dialog from './ui/Dialog';
import Image from 'next/image';
import DialogHeader from './ui/DialogHeader';
import { deleteUserAccount } from '@/lib/user';
import { UserProfile } from '@/lib/types';
import ThemeToggle from './ui/ThemeToggle';
import UpdateAvatarDialog from './UpdateAvatarDialog';

const MeDialog = ({
  userProfile,
  onClose,
  onSizeChange,
  onDeleteAccount,
  onUpdateProfile,
}: {
  userProfile: UserProfile;
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onDeleteAccount: () => void;
  onUpdateProfile: () => void;
}) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');

  /*
  const [notifications, setNotifications] = React.useState(userProfile.notificationsEnabled ?? false);
  const [permissionStatus, setPermissionStatus] = React.useState<NotificationPermission>('default');

  React.useEffect(() => {
    setPermissionStatus(Notification.permission);
  }, []);
  */

  const handleDelete = async () => {
    await deleteUserAccount();
    onDeleteAccount();
    window.location.reload();
  };

  /*
  const handleNotificationChange = async (value: boolean) => {
    if (value) {
      if (permissionStatus === 'default') {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission === 'granted') {
          setNotifications(true);
          onUpdateProfile({ notificationsEnabled: true });
        }
      } else if (permissionStatus === 'granted') {
        setNotifications(true);
        onUpdateProfile({ notificationsEnabled: true });
      }
    } else {
      setNotifications(false);
      onUpdateProfile({ notificationsEnabled: false });
    }
  };
  */

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onUpdateProfile} className="focus:outline-none w-12 h-12">
                {userProfile.photoURL ? (
                    <Image
                        src={userProfile.photoURL}
                        alt="Avatar"
                        width={48}
                        height={48}
                        className="rounded-xl object-cover w-full h-full"
                    />
                ) : (
                    <UserSquare size={48} strokeWidth={1.5} className="text-white/40" />
                )}
            </button>
            <div className="dialog-title">
              <p>{userProfile.username}</p>
            </div>
          </div>
        </div>
        <hr className="border-white/20" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon size={16} strokeWidth={2.25} className="text-white/80" />
            ) : (
              <Sun size={16} strokeWidth={2.25} className="text-white/80" />
            )}
            <div>
              <p className="text-white/80 font-medium">Theme</p>
              <p className="text-xs text-white/40">Coming soon</p>
            </div>
          </div>
          <ThemeToggle 
            value={theme}
            onChange={setTheme}
          />
        </div>
        {/*
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
          <NotificationToggle 
            value={notifications && permissionStatus === 'granted'} 
            onChange={handleNotificationChange}
            disabled={permissionStatus === 'denied'}
          />
        </div>
        */}
        <hr className="border-white/20" />
        <div className="gap-2">
          <h3 className="text-sm font-medium text-white/40 mb-2">About this app</h3>
          <p className="text-white/80 text-sm">
            Inspired by Einstein&apos;s theory of relativity, Warp lets you share moments in the fabric of spacetime. A hobby project by <a href="https://www.instagram.com/test_alap_final/" target="_blank" rel="noopener noreferrer" className="underline">@alap</a>, a designer and experimenter from Berlin.
          </p>
        </div>
        <hr className="border-white/20" />
        <Button
          variant="tertiary"
          onClick={handleDelete}
          className="w-full justify-center"
        >
          <Trash2 size={16} strokeWidth={2.25} className="mr-2 text-white/40" />
          <span className="text-white/40">Delete account</span>
        </Button>
      </div>
    </Dialog>
  );
};

export default MeDialog; 