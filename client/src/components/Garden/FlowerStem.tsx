import React, { useMemo } from "react";
import * as THREE from "three";

interface FlowerStemProps {
  position: [number, number, number];
  height: number;
}

const FlowerStem: React.FC<FlowerStemProps> = ({ position, height }) => {
  // Create a material for the stem
  const stemMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#2e8b57", // Sea green
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
  }, []);

  // Create curve for the stem (slight curve for realism)
  const curve = useMemo(() => {
    const stemCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, height * 0.33, 0),
      new THREE.Vector3(-0.1, height * 0.66, 0),
      new THREE.Vector3(0, height, 0)
    );
    return stemCurve;
  }, [height]);
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
        <primitive object={stemMaterial} attach="material" />
      </mesh>
      
      {/* Leaf on the stem */}
      <mesh position={[0.05, height * 0.3, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8, 0, Math.PI, 0, Math.PI / 2]} />
        <primitive object={stemMaterial} attach="material" />
      </mesh>
      
      {/* Another leaf on the stem */}
      <mesh position={[-0.05, height * 0.6, 0]} rotation={[0, 0, -Math.PI / 5]} castShadow>
        <sphereGeometry args={[0.08, 8, 8, 0, Math.PI, 0, Math.PI / 2]} />
        <primitive object={stemMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export default FlowerStem;
