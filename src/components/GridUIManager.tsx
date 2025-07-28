'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useGridState } from '@/context/GridStateContext';
import { MakeWarpDialog,getIcon } from './MakeWarpDialog';
import WarpTile from './WarpTile';
import MeDialog from './MeDialog';
import UpdateAvatarDialog from './UpdateAvatarDialog';
import SegmentedControl from './ui/SegmentedControl';
import { Plus } from 'lucide-react';
import OpenWarpDialog from './OpenWarpDialog';
import LoadingDialog from './ui/LoadingDialog';
import { updateUserProfile } from '@/lib/user';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { markNotificationsAsRead } from '@/lib/warp';
import type { Warp, UserProfile } from '@/lib/types';

const CreateWarpTile = ({ onClick }: { onClick: () => void }) => {
  const tileRef = React.useRef<HTMLDivElement>(null);
  const { setCenterTileSize } = useGridState();

  React.useEffect(() => {
    if (tileRef.current) {
      const { width, height } = tileRef.current.getBoundingClientRect();
      setCenterTileSize({ width, height });
    }
    return () => setCenterTileSize(null);
  }, [setCenterTileSize]);
  
  return (
    <motion.div
      ref={tileRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
    >
      <div
        className="w-[84px] h-[84px] bg-black border-2 border-white/40 rounded-[24px] p-4 flex flex-col items-center justify-center cursor-pointer"
        onClick={onClick}
      >
        <div className="w-8 h-8 text-white/80">
          <Plus size={32} strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  )
};


const GridUIManager = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { notifications } = useNotifications(user?.uid || null);
  const { 
    isMakeWarpDialogOpen, 
    isOpenWarpDialogOpen,
    activeWarp, 
    setActiveWarp, 
    warpToEdit, 
    postWarp, 
    updateWarp,
    closeMakeWarpDialog, 
    deleteWarp, 
    startEditWarp, 
    openMakeWarpDialog,
    openWarpDialog,
    closeWarpDialog,
    setDialogSize, 
    setMeDialogSize, 
    setUpdateAvatarDialogSize,
    meDialogSize,
    isLoading,
    warps,
  } = useGridState();
  const [isUpdatingAvatar, setUpdatingAvatar] = React.useState(false);
  const [segmentedControlSelection, setSegmentedControlSelection] = React.useState('Everyone');
  const [warpPositions, setWarpPositions] = React.useState<{ [key: string]: { x: number, y: number } }>({});
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', updateScreenSize);
    updateScreenSize();

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  React.useEffect(() => {
    if (screenSize.width === 0 || screenSize.height === 0 || !warps) return;

    const TILE_WIDTH = 84;
    const TILE_HEIGHT = 84;
    const GAP = 16;

    const layoutPattern = [
      // Ring 1
      { col: -1, row: 0 }, { col: 1, row: 0 },
      // Ring 2
      { col: -0.5, row: -1 }, { col: 0.5, row: -1 },
      { col: -0.5, row: 1 }, { col: 0.5, row: 1 },
      // Ring 3
      { col: -2, row: 0 }, { col: 2, row: 0 },
      // Ring 4
      { col: -1, row: -2 }, { col: 0, row: -2 }, { col: 1, row: -2 },
      { col: -1, row: 2 }, { col: 0, row: 2 }, { col: 1, row: 2 },
    ];

    const newPositions: { [key: string]: { x: number, y: number } } = {};
    const otherWarps = user ? warps.filter(warp => warp.ownerId !== user.uid) : warps;

    otherWarps.forEach((warp, index) => {
      if (index < layoutPattern.length) {
        const { col, row } = layoutPattern[index];

        const x = (screenSize.width / 2) + col * (TILE_WIDTH + GAP) - (TILE_WIDTH / 2);
        const y = (screenSize.height / 2) + row * (TILE_HEIGHT + GAP) - (TILE_HEIGHT / 2);
        
        if (x >= 0 && x <= screenSize.width - TILE_WIDTH && y >= 0 && y <= screenSize.height - TILE_HEIGHT) {
          newPositions[warp.id] = { x, y };
        }
      }
    });
    
    setWarpPositions(newPositions);
  }, [warps, user, screenSize]);

  React.useEffect(() => {
    if (activeWarp && warps) {
      const updatedWarp = warps.find(warp => warp.id === activeWarp.id);
      if (updatedWarp) {
        setActiveWarp(updatedWarp);
      }
    }
  }, [warps, activeWarp, setActiveWarp]);

  const isAnyDialogOpen = isMakeWarpDialogOpen || !profile || isOpenWarpDialogOpen || isUpdatingAvatar;

  const handleAvatarSave = async (newIcon: string) => {
    if (user) {
      await updateUserProfile(user.uid, { icon: newIcon });
      await refreshProfile();
    }
    setUpdatingAvatar(false);
    setUpdateAvatarDialogSize(null);
    setMeDialogSize({ width: 300, height: 557 });
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (user) {
      await updateUserProfile(user.uid, data);
      await refreshProfile();
    }
  };

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clicks on the background should deselect the active warp.
    // We check the class name to make sure we're not clicking on a tile.
    if ((e.target as HTMLElement).classList.contains('grid-ui-manager')) {
      setActiveWarp(null);
    }
  }

  const handleWarpClick = (warp: Warp) => {
    setActiveWarp(warp);
    openWarpDialog();
    if(user) {
      const relevantNotifications = notifications.filter(n => n.warpId === warp.id);
      if (relevantNotifications.length > 0) {
        markNotificationsAsRead(user.uid, relevantNotifications.map(n => n.id));
      }
    }
  };

  // Convert Firestore Timestamp to Date for MakeWarpDialog
  const warpToEditWithDate = warpToEdit && warpToEdit.when ? {
    ...warpToEdit,
    when: warpToEdit.when.toDate ? warpToEdit.when.toDate() : new Date(warpToEdit.when),
  } : null;
  
  const myWarp = user && warps ? warps.find(warp => warp.ownerId === user.uid) : null;
  const otherWarps = user && profile && warps ? warps.filter(warp => warp.ownerId !== user.uid) : [];
  const showTiles = !isMakeWarpDialogOpen && !isOpenWarpDialogOpen && !meDialogSize && !isUpdatingAvatar;

  return (
    <div className="absolute inset-0 grid-ui-manager" onClick={handleGridClick}>
      <AnimatePresence>
        {isLoading && <LoadingDialog />}
        {isMakeWarpDialogOpen && (
          <MakeWarpDialog
            key={warpToEdit ? 'edit' : 'new'}
            initialData={warpToEditWithDate}
            onClose={closeMakeWarpDialog}
            onPost={postWarp}
            onUpdate={updateWarp}
            onDelete={warpToEdit ? deleteWarp : undefined}
            onSizeChange={setDialogSize}
          />
        )}
        {isOpenWarpDialogOpen && activeWarp && (
          <OpenWarpDialog
            warp={{...activeWarp, icon: getIcon(activeWarp.icon)}}
            onClose={closeWarpDialog}
            onSizeChange={setDialogSize}
            onEdit={() => startEditWarp(activeWarp)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {/* Render the active warp (from another user) in the center */}
        {activeWarp && !isOpenWarpDialogOpen && (
          <WarpTile
            key={activeWarp.id}
            warp={{...activeWarp, icon: getIcon(activeWarp.icon)}}
            username={activeWarp.user?.username || '...'}
            onClick={() => handleWarpClick(activeWarp)}
            isNew={notifications.some(n => n.warpId === activeWarp.id && n.type === 'new_warp')}
            joinerCount={notifications.filter(n => n.warpId === activeWarp.id && n.type === 'warp_join').length}
            participantCount={activeWarp.participants.length}
          />
        )}
      </AnimatePresence>

      {/* If no other warp is active, show the user's own warp or the create tile */}
      {!activeWarp && showTiles && (
        myWarp ? (
          <WarpTile
            key={myWarp.id}
            warp={{ ...myWarp, icon: getIcon(myWarp.icon) }}
            username={profile?.username || ''}
            onClick={() => handleWarpClick(myWarp)}
            isNew={notifications.some(n => n.warpId === myWarp.id && n.type === 'new_warp')}
            joinerCount={notifications.filter(n => n.warpId === myWarp.id && n.type === 'warp_join').length}
            participantCount={myWarp.participants.length}
          />
        ) : (
          profile && <CreateWarpTile onClick={openMakeWarpDialog} />
        )
      )}

      {/* Render all other warps on the grid */}
      {showTiles && profile && otherWarps.map(warp => {
        // Hide the tile if it's the currently active one (since it's in the center)
        if (activeWarp && activeWarp.id === warp.id) return null;
        const IconComponent = getIcon(warp.icon);
        const position = warpPositions[warp.id];
        return (
          position && (
            <WarpTile
              key={warp.id}
              warp={{ ...warp, icon: IconComponent }}
              username={warp.user?.username || '...'}
              position={position}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent the grid click from firing
                handleWarpClick(warp);
              }}
              isNew={notifications.some(n => n.warpId === warp.id && n.type === 'new_warp')}
              joinerCount={notifications.filter(n => n.warpId === warp.id && n.type === 'warp_join').length}
              participantCount={warp.participants.length}
            />
          )
        );
      })}

      {profile && (
        <AnimatePresence>
          {meDialogSize && (
            <MeDialog
              key={profile.icon}
              userProfile={profile}
              onClose={() => setMeDialogSize(null)}
              onSizeChange={setMeDialogSize}
              onUpdateAvatar={() => {
                setMeDialogSize(null);
                setUpdatingAvatar(true);
              }}
              onDeleteAccount={() => setMeDialogSize(null)}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </AnimatePresence>
      )}
       {isUpdatingAvatar && profile && (
        <UpdateAvatarDialog
          defaultValue={profile.icon}
          onSave={handleAvatarSave}
          onClose={() => {
            setUpdatingAvatar(false);
            setMeDialogSize({ width: 300, height: 557 });
            setUpdateAvatarDialogSize(null);
          }}
          onSizeChange={setUpdateAvatarDialogSize}
        />
      )}
      <AnimatePresence>
        {!isAnyDialogOpen && profile && (
          <motion.div
            className="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SegmentedControl
              options={['Everyone', 'Friends', 'Me']}
              value={segmentedControlSelection}
              onSelect={(option) => {
                setSegmentedControlSelection(option);
                if (option === 'Me') {
                  setMeDialogSize({ width: 300, height: 557 });
                } else {
                  setMeDialogSize(null);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GridUIManager;