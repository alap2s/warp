'use client';

import React, { useState, useEffect } from 'react';
import { Warp, UserProfile } from '@/lib/warp';
import Dialog from './ui/Dialog';
import DialogHeader from './ui/DialogHeader';
import { formatEuropeanDate, formatTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { Merge } from 'lucide-react';
import { joinWarp, leaveWarp } from '@/lib/warp';
import { getUsersByIds } from '@/lib/user';

interface OpenWarpDialogProps {
  warp: Warp;
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

const OpenWarpDialog = ({ warp, onClose, onSizeChange }: OpenWarpDialogProps) => {
  const { user: currentUser } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<UserProfile[]>([]);

  const participants = warp.participants || [];

  useEffect(() => {
    if (currentUser && participants) {
      setIsJoined(participants.includes(currentUser.uid));
    }
  }, [currentUser, participants]);

  useEffect(() => {
    const fetchParticipantProfiles = async () => {
      if (participants && participants.length > 0) {
        const users = await getUsersByIds(participants);
        setParticipantProfiles(Object.values(users) as UserProfile[]);
      } else {
        setParticipantProfiles([]);
      }
    };
    fetchParticipantProfiles();
  }, [participants]);

  if (!warp) return null;

  const handleJoin = async () => {
    if (currentUser && participants.length < 20) {
      await joinWarp(warp.id, currentUser.uid);
      setIsJoined(true);
      // Optimistically update UI
      const newProfiles = [...participantProfiles, { username: currentUser.displayName || 'new user', avatar: currentUser.photoURL || '' }];
      setParticipantProfiles(newProfiles as UserProfile[]);
    }
  };

  const handleLeave = async () => {
    if (currentUser) {
      await leaveWarp(warp.id, currentUser.uid);
      setIsJoined(false);
      // Optimistically update UI
      const newProfiles = participantProfiles.filter(p => p.username !== (currentUser.displayName || 'new user'));
      setParticipantProfiles(newProfiles);
    }
  };

  const { what, when, where } = warp;
  const date = when.toDate();

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange} isModal={true}>
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        <DialogHeader title={warp.user?.username || '...'}>
          {currentUser && currentUser.uid !== warp.ownerId && (
            <Button 
              variant={isJoined ? "tertiary" : "primary"}
              onClick={isJoined ? handleLeave : handleJoin} 
              disabled={!isJoined && participants.length >= 20}
            >
              <Merge size={16} className="mr-2" />
              {isJoined ? 'Unjoin' : 'Join'}
            </Button>
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