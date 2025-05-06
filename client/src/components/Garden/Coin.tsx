import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoinProps {
  position: [number, number, number];
  onCollect: () => void;
  scale?: number;
  id: string; // Unique identifier for each coin
}

const Coin: React.FC<CoinProps> = ({ position, onCollect, scale = 1, id }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // Coin animation
  useFrame((state) => {
    if (meshRef.current && !collected) {
      // Rotate coin around its upright axis
      meshRef.current.rotation.x = Math.PI / 2; // Keep it upright
      meshRef.current.rotation.z += 0.02; // Rotate around the upright axis
      
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      
      // Check distance to camera (player)
      const distance = meshRef.current.position.distanceTo(state.camera.position);
      if (distance < 1.5) {
        setCollected(true);
        onCollect();
      }
    }
  });
  
  if (collected) return null;
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[Math.PI / 2, 0, 0]} // Rotate to stand on edge instead of face
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? scale * 1.1 : scale}
    >
      <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFFF00"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
      {/* Add ridge details to make it look more coin-like */}
      <group>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i} position={[0, 0, 0]} rotation={[0, (i / 16) * Math.PI * 2, 0]}>
            <boxGeometry args={[0.42, 0.02, 0.02]} />
            <meshStandardMaterial color="#E6C200" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </mesh>
  );
};

export default Coin;