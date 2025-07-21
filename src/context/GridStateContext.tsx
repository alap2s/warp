'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FormData } from '@/components/MakeWarpDialog';
import { useWarps } from '@/lib/hooks/useWarps';

type Warp = any; // A more specific type will be better
type DialogSize = { width: number, height: number } | null;

interface GridStateContextType {
  isMakeWarpDialogOpen: boolean;
  isOpenWarpDialogOpen: boolean;
  activeWarp: Warp | null;
  warpToEdit: Warp | null;
  dialogSize: DialogSize;
  profileDialogSize: DialogSize;
  meDialogSize: DialogSize;
  openMakeWarpDialog: () => void;
  closeMakeWarpDialog: () => void;
  openWarpDialog: () => void;
  closeWarpDialog: () => void;
  postWarp: (data: FormData) => void;
  startEditWarp: (warp: Warp) => void;
  deleteWarp: () => void;
  setActiveWarp: (warp: Warp | null) => void;
  setDialogSize: (size: DialogSize) => void;
  setProfileDialogSize: (size: DialogSize) => void;
  setMeDialogSize: (size: DialogSize) => void;
  handlePost: (data: FormData) => void;
  handleCloseDialog: () => void;
  handleDelete: () => void;
  handleStartEdit: (warp: Warp) => void;
}

const GridStateContext = createContext<GridStateContextType | undefined>(undefined);

export const useGridState = () => {
  const context = useContext(GridStateContext);
  if (!context) {
    throw new Error('useGridState must be used within a GridStateProvider');
  }
  return context;
};

export const GridStateProvider = ({ children }: { children: ReactNode }) => {
  const { createWarp, deleteWarp: removeWarp } = useWarps();
  const [isMakeWarpDialogOpen, setMakeWarpDialogOpen] = useState(false);
  const [isOpenWarpDialogOpen, setOpenWarpDialogOpen] = useState(false);
  const [activeWarp, setActiveWarp] = useState<Warp | null>(null);
  const [warpToEdit, setWarpToEdit] = useState<Warp | null>(null);
  const [dialogSize, setDialogSize] = useState<DialogSize>(null);
  const [profileDialogSize, setProfileDialogSize] = useState<DialogSize>(null);
  const [meDialogSize, setMeDialogSize] = useState<DialogSize>(null);

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

  const postWarp = (data: FormData) => {
    const iconName = Object.keys(data.icon)[0] || 'LineSquiggle';
    const IconComponent = (data.icon as any)[iconName];
    createWarp({ ...data, icon: iconName });
    setActiveWarp({ ...data, icon: IconComponent });
    setMakeWarpDialogOpen(false);
    setWarpToEdit(null);
  };

  const startEditWarp = (warp: Warp) => {
    setWarpToEdit(warp);
    setActiveWarp(null);
    setMakeWarpDialogOpen(true);
  };

  const deleteWarpAndCloseDialog = () => {
    if (warpToEdit) {
      removeWarp(warpToEdit.id);
    }
    setActiveWarp(null);
    setMakeWarpDialogOpen(false);
    setWarpToEdit(null);
    setDialogSize(null);
  };

  const value = {
    isMakeWarpDialogOpen,
    isOpenWarpDialogOpen,
    activeWarp,
    warpToEdit,
    dialogSize,
    profileDialogSize,
    meDialogSize,
    openMakeWarpDialog,
    closeMakeWarpDialog,
    openWarpDialog,
    closeWarpDialog,
    postWarp,
    startEditWarp,
    deleteWarp: deleteWarpAndCloseDialog,
    setActiveWarp,
    setDialogSize,
    setProfileDialogSize,
    setMeDialogSize,
    handlePost: postWarp,
    handleCloseDialog: closeMakeWarpDialog,
    handleDelete: deleteWarpAndCloseDialog,
    handleStartEdit: startEditWarp,
  };

  return (
    <GridStateContext.Provider value={value}>
      {children}
    </GridStateContext.Provider>
  );
}; 