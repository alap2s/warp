'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useSpring, SpringValue } from '@react-spring/three';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import { MakeWarpDialog, FormData } from './MakeWarpDialog';
import WarpTile from './WarpTile';
import ProfileDialog from './ProfileDialog';
import WelcomeDialog from './WelcomeDialog';
import DebugControls from './ui/DebugControls';
import SegmentedControl from './ui/SegmentedControl';

const smoothstep = (min: number, max: number, value: number) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};

type Rect = { width: number, height: number, cornerRadius: number, centerX?: number, centerY?: number };

interface DialogBumpConfig {
  dialogBumpStrength: number;
  dialogEdgeSoftness: number;
  dialogBumpScale: number;
}

const DeformableGrid = ({ isPointerDown, pointerPos, bumpStrength, dialogRect, warpTileRect, profileDialogRect, segmentedControlRect, dialogBumpConfig }: { 
  isPointerDown: boolean, 
  pointerPos: THREE.Vector3, 
  bumpStrength: SpringValue,
  dialogRect: Rect | null,
  warpTileRect: Rect | null,
  profileDialogRect: Rect | null,
  segmentedControlRect: Rect | null,
  dialogBumpConfig: DialogBumpConfig,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const rippleRef = useRef<{ active: boolean, startTime: number, rect: Rect, isOpening: boolean } | null>(null);
  const prevDialogRect = useRef(dialogRect);
  const prevWarpTileRect = useRef(warpTileRect);
  const prevProfileDialogRect = useRef(profileDialogRect);
  const prevSegmentedControlRect = useRef(segmentedControlRect);
  
  const originalPositions = useRef<Float32Array | null>(null);
  const { val: dialogBumpStrength } = useSpring({ val: 0 });
  const { val: tileBumpStrength } = useSpring({ val: 0 });
  const { val: profileDialogBumpStrength } = useSpring({ val: 0 });
  const { val: segmentedControlBumpStrength } = useSpring({ val: 0 });

  useEffect(() => {
    dialogBumpStrength.start(dialogRect ? dialogBumpConfig.dialogBumpStrength : 0);
  }, [dialogRect, dialogBumpStrength, dialogBumpConfig.dialogBumpStrength]);

  useEffect(() => {
    tileBumpStrength.start(warpTileRect ? -0.8 : 0);
  }, [warpTileRect, tileBumpStrength]);

  useEffect(() => {
    profileDialogBumpStrength.start(profileDialogRect ? dialogBumpConfig.dialogBumpStrength : 0);
  }, [profileDialogRect, profileDialogBumpStrength, dialogBumpConfig.dialogBumpStrength]);

  useEffect(() => {
    segmentedControlBumpStrength.start(segmentedControlRect ? -0.2 : 0);
  }, [segmentedControlRect, segmentedControlBumpStrength]);

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
    const wasProfile = !!prevProfileDialogRect.current;
    const isProfile = !!profileDialogRect;

    if (!rippleRef.current?.active) {
      if (wasTile && !isTile && !wasDialog && isDialog) {
        if (prevWarpTileRect.current) {
          rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect: prevWarpTileRect.current, isOpening: true };
        }
      }
      else if (wasDialog && !isDialog && !wasTile && isTile) {
        if (prevDialogRect.current) {
          rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect: prevDialogRect.current, isOpening: true };
        }
      }
      else if (wasDialog !== isDialog) {
        const isOpening = isDialog;
        const rect = isOpening ? dialogRect : prevDialogRect.current;
        if (rect) {
          rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect, isOpening };
        }
      }
      else if (wasTile !== isTile) {
        const isOpening = isTile;
        const rect = isOpening ? warpTileRect : prevWarpTileRect.current;
        if (rect) {
          rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect, isOpening };
        }
      }
      else if (wasProfile !== isProfile) {
        const isOpening = isProfile;
        const rect = isOpening ? profileDialogRect : prevProfileDialogRect.current;
        if (rect) {
          rippleRef.current = { active: true, startTime: clock.getElapsedTime(), rect, isOpening };
        }
      }
    }

    prevDialogRect.current = dialogRect;
    prevWarpTileRect.current = warpTileRect;
    prevProfileDialogRect.current = profileDialogRect;
    prevSegmentedControlRect.current = segmentedControlRect;

    // meshRef.current.material.map.offset.x = clock.getElapsedTime() * 0.01;
    // meshRef.current.material.map.offset.y = clock.getElapsedTime() * 0.01;
    
    const vertices = meshRef.current.geometry.attributes.position.array as Float32Array;
    const strength = bumpStrength.get();
    const animatedDialogStrength = dialogBumpStrength.get();
    const animatedTileStrength = tileBumpStrength.get();
    const animatedProfileDialogStrength = profileDialogBumpStrength.get();
    const animatedSegmentedControlStrength = segmentedControlBumpStrength.get();

    if (strength === 0 && !isPointerDown && animatedDialogStrength === 0 && animatedTileStrength === 0 && animatedProfileDialogStrength === 0 && animatedSegmentedControlStrength === 0 && !rippleRef.current?.active) {
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
            new THREE.Vector2(x - (rect.centerX || 0), y - (rect.centerY || 0)), 
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
        
        const edgeSoftness = dialogBumpConfig.dialogEdgeSoftness;
        const factor = 1.0 - smoothstep(0, edgeSoftness, dist);
        zDisplacement += animatedDialogStrength * factor;
      }

      if (profileDialogRect && animatedProfileDialogStrength !== 0) {
        const rectHalfWidth = profileDialogRect.width / 2;
        const rectHalfHeight = profileDialogRect.height / 2;
        const cornerRadius = profileDialogRect.cornerRadius;
        
        const dist = sdfRoundedBox(
          new THREE.Vector2(x, y), 
          new THREE.Vector2(rectHalfWidth, rectHalfHeight), 
          cornerRadius
        );
        
        const edgeSoftness = dialogBumpConfig.dialogEdgeSoftness;
        const factor = 1.0 - smoothstep(0, edgeSoftness, dist);
        zDisplacement += animatedProfileDialogStrength * factor;
      }

      if (segmentedControlRect && animatedSegmentedControlStrength !== 0) {
        const rectHalfWidth = segmentedControlRect.width / 2;
        const rectHalfHeight = segmentedControlRect.height / 2;
        const cornerRadius = segmentedControlRect.cornerRadius;
        
        const dist = sdfRoundedBox(
          new THREE.Vector2(x - (segmentedControlRect.centerX || 0), y - (segmentedControlRect.centerY || 0)), 
          new THREE.Vector2(rectHalfWidth, rectHalfHeight), 
          cornerRadius
        );
        
        const edgeSoftness = 0.1;
        const factor = 1.0 - smoothstep(0, edgeSoftness, dist);
        zDisplacement += animatedSegmentedControlStrength * factor;
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

const InteractiveGrid = ({ onPointerUp, dialogRect, warpTileRect, profileDialogRect, segmentedControlRect, dialogBumpConfig }: { 
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void, 
  dialogRect: Rect | null,
  warpTileRect: Rect | null,
  profileDialogRect: Rect | null,
  segmentedControlRect: Rect | null,
  dialogBumpConfig: DialogBumpConfig,
}) => {
  const [isPointerDown, setPointerDown] = useState(false);
  const pointerPos = useRef(new THREE.Vector3());
  const { val: bumpStrength } = useSpring({ val: 0 });
  const { viewport } = useThree();

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setPointerDown(true);
    pointerPos.current = e.point;
    bumpStrength.start(1);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isPointerDown) {
      setPointerDown(false);
      bumpStrength.start(0);
      onPointerUp(e);
    }
  };
  
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isPointerDown || e.buttons === 1) {
      e.stopPropagation();
      pointerPos.current = e.point;
      if (!isPointerDown) {
        setPointerDown(true);
        bumpStrength.start(1);
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
        profileDialogRect={profileDialogRect}
        segmentedControlRect={segmentedControlRect}
        dialogBumpConfig={dialogBumpConfig}
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

type ViewportInfo = {
  viewport: { width: number; height: number; factor: number; distance: number; },
  size: { width: number, height: number, top: number, left: number }
}

const ViewportReporter = ({ onViewportChange }: { onViewportChange: (viewportInfo: ViewportInfo) => void }) => {
  const { viewport, size } = useThree();
  useEffect(() => {
    onViewportChange({viewport, size});
  }, [viewport, size, onViewportChange]);
  return null;
}

const SETTING_A: DialogBumpConfig = {
  dialogBumpStrength: -1.2,
  dialogEdgeSoftness: 0.6,
  dialogBumpScale: 1.0,
};

const SETTING_B: DialogBumpConfig = {
  dialogBumpStrength: -0.5,
  dialogEdgeSoftness: 0.1,
  dialogBumpScale: 1.3,
};

const GridCanvas = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username: string; icon: string } | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'profile' | 'complete'>('complete');
  const [activeWarp, setActiveWarp] = useState<FormData | null>(null);
  const [warpToEdit, setWarpToEdit] = useState<FormData | null>(null);
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null);
  const [dialogSize, setDialogSize] = useState<{ width: number, height: number } | null>(null);
  const [profileDialogSize, setProfileDialogSize] = useState<{ width: number, height: number } | null>(null);
  const [segmentedControlSize, setSegmentedControlSize] = useState<{ width: number, height: number, top: number, left: number } | null>(null);
  const [isSegmentedControlVisible, setSegmentedControlVisible] = useState(false);
  const [dialogBumpConfig, setDialogBumpConfig] = useState<DialogBumpConfig>(SETTING_A);
  const segmentedControlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (segmentedControlRef.current && isSegmentedControlVisible) {
      const { width, height, top, left } = segmentedControlRef.current.getBoundingClientRect();
      setSegmentedControlSize({ width, height, top, left });
    } else {
      setSegmentedControlSize(null);
    }
  }, [isSegmentedControlVisible]);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
      setOnboardingStep('complete');
    } else {
      setOnboardingStep('welcome');
    }
  }, []);

  const handleSettingSelect = (setting: 'A' | 'B') => {
    setDialogBumpConfig(setting === 'A' ? SETTING_A : SETTING_B);
  };

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
    setProfileDialogSize(null);
  };

  const handleCloseOnboarding = () => {
    setOnboardingStep('complete');
    setDialogSize(null);
    setProfileDialogSize(null);
  }

  const dialogRect = useMemo(() => {
    if (!dialogSize || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const dialogWidthPx = dialogSize.width;
    const dialogHeightPx = dialogSize.height;
    const dialogCornerRadiusPx = 48;

    const dialogWorldWidth = (dialogWidthPx / size.width) * viewport.width;
    const dialogWorldHeight = (dialogHeightPx / size.height) * viewport.height;
    const cornerRadius = (dialogCornerRadiusPx / size.width) * viewport.width;
    
    return { width: dialogWorldWidth, height: dialogWorldHeight, cornerRadius };
  }, [dialogSize, viewportInfo]);

  const profileDialogRect = useMemo(() => {
    if (!profileDialogSize || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const dialogWidthPx = profileDialogSize.width;
    const dialogHeightPx = profileDialogSize.height;
    const dialogCornerRadiusPx = 48;

    const dialogWorldWidth = (dialogWidthPx / size.width) * viewport.width;
    const dialogWorldHeight = (dialogHeightPx / size.height) * viewport.height;
    const cornerRadius = (dialogCornerRadiusPx / size.width) * viewport.width;
    
    return { width: dialogWorldWidth, height: dialogWorldHeight, cornerRadius };
  }, [profileDialogSize, viewportInfo]);

  const segmentedControlRect = useMemo(() => {
    if (!segmentedControlSize || !viewportInfo || !isSegmentedControlVisible) return null;

    const { viewport, size } = viewportInfo;
    const { width, height, top, left } = segmentedControlSize;
    
    const controlWidthPx = width;
    const controlHeightPx = height;
    const cornerRadiusPx = 12;

    const controlWorldWidth = (controlWidthPx / size.width) * viewport.width;
    const controlWorldHeight = (controlHeightPx / size.height) * viewport.height;
    const cornerRadius = (cornerRadiusPx / size.width) * viewport.width;

    const centerX = ((left + width / 2) / size.width - 0.5) * viewport.width;
    const centerY = -((top + height / 2) / size.height - 0.5) * viewport.height;
    
    return { width: controlWorldWidth, height: controlWorldHeight, cornerRadius, centerX, centerY };
  }, [segmentedControlSize, viewportInfo, isSegmentedControlVisible]);

  const scaledDialogRect = useMemo(() => {
    if (!dialogRect) return null;
    return {
      ...dialogRect,
      width: dialogRect.width * dialogBumpConfig.dialogBumpScale,
      height: dialogRect.height * dialogBumpConfig.dialogBumpScale,
    };
  }, [dialogRect, dialogBumpConfig.dialogBumpScale]);

  const warpTileRect = useMemo(() => {
    if (!activeWarp || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const tileWidthPx = 84;
    const tileHeightPx = 84;

    const tileWorldWidth = (tileWidthPx / size.width) * viewport.width;
    const tileWorldHeight = (tileHeightPx / size.height) * viewport.height;
    const cornerRadius = (16 / size.width) * viewport.width;

    return { width: tileWorldWidth, height: tileWorldHeight, cornerRadius };
  }, [activeWarp, viewportInfo]);

  return (
    <div className="w-screen h-screen bg-black relative">
      {false && <DebugControls 
        values={dialogBumpConfig} 
        onChange={setDialogBumpConfig}
        onSettingSelect={handleSettingSelect}
      />}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 10, 0.1], fov: 50 }}>
          <ViewportReporter onViewportChange={setViewportInfo} />
          <InteractiveGrid 
            onPointerUp={handleGridClick} 
            dialogRect={scaledDialogRect}
            warpTileRect={warpTileRect}
            profileDialogRect={profileDialogRect}
            segmentedControlRect={segmentedControlRect}
            dialogBumpConfig={dialogBumpConfig}
          />
        </Canvas>
      </div>
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
      {activeWarp && userProfile && <WarpTile warp={activeWarp} username={userProfile.username} onRemove={handleStartEdit} />}
      {onboardingStep === 'welcome' && (
        <WelcomeDialog
          onNext={() => {
            setOnboardingStep('profile');
            setDialogSize(null);
          }}
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
          onSizeChange={setProfileDialogSize}
          isModal={true}
        />
      )}
      <AnimatePresence onExitComplete={() => setSegmentedControlVisible(false)}>
        {!isDialogOpen && onboardingStep === 'complete' && (
          <motion.div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => setSegmentedControlVisible(true)}
          >
            <SegmentedControl
              ref={segmentedControlRef}
              options={['Everyone', 'Friends', 'Me']}
              onSelect={(option) => console.log(option)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GridCanvas;