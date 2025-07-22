'use client';

import React, { useState, useEffect } from 'react';
import Dialog from './ui/Dialog';
import { getIcon, FormData } from './MakeWarpDialog';
import { Merge } from 'lucide-react';
import { Button } from './ui/Button';
import DialogHeader from './ui/DialogHeader';
import { useAuth } from '@/context/AuthContext';
import { joinWarp, leaveWarp } from '@/lib/warp';
import { getUsersByIds } from '@/lib/user';

const OpenWarpDialog = ({
  warp,
  onClose,
  onSizeChange,
}: {
  warp: any;
  onClose: () => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}) => {
  const { user: currentUser } = useAuth();
  const { what, when, where, user, participants, id: warpId } = warp;
  const date = when.toDate ? when.toDate() : new Date(when);
  const [isJoined, setIsJoined] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser && participants) {
      setIsJoined(participants.includes(currentUser.uid));
    }
  }, [currentUser, participants]);

  useEffect(() => {
    const fetchParticipantProfiles = async () => {
      if (participants && participants.length > 0) {
        const users = await getUsersByIds(participants);
        setParticipantProfiles(Object.values(users));
      } else {
        setParticipantProfiles([]);
      }
    };
    fetchParticipantProfiles();
  }, [participants]);

  const handleJoin = async () => {
    if (currentUser) {
      await joinWarp(warpId, currentUser.uid);
      setIsJoined(true);
    }
  };

  const handleLeave = async () => {
    if (currentUser) {
      await leaveWarp(warpId, currentUser.uid);
      setIsJoined(false);
    }
  };

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto ">
        <DialogHeader title={user?.username || '...'}>
          <Button variant="secondary" onClick={isJoined ? handleLeave : handleJoin}>
            <Merge size={16} className="mr-2" />
            {isJoined ? 'Unjoin' : 'Join'}
          </Button>
        </DialogHeader>
        <hr className="border-white/20" />
        <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-neutral-400">What</p>
              <p className="text-lg">{what}</p>
            </div>
            <hr className="border-white/20" />
            <div>
              <p className="text-sm text-neutral-400">When</p>
              <p className="text-lg">{`${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`}</p>
            </div>
            <hr className="border-white/20" />
            <div>
              <p className="text-sm text-neutral-400">Where</p>
              <p className="text-lg">{where}</p>
            </div>
            {participantProfiles.length > 0 && (
              <>
                <hr className="border-white/20" />
                <div>
                  <p className="text-sm text-neutral-400">Who</p>
                  <p className="text-lg">
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