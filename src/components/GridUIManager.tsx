'use client';

import React, { useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useGridState } from '@/context/GridStateContext';
import { MakeWarpDialog } from './MakeWarpDialog';
import WarpTile from './WarpTile';
import MeDialog from './MeDialog';
import UpdateAvatarDialog from './UpdateAvatarDialog';
import SegmentedControl from './ui/SegmentedControl';
import { Plus } from 'lucide-react';
import OpenWarpDialog from './OpenWarpDialog';
import LoadingDialog from './ui/LoadingDialog';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { getUsersByIds, updateUserProfile } from '@/lib/user';
import { markNotificationsAsRead } from '@/lib/warp';
import type { Warp, UserProfile } from '@/lib/types';
import { debounce } from 'lodash';
import { playDialogSound } from '@/lib/audio';

const CreateWarpTile = React.forwardRef<HTMLDivElement, { onClick: () => void, onSizeChange?: (size: { width: number, height: number } | null) => void }>(({ onClick, onSizeChange }, ref) => {
  useLayoutEffect(() => {
    const currentRef = ref && 'current' in ref ? ref.current : null;
    if (onSizeChange && currentRef) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          onSizeChange({ width, height });
        }
      });
      observer.observe(currentRef);
      return () => observer.disconnect();
    }
  }, [onSizeChange, ref]);
  
  return (
    <motion.div
      ref={ref}
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
});
CreateWarpTile.displayName = 'CreateWarpTile';


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
    setCenterTileSize,
  } = useGridState();
  const centerTileRef = React.useRef<HTMLDivElement>(null);
  const [isPreparingWarp, setIsPreparingWarp] = React.useState(false);
  const [participantProfiles, setParticipantProfiles] = React.useState<UserProfile[]>([]);
  const [isUpdatingAvatar, setUpdatingAvatar] = React.useState(false);
  const [segmentedControlSelection, setSegmentedControlSelection] = React.useState('Everyone');
  const [warpPositions, setWarpPositions] = React.useState<{ [key: string]: { x: number, y: number } }>({});
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    }, 200);

    window.addEventListener('resize', debouncedUpdate);
    
    // Initial size set
    debouncedUpdate();

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      debouncedUpdate.cancel();
    }
  }, []);

  React.useEffect(() => {
    if (screenSize.width === 0 || screenSize.height === 0 || !warps) return;

    const TILE_WIDTH = 84;
    const TILE_HEIGHT = 84;
    const GAP = 16;

    const cols = Math.floor(screenSize.width / (TILE_WIDTH + GAP));
    const rows = Math.floor(screenSize.height / (TILE_HEIGHT + GAP));

    const newPositions: { [key: string]: { x: number, y: number } } = {};
    const otherWarps = user ? warps.filter(warp => warp.ownerId !== user.uid) : warps;
    let warpIndex = 0;
    
    // Loop outwards from the center row
    for (let j = 0; warpIndex < otherWarps.length && j < rows; j++) {
      const row = (j % 2 === 0) ? (j / 2) : -(Math.ceil(j / 2));
      const isStaggered = Math.abs(row) % 2 !== 0;

      // Even rows (0, 2, -2...) have a center tile (except for row 0)
      if (!isStaggered && row !== 0) {
        if (warpIndex >= otherWarps.length) break;
        const x = (screenSize.width / 2) - (TILE_WIDTH / 2);
        const y = (screenSize.height / 2) + row * (TILE_HEIGHT + GAP) - (TILE_HEIGHT / 2);
        if (x >= 0 && x <= screenSize.width - TILE_WIDTH && y >= 0 && y <= screenSize.height - TILE_HEIGHT) {
          const warp = otherWarps[warpIndex];
          newPositions[warp.id] = { x, y };
          warpIndex++;
        }
      }

      for (let i = 1; warpIndex < otherWarps.length && i < cols / 2; i++) {
        const colOffset = isStaggered ? (i - 0.5) : i;

        // Add tile to the right
        if (warpIndex < otherWarps.length) {
          const x = (screenSize.width / 2) + colOffset * (TILE_WIDTH + GAP) - (TILE_WIDTH / 2);
          const y = (screenSize.height / 2) + row * (TILE_HEIGHT + GAP) - (TILE_HEIGHT / 2);
          if (x >= 0 && x <= screenSize.width - TILE_WIDTH && y >= 0 && y <= screenSize.height - TILE_HEIGHT) {
            const warp = otherWarps[warpIndex];
            newPositions[warp.id] = { x, y };
            warpIndex++;
          }
        }
        
        // Add tile to the left
        if (warpIndex < otherWarps.length) {
          const x = (screenSize.width / 2) - colOffset * (TILE_WIDTH + GAP) - (TILE_WIDTH / 2);
          const y = (screenSize.height / 2) + row * (TILE_HEIGHT + GAP) - (TILE_HEIGHT / 2);
          if (x >= 0 && x <= screenSize.width - TILE_WIDTH && y >= 0 && y <= screenSize.height - TILE_HEIGHT) {
            const warp = otherWarps[warpIndex];
            newPositions[warp.id] = { x, y };
            warpIndex++;
          }
        }
      }
    }
    
    setWarpPositions(newPositions);
    
  }, [warps, user, screenSize]);

  React.useEffect(() => {

    const prepareWarp = async () => {
      if (isOpenWarpDialogOpen && activeWarp) {
        setIsPreparingWarp(true);
        const profiles = activeWarp.participants?.length > 0 ? await getUsersByIds(activeWarp.participants) : {};
        setParticipantProfiles(Object.values(profiles) as UserProfile[]);
        
        if (user) {
            const relevantNotifications = notifications.filter(n => n.warpId === activeWarp.id);
            if (relevantNotifications.length > 0) {
              markNotificationsAsRead(user!.uid, relevantNotifications.map(n => n.id));
            }
        }
        
        setIsPreparingWarp(false);
      }
    };
    prepareWarp();
  }, [isOpenWarpDialogOpen, activeWarp, user, notifications]);


  React.useEffect(() => {
    if (activeWarp) {

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

  };

  // Convert Firestore Timestamp to Date for MakeWarpDialog
  const warpToEditWithDate = warpToEdit && warpToEdit.when ? {
    ...warpToEdit,
    when: warpToEdit.when.toDate(),
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

          isPreparingWarp ? (
            <LoadingDialog />
          ) : (
            <OpenWarpDialog
              warp={activeWarp}
              participantProfiles={participantProfiles}
              onClose={() => {
                closeWarpDialog();
                setParticipantProfiles([]);
              }}
              onSizeChange={setDialogSize}
              onEdit={() => {
                closeWarpDialog();
                startEditWarp(activeWarp)
              }}
              isPreview={!profile}
            />
          )
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {/* Render the active warp (from another user) in the center */}
        {activeWarp && !isOpenWarpDialogOpen && (
          <WarpTile
            ref={centerTileRef}
            key={activeWarp.id}
            warp={activeWarp}
            username={activeWarp.user?.username || '...'}
            onClick={() => handleWarpClick(activeWarp)}
            isNew={notifications.some(n => n.warpId === activeWarp.id && n.type === 'new_warp')}
            joinerCount={notifications.filter(n => n.warpId === activeWarp.id && n.type === 'warp_join').length}
            participantCount={activeWarp.participants.length}
            onSizeChange={setCenterTileSize}
          />
        )}
      </AnimatePresence>

      {/* If no other warp is active, show the user's own warp or the create tile */}
      {!activeWarp && showTiles && (
        myWarp ? (
          <WarpTile
            ref={centerTileRef}
            key={myWarp.id}
            warp={myWarp}
            username={profile?.username || ''}
            onClick={() => handleWarpClick(myWarp)}
            isNew={notifications.some(n => n.warpId === myWarp.id && n.type === 'new_warp')}
            joinerCount={notifications.filter(n => n.warpId === myWarp.id && n.type === 'warp_join').length}
            participantCount={myWarp.participants.length}
            onSizeChange={setCenterTileSize}
          />
        ) : (
          profile && <CreateWarpTile ref={centerTileRef} onClick={openMakeWarpDialog} onSizeChange={setCenterTileSize} />
        )
      )}

      {/* Render all other warps on the grid */}
      {showTiles && profile && otherWarps.map(warp => {
        // Hide the tile if it's the currently active one (since it's in the center)
        if (activeWarp && activeWarp.id === warp.id) return null;
        //const IconComponent = getIcon(warp.icon);
        const position = warpPositions[warp.id];
        return (
          position && (
            <WarpTile
              key={warp.id}
              warp={warp}
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
              onClose={() => {
                setMeDialogSize(null)
                setSegmentedControlSelection('Friends');
                playDialogSound('close');
              }}
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
                  playDialogSound('open');
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
