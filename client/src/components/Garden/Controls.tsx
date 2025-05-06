import React, { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { Controls } from "../../types";
import { useKeyboardControls } from "@react-three/drei";

const PlayerControls: React.FC = () => {
  const { camera } = useThree();
  
  // Set up initial camera position
  useEffect(() => {
    camera.position.set(0, 1.7, 5);
  }, [camera]);
  
  // Get keyboard controls
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
  
  // Set up movement
  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward, jump } = getKeys();
    
    // Calculate movement direction
    const moveSpeed = 5 * delta;
    const jumpPower = 5;
    
    // Get camera direction for movement relative to view
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    
    // Calculate forward/backward movement
    if (forward) {
      camera.position.add(direction.clone().multiplyScalar(moveSpeed));
    }
    if (backward) {
      camera.position.add(direction.clone().multiplyScalar(-moveSpeed));
    }
    
    // Calculate left/right movement (perpendicular to camera direction)
    const rightDirection = new THREE.Vector3(direction.z, 0, -direction.x);
    
    if (rightward) {
      camera.position.add(rightDirection.multiplyScalar(moveSpeed));
    }
    if (leftward) {
      camera.position.add(rightDirection.multiplyScalar(-moveSpeed));
    }
    
    // Optional jumping (can be implemented with physics)
    if (jump) {
      console.log("Jump pressed - would implement physics for this");
    }
    
    // Keep player within bounds
    const bounds = 45;
    camera.position.x = Math.max(-bounds, Math.min(bounds, camera.position.x));
    camera.position.z = Math.max(-bounds, Math.min(bounds, camera.position.z));
  });
  
  return <PointerLockControls />;
};

export default PlayerControls;
