'use client';

import React, { useState, useEffect } from 'react';
import { Warp, UserProfile } from '@/lib/types';
import Dialog from './ui/Dialog';
import DialogHeader from './ui/DialogHeader';
import { formatEuropeanDate, formatTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { Merge, Edit, Share, SquareArrowOutUpRight } from 'lucide-react';
import { joinWarp, leaveWarp } from '@/lib/warp';
import { usePrevious } from '@/lib/utils';
import { IconButton } from './ui/IconButton';
import { playJoinWarp, playUnjoinWarp } from '@/lib/audio';

interface OpenWarpDialogProps {
  warp: Warp;
  participantProfiles: UserProfile[];
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onEdit: () => void;
  isPreview?: boolean;
}

const OpenWarpDialog = ({ warp, participantProfiles, onClose, onSizeChange, onEdit, isPreview = false }: OpenWarpDialogProps) => {
  const { user: currentUser } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const participants = React.useMemo(() => warp.participants || [], [warp.participants]);
  const prevParticipants = usePrevious(participants);

  useEffect(() => {
    if (currentUser && participants) {
      setIsJoined(participants.includes(currentUser.uid));
    }
  }, [participants, currentUser]);

  useEffect(() => {
    if (isUpdating && prevParticipants && JSON.stringify(prevParticipants) !== JSON.stringify(participants)) {
      setIsUpdating(false);
    }
  }, [participants, prevParticipants, isUpdating]);

  if (!warp) return null;

  const handleJoin = async () => {
    if (isPreview || !currentUser) {
      window.location.href = `/?redirectTo=/warp/${warp.id}`;
      return;
    }
    if (participants.length < 20) {
      setIsUpdating(true);
      try {
        await joinWarp(warp.id, currentUser.uid);
        playJoinWarp();
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
        playUnjoinWarp();
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
    }
  };

  const handleLocationClick = () => {
    if (warp.coordinates) {
      const { lat, lng } = warp.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const { what, when, where } = warp;
  const date = when.toDate();
  
  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
      
        <DialogHeader title={warp.user?.username || '...'}>
          {currentUser?.uid === warp.ownerId ? (
            <>
              <IconButton variant="outline" onClick={onEdit} icon={Edit} />
              <IconButton variant="outline" onClick={handleShare} icon={Share} />
            </>
          ) : (
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
          }
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
            <div className="flex items-center justify-between cursor-pointer gap-2" onClick={handleLocationClick}>
              <p className="text-lg text-white">{where}</p>
              {warp.coordinates && (
                <SquareArrowOutUpRight className="text-white/40 flex-shrink-0" size={20} strokeWidth={2.5} />
              )}
            </div>
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
