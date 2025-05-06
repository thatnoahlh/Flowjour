import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import MinigameBase, { LightingMinigameResult, MinigameBaseProps } from './MinigameBase';
import { LightingType } from '../Menu/Menu';

// Light source component
const LightSource: React.FC<{
  position: [number, number, number];
  color: string;
  intensity: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ position, color, intensity, isSelected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Light animation
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Gentle hover animation
      groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.1;
      
      // Pulse if selected
      if (isSelected && groupRef.current.scale.x < 1.2) {
        groupRef.current.scale.set(
          groupRef.current.scale.x + delta * 2,
          groupRef.current.scale.y + delta * 2,
          groupRef.current.scale.z + delta * 2
        );
      } else if (!isSelected && groupRef.current.scale.x > 1) {
        groupRef.current.scale.set(
          Math.max(1, groupRef.current.scale.x - delta * 2),
          Math.max(1, groupRef.current.scale.y - delta * 2),
          Math.max(1, groupRef.current.scale.z - delta * 2)
        );
      }
    }
  });
  
  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Light source sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
        />
      </mesh>
      
      {/* Actual light */}
      <pointLight
        color={color}
        intensity={intensity * 2}
        distance={10}
        castShadow
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      )}
    </group>
  );
};

// Target object to illuminate
const TargetObject: React.FC<{
  position: [number, number, number];
  currentLighting: string;
  targetLighting: string;
  matchPercentage: number;
}> = ({ position, currentLighting, targetLighting, matchPercentage }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <group position={position}>
      {/* Target object */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="white"
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Indicator of match percentage */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[matchPercentage * 2, 0.1, 0.1]} />
        <meshBasicMaterial color={matchPercentage > 0.8 ? "green" : "red"} />
      </mesh>
      
      {/* Labels */}
      <Html position={[0, -1.5, 0]}>
        <div className="text-center">
          <div className="text-sm font-medium">Current: {currentLighting}</div>
          <div className="text-sm font-medium">Target: {targetLighting}</div>
          <div className="text-sm font-medium">Match: {Math.round(matchPercentage * 100)}%</div>
        </div>
      </Html>
    </group>
  );
};

// HTML overlay component for Three.js
const Html: React.FC<{
  position: [number, number, number];
  children: React.ReactNode;
}> = ({ position, children }) => {
  const [pos] = useState(() => new THREE.Vector3(...position));
  const { camera } = useThree();
  const [visible, setVisible] = useState(true);
  const htmlRef = useRef<HTMLDivElement>(null);
  
  useFrame(() => {
    if (htmlRef.current) {
      // Convert 3D position to screen coordinates
      const tempV = pos.clone().project(camera);
      const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
      const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
      
      // Update HTML element position
      htmlRef.current.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
      
      // Show if in front of camera
      const isInView = tempV.z < 1;
      if (visible !== isInView) setVisible(isInView);
    }
  });
  
  return (
    <div
      ref={htmlRef}
      className="absolute top-0 left-0 pointer-events-none text-white bg-black/50 px-2 py-1 rounded"
      style={{
        transform: 'translate(-50%, -50%)',
        display: visible ? 'block' : 'none'
      }}
    >
      {children}
    </div>
  );
};

