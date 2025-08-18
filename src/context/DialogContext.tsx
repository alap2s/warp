'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type DialogInfo = {
  id: string;
  size: { width: number; height: number };
};

interface DialogContextType {
  dialogs: DialogInfo[];
  registerDialog: (id: string, size: { width: number; height: number }) => void;
  unregisterDialog: (id:string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogInfo[]>([]);

  const registerDialog = useCallback((id: string, size: { width: number; height: number }) => {
    setDialogs(prev => [...prev.filter(d => d.id !== id), { id, size }]);
  }, []);

  const unregisterDialog = useCallback((id: string) => {
    setDialogs(prev => prev.filter(d => d.id !== id));
  }, []);

  return (
    <DialogContext.Provider value={{ dialogs, registerDialog, unregisterDialog }}>
      {children}
    </DialogContext.Provider>
  );
};
