'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FormData } from '@/components/MakeWarpDialog';

import { Warp, UserProfile } from '@/lib/types';
import { playCreateWarp, playDeleteWarp, playDialogSound } from '@/lib/audio';
type DialogSize = { width: number, height: number } | null;

interface GridStateContextType {
  isMakeWarpDialogOpen: boolean;
  isOpenWarpDialogOpen: boolean;
  isMeDialogOpen: boolean;
  isUserDialogOpen: boolean;
  isUpdateAvatarDialogOpen: boolean;
  activeWarp: Warp | null;
  activeUserProfile: UserProfile | null;
  warpToEdit: Warp | null;
  isSaving: boolean;
  isLoading: boolean;
  dialogSize: DialogSize;
  updateAvatarDialogSize: DialogSize;
  centerTileSize: DialogSize;
  warps: Warp[];
  openMakeWarpDialog: () => void;
  closeMakeWarpDialog: () => void;
  openWarpDialog: () => void;
  closeWarpDialog: (isTransitioning?: boolean) => void;
  openUserDialog: (user: UserProfile) => void;
  closeUserDialog: () => void;
  openUpdateAvatarDialog: () => void;
  closeUpdateAvatarDialog: () => void;
  deleteActiveWarp: () => void;
  postWarp: (data: FormData) => void;
  updateWarp: (data: FormData) => void;
  startEditWarp: (warp: Warp) => void;
  deleteWarp: () => void;
  setActiveWarp: (warp: Warp | null) => void;
  setDialogSize: (size: DialogSize) => void;
  setMeDialogOpen: (isOpen: boolean) => void;
  setUpdateAvatarDialogSize: (size: DialogSize) => void;
  setCenterTileSize: (size: DialogSize) => void;
  filter: 'all' | 'friends';
  setFilter: (filter: 'all' | 'friends') => void;
}

const GridStateContext = createContext<GridStateContextType | undefined>(undefined);

export const useGridState = () => {
  const context = useContext(GridStateContext);
  if (!context) {
    throw new Error('useGridState must be used within a GridStateProvider');
  }
  return context;
};

interface GridStateProviderProps {
  children: ReactNode;
  warps: Warp[];
  createWarp: (data: FormData) => Promise<void>;
  updateWarp: (id: string, data: Partial<FormData>) => Promise<void>;
  deleteWarp: (id: string) => Promise<void>;
  isSaving: boolean;
  filter: 'all' | 'friends';
  setFilter: (filter: 'all' | 'friends') => void;
}

export const GridStateProvider = ({ 
  children,
  warps,
  createWarp,
  updateWarp: updateWarpInDb,
  deleteWarp: removeWarp,
  isSaving,
  filter,
  setFilter,
}: GridStateProviderProps) => {
  const [isMakeWarpDialogOpen, setMakeWarpDialogOpen] = useState(false);
  const [isOpenWarpDialogOpen, setOpenWarpDialogOpen] = useState(false);
  const [isMeDialogOpen, setMeDialogOpen] = useState(false);
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  const [isUpdateAvatarDialogOpen, setUpdateAvatarDialogOpen] = useState(false);
  const [activeWarp, setActiveWarp] = useState<Warp | null>(null);
  const [activeUserProfile, setActiveUserProfile] = useState<UserProfile | null>(null);
  const [warpToEdit, setWarpToEdit] = useState<Warp | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>(null);
  const [updateAvatarDialogSize, setUpdateAvatarDialogSize] = useState<DialogSize>(null);
  const [centerTileSize, setCenterTileSize] = useState<DialogSize>(null);

  const openMakeWarpDialog = () => {
    setWarpToEdit(null);
    setMakeWarpDialogOpen(true);
    playDialogSound('open');
  };

  const closeMakeWarpDialog = () => {
    setMakeWarpDialogOpen(false);
    setWarpToEdit(null);
    setDialogSize(null);
  };

  const openWarpDialog = () => {
    playDialogSound('open');
    setOpenWarpDialogOpen(true);
  };

  const closeWarpDialog = (isTransitioning = false) => {
    setOpenWarpDialogOpen(false);
    setDialogSize(null);
    if (!isTransitioning) {
      setActiveWarp(null);
      playDialogSound('close');
    }
  };

  const openUserDialog = (user: UserProfile) => {
    setActiveUserProfile(user);
    setUserDialogOpen(true);
    playDialogSound('open');
  };

  const closeUserDialog = () => {
    setActiveUserProfile(null);
    setUserDialogOpen(false);
    setDialogSize(null);
    playDialogSound('close');

    if (activeWarp) {
      setOpenWarpDialogOpen(true);
    }
  };

  const deleteActiveWarp = async () => {
    if (activeWarp) {
      await removeWarp(activeWarp.id);
      playDeleteWarp();
      closeWarpDialog();
    }
  };

  const openUpdateAvatarDialog = () => {
    setMeDialogOpen(false);
    setUpdateAvatarDialogOpen(true);
  };

  const closeUpdateAvatarDialog = () => {
    setUpdateAvatarDialogOpen(false);
    setMeDialogOpen(true);
  };

  const postWarp = async (data: FormData) => {
    const newWarp = { ...data };
    await createWarp(newWarp);
    playCreateWarp();
    setMakeWarpDialogOpen(false);
    setDialogSize(null);
  };

  const updateWarp = async (data: FormData) => {
    if (!warpToEdit) return;
    closeMakeWarpDialog();
    setIsLoading(true);
    await updateWarpInDb(warpToEdit.id, data);
    setIsLoading(false);
  };

  const startEditWarp = (warp: Warp) => {
    setWarpToEdit(warp);
    setActiveWarp(null);
    closeWarpDialog(true);
    setMakeWarpDialogOpen(true);
  };

  const deleteWarp = async () => {
    if (warpToEdit) {
      await removeWarp(warpToEdit.id);
      playDeleteWarp();
      setActiveWarp(null);
      setMakeWarpDialogOpen(false);
      setWarpToEdit(null);
      setDialogSize(null);
    }
  };

  const value = {
    isMakeWarpDialogOpen,
    isOpenWarpDialogOpen,
    isMeDialogOpen,
    isUserDialogOpen,
    isUpdateAvatarDialogOpen,
    activeWarp,
    activeUserProfile,
    warpToEdit,
    isSaving,
    isLoading,
    dialogSize,
    updateAvatarDialogSize,
    centerTileSize,
    warps,
    openMakeWarpDialog,
    closeMakeWarpDialog,
    openWarpDialog,
    closeWarpDialog,
    openUserDialog,
    closeUserDialog,
    openUpdateAvatarDialog,
    closeUpdateAvatarDialog,
    deleteActiveWarp,
    postWarp,
    updateWarp,
    startEditWarp,
    deleteWarp,
    setActiveWarp,
    setDialogSize,
    setMeDialogOpen,
    setUpdateAvatarDialogSize,
    setCenterTileSize,
    filter,
    setFilter,
  };

  return (
    <GridStateContext.Provider value={value}>
      {children}
    </GridStateContext.Provider>
  );
};
