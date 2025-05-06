import React, { useState, useEffect } from 'react';
import { SkyboxType, DecorationType, LightingType, GroundType } from '../Menu/Menu';

// Base interface for all minigame results
export interface MinigameResult {
  completed: boolean;
  score: number;
}

// Specific result interfaces for each customization type
export interface SkyboxMinigameResult extends MinigameResult {
  unlockedSkybox: SkyboxType;
}

export interface DecorationMinigameResult extends MinigameResult {
  unlockedDecoration: DecorationType;
}

export interface LightingMinigameResult extends MinigameResult {
  unlockedLighting: LightingType;
}

export interface GroundMinigameResult extends MinigameResult {
  unlockedGround: GroundType;
}

// Props for the base minigame component
export interface MinigameBaseProps {
  onComplete: (result: MinigameResult) => void;
  onCancel: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
  children?: React.ReactNode;
}

// The base minigame component that all specific minigames will extend
const MinigameBase: React.FC<MinigameBaseProps> = ({
  onComplete,
  onCancel,
  difficulty = 'medium',
  timeLimit = 60,
  children
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);

  // Set up the timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle time running out
  useEffect(() => {
    if (timeRemaining === 0) {
      onComplete({ completed: false, score: 0 });
    }
  }, [timeRemaining, onComplete]);

  // Ensure pointer lock is released and cursor is visible
  useEffect(() => {
    document.body.style.cursor = 'auto';
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // When component unmounts, clean up
    return () => {
      document.body.style.cursor = 'none';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">Minigame Challenge</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              Time: <span className={timeRemaining < 10 ? "text-red-500" : ""}>{timeRemaining}s</span>
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-800"
            >
              {isPaused ? "▶" : "⏸"}
            </button>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-100 min-h-[400px]">
          {/* The specific minigame content will be rendered here */}
          {children}
        </div>

        <div className="bg-white p-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium mr-2"
          >
            Cancel
          </button>
          <button
            onClick={() => onComplete({ completed: false, score: 0 })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium"
          >
            Give Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinigameBase;