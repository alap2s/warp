'use client';

import React from 'react';
//import { IconButton } from './ui/IconButton';
import { Button } from './ui/Button';
import { Bell, BellOff, Trash2 } from 'lucide-react';
import Dialog from './ui/Dialog';
import Image from 'next/image';
import NotificationToggle from './ui/NotificationToggle';
import DialogHeader from './ui/DialogHeader';
import { deleteUserAccount } from '@/lib/user';
import { UserProfile } from '@/lib/types';

const MeDialog = ({
  userProfile,
  onClose,
  onSizeChange,
  onUpdateAvatar,
  onDeleteAccount,
  onUpdateProfile,
}: {
  userProfile: UserProfile;
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onUpdateAvatar: () => void;
  onDeleteAccount: () => void;
  onUpdateProfile: (data: { notificationsEnabled: boolean }) => void;
}) => {
  const [notifications, setNotifications] = React.useState(userProfile.notificationsEnabled ?? false);
  const [permissionStatus, setPermissionStatus] = React.useState<NotificationPermission>('default');

  React.useEffect(() => {
    setPermissionStatus(Notification.permission);
  }, []);

  const handleDelete = async () => {
    await deleteUserAccount();
    onDeleteAccount();
    window.location.reload();
  };

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

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <DialogHeader title={[userProfile.username]}>
            <button onClick={onUpdateAvatar} className="overflow-hidden rounded-2xl">
              <Image
                src={`/Thumbs/${userProfile.icon}`}
                alt="Avatar"
                width={60}
                height={60}
                className="rounded-2xl"
              />
            </button>
        </DialogHeader>
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