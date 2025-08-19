'use client';

import React, { useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useGridState } from '@/context/GridStateContext';
import { MakeWarpDialog } from './MakeWarpDialog';
import WarpTile from './WarpTile';
import MeDialog from './MeDialog';
import UpdateAvatarDialog from './UpdateAvatarDialog';
import NavBar from './ui/NavBar';
import { Plus } from 'lucide-react';
import OpenWarpDialog from './OpenWarpDialog';
import LoadingDialog from './ui/LoadingDialog';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { getUsersByIds, updateUserProfile } from '@/lib/user';
import { markNotificationsAsRead } from '@/lib/warp';
import type { Warp, UserProfile } from '@/lib/types';
import { debounce } from 'lodash';
import { playDialogSound } from '@/lib/audio';
import { useRouter } from 'next/navigation';
import AddFriendsDialog from './AddFriendsDialog';
import { onFriendsUpdate } from '@/lib/friends';
import FriendTile from './FriendTile';
import { UserPlus } from 'lucide-react';
import { IconButton } from './ui/IconButton';

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

interface GridUIManagerProps {
    sharedWarp?: Warp;
    isPreview?: boolean;
}

const GridUIManager = ({ sharedWarp, isPreview = false }: GridUIManagerProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const { notifications } = useNotifications(user?.uid || null);
  const { 
    isMakeWarpDialogOpen, 
    isOpenWarpDialogOpen,
    isMeDialogOpen,
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
    setMeDialogOpen,
    setUpdateAvatarDialogSize,
    isLoading,
    warps,
    setCenterTileSize,
    filter,
    setFilter,
  } = useGridState();
  const centerTileRef = React.useRef<HTMLDivElement>(null);
  const [isPreparingWarp, setIsPreparingWarp] = React.useState(false);
  const [participantProfiles, setParticipantProfiles] = React.useState<UserProfile[]>([]);
  const [isUpdatingAvatar, setUpdatingAvatar] = React.useState(false);
  const [isAddFriendsDialogOpen, setAddFriendsDialogOpen] = React.useState(false);
  const [friends, setFriends] = React.useState<UserProfile[]>([]);
  const [segmentedControlSelection, setSegmentedControlSelection] = React.useState('World');
  const [warpPositions, setWarpPositions] = React.useState<{ [key: string]: { x: number, y: number } }>({});
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });
  const [sharedWarpHandled, setSharedWarpHandled] = React.useState(false);

  React.useEffect(() => {
    if (sharedWarp && !isPreview && !sharedWarpHandled) {
      setActiveWarp(sharedWarp);
      openWarpDialog();
      setSharedWarpHandled(true);
    }
  }, [sharedWarp, isPreview, setActiveWarp, openWarpDialog, sharedWarpHandled]);

  React.useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onFriendsUpdate(user.uid, setFriends);
      return () => unsubscribe();
    }
  }, [user?.uid]);

  React.useEffect(() => {
    if (segmentedControlSelection === 'Friends' && friends.length === 0) {
      setAddFriendsDialogOpen(true);
    } else {
      setAddFriendsDialogOpen(false);
    }
  }, [segmentedControlSelection, friends]);

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

    const tilesToPosition: (Warp | UserProfile)[] = segmentedControlSelection === 'World'
      ? otherWarps
      : [...warps, ...friendsWithoutWarps];

    let tileIndex = 0;

    for (let j = 0; tileIndex < tilesToPosition.length && j < rows; j++) {
      const row = (j % 2 === 0) ? (j / 2) : -(Math.ceil(j / 2));
      const isStaggered = Math.abs(row) % 2 !== 0;

      if (!isStaggered && row !== 0) {
        if (tileIndex >= tilesToPosition.length) break;
        const x = (screenSize.width / 2) - (TILE_WIDTH / 2);
        const y = (screenSize.height / 2) + row * (TILE_HEIGHT + GAP) - (TILE_HEIGHT / 2);
        if (x >= 0 && x <= screenSize.width - TILE_WIDTH && y >= 0 && y <= screenSize.height - TILE_HEIGHT) {
          const tile = tilesToPosition[tileIndex];
          const tileId = 'id' in tile ? tile.id : tile.uid;
          newPositions[tileId] = { x, y };
          tileIndex++;
        }
      }

      for (let i = 1; tileIndex < tilesToPosition.length && i < cols / 2; i++) {
        const colOffset = isStaggered ? (i - 0.5) : i;

        if (tileIndex < tilesToPosition.length) {
          const x = (screenSize.width / 2) + colOffset * (TILE_WIDTH + GAP) - (TILE_WIDTH / 2);
          const y = (screenSize.height / 2) + row * (TILE_HEIGHT + GAP) - (TILE_HEIGHT / 2);
          if (x >= 0 && x <= screenSize.width - TILE_WIDTH && y >= 0 && y <= screenSize.height - TILE_HEIGHT) {
            const tile = tilesToPosition[tileIndex];
            const tileId = 'id' in tile ? tile.id : tile.uid;
            newPositions[tileId] = { x, y };
            tileIndex++;
          }
        }

        if (tileIndex < tilesToPosition.length) {
          const x = (screenSize.width / 2) - colOffset * (TILE_WIDTH + GAP) - (TILE_WIDTH / 2);
          const y = (screenSize.height / 2) + row * (TILE_HEIGHT + GAP) - (TILE_HEIGHT / 2);
          if (x >= 0 && x <= screenSize.width - TILE_WIDTH && y >= 0 && y <= screenSize.height - TILE_HEIGHT) {
            const tile = tilesToPosition[tileIndex];
            const tileId = 'id' in tile ? tile.id : tile.uid;
            newPositions[tileId] = { x, y };
            tileIndex++;
          }
        }
      }
    }

    setWarpPositions(newPositions);
    
  }, [warps, user, screenSize, segmentedControlSelection, friends]);

  React.useEffect(() => {

    const prepareWarp = async () => {
      if (isOpenWarpDialogOpen && activeWarp) {
        setIsPreparingWarp(true);
        const profiles = activeWarp.participants?.length > 0 ? await getUsersByIds(activeWarp.participants) : {};
        setParticipantProfiles(Object.values(profiles) as UserProfile[]);
        
        const relevantNotifications = notifications.filter(n => n.warpId === activeWarp.id);
        if (relevantNotifications.length > 0 && user) {
          markNotificationsAsRead(user!.uid, relevantNotifications.map(n => n.id));
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
        if(JSON.stringify(updatedWarp) !== JSON.stringify(activeWarp)) {
          setActiveWarp(updatedWarp);
        }
      }
    }
  }, [warps, activeWarp, setActiveWarp]);

  const shouldHideNavBar = isMakeWarpDialogOpen || isOpenWarpDialogOpen || isUpdatingAvatar;
  const anyDialogOpen = isMakeWarpDialogOpen || isOpenWarpDialogOpen || isUpdatingAvatar || isMeDialogOpen || isAddFriendsDialogOpen;
  const showTiles = !anyDialogOpen && !isPreview;


  const handleAvatarSave = async (newIcon: string) => {
    if (user) {
      await updateUserProfile(user.uid, { icon: newIcon });
      await refreshProfile();
    }
    setUpdatingAvatar(false);
    setUpdateAvatarDialogSize(null);
    setMeDialogOpen(true);
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (user) {
      await updateUserProfile(user.uid, data);
      await refreshProfile();
    }
  };

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clicks on the background should deselect the active warp and close the dialog.
    if ((e.target as HTMLElement).classList.contains('grid-ui-manager')) {
      setActiveWarp(null);
      closeWarpDialog();
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
  const friendsWithoutWarps = friends.filter(friend => !warps.some(warp => warp.ownerId === friend.uid));

  const tilesToDisplay = segmentedControlSelection === 'World'
    ? otherWarps
    : [...warps, ...friendsWithoutWarps];

  if (isPreview) {
    if (!sharedWarp) {
        return <LoadingDialog />; // Or some other placeholder
    }
    return (
        <OpenWarpDialog
            warp={sharedWarp}
            participantProfiles={[]}
            onClose={() => router.push('/')} // Redirect to home to start onboarding
            onEdit={() => {}} // No-op for preview
            isPreview={true}
            onSizeChange={setDialogSize}
        />
    );
}

  return (
    <div className="absolute inset-0 grid-ui-manager" onClick={handleGridClick}>
      <AnimatePresence>
        {isLoading && <LoadingDialog key="loading" />}
        {profile && isMakeWarpDialogOpen && (
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
        {profile && <AddFriendsDialog
            key="add-friends"
            isOpen={isAddFriendsDialogOpen}
            onClose={() => {
              setAddFriendsDialogOpen(false)
              setDialogSize(null);
              if (friends.length === 0) {
                setSegmentedControlSelection('World');
              }
            }}
            showCloseButton={friends.length > 0}
            onSizeChange={setDialogSize}
          />}

        {profile && isOpenWarpDialogOpen && activeWarp && (

          isPreparingWarp ? (
            <LoadingDialog key="preparing-warp" />
          ) : (
            <OpenWarpDialog
              key={activeWarp.id}
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
            />
          )
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
            participantCount={Math.max(0, myWarp.participants.length)}
            onSizeChange={setCenterTileSize}
          />
        ) : (
          profile && <CreateWarpTile ref={centerTileRef} onClick={openMakeWarpDialog} onSizeChange={setCenterTileSize} />
        )
      )}

      {/* Render all other warps on the grid */}
      <AnimatePresence key={segmentedControlSelection}>
        {showTiles && profile && tilesToDisplay.map(tile => {
          if (activeWarp && 'id' in tile && activeWarp.id === tile.id) return null;
          if ('ownerId' in tile && tile.ownerId === user?.uid) return null;
          
          const position = warpPositions['id' in tile ? tile.id : tile.uid];
          if (!position) return null;

          if ('id' in tile) { // It's a Warp
            const warp = tile;
            return (
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
                participantCount={Math.max(0, warp.participants.length)}
              />
            );
          } else { // It's a Friend
            const friend = tile;
            return (
              <FriendTile
                key={friend.uid}
                friend={friend}
                position={position}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
              />
            );
          }
        })}
      </AnimatePresence>

      {segmentedControlSelection === 'Friends' && friends.length > 0 && showTiles && (
        <div className="absolute top-4 right-4 z-50">
          <IconButton variant="outline" onClick={() => setAddFriendsDialogOpen(true)} icon={UserPlus} />
        </div>
      )}

      {profile && (
        <AnimatePresence>
          {isMeDialogOpen && (
            <MeDialog
              key={profile.icon}
              userProfile={profile}
              onClose={() => {
                setMeDialogOpen(false);
                setDialogSize(null);
                setSegmentedControlSelection('World');
                playDialogSound('close');
              }}
              onSizeChange={setDialogSize}
              onUpdateAvatar={() => {
                setMeDialogOpen(false);
                setUpdatingAvatar(true);
              }}
              onDeleteAccount={() => setMeDialogOpen(false)}
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
            setMeDialogOpen(true);
            setUpdateAvatarDialogSize(null);
          }}
          onSizeChange={setUpdateAvatarDialogSize}
        />
      )}
        {profile && !shouldHideNavBar && (
          <NavBar
            options={[{ label: 'World' }, { label: 'Friends' }, { label: 'Settings' }]}
            value={segmentedControlSelection}
            onSelect={(option) => {
              setActiveWarp(null);
              setSegmentedControlSelection(option);
              if (option === 'Settings') {
                playDialogSound('open');
                setMeDialogOpen(true);
              } else if (option === 'Friends') {
                setFilter('friends');
                if (friends.length === 0) {
                  setAddFriendsDialogOpen(true);
                } else {
                  setDialogSize(null);
                }
                setMeDialogOpen(false);
              } else {
                setFilter('all');
                setAddFriendsDialogOpen(false);
                setMeDialogOpen(false);
                setDialogSize(null);
              }
            }}
          />
        )}
    </div>
  );
};

export default GridUIManager;
