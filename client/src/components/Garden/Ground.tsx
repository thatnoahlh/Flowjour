import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useEnvironment } from '../../lib/stores/useEnvironment';
import { GroundType } from '../Menu/Menu';

// Tree component for decoration
const Tree = ({ position }: { position: [number, number, number] }) => {
  const { decorationType } = useEnvironment();
  
  // Adjust tree appearance based on decoration type
  const getTreeStyle = () => {
    switch (decorationType) {
      case 'winter':
        return {
          trunkColor: '#8B4513',
          topColor: '#e0ffff',
          topShape: 'cone'
        };
      case 'autumn':
        return {
          trunkColor: '#8B5A2B',
          topColor: '#ff7f24',
          topShape: 'sphere'
        };
      case 'fantasy':
        return {
          trunkColor: '#da70d6',
          topColor: '#00ced1',
          topShape: 'torus'
        };
      default: // 'default'
        return {
          trunkColor: '#8B4513',
          topColor: '#2e5e1f',
          topShape: 'cone'
        };
    }
  };
  
  const treeStyle = getTreeStyle();
  
  return (
    <group position={position}>
      {/* Tree trunk */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color={treeStyle.trunkColor} roughness={0.9} />
      </mesh>
      
      {/* Tree top */}
      <mesh position={[0, 2.5, 0]} castShadow>
        {treeStyle.topShape === 'cone' && <coneGeometry args={[1.2, 3, 8]} />}
        {treeStyle.topShape === 'sphere' && <sphereGeometry args={[1.2, 12, 12]} />}
        {treeStyle.topShape === 'torus' && <torusGeometry args={[0.8, 0.4, 16, 32]} />}
        <meshStandardMaterial color={treeStyle.topColor} roughness={0.8} />
      </mesh>
    </group>
  );
};

// Rock component for decoration
const Rock = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  const { decorationType } = useEnvironment();
  
  // Adjust rock appearance based on decoration type
  const getRockColor = () => {
    switch (decorationType) {
      case 'winter':
        return '#e8e8e8';
      case 'autumn':
        return '#a0522d';
      case 'fantasy':
        return '#ff69b4';
      default: // 'default'
        return '#808080';
    }
  };
  
  const rockGeometry = useMemo(() => {
    const geometry = new THREE.DodecahedronGeometry(scale, 0);
    // Add some randomness to the vertices
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const z = vertices.getZ(i);
      
      vertices.setXYZ(
        i,
        x + (Math.random() - 0.5) * 0.1 * scale,
        y + (Math.random() - 0.5) * 0.1 * scale,
        z + (Math.random() - 0.5) * 0.1 * scale
      );
    }
    return geometry;
  }, [scale]);

  return (
    <mesh geometry={rockGeometry} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={getRockColor()} roughness={0.9} />
    </mesh>
  );
};

// Bench component
const Bench = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) => {
  const { decorationType } = useEnvironment();
  
  // Adjust bench appearance based on decoration type
  const getBenchColors = () => {
    switch (decorationType) {
      case 'winter':
        return { seat: '#e0e0e0', legs: '#c0c0c0' };
      case 'autumn':
        return { seat: '#d2691e', legs: '#8b4513' };
      case 'fantasy':
        return { seat: '#ff00ff', legs: '#4b0082' };
      default: // 'default'
        return { seat: '#6d4c41', legs: '#5d4037' };
    }
  };
  
  const benchColors = getBenchColors();
  
  return (
    <group position={position} rotation={rotation as any}>
      {/* Bench seat */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.1, 0.6]} />
        <meshStandardMaterial color={benchColors.seat} roughness={0.7} />
      </mesh>
      
      {/* Bench legs */}
      <mesh position={[-0.7, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.4, 0.55]} />
        <meshStandardMaterial color={benchColors.legs} roughness={0.7} />
      </mesh>
      
      <mesh position={[0.7, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.4, 0.55]} />
        <meshStandardMaterial color={benchColors.legs} roughness={0.7} />
      </mesh>
    </group>
  );
};

// Ground plane component
const Ground: React.FC = () => {
  const { groundType } = useEnvironment();
  
  // Get ground texture and color based on type
  const getGroundAttributes = () => {
    switch (groundType) {
      case 'sand':
        return {
          texture: '/textures/sand.png',
          color: '#e6d59e',
          roughness: 0.9,
          repeat: 50
        };
      case 'snow':
        return {
          texture: '/textures/snow.png',
          color: '#ffffff',
          roughness: 0.7,
          repeat: 50
        };
      case 'alien':
        return {
          texture: '/textures/alien.png',
          color: '#7030a0',
          roughness: 0.8,
          repeat: 50
        };
      default: // 'grass'
        return {
          texture: '/textures/grass.png',
          color: '#4a9c46',
          roughness: 0.8,
          repeat: 50
        };
    }
  };
  
  const groundAttrs = getGroundAttributes();
  
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load(groundAttrs.texture);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(groundAttrs.repeat, groundAttrs.repeat);
    return t;
  }, [groundAttrs.texture, groundAttrs.repeat]);

  // Generate random positions for decorations
  const treePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push([x, 0, z]);
    }
    return positions;
  }, []);

  const rockPositions = useMemo(() => {
    const positions: [number, number, number, number][] = []; // x, y, z, scale
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 35;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.3 + Math.random() * 0.6;
      positions.push([x, 0, z, scale]);
    }
    return positions;
  }, []);

  // Create dirt texture for garden area
  const dirtTexture = useMemo(() => {
    const t = new THREE.TextureLoader().load('/textures/dirt.png');
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(20, 20);
    return t;
  }, []);

  // Get dirt color based on ground type for compatibility
  const getDirtColor = () => {
    switch (groundType) {
      case 'sand':
        return '#c2a375';
      case 'snow':
        return '#8b7355';
      case 'alien':
        return '#4e1655';
      default: // 'grass'
        return '#5c4033';
    }
  };

  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          map={texture}
          color={groundAttrs.color}
          roughness={groundAttrs.roughness}
        />
      </mesh>
      
      {/* Garden circular dirt area where flowers grow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial 
          map={dirtTexture}
          color={getDirtColor()}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Small edge/border around garden */}
      <mesh position={[0, -0.09, 0]}>
        <ringGeometry args={[12, 12.5, 32]} />
        <meshStandardMaterial 
          color="#7c6e4c"
          roughness={0.8}
        />
      </mesh>
      
      {/* Add trees beyond garden area */}
      {treePositions.map((position, i) => (
        <Tree key={`tree-${i}`} position={position} />
      ))}
      
      {/* Add rocks outside garden area */}
      {rockPositions.map((posAndScale, i) => (
        <Rock 
          key={`rock-${i}`} 
          position={[posAndScale[0], posAndScale[1], posAndScale[2]]} 
          scale={posAndScale[3]} 
        />
      ))}
      
      {/* Add a couple of benches by the garden */}
      <Bench position={[14, 0, 0]} rotation={[0, Math.PI * 0.5, 0] as [number, number, number]} />
      <Bench position={[-14, 0, 0]} rotation={[0, -Math.PI * 0.5, 0] as [number, number, number]} />
      <Bench position={[0, 0, 14]} rotation={[0, Math.PI, 0] as [number, number, number]} />
      <Bench position={[0, 0, -14]} rotation={[0, 0, 0] as [number, number, number]} />
    </group>
  );
};

export default Ground;