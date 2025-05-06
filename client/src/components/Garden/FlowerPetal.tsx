import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { AnswerOption } from "../../types";

interface FlowerPetalProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: AnswerOption;
  scale?: number;
  angleOffset?: number;
  index?: number;
}

// Map answer options to colors (no textures)
const colorMap = {
  A: { 
    color: "#e53935",   // Red
    emissive: "#ff6f60", // Lighter red for emissive glow
  },
  B: { 
    color: "#1e88e5",   // Blue
    emissive: "#6ab7ff", // Lighter blue for emissive glow
  },
  C: { 
    color: "#fdd835",   // Yellow
    emissive: "#ffff6b", // Lighter yellow for emissive glow
  },
  D: { 
    color: "#ec407a",   // Pink
    emissive: "#ff77a9", // Lighter pink for emissive glow
  }
};

const FlowerPetal: React.FC<FlowerPetalProps> = ({ 
  position, 
  rotation, 
  color,
  scale = 1,
  angleOffset = 0,
  index = 0
}) => {
  // Create a reference to the mesh
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a teardrop petal shape with sharp point at origin (center of flower)
  // and rounded end facing outward - EXACTLY as requested
  const petalShape = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Start at the pointed tip that will face the center
    shape.moveTo(0, 0);
    
    // IMPORTANT: Create teardrop shape with narrow point at pistil and wider rounded end
    // This ensures the petal bases touch the pistil tangentially as requested
    // Increased size for more prominent petals
    shape.bezierCurveTo(0.8, 1.0, 1.0, 2.0, 0.7, 3.0); // Right curve up - larger
    shape.lineTo(-0.7, 3.0); // Flat top connecting right and left curves (wider)
    shape.bezierCurveTo(-1.0, 2.0, -0.8, 1.0, 0, 0); // Left curve down - larger
    
    return shape;
  }, []);

  // Keep petals flat as in your reference image
  const petalDepth = 0.05; // Very flat
  
  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: petalDepth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelOffset: 0,
    bevelSegments: 2
  }), [petalDepth]);

  // Adjust position to match the stem top and flower center
  const finalPosition = useMemo(() => {
    return [
      position[0], 
      position[1], 
      position[2]
    ] as [number, number, number];
  }, [position]);
  
  // Use natural petal colors with some subtle variation
  const baseBrightness = 0.9 + (Math.sin(index * 1.5) * 0.1); // Slight brightness variation
  
  return (
    <group 
      position={finalPosition} 
      rotation={rotation}
      scale={[scale * 0.15, scale * 0.15, scale * 0.02]} // Much larger petals, still relatively flat
    >
      {/* Create the petal with proper coloring */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <extrudeGeometry args={[petalShape, extrudeSettings]} />
        <meshStandardMaterial
          color={colorMap[color].color}
          emissive={colorMap[color].emissive}
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.0}
          side={THREE.DoubleSide}
          // Add subtle shininess to petals
          onBeforeCompile={(shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              'vec4 diffuseColor = vec4( diffuse, opacity );',
              `
              vec4 diffuseColor = vec4( diffuse * ${baseBrightness}, opacity );
              `
            );
          }}
        />
      </mesh>
    </group>
  );
};

export default FlowerPetal;
