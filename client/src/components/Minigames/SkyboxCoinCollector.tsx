import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import MinigameBase, { SkyboxMinigameResult, MinigameBaseProps } from './MinigameBase';
import { SkyboxType } from '../Menu/Menu';
import { Controls } from '../../types';

// Coin collectible component
const Coin: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
}> = ({ position, onCollect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const [collected, setCollected] = useState(false);
  
  // Rotate coin and check if player is near
  useFrame((state) => {
    if (meshRef.current && !collected) {
      // Rotate coin
      meshRef.current.rotation.y += 0.02;
      
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
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={hover ? 1.1 : 1}
    >
      <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFFF00"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
};

// Player controller
const Player = ({ onCollect }: { onCollect: () => void }) => {
  const { camera } = useThree();
  const speed = 10;
  const [, getKeyboardState] = useKeyboardControls<Controls>();
  
  // Store player position
  const playerPos = useRef(new THREE.Vector3(0, 1.7, 0));
  
  // Handle player movement
  useFrame((_, delta) => {
    const { forward, backward, leftward, rightward } = getKeyboardState();
    
    // Get camera direction for movement relative to view
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // Remove vertical component for flat movement
    direction.y = 0;
    direction.normalize();
    
    // Side direction (perpendicular to view direction)
    const sideDirection = new THREE.Vector3(-direction.z, 0, direction.x);
    
    // Calculate movement
    const moveDirection = new THREE.Vector3();
    
    if (forward) moveDirection.add(direction);
    if (backward) moveDirection.sub(direction);
    if (leftward) moveDirection.add(sideDirection);
    if (rightward) moveDirection.sub(sideDirection);
    
    // Normalize and apply movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      playerPos.current.addScaledVector(moveDirection, speed * delta);
      
      // Limit movement area
      playerPos.current.x = Math.max(-40, Math.min(40, playerPos.current.x));
      playerPos.current.z = Math.max(-40, Math.min(40, playerPos.current.z));
    }
    
    // Update camera position
    camera.position.copy(playerPos.current);
  });
  
  return null;
};

// Sky environment
const SkyEnvironment = ({ skyType }: { skyType: SkyboxType }) => {
  let skyColor: string;
  let sunColor: string;
  let fogColor: string;
  
  // Set colors based on sky type
  switch (skyType) {
    case 'night':
      skyColor = '#051428';
      sunColor = '#CCCCFF';
      fogColor = '#051428';
      break;
    case 'sunset':
      skyColor = '#FF7F50';
      sunColor = '#FF4500';
      fogColor = '#FF7F50';
      break;
    case 'cosmic':
      skyColor = '#4B0082';
      sunColor = '#9370DB';
      fogColor = '#4B0082';
      break;
    default: // 'default'
      skyColor = '#87CEEB';
      sunColor = '#FFFFFF';
      fogColor = '#E0F7FF';
  }
  
  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, 30, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        color={sunColor}
        castShadow
      />
    </>
  );
};

// Main game scene
const GameScene = ({
  targetSkybox,
  coinCount = 4,
  onGameComplete
}: {
  targetSkybox: SkyboxType;
  coinCount?: number;
  onGameComplete: (result: SkyboxMinigameResult) => void;
}) => {
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [coinPositions] = useState(() => {
    // Generate random coin positions
    const positions: [number, number, number][] = [];
    for (let i = 0; i < coinCount; i++) {
      // Position coins in a circle around the start position
      const angle = (i / coinCount) * Math.PI * 2;
      const radius = 10 + Math.random() * 15; // Between 10-25 units away
      positions.push([
        Math.cos(angle) * radius,
        1,  // Slightly above ground
        Math.sin(angle) * radius
      ]);
    }
    return positions;
  });
  
  // Check if game is complete
  useEffect(() => {
    if (coinsCollected === coinCount) {
      onGameComplete({
        completed: true,
        score: coinsCollected,
        unlockedSkybox: targetSkybox
      });
    }
  }, [coinsCollected, coinCount, targetSkybox, onGameComplete]);
  
  const handleCoinCollect = () => {
    setCoinsCollected(prev => prev + 1);
  };
  
  return (
    <>
      {/* Sky and lighting */}
      <SkyEnvironment skyType={targetSkybox} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Coins */}
      {coinPositions.map((position, i) => (
        <Coin 
          key={i}
          position={position}
          onCollect={handleCoinCollect}
        />
      ))}
      
      {/* Player */}
      <Player onCollect={handleCoinCollect} />
      
      {/* Instructions - displayed using HTML overlaid on the canvas */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded">
        <p>Collect all {coinCount} coins to unlock the {targetSkybox} skybox!</p>
        <p>Progress: {coinsCollected} / {coinCount}</p>
      </div>
    </>
  );
};

// Main component that combines MinigameBase with the skybox game
interface SkyboxCoinCollectorProps extends Omit<MinigameBaseProps, 'onComplete'> {
  targetSkybox: SkyboxType;
  onComplete: (result: SkyboxMinigameResult) => void;
  coinCount?: number;
}

const SkyboxCoinCollector: React.FC<SkyboxCoinCollectorProps> = ({
  targetSkybox,
  onComplete,
  onCancel,
  coinCount = 4,
  ...props
}) => {
  return (
    <MinigameBase
      onComplete={(result) => {
        // Convert generic result to skybox-specific result
        if (!result.completed) {
          onComplete({
            ...result,
            unlockedSkybox: 'default' // Default if failed
          });
        }
      }}
      onCancel={onCancel}
      {...props}
    >
      <div className="relative w-full h-[500px]">
        <Canvas camera={{ position: [0, 1.7, 0], fov: 75 }}>
          <GameScene
            targetSkybox={targetSkybox}
            coinCount={coinCount}
            onGameComplete={onComplete}
          />
        </Canvas>
      </div>
    </MinigameBase>
  );
};

export default SkyboxCoinCollector;