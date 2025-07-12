'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring, Spring, motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { MakeWarpDialog, FormData } from './MakeWarpDialog';
import WarpTile from './WarpTile';
import ProfileDialog from './ProfileDialog';
import WelcomeDialog from './WelcomeDialog';

const smoothstep = (min: number, max: number, value: number) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};

const DeformableGrid = ({ isPointerDown, pointerPos, bumpStrength, dialogRect, warpTileRect }: { 
  isPointerDown: boolean, 
  pointerPos: THREE.Vector3, 
  bumpStrength: Spring,
  dialogRect: { width: number, height: number, cornerRadius: number } | null,
  warpTileRect: { width: number, height: number, cornerRadius: number } | null
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const rippleRef = useRef<{ active: boolean, startTime: number, rect: any, isOpening: boolean } | null>(null);
  const prevDialogRect = useRef(dialogRect);
  const prevWarpTileRect = useRef(warpTileRect);
  
  const originalPositions = useRef<Float32Array>();
  const dialogBumpStrength = useSpring(0, { stiffness: 150, damping: 50 });
  const tileBumpStrength = useSpring(0, { stiffness: 150, damping: 50 });

  useEffect(() => {
    dialogBumpStrength.set(dialogRect ? -1.2 : 0);
  }, [dialogRect, dialogBumpStrength]);

  useEffect(() => {
    tileBumpStrength.set(warpTileRect ? -0.8 : 0);
  }, [warpTileRect, tileBumpStrength]);

  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#222';
    context.fillRect(0, 0, size, size);
    context.strokeStyle = '#555';
    context.lineWidth = 2;
    for (let i = 0; i <= size; i += 16) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(size, i);
      context.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  const sdfRoundedBox = (p: THREE.Vector2, b: THREE.Vector2, r: number) => {
    const qx = Math.abs(p.x) - b.x + r;
    const qy = Math.abs(p.y) - b.y + r;
    return Math.min(Math.max(qx, qy), 0.0) + new THREE.Vector2(Math.max(qx, 0.0), Math.max(qy, 0.0)).length() - r;
  }

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(viewport.width * 1.5, viewport.height * 1.5, 75, 75);
    originalPositions.current = new Float32Array(geom.attributes.position.array);
    return geom;
  }, [viewport.width, viewport.height]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const wasDialog = !!prevDialogRect.current;
    const isDialog = !!dialogRect;
    const wasTile = !!prevWarpTileRect.current;
    const isTile = !!warpTileRect;

    if (!rippleRef.current?.active) {
      if (wasTile && !isTile && !wasDialog && isDialog) {
        rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect: prevWarpTileRect.current, isOpening: true };
      }
      else if (wasDialog && !isDialog && !wasTile && isTile) {
        rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect: prevDialogRect.current, isOpening: true };
      }
      else if (wasDialog !== isDialog) {
        const isOpening = isDialog;
        const rect = isOpening ? dialogRect : prevDialogRect.current;
        rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect, isOpening };
      }
      else if (wasTile !== isTile) {
        const isOpening = isTile;
        const rect = isOpening ? warpTileRect : prevWarpTileRect.current;
        rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect, isOpening };
      }
    }

    prevDialogRect.current = dialogRect;
    prevWarpTileRect.current = warpTileRect;

    // meshRef.current.material.map.offset.x = clock.getElapsedTime() * 0.01;
    // meshRef.current.material.map.offset.y = clock.getElapsedTime() * 0.01;
    
    const vertices = meshRef.current.geometry.attributes.position.array as Float32Array;
    const strength = bumpStrength.get();
    const animatedDialogStrength = dialogBumpStrength.get();
    const animatedTileStrength = tileBumpStrength.get();

    if (strength === 0 && !isPointerDown && animatedDialogStrength === 0 && animatedTileStrength === 0 && !rippleRef.current?.active) {
      if (vertices.every((v, i) => v === originalPositions.current![i])) return;
      
      for (let i = 0; i < vertices.length; i++) {
          vertices[i] = originalPositions.current![i];
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
      return;
    };

    for (let i = 0; i < vertices.length; i += 3) {
      const x = originalPositions.current![i];
      const y = originalPositions.current![i+1];
      
      const mouseDistance = new THREE.Vector2(x, y).distanceTo(
        new THREE.Vector2(pointerPos.x, -pointerPos.z)
      );

      const radius = 1.67;
      const mouseEase = 0.5 * (1 + Math.cos(Math.PI * Math.min(mouseDistance / radius, 1)));
      let zDisplacement = isPointerDown ? strength * mouseEase * -1.5 : 0;
      
      if (rippleRef.current?.active) {
        const { startTime, rect, isOpening } = rippleRef.current;
        const elapsedTime = clock.getElapsedTime() - startTime;
        
        if (rect) {
          const speed = 5;
          const amplitude = 0.4;
          const rippleWidth = 1.5;
          const signedAmplitude = isOpening ? -amplitude : amplitude;
          
          const sdfDist = sdfRoundedBox(
            new THREE.Vector2(x, y), 
            new THREE.Vector2(rect.width / 2, rect.height / 2), 
            rect.cornerRadius
          );

          const rippleDist = elapsedTime * speed;
          const distFromRipple = Math.abs(sdfDist - rippleDist);
          
          if (distFromRipple < rippleWidth / 2) {
            const rippleFactor = Math.cos((distFromRipple / (rippleWidth / 2)) * (Math.PI / 2));
            const decay = Math.max(0, 1 - (elapsedTime / 2.0));
            zDisplacement += rippleFactor * signedAmplitude * decay;
          }
        }
      
        if (elapsedTime > 2.0) {
          rippleRef.current = null;
        }
      }

      if (dialogRect && animatedDialogStrength !== 0) {
        const rectHalfWidth = dialogRect.width / 2;
        const rectHalfHeight = dialogRect.height / 2;
        const cornerRadius = dialogRect.cornerRadius;
        
        const dist = sdfRoundedBox(
          new THREE.Vector2(x, y), 
          new THREE.Vector2(rectHalfWidth, rectHalfHeight), 
          cornerRadius
        );
        
        const edgeSoftness = 0.5;
        const factor = 1.0 - smoothstep(0, edgeSoftness, dist);
        zDisplacement += animatedDialogStrength * factor;
      }

      if (warpTileRect && animatedTileStrength !== 0) {
        const halfWidth = warpTileRect.width / 2;
        const halfHeight = warpTileRect.height / 2;
        const radius = warpTileRect.cornerRadius;

        const dist = sdfRoundedBox(
          new THREE.Vector2(x, y), 
          new THREE.Vector2(halfWidth, halfHeight), 
          radius
        );

        const edgeSoftness = 0.15;
        const factor = 1.0 - smoothstep(0, edgeSoftness, dist);

        zDisplacement += animatedTileStrength * factor;
      }

      vertices[i + 2] = originalPositions.current![i+2] + zDisplacement;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial 
        map={texture}
        map-repeat={[viewport.width / 2, viewport.height / 2]}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

const InteractiveGrid = ({ onPointerUp, dialogRect, warpTileRect }: { 
  onPointerUp: (e: any) => void, 
  dialogRect: { width: number, height: number } | null,
  warpTileRect: { width: number, height: number, cornerRadius: number } | null 
}) => {
  const [isPointerDown, setPointerDown] = useState(false);
  const pointerPos = useRef(new THREE.Vector3());
  const bumpStrength = useSpring(0, { stiffness: 150, damping: 50 });
  const { viewport } = useThree();

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setPointerDown(true);
    pointerPos.current = e.point;
    bumpStrength.set(1);
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (isPointerDown) {
      setPointerDown(false);
      bumpStrength.set(0);
      onPointerUp(e);
    }
  };
  
  const handlePointerMove = (e: any) => {
    if (isPointerDown || e.buttons === 1) {
      e.stopPropagation();
      pointerPos.current = e.point;
      if (!isPointerDown) {
        setPointerDown(true);
        bumpStrength.set(1);
      }
    }
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 10, 5]} intensity={150} />
      <DeformableGrid 
        isPointerDown={isPointerDown} 
        pointerPos={pointerPos.current} 
        bumpStrength={bumpStrength}
        dialogRect={dialogRect}
        warpTileRect={warpTileRect}
      />
      <mesh
        position={[0, -1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
};

const ViewportReporter = ({ onViewportChange }: { onViewportChange: (viewport: any, size: any) => void }) => {
  const { viewport, size } = useThree();
  useEffect(() => {
    onViewportChange(viewport, size);
  }, [viewport, size, onViewportChange]);
  return null;
}

const GridCanvas = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username: string; icon: string } | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'profile' | 'complete'>('complete');
  const [activeWarp, setActiveWarp] = useState<FormData | null>(null);
  const [warpToEdit, setWarpToEdit] = useState<FormData | null>(null);
  const [viewportInfo, setViewportInfo] = useState<{ viewport: any, size: any } | null>(null);
  const [dialogSize, setDialogSize] = useState<{ width: number, height: number } | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
      setOnboardingStep('complete');
    } else {
      setOnboardingStep('welcome');
    }
  }, []);

  const handleGridClick = () => {
    setWarpToEdit(null);
    setDialogOpen(true);
  };

  const handlePost = (data: FormData) => {
    setActiveWarp(data);
    setDialogOpen(false);
    setWarpToEdit(null);
    setDialogSize(null);
  };

  const handleStartEdit = () => {
    if (!activeWarp) return;
    setWarpToEdit(activeWarp);
    setActiveWarp(null);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    setActiveWarp(null);
    setDialogOpen(false);
    setWarpToEdit(null);
    setDialogSize(null);
  }

  const handleCloseDialog = () => {
    setDialogOpen(false);
    if (warpToEdit) {
      setActiveWarp(warpToEdit);
    }
    setWarpToEdit(null);
    setDialogSize(null);
  }

  const handleSaveProfile = (data: { username: string; icon: string }) => {
    localStorage.setItem('userProfile', JSON.stringify(data));
    setUserProfile(data);
    setOnboardingStep('complete');
    setDialogSize(null);
  };

  const handleCloseOnboarding = () => {
    setOnboardingStep('complete');
    setDialogSize(null);
  }

  const dialogRect = useMemo(() => {
    if (!dialogSize || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const dialogWidthPx = dialogSize.width * 1.2;
    const dialogHeightPx = dialogSize.height * 1.2;
    const dialogCornerRadiusPx = 48;

    const dialogWorldWidth = (dialogWidthPx / size.width) * viewport.width;
    const dialogWorldHeight = (dialogHeightPx / size.height) * viewport.height;
    const cornerRadius = (dialogCornerRadiusPx / size.width) * viewport.width;
    
    return { width: dialogWorldWidth, height: dialogWorldHeight, cornerRadius };
  }, [dialogSize, viewportInfo]);

  const warpTileRect = useMemo(() => {
    if (!activeWarp || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const tileWidthPx = 84;
    const tileHeightPx = 84;
    const tileCornerRadiusPx = 24;

    const tileWorldWidth = (tileWidthPx / size.width) * viewport.width;
    const tileWorldHeight = (tileHeightPx / size.height) * viewport.height;
    const cornerRadius = (16 / size.width) * viewport.width;

    return { width: tileWorldWidth, height: tileWorldHeight, cornerRadius };
  }, [activeWarp, viewportInfo]);

  return (
    <div className="w-screen h-screen bg-black">
       <Canvas camera={{ position: [0, 10, 0.1], fov: 50 }}>
        <ViewportReporter onViewportChange={(viewport, size) => setViewportInfo({ viewport, size })} />
        <InteractiveGrid 
          onPointerUp={handleGridClick} 
          dialogRect={dialogRect}
          warpTileRect={warpTileRect}
        />
      </Canvas>
      <AnimatePresence>
        {isDialogOpen && (
          <MakeWarpDialog
            key={warpToEdit ? 'edit' : 'new'}
            initialData={warpToEdit}
            onClose={handleCloseDialog}
            onPost={handlePost}
            onDelete={warpToEdit ? handleDelete : undefined}
            onSizeChange={setDialogSize}
          />
        )}
      </AnimatePresence>
      {activeWarp && <WarpTile warp={activeWarp} onRemove={handleStartEdit} />}
      {onboardingStep === 'welcome' && (
        <WelcomeDialog
          onNext={() => setOnboardingStep('profile')}
          onClose={handleCloseOnboarding}
          onSizeChange={setDialogSize}
          isModal={true}
        />
      )}
      {onboardingStep === 'profile' && (
        <ProfileDialog
          initialData={userProfile}
          onSave={handleSaveProfile}
          onClose={handleCloseOnboarding}
          onSizeChange={setDialogSize}
          isModal={true}
        />
      )}
    </div>
  );
};

export default GridCanvas;