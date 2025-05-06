import React, { useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { 
  PointerLockControls, 
  useKeyboardControls 
} from "@react-three/drei";
import * as THREE from "three";
import { FlowerData } from "../../types";
import { Controls } from "../../types";
import { useEnvironment } from "../../lib/stores/useEnvironment";
import Flower from "./Flower";
import Ground from './Ground';
import SceneEnvironment from './SceneEnvironment';
import NatureElements from './NatureElements';
import Coins from './Coins';

// Player controller component
const PlayerControls = ({ speed = 5 }) => {
  const camera = useThree(state => state.camera);
  const player = useRef(new THREE.Vector3(0, 1.7, 5));
  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());
  
  // Get current keyboard state without re-renders
  const [, getKeyboardState] = useKeyboardControls<Controls>();
  
  useFrame((state, delta) => {
    // Get current controls state
    const { forward, backward, leftward, rightward, jump } = getKeyboardState();
    
    // Update movement direction
    frontVector.current.set(0, 0, forward ? -1 : backward ? 1 : 0);
    sideVector.current.set(leftward ? -1 : rightward ? 1 : 0, 0, 0);
    
    // Combine movement vector and normalize
    direction.current.addVectors(frontVector.current, sideVector.current).normalize().multiplyScalar(forward || backward || leftward || rightward ? 1 : 0);
    
    // Get camera rotation to adjust movement direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
    
    // Apply movement
    if (forward || backward || leftward || rightward) {
      // Calculate forward/backward movement (aligned with camera)
      if (forward || backward) {
        const forwardFactor = forward ? 1 : -1; // 1 for forward, -1 for backward
        player.current.x += Math.sin(angle) * speed * delta * forwardFactor;
        player.current.z += Math.cos(angle) * speed * delta * forwardFactor;
      }
      
      // Calculate left/right movement (perpendicular to camera)
      if (leftward || rightward) {
        const strafeFactor = leftward ? 1 : -1; // 1 for left, -1 for right
        player.current.x += Math.sin(angle + Math.PI/2) * speed * delta * strafeFactor;
        player.current.z += Math.cos(angle + Math.PI/2) * speed * delta * strafeFactor;
      }
      
      // Keep within bounds
      player.current.x = Math.max(-45, Math.min(45, player.current.x));
      player.current.z = Math.max(-45, Math.min(45, player.current.z));
    }
    
    // Update camera position
    camera.position.x = player.current.x;
    camera.position.z = player.current.z;
    
    // Simple jump implementation
    if (jump) {
      console.log("Jump pressed");
    }
  });
  
  return null;
};

// Props for the flower scene
interface FlowerSceneProps {
  flowers: FlowerData[];
}

// Main flower scene component
// The FlowerScene component with garden layout
export const FlowerScene: React.FC<FlowerSceneProps> = ({ flowers }) => {
  // Calculate camera starting position - position the camera outside the garden looking in
  const cameraStartPosition = useMemo(() => {
    return [0, 1.7, 15] as [number, number, number]; // Position outside garden looking inward
  }, []);

  return (
    <Canvas 
      shadows 
      camera={{ position: cameraStartPosition, fov: 75, near: 0.1, far: 1000 }}
    >
      {/* Scene environment with sky, lighting, etc. */}
      <SceneEnvironment />
      
      {/* Ground with garden circle */}
      <Ground />
      
      {/* Center garden marker - decorative element */}
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Base circle */}
        <mesh>
          <circleGeometry args={[0.5, 32]} />
          <meshStandardMaterial color="#8b7d6b" side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
        {/* Decorative ring */}
        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[0.48, 0.5, 32]} />
          <meshStandardMaterial color="#6a5d4d" side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
      </group>
      
      {/* Flowers positioned correctly in garden */}
      {flowers.map((flower) => (
        <Flower 
          key={flower.id}
          flower={flower}
        />
      ))}
      
      {/* Add natural elements outside the central garden area */}
      <NatureElements count={30} radius={15} />
      
      {/* Add collectible coins throughout the garden */}
      <Coins count={20} minRadius={10} maxRadius={30} />
      
      {/* Player controls */}
      <PointerLockControls />
      <PlayerControls />
      
      {/* Ambient lighting to ensure visibility */}
      <ambientLight intensity={0.2} />
    </Canvas>
  );
};