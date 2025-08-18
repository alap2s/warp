'use client';

import { useEffect, useRef } from 'react';
import { useDialogContext } from '@/context/DialogContext';

export const useDialog = (dialogId: string) => {
  const { registerDialog, unregisterDialog } = useDialogContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        registerDialog(dialogId, { width, height });
      }
    });

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
      unregisterDialog(dialogId);
    };
  }, [dialogId, registerDialog, unregisterDialog]);

  return ref;
};
