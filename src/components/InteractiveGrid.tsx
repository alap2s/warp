'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring, Spring, motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { MakeWarpDialog } from './MakeWarpDialog';

const DeformableGrid = ({ isPointerDown, pointerPos, bumpStrength }: { isPointerDown: boolean, pointerPos: THREE.Vector3, bumpStrength: Spring }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  
  const originalPositions = useRef<Float32Array>();

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

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(viewport.width * 1.5, viewport.height * 1.5, 75, 75);
    originalPositions.current = new Float32Array(geom.attributes.position.array);
    return geom;
  }, [viewport.width, viewport.height]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Animate texture offset for a subtle flowing effect
    meshRef.current.material.map.offset.x = clock.getElapsedTime() * 0.01;
    meshRef.current.material.map.offset.y = clock.getElapsedTime() * 0.01;
    
    const vertices = meshRef.current.geometry.attributes.position.array as Float32Array;
    const strength = bumpStrength.get();

    if (strength === 0 && !isPointerDown) {
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
      
      const distance = new THREE.Vector2(x, y).distanceTo(
        new THREE.Vector2(pointerPos.x, -pointerPos.z)
      );

      const radius = 1.67;
      const ease = 0.5 * (1 + Math.cos(Math.PI * Math.min(distance / radius, 1)));
      const zDisplacement = strength * ease * -1.5;

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

const InteractiveGrid = ({ onPointerUp }: { onPointerUp: () => void }) => {
  const [isPointerDown, setPointerDown] = useState(false);
  const [pointerPos, setPointerPos] = useState(new THREE.Vector3());
  const bumpStrength = useSpring(0, { stiffness: 400, damping: 30 });
  const { viewport } = useThree();

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setPointerDown(true);
    setPointerPos(e.point);
    bumpStrength.set(1);
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (isPointerDown) {
      setPointerDown(false);
      bumpStrength.set(0);
      onPointerUp();
    }
  };
  
  const handlePointerMove = (e: any) => {
    if (isPointerDown || e.buttons === 1) {
      e.stopPropagation();
      setPointerPos(e.point);
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
      <DeformableGrid isPointerDown={isPointerDown} pointerPos={pointerPos} bumpStrength={bumpStrength} />
      <mesh
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

const GridCanvas = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 8, 0], fov: 50 }}>
        <InteractiveGrid onPointerUp={() => setDialogOpen(true)} />
      </Canvas>
      <AnimatePresence>
        {isDialogOpen && <MakeWarpDialog onClose={() => setDialogOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default GridCanvas;