// Scene setup with lights and target
const LightingScene: React.FC<{
  targetLighting: LightingType;
  onComplete: (result: LightingMinigameResult) => void;
}> = ({ targetLighting, onComplete }) => {
  // Light positions
  const lightPositions: [number, number, number][] = [
    [-3, 2, 3],   // Top left
    [3, 2, 3],    // Top right
    [-3, 2, -3],  // Bottom left
    [3, 2, -3],   // Bottom right
    [0, 4, 0],    // Top
  ];
  
  // Target lighting configurations
  const lightingConfigs: Record<LightingType, {
    colors: string[];
    intensities: number[];
  }> = {
    default: {
      colors: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
      intensities: [1, 1, 1, 1, 1],
    },
    warm: {
      colors: ['#FF8C00', '#FFD700', '#FFA500', '#FF4500', '#FFFF00'],
      intensities: [1.2, 0.8, 1, 0.9, 0.7],
    },
    cool: {
      colors: ['#00BFFF', '#87CEEB', '#1E90FF', '#4682B4', '#B0E0E6'],
      intensities: [0.8, 1, 0.9, 0.7, 1.1],
    },
    dramatic: {
      colors: ['#FF0000', '#800080', '#0000FF', '#008000', '#FFFFFF'],
      intensities: [1.5, 0.8, 0.8, 0.9, 0.4],
    },
  };
  
  // Current lighting setup
  const [selectedLightIndex, setSelectedLightIndex] = useState(0);
  const [currentColors, setCurrentColors] = useState<string[]>(
    lightingConfigs.default.colors.slice()
  );
  const [currentIntensities, setCurrentIntensities] = useState<number[]>(
    lightingConfigs.default.intensities.slice()
  );
  
  // Color adjustment controls
  const adjustColor = (amount: number, channel: 'r' | 'g' | 'b') => {
    setCurrentColors(prevColors => {
      const newColors = [...prevColors];
      const color = new THREE.Color(newColors[selectedLightIndex]);
      
      // Adjust the specific channel
      if (channel === 'r') {
        color.r = Math.max(0, Math.min(1, color.r + amount));
      } else if (channel === 'g') {
        color.g = Math.max(0, Math.min(1, color.g + amount));
      } else if (channel === 'b') {
        color.b = Math.max(0, Math.min(1, color.b + amount));
      }
      
      newColors[selectedLightIndex] = color.getHexString();
      return newColors;
    });
  };
  
  // Intensity adjustment control
  const adjustIntensity = (amount: number) => {
    setCurrentIntensities(prevIntensities => {
      const newIntensities = [...prevIntensities];
      newIntensities[selectedLightIndex] = Math.max(
        0.1,
        Math.min(2, newIntensities[selectedLightIndex] + amount)
      );
      return newIntensities;
    });
  };
  
  // Calculate how close the current lighting is to the target
  const calculateMatchPercentage = () => {
    const targetColors = lightingConfigs[targetLighting].colors;
    const targetIntensities = lightingConfigs[targetLighting].intensities;
    
    let totalMatch = 0;
    const numLights = lightPositions.length;
    
    for (let i = 0; i < numLights; i++) {
      // Convert hex colors to r,g,b components
      const currentColor = new THREE.Color(currentColors[i]);
      const targetColor = new THREE.Color(targetColors[i]);
      
      // Calculate color difference (Euclidean distance in RGB space)
      const colorDiff = Math.sqrt(
        Math.pow(currentColor.r - targetColor.r, 2) +
        Math.pow(currentColor.g - targetColor.g, 2) +
        Math.pow(currentColor.b - targetColor.b, 2)
      );
      
      // Calculate intensity difference
      const intensityDiff = Math.abs(
        currentIntensities[i] - targetIntensities[i]
      );
      
      // Calculate match for this light (0-1)
      const colorMatch = 1 - Math.min(1, colorDiff);
      const intensityMatch = 1 - Math.min(1, intensityDiff);
      
      // Weighted average (color is more important than intensity)
      const lightMatch = colorMatch * 0.7 + intensityMatch * 0.3;
      totalMatch += lightMatch;
    }
    
    // Return average match across all lights
    return totalMatch / numLights;
  };
  
  const matchPercentage = calculateMatchPercentage();
  
  // Check for win condition
  useEffect(() => {
    if (matchPercentage > 0.9) {
      // Player has successfully matched the target lighting
      onComplete({
        completed: true,
        score: Math.round(matchPercentage * 1000),
        unlockedLighting: targetLighting
      });
    }
  }, [matchPercentage, targetLighting, onComplete]);
  
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.3} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Target cube */}
      <TargetObject
        position={[0, 0, 0]}
        currentLighting={Object.keys(lightingConfigs).find(
          key => JSON.stringify(lightingConfigs[key as LightingType].colors) === 
                 JSON.stringify(currentColors)
        ) || 'custom'}
        targetLighting={targetLighting}
        matchPercentage={matchPercentage}
      />
      
      {/* Light sources */}
      {lightPositions.map((position, index) => (
        <LightSource
          key={index}
          position={position}
          color={currentColors[index]}
          intensity={currentIntensities[index]}
          isSelected={selectedLightIndex === index}
          onClick={() => setSelectedLightIndex(index)}
        />
      ))}
      
      {/* Controls UI */}
      <Html position={[0, 3, 0]}>
        <div className="controls text-center w-64">
          <div className="mb-2">Selected Light: {selectedLightIndex + 1}</div>
          <div className="flex space-x-2 mb-2">
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => adjustColor(0.1, 'r')}
            >
              R+
            </button>
            <button
              className="bg-red-800 text-white px-2 py-1 rounded"
              onClick={() => adjustColor(-0.1, 'r')}
            >
              R-
            </button>
            
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={() => adjustColor(0.1, 'g')}
            >
              G+
            </button>
            <button
              className="bg-green-800 text-white px-2 py-1 rounded"
              onClick={() => adjustColor(-0.1, 'g')}
            >
              G-
            </button>
            
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => adjustColor(0.1, 'b')}
            >
              B+
            </button>
            <button
              className="bg-blue-800 text-white px-2 py-1 rounded"
              onClick={() => adjustColor(-0.1, 'b')}
            >
              B-
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              className="bg-yellow-500 text-white px-2 py-1 rounded"
              onClick={() => adjustIntensity(0.1)}
            >
              Intensity+
            </button>
            <button
              className="bg-yellow-800 text-white px-2 py-1 rounded"
              onClick={() => adjustIntensity(-0.1)}
            >
              Intensity-
            </button>
          </div>
        </div>
      </Html>
    </>
  );
};

// Main component that combines MinigameBase with the lighting puzzle
interface LightingPuzzleProps extends Omit<MinigameBaseProps, 'onComplete'> {
  targetLighting: LightingType;
  onComplete: (result: LightingMinigameResult) => void;
}

const LightingPuzzle: React.FC<LightingPuzzleProps> = ({
  targetLighting,
  onComplete,
  onCancel,
  ...props
}) => {
  return (
    <MinigameBase
      onComplete={(result) => {
        // Convert generic result to lighting-specific result
        if (!result.completed) {
          onComplete({
            ...result,
            unlockedLighting: 'default' // Default if failed
          });
        }
      }}
      onCancel={onCancel}
      {...props}
    >
      <div className="relative w-full h-[500px]">
        <Canvas
          shadows
          camera={{ position: [0, 3, 6], fov: 50 }}
        >
          <LightingScene
            targetLighting={targetLighting}
            onComplete={onComplete}
          />
        </Canvas>
        
        <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded">
          <h3 className="font-bold">Light Sculptor</h3>
          <p>Match the target lighting by adjusting colors and intensities!</p>
          <p>Click on a light source to select it, then use the controls to adjust.</p>
        </div>
      </div>
    </MinigameBase>
  );
};

export default LightingPuzzle;