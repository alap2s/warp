'use client';

import React, { useState, useEffect } from 'react';
import { Warp, UserProfile } from '@/lib/types';
import Dialog from './ui/Dialog';
import DialogHeader from './ui/DialogHeader';
import { formatEuropeanDate, formatTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { Merge, Edit, Share } from 'lucide-react';
import { joinWarp, leaveWarp } from '@/lib/warp';
import { getUsersByIds } from '@/lib/user';
import { usePrevious } from '@/lib/utils';
import { IconButton } from './ui/IconButton';

interface OpenWarpDialogProps {
  warp: Warp;
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onEdit: () => void;
}

const OpenWarpDialog = ({ warp, onClose, onSizeChange, onEdit }: OpenWarpDialogProps) => {
  const { user: currentUser } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<UserProfile[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const participants = warp.participants || [];
  const prevParticipants = usePrevious(participants);

  useEffect(() => {
    if (currentUser && participants) {
      setIsJoined(participants.includes(currentUser.uid));
    }
    const fetchParticipantProfiles = async () => {
      if (participants && participants.length > 0) {
        const users = await getUsersByIds(participants);
        setParticipantProfiles(Object.values(users) as UserProfile[]);
      } else {
        setParticipantProfiles([]);
      }
    };
    fetchParticipantProfiles();
  }, [participants, currentUser]);

  useEffect(() => {
    if (isUpdating && prevParticipants && JSON.stringify(prevParticipants) !== JSON.stringify(participants)) {
      setIsUpdating(false);
    }
  }, [participants, prevParticipants, isUpdating]);

  if (!warp) return null;

  const handleJoin = async () => {
    if (!currentUser) {
      window.location.href = `/?redirectTo=/warp/${warp.id}`;
      return;
    }
    if (participants.length < 20) {
      setIsUpdating(true);
      try {
        await joinWarp(warp.id, currentUser.uid);
      } catch (error) {
        console.error("Failed to join warp:", error);
        setIsUpdating(false);
      }
    }
  };

  const handleLeave = async () => {
    if (currentUser) {
      setIsUpdating(true);
      try {
        await leaveWarp(warp.id, currentUser.uid);
      } catch (error) {
        console.error("Failed to leave warp:", error);
        setIsUpdating(false);
      }
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/warp/${warp.id}`;
    const shareData = {
      title: 'Join my Warp!',
      text: `Join me for: ${warp.what}`,
      url: url,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      // You might want to show a toast notification here to confirm the copy
    }
  };

  const { what, when, where } = warp;
  const date = when.toDate();

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        <DialogHeader title={warp.user?.username || '...'}>
          {currentUser?.uid === warp.ownerId ? (
            <div className="flex gap-2">
              <IconButton variant="outline" onClick={onEdit}><Edit size={16} /></IconButton>
              <IconButton variant="outline" onClick={handleShare}><Share size={16} /></IconButton>
            </div>
          ) : (
            currentUser && (
              <Button
                variant={isJoined ? "tertiary" : "primary"}
                onClick={isJoined ? handleLeave : handleJoin}
                disabled={isUpdating || (!isJoined && participants.length >= 20)}
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Merge size={16} className="mr-2" />
                    {isJoined ? 'Unjoin' : 'Join'}
                  </>
                )}
              </Button>
            )
          )}
        </DialogHeader>
        <hr className="border-white/20" />
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-neutral-400">What</p>
            <p className="text-lg text-white">{what}</p>
          </div>
          <hr className="border-white/20" />
          <div>
            <p className="text-sm text-neutral-400">When</p>
            <p className="text-lg text-white">{`${formatEuropeanDate(date)}, ${formatTime(date)}`}</p>
          </div>
          <hr className="border-white/20" />
          <div>
            <p className="text-sm text-neutral-400">Where</p>
            <p className="text-lg text-white">{where}</p>
          </div>
          {participantProfiles.length > 0 && (
            <>
              <hr className="border-white/20" />
              <div>
                <p className="text-sm text-neutral-400">Who</p>
                <p className="text-lg text-white">
                  {participantProfiles.map(p => `@${p.username}`).join(', ')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default OpenWarpDialog; 