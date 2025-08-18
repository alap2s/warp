'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { app } from '@/lib/firebase';
import Dialog from '@/components/ui/Dialog';
import DialogHeader from '@/components/ui/DialogHeader';
import { motion } from 'framer-motion';
import DynamicIcon from '@/components/ui/DynamicIcon';

const InvitePage = () => {
  const { code } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [friendUsername, setFriendUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (typeof code === 'string') {
      const functions = getFunctions(app, 'europe-west3');
      const acceptInvite = httpsCallable(functions, 'acceptInvite');
      acceptInvite({ inviteCode: code })
        .then((result) => {
          const data = result.data as { friendUsername: string };
          setFriendUsername(data.friendUsername);
          setStatus('success');
        })
        .catch((error) => {
          setErrorMessage(error.message || 'An unknown error occurred.');
          setStatus('error');
        });
    }
  }, [code]);

  const closeDialog = () => {
    window.location.href = '/';
  };

  const renderDialogContent = () => {
    if (status === 'loading') {
      return (
        <DialogHeader title="Accepting Invite..." />
      );
    }

    if (status === 'success') {
      return (
        <>
          <DialogHeader title="Friend Made" />
          <div className="flex items-center justify-center p-4 bg-black bg-opacity-20 rounded-lg">
            <DynamicIcon name="user" className="w-6 h-6 mr-2" />
            <span className="text-lg">{friendUsername}</span>
          </div>
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <DialogHeader title="Link Broken" />
          <div className="flex flex-col items-center text-center p-4">
            <DynamicIcon name="refresh" className="w-8 h-8 mb-3" />
            <p className="text-sm">{errorMessage}</p>
            <p className="text-xs text-gray-400 mt-2">Ask your friend for a new link.</p>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Dialog onClose={closeDialog}>
          {renderDialogContent()}
        </Dialog>
      </motion.div>
    </div>
  );
};

export default InvitePage;
