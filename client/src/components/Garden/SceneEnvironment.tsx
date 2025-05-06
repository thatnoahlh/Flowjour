import React from 'react';
import { Sky, Stars, Cloud } from '@react-three/drei';
import { useEnvironment } from '../../lib/stores/useEnvironment';
import * as THREE from 'three';
import DistantMountains from './DistantMountains';

const SceneEnvironment: React.FC = () => {
  const { skyboxType, lightingType } = useEnvironment();
  
  // Lighting configurations
  const getLightingConfig = () => {
    switch (lightingType) {
      case 'warm':
        return {
          ambientIntensity: 0.5,
          ambientColor: new THREE.Color('#ffd0b0'),
          directionalIntensity: 1.2,
          directionalColor: new THREE.Color('#ff9d5c'),
          directionalPosition: [15, 12, 5] as [number, number, number]
        };
      case 'cool':
        return {
          ambientIntensity: 0.4,
          ambientColor: new THREE.Color('#b0d0ff'),
          directionalIntensity: 0.8,
          directionalColor: new THREE.Color('#5c9dff'),
          directionalPosition: [10, 15, 10] as [number, number, number]
        };
      case 'dramatic':
        return {
          ambientIntensity: 0.2,
          ambientColor: new THREE.Color('#303050'),
          directionalIntensity: 1.5,
          directionalColor: new THREE.Color('#ffcc77'),
          directionalPosition: [20, 10, -5] as [number, number, number]
        };
      default: // 'default'
        return {
          ambientIntensity: 0.3,
          ambientColor: new THREE.Color('#ffffff'),
          directionalIntensity: 1,
          directionalColor: new THREE.Color('#ffffff'),
          directionalPosition: [10, 10, 5] as [number, number, number]
        };
    }
  };
  
  // Get the current lighting configuration
  const lightingConfig = getLightingConfig();
  
  // Skybox configurations
  const renderSkybox = () => {
    switch (skyboxType) {
      case 'night':
        return (
          <>
            <color attach="background" args={['#020225']} />
            <Stars radius={100} depth={50} count={8000} factor={5} fade />
            <ambientLight 
              intensity={0.1} 
              color="#4080ff" 
            />
            <directionalLight 
              position={new THREE.Vector3(0, 5, -10)} 
              intensity={0.05} 
              color="#a0c0ff" 
              castShadow 
            />
            <pointLight 
              position={new THREE.Vector3(0, 15, 0)} 
              intensity={0.2} 
              color="#c0c0ff" 
            />
            <DistantMountains type="night" />
          </>
        );
      case 'sunset':
        return (
          <>
            <Sky 
              sunPosition={new THREE.Vector3(-2, 0.1, -1)} 
              inclination={0.1} 
              azimuth={0.8} 
              mieCoefficient={0.005} 
              mieDirectionalG={0.7} 
              rayleigh={0.5} 
              turbidity={8} 
            />
            <ambientLight 
              intensity={0.4} 
              color="#ffb090" 
            />
            <directionalLight 
              position={new THREE.Vector3(-5, 2, 1)} 
              intensity={1} 
              color="#ff7030" 
              castShadow 
            />
            <directionalLight 
              position={new THREE.Vector3(0, 5, -10)} 
              intensity={0.2} 
              color="#5050ff" 
            />
            <DistantMountains type="sunset" />
          </>
        );
      case 'cosmic':
        return (
          <>
            <color attach="background" args={['#111344']} />
            <Stars radius={100} depth={50} count={7000} factor={4} fade speed={0.5} />
            <fog attach="fog" args={['#1e1a4a', 25, 100]} />
            <ambientLight 
              intensity={0.25} 
              color="#4b5efc" 
            />
            <pointLight 
              position={new THREE.Vector3(10, 20, 5)} 
              intensity={0.6} 
              color="#bd4be8" 
            />
            <pointLight 
              position={new THREE.Vector3(-15, 10, -10)} 
              intensity={0.4} 
              color="#fddb3a" 
            />
            <pointLight 
              position={new THREE.Vector3(0, 30, 20)} 
              intensity={0.2} 
              color="#ffffff" 
            />
            <DistantMountains type="cosmic" />
          </>
        );
      default: // 'default'
        return (
          <>
            <Sky 
              sunPosition={new THREE.Vector3(100, 10, 100)} 
              inclination={0.6} 
              azimuth={0.25} 
            />
            <Stars radius={100} depth={50} count={5000} factor={4} fade />
            <ambientLight 
              intensity={lightingConfig.ambientIntensity} 
              color={lightingConfig.ambientColor} 
            />
            <directionalLight 
              position={new THREE.Vector3(...lightingConfig.directionalPosition)} 
              intensity={lightingConfig.directionalIntensity} 
              color={lightingConfig.directionalColor} 
              castShadow 
              shadow-mapSize-width={2048} 
              shadow-mapSize-height={2048}
            />
            <DistantMountains type="default" />
          </>
        );
    }
  };
  
  return <>{renderSkybox()}</>;
};

export default SceneEnvironment;