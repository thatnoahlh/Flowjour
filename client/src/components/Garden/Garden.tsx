import React, { useState, useEffect, useRef } from "react";
import { FlowerScene } from "./FlowerScene";
import { useFlower } from "../../lib/stores/useFlower";
import { useJournal } from "../../lib/stores/useJournal";
import { useAudio } from "../../lib/stores/useAudio";
import { useEnvironment } from "../../lib/stores/useEnvironment";
import { useCoinStore } from "../../lib/stores/useCoinStore";
import { EmotionCompassButton } from "../EmotionCompass";
import Menu from "../Menu/Menu";

interface GardenProps {
  onBack: () => void;
}

const findNonOverlappingPosition = () => {
  // Temporary stub – return a basic default position
  return { x: 0, y: 0, z: 0 };
};

const Garden: React.FC<GardenProps> = ({ onBack }) => {
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { flowers, fetchFlowers, addFlower } = useFlower(); // Added addFlower
  const { fetchEntries, entries } = useJournal();
  const { toggleMute, isMuted } = useAudio();
  const { 
    menuOpen, 
    toggleMenu, 
    setMenuOpen,
    skyboxType,
    decorationType,
    lightingType,
    groundType,
    setSkyboxType,
    setDecorationType,
    setLightingType,
    setGroundType
  } = useEnvironment();

  useEffect(() => {
    // Load data when garden is mounted
    const loadData = async () => {
      await Promise.all([fetchFlowers(), fetchEntries()]);
      setLoading(false);
    };

    loadData();

    // Auto-hide controls after 5 seconds
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);

    // Add keyboard event listener for the M key to open menu
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'm') {
        toggleMenu();
      }

      // E key handling is now done in the Flower component
      // We removed the E key handling here to prevent duplicates
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fetchFlowers, fetchEntries, toggleMenu, flowers]);

  // Handle cursor visibility based on menus
  useEffect(() => {
    // This keeps the cursor visible during menu interactions
    if (menuOpen) {
      document.body.style.cursor = 'auto';
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } else {
      // Reset cursor when normal game play resumes
      document.body.style.cursor = 'none';
    }
  }, [menuOpen]);

  const [pPressCount, setPPressCount] = useState(0);
  const [lastPressTime, setLastPressTime] = useState(0);

  // Handle P key presses
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        const currentTime = Date.now();
        if (currentTime - lastPressTime < 500) { // Must press within 500ms
          setPPressCount(prev => prev + 1);
          if (pPressCount === 4) { // On 5th press
            // Generate 50 random flowers
            for (let i = 0; i < 50; i++) {
              const randomPosition = findNonOverlappingPosition();
              const randomHeight = 0.5 + Math.random() * 1.2;
              const randomAnswers = ['red', 'blue', 'yellow', 'pink'].map(() => 
                Math.random() > 0.5 ? 'yes' : 'no'
              );

              const flowerData: FlowerData = {
                id: `secret-flower-${Date.now()}-${i}`,
                journalId: `secret-journal-${Date.now()}-${i}`,
                answers: randomAnswers,
                journalDate: new Date().toISOString(),
                journalTitle: "Secret Flower",
                created: new Date().toISOString(),
                position: randomPosition,
                stemHeight: randomHeight
              };

              addFlower(flowerData);
            }
            setPPressCount(0);
          }
        } else {
          setPPressCount(1);
        }
        setLastPressTime(currentTime);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pPressCount, lastPressTime, addFlower, findNonOverlappingPosition]);

  const handleControlsToggle = () => {
    setShowControls(!showControls);
  };

  return (
    <div className="w-full h-full relative">
      {/* 3D Garden Scene */}
      <FlowerScene flowers={flowers} />

      {/* Overlay UI */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm transition-all duration-300 ${
          showControls ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Flower Garden</h2>
            <div className="flex gap-2">
              <button
                onClick={toggleMute}
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
              >
                {isMuted ? "Unmute Sound" : "Mute Sound"}
              </button>
              <button
                onClick={onBack}
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
              >
                Back to Home
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>A = Red</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>B = Blue</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>C = Yellow</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>D = Pink</span>
            </div>
          </div>

          <div className="mt-3 text-sm">
            <p>Controls: WASD to move. Space to jump. Mouse to look around. Hover over a flower and press E to view journal entry.</p>
          </div>
        </div>
      </div>

      {/* Toggle button for controls */}
      <button
        onClick={handleControlsToggle}
        className="absolute bottom-4 right-4 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center z-50"
      >
        {showControls ? "↓" : "↑"}
      </button>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">Loading your garden...</p>
          </div>
        </div>
      )}

      {/* Flower info when hovering */}
      <div className="absolute top-4 left-4 p-3 bg-background/80 backdrop-blur-sm rounded-md text-sm pointer-events-none opacity-0 transition-opacity" id="flower-info">
        <div className="font-medium" id="flower-title"></div>
        <div className="text-muted-foreground" id="flower-date"></div>
      </div>

      {/* Menu button hint */}
      <div className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-md text-sm">
        Press <kbd className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded">M</kbd> for Menu
      </div>

      {/* Game Menu */}
      <Menu 
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onChangeSkybox={setSkyboxType}
        onChangeDecorations={setDecorationType}
        onChangeLighting={setLightingType}
        onChangeGround={setGroundType}
        currentSkybox={skyboxType}
        currentDecorations={decorationType}
        currentLighting={lightingType}
        currentGround={groundType}
      />

      {/* Journal entries are now handled by the Flower component 
          to prevent duplicate entries when pressing E */}

      {/* Coin indicator */}
      <div className="absolute top-14 right-4 p-2 bg-amber-100 text-amber-600 font-bold rounded-full">
        🪙 <span className="ml-1">{useCoinStore(state => state.coins)}</span>
      </div>

      </div>
  );
};

export default Garden;