import React from 'react';
import { SkyboxType, DecorationType, LightingType, GroundType } from '../Menu/Menu';
import { MinigameType } from '../../lib/stores/useEnvironment';
import SkyboxCoinCollector from './SkyboxCoinCollector';
import GroundPuzzle from './GroundPuzzle';
import LightingPuzzle from './LightingPuzzle';
import DecorationRunner from './DecorationRunner';
import {
  SkyboxMinigameResult,
  DecorationMinigameResult,
  LightingMinigameResult,
  GroundMinigameResult
} from './MinigameBase';

// Props for the minigame manager
interface MinigameManagerProps {
  activeMinigame: MinigameType;
  targetSkybox?: SkyboxType;
  targetDecoration?: DecorationType;
  targetLighting?: LightingType;
  targetGround?: GroundType;
  onClose: () => void;
  onSkyboxUnlock: (skybox: SkyboxType) => void;
  onDecorationUnlock: (decoration: DecorationType) => void;
  onLightingUnlock: (lighting: LightingType) => void;
  onGroundUnlock: (ground: GroundType) => void;
}

const MinigameManager: React.FC<MinigameManagerProps> = ({
  activeMinigame,
  targetSkybox = 'night',
  targetDecoration = 'winter',
  targetLighting = 'warm',
  targetGround = 'sand',
  onClose,
  onSkyboxUnlock,
  onDecorationUnlock,
  onLightingUnlock,
  onGroundUnlock
}) => {
  // Handle completion of different minigame types
  const handleSkyboxComplete = (result: SkyboxMinigameResult) => {
    if (result.completed) {
      onSkyboxUnlock(result.unlockedSkybox);
    }
    onClose();
  };
  
  const handleDecorationComplete = (result: DecorationMinigameResult) => {
    if (result.completed) {
      onDecorationUnlock(result.unlockedDecoration);
    }
    onClose();
  };
  
  const handleLightingComplete = (result: LightingMinigameResult) => {
    if (result.completed) {
      onLightingUnlock(result.unlockedLighting);
    }
    onClose();
  };
  
  const handleGroundComplete = (result: GroundMinigameResult) => {
    if (result.completed) {
      onGroundUnlock(result.unlockedGround);
    }
    onClose();
  };
  
  // Render the active minigame
  if (activeMinigame === 'skybox') {
    return (
      <SkyboxCoinCollector
        targetSkybox={targetSkybox}
        onComplete={handleSkyboxComplete}
        onCancel={onClose}
        difficulty="medium"
        timeLimit={120}
      />
    );
  }
  
  if (activeMinigame === 'decoration') {
    return (
      <DecorationRunner
        targetDecoration={targetDecoration}
        onComplete={handleDecorationComplete}
        onCancel={onClose}
        difficulty="medium"
        timeLimit={180}
      />
    );
  }
  
  if (activeMinigame === 'lighting') {
    return (
      <LightingPuzzle
        targetLighting={targetLighting}
        onComplete={handleLightingComplete}
        onCancel={onClose}
        difficulty="medium"
        timeLimit={120}
      />
    );
  }
  
  if (activeMinigame === 'ground') {
    return (
      <GroundPuzzle
        targetGround={targetGround}
        onComplete={handleGroundComplete}
        onCancel={onClose}
        difficulty="medium"
        timeLimit={120}
      />
    );
  }
  
  // No active minigame, render nothing
  return null;
};

export default MinigameManager;