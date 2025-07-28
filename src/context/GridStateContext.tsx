'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FormData } from '@/components/MakeWarpDialog';

import { Warp } from '@/lib/types';
type DialogSize = { width: number, height: number } | null;

interface GridStateContextType {
  isMakeWarpDialogOpen: boolean;
  isOpenWarpDialogOpen: boolean;
  activeWarp: Warp | null;
  warpToEdit: Warp | null;
  isSaving: boolean;
  isLoading: boolean;
  dialogSize: DialogSize;
  meDialogSize: DialogSize;
  updateAvatarDialogSize: DialogSize;
  centerTileSize: DialogSize;
  warps: Warp[];
  openMakeWarpDialog: () => void;
  closeMakeWarpDialog: () => void;
  openWarpDialog: () => void;
  closeWarpDialog: () => void;
  postWarp: (data: FormData) => void;
  updateWarp: (data: FormData) => void;
  startEditWarp: (warp: Warp) => void;
  deleteWarp: () => void;
  setActiveWarp: (warp: Warp | null) => void;
  setDialogSize: (size: DialogSize) => void;
  setMeDialogSize: (size: DialogSize) => void;
  setUpdateAvatarDialogSize: (size: DialogSize) => void;
  setCenterTileSize: (size: DialogSize) => void;
}

const GridStateContext = createContext<GridStateContextType | undefined>(undefined);

export const useGridState = () => {
  const context = useContext(GridStateContext);
  if (!context) {
    throw new Error('useGridState must be used within a GridStateProvider');
  }
  return context;
};

export const GridStateProvider = ({ 
  children,
  warps,
  createWarp,
  updateWarp: updateWarpInDb,
  deleteWarp: removeWarp,
  isSaving,
}: { 
  children: ReactNode,
  warps: Warp[],
  createWarp: (data: FormData) => Promise<void>,
  updateWarp: (id: string, data: Partial<FormData>) => Promise<void>,
  deleteWarp: (id: string) => Promise<void>,
  isSaving: boolean,
}) => {
  const [isMakeWarpDialogOpen, setMakeWarpDialogOpen] = useState(false);
  const [isOpenWarpDialogOpen, setOpenWarpDialogOpen] = useState(false);
  const [activeWarp, setActiveWarp] = useState<Warp | null>(null);
  const [warpToEdit, setWarpToEdit] = useState<Warp | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>(null);
  const [meDialogSize, setMeDialogSize] = useState<DialogSize>(null);
  const [updateAvatarDialogSize, setUpdateAvatarDialogSize] = useState<DialogSize>(null);
  const [centerTileSize, setCenterTileSize] = useState<DialogSize>(null);

  const openMakeWarpDialog = () => {
    setWarpToEdit(null);
    setMakeWarpDialogOpen(true);
  };

  const closeMakeWarpDialog = () => {
    setMakeWarpDialogOpen(false);
    if (warpToEdit) {
      setActiveWarp(warpToEdit);
    }
    setWarpToEdit(null);
    setDialogSize(null);
  };

  const openWarpDialog = () => {
    setOpenWarpDialogOpen(true);
  };

  const closeWarpDialog = () => {
    setOpenWarpDialogOpen(false);
    setActiveWarp(null);
    setDialogSize(null);
  };

  const postWarp = async (data: FormData) => {
    const newWarp = { ...data };
    await createWarp(newWarp);
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
    closeWarpDialog();
    setMakeWarpDialogOpen(true);
  };

  const deleteWarp = async () => {
    if (warpToEdit) {
      await removeWarp(warpToEdit.id);
      setActiveWarp(null);
      setMakeWarpDialogOpen(false);
      setWarpToEdit(null);
      setDialogSize(null);
    }
  };

  const value = {
    isMakeWarpDialogOpen,
    isOpenWarpDialogOpen,
    activeWarp,
    warpToEdit,
    isSaving,
    isLoading,
    dialogSize,
    meDialogSize,
    updateAvatarDialogSize,
    centerTileSize,
    warps,
    openMakeWarpDialog,
    closeMakeWarpDialog,
    openWarpDialog,
    closeWarpDialog,
    postWarp,
    updateWarp,
    startEditWarp,
    deleteWarp,
    setActiveWarp,
    setDialogSize,
    setMeDialogSize,
    setUpdateAvatarDialogSize,
    setCenterTileSize,
  };

  return (
    <GridStateContext.Provider value={value}>
      {children}
    </GridStateContext.Provider>
  );
}; 