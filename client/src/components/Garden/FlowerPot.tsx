import React, { useMemo } from "react";
import * as THREE from "three";

interface FlowerPotProps {
  position: [number, number, number];
}

const FlowerPot: React.FC<FlowerPotProps> = ({ position }) => {
  // Create materials for the pot and soil
  const potMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ 
      roughness: 0.7,
      metalness: 0.1,
      color: "#cd7f32" // Brownish color
    });
  }, []);
  
  const soilMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#3d2817", // Dark brown
      roughness: 1,
      metalness: 0
    });
  }, []);
  
  return (
    <group position={position} scale={[0.3, 0.3, 0.3]}>
      {/* Flower pot (truncated cone) */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.4, 16]} />
        <primitive object={potMaterial} attach="material" />
      </mesh>
      
      {/* Soil inside the pot */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 16]} />
        <primitive object={soilMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export default FlowerPot;
