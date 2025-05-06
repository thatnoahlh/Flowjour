import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useEnvironment } from '../../lib/stores/useEnvironment';

interface NatureElementsProps {
  count?: number;
  radius?: number;
}

// Define tree/nature elements
const NatureElements: React.FC<NatureElementsProps> = ({ 
  count = 25,
  radius = 15
}) => {
  const { decorationType } = useEnvironment();
  
  // Generate random positions around the garden but outside the central area
  const elements = useMemo(() => {
    const items = [];
    // Generate positions in a ring around the center (avoiding central garden)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = radius + Math.random() * 15; // Between radius and radius+15
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Determine element type (trees, rocks, etc.) based on decoration type
      const elementType = Math.random() > 0.7 ? 'tree' : 'rock';
      
      // Randomize sizes
      const scale = 0.5 + Math.random() * 1.5;
      const height = 1 + Math.random() * 2;
      
      items.push({
        position: [x, 0, z] as [number, number, number],
        rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number],
        scale,
        height,
        type: elementType
      });
    }
    return items;
  }, [count, radius]);
  
  return (
    <group>
      {elements.map((element, i) => {
        if (element.type === 'tree') {
          return (
            <Tree 
              key={`tree-${i}`} 
              position={element.position} 
              rotation={element.rotation} 
              scale={element.scale}
              height={element.height}
              decorationType={decorationType}
            />
          );
        } else {
          return (
            <Rock 
              key={`rock-${i}`} 
              position={element.position} 
              rotation={element.rotation} 
              scale={element.scale}
            />
          );
        }
      })}
    </group>
  );
};

// Tree component
interface TreeProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  height: number;
  decorationType: string;
}

const Tree: React.FC<TreeProps> = ({ position, rotation, scale, height, decorationType }) => {
  // Colors based on decoration type
  const getTrunkColor = () => {
    switch (decorationType) {
      case 'winter':
        return '#5A4C41';
      case 'autumn':
        return '#614B35';
      case 'fantasy':
        return '#9370DB';
      default:
        return '#6B4226';
    }
  };
  
  const getLeafColor = () => {
    switch (decorationType) {
      case 'winter':
        return '#F0F8FF';
      case 'autumn':
        return '#FF6347';
      case 'fantasy':
        return '#DA70D6';
      default:
        return '#4CA64C';
    }
  };
  
  const trunkColor = getTrunkColor();
  const leafColor = getLeafColor();
  
  return (
    <group position={position} rotation={rotation}>
      {/* Tree trunk */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2 * scale, 0.3 * scale, height, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.8} />
      </mesh>
      
      {/* Tree foliage */}
      <mesh position={[0, height + 0.5 * scale, 0]} castShadow>
        <coneGeometry args={[1 * scale, 2 * scale, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.7} />
      </mesh>
      
      {decorationType !== 'winter' && (
        <mesh position={[0, height + 1.5 * scale, 0]} castShadow>
          <coneGeometry args={[0.7 * scale, 1.5 * scale, 8]} />
          <meshStandardMaterial color={leafColor} roughness={0.7} />
        </mesh>
      )}
    </group>
  );
};

// Rock component
interface RockProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

const Rock: React.FC<RockProps> = ({ position, rotation, scale }) => {
  // Random rock color
  const rockColor = useMemo(() => {
    const colors = ['#555555', '#777777', '#666666', '#444444'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);
  
  return (
    <mesh position={position} rotation={rotation} scale={[scale, scale * 0.6, scale]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color={rockColor} roughness={0.9} />
    </mesh>
  );
};

export default NatureElements;