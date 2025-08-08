'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

import { useGridState, GridStateProvider } from '@/context/GridStateContext';
import { AuthProvider } from '@/context/AuthContext';

const InteractiveGrid = dynamic(() => import('@/components/InteractiveGrid'), { ssr: false });

const BumpPageContent = () => {
    return (
        <div className="w-full h-full">
             <InteractiveGrid />
        </div>
    )
};

const BumpPage = () => {
  return (
    <AuthProvider>
        <GridStateProvider>
            <main className="relative w-full h-screen overflow-hidden bg-black">
                <BumpPageContent />
            </main>
        </GridStateProvider>
    </AuthProvider>
  );
};

export default BumpPage;
