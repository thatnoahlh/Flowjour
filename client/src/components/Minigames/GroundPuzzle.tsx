import React, { useState, useEffect } from 'react';
import MinigameBase, { GroundMinigameResult, MinigameBaseProps } from './MinigameBase';
import { GroundType } from '../Menu/Menu';

// Puzzle tile type
interface Tile {
  id: number;
  groundType: GroundType;
  isRevealed: boolean;
  isMatched: boolean;
}

// Props for the ground puzzle minigame
interface GroundPuzzleProps extends Omit<MinigameBaseProps, 'onComplete'> {
  targetGround: GroundType;
  onComplete: (result: GroundMinigameResult) => void;
  gridSize?: number; // Size of the puzzle grid (gridSize x gridSize)
}

// Ground texture images
const groundTextures: Record<GroundType, string> = {
  grass: '/textures/grass.png',
  sand: '/textures/sand.png',
  snow: '/textures/snow.png',
  alien: '/textures/alien.png'
};

// Main ground puzzle component
const GroundPuzzle: React.FC<GroundPuzzleProps> = ({
  targetGround,
  onComplete,
  onCancel,
  gridSize = 4, // Default 4x4 grid
  ...props
}) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  
  // Initial setup of the puzzle
  useEffect(() => {
    const setupPuzzle = () => {
      // Create pairs of tiles with all ground types
      const groundTypes: GroundType[] = ['grass', 'sand', 'snow', 'alien'];
      const allTiles: Tile[] = [];
      
      // Create pairs for each ground type
      groundTypes.forEach(groundType => {
        // Each ground type gets two tiles (for pairs)
        for (let i = 0; i < 2; i++) {
          allTiles.push({
            id: allTiles.length,
            groundType,
            isRevealed: false,
            isMatched: false
          });
        }
      });
      
      // If we need more tiles to fill the grid, add additional pairs of the target ground
      const totalTiles = gridSize * gridSize;
      while (allTiles.length < totalTiles) {
        allTiles.push({
          id: allTiles.length,
          groundType: targetGround,
          isRevealed: false,
          isMatched: false
        });
        allTiles.push({
          id: allTiles.length,
          groundType: targetGround,
          isRevealed: false,
          isMatched: false
        });
      }
      
      // Trim if we have too many tiles
      const finalTiles = allTiles.slice(0, totalTiles);
      
      // Shuffle tiles
      for (let i = finalTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalTiles[i], finalTiles[j]] = [finalTiles[j], finalTiles[i]];
      }
      
      setTiles(finalTiles);
    };
    
    setupPuzzle();
  }, [gridSize, targetGround]);
  
  // Handle tile clicks
  const handleTileClick = (id: number) => {
    // Ignore clicks while checking pairs or if tile is already flipped/matched
    if (isChecking || flippedTiles.includes(id)) return;
    
    const clickedTile = tiles.find(tile => tile.id === id);
    if (!clickedTile || clickedTile.isMatched) return;
    
    // Flip the tile
    const newFlippedTiles = [...flippedTiles, id];
    setFlippedTiles(newFlippedTiles);
    
    // If we have 2 flipped tiles, check for a match
    if (newFlippedTiles.length === 2) {
      setIsChecking(true);
      setMovesCount(prev => prev + 1);
      
      // Get both flipped tiles
      const firstTileId = newFlippedTiles[0];
      const secondTileId = newFlippedTiles[1];
      const firstTile = tiles.find(tile => tile.id === firstTileId);
      const secondTile = tiles.find(tile => tile.id === secondTileId);
      
      // Check if they match
      if (firstTile && secondTile && firstTile.groundType === secondTile.groundType) {
        // Mark tiles as matched
        setTiles(prevTiles => 
          prevTiles.map(tile => 
            tile.id === firstTileId || tile.id === secondTileId
              ? { ...tile, isMatched: true }
              : tile
          )
        );
        setMatchedPairs(prev => prev + 1);
        setFlippedTiles([]);
        setIsChecking(false);
      } else {
        // Not a match, flip tiles back after a delay
        setTimeout(() => {
          setFlippedTiles([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };
  
  // Check for game completion
  useEffect(() => {
    const totalPairs = tiles.length / 2;
    
    if (matchedPairs === totalPairs && matchedPairs > 0) {
      // Calculate score based on moves and grid size
      const perfectMoves = totalPairs; // Minimum possible moves
      const maxScore = 1000;
      const movePenalty = 50; // Points deducted per extra move
      
      let score = maxScore - (movesCount - perfectMoves) * movePenalty;
      score = Math.max(100, score); // Minimum score is 100
      
      // Complete the game
      onComplete({
        completed: true,
        score,
        unlockedGround: targetGround
      });
    }
  }, [matchedPairs, tiles.length, movesCount, targetGround, onComplete]);
  
  return (
    <MinigameBase
      onComplete={(result) => {
        // Convert generic result to ground-specific result
        if (!result.completed) {
          onComplete({
            ...result,
            unlockedGround: 'grass' // Default if failed
          });
        }
      }}
      onCancel={onCancel}
      {...props}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold mb-2">Ground Memory Puzzle</h3>
          <p className="text-gray-600 mb-2">
            Match all pairs to unlock the {targetGround} ground type!
          </p>
          <div className="text-sm font-medium bg-gray-200 rounded-full px-3 py-1 inline-block">
            Pairs found: {matchedPairs} / {tiles.length / 2} • Moves: {movesCount}
          </div>
        </div>
        
        <div 
          className="grid gap-2 bg-gray-800 p-4 rounded-lg shadow-lg" 
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: `${gridSize * 80 + (gridSize - 1) * 8}px`
          }}
        >
          {tiles.map(tile => (
            <div 
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={`
                w-20 h-20 rounded-md shadow-md transition-all duration-300 transform cursor-pointer
                ${tile.isMatched ? 'opacity-70' : 'hover:scale-105'}
                ${flippedTiles.includes(tile.id) || tile.isMatched ? 'rotate-0' : 'rotate-y-180 bg-gray-600'}
              `}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {(flippedTiles.includes(tile.id) || tile.isMatched) ? (
                <div className="w-full h-full rounded-md overflow-hidden">
                  <img 
                    src={groundTextures[tile.groundType]} 
                    alt={tile.groundType}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-600 rounded-md flex items-center justify-center text-white font-bold text-2xl">
                  ?
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MinigameBase>
  );
};

export default GroundPuzzle;