import React from 'react';
import * as THREE from 'three';

// Simple component that creates a distant mountain backdrop using simple triangular shapes
const DistantMountains: React.FC<{ type?: 'default' | 'night' | 'sunset' | 'cosmic' }> = ({ 
  type = 'default' 
}) => {
  // Define mountain colors based on skybox type
  const getMountainColors = () => {
    switch (type) {
      case 'night':
        return ['#1a202c', '#2d3748', '#1c2434'];
      case 'sunset':
        return ['#5a3030', '#744545', '#933030'];
      case 'cosmic':
        return ['#291e54', '#3a1b6b', '#4339a5'];
      default:
        return ['#4a5568', '#2d3748', '#5c6c85'];
    }
  };

  const colors = getMountainColors();
  
  // Create discrete mountain ranges instead of complex geometry
  // This is more reliable and easier to control visually
  return (
    <group position={[0, -5, 0]}>
      {/* Far mountains - front */}
      <mesh position={[0, 0, -200]} rotation={[0, 0, 0]}>
        <coneGeometry args={[150, 50, 5, 1, false, Math.PI/5]} />
        <meshStandardMaterial color={colors[0]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      {/* Far mountains - left */}
      <mesh position={[-200, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <coneGeometry args={[120, 70, 5, 1, false, 0]} />
        <meshStandardMaterial color={colors[1]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      {/* Far mountains - right */}
      <mesh position={[200, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <coneGeometry args={[120, 80, 5, 1, false, 0]} />
        <meshStandardMaterial color={colors[1]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      {/* Far mountains - back */}
      <mesh position={[0, 0, 200]} rotation={[0, Math.PI, 0]}>
        <coneGeometry args={[150, 60, 5, 1, false, -Math.PI/5]} />
        <meshStandardMaterial color={colors[0]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      {/* Additional mountain peaks at different positions */}
      <mesh position={[-150, 0, -150]} rotation={[0, Math.PI/4, 0]}>
        <coneGeometry args={[80, 100, 4, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[150, 0, -150]} rotation={[0, -Math.PI/4, 0]}>
        <coneGeometry args={[80, 90, 4, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[-150, 0, 150]} rotation={[0, 3*Math.PI/4, 0]}>
        <coneGeometry args={[80, 70, 4, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[150, 0, 150]} rotation={[0, -3*Math.PI/4, 0]}>
        <coneGeometry args={[80, 85, 4, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      {/* Add a few taller central peaks */}
      <mesh position={[0, 0, -250]} rotation={[0, 0, 0]}>
        <coneGeometry args={[60, 120, 3, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[-250, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <coneGeometry args={[50, 110, 3, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[250, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <coneGeometry args={[55, 105, 3, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, 0, 250]} rotation={[0, Math.PI, 0]}>
        <coneGeometry args={[60, 115, 3, 1, false, 0]} />
        <meshStandardMaterial color={colors[2]} flatShading side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default DistantMountains;