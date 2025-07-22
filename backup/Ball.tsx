import React from 'react';
import { useSpring, a } from '@react-spring/three';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export const Ball = ({ position, icon: Icon }: { position: THREE.Vector3, icon: React.ComponentType<IconProps> }) => {
  const { y } = useSpring({ from: { y: 5 }, to: { y: 0.15 * 3 }, config: { mass: 2, tension: 200, friction: 25 }});

  return (
    <a.mesh position={position} position-y={y} scale={3}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="white" roughness={0.2} metalness={0.5} />
      <Html position={[0, 0, 0.2]} center>
        <Icon className="h-5 w-5 text-black" strokeWidth={2} />
      </Html>
    </a.mesh>
  );
}; 