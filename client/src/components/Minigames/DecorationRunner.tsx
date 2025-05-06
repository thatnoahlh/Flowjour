import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import MinigameBase, { DecorationMinigameResult, MinigameBaseProps } from './MinigameBase';
import { DecorationType } from '../Menu/Menu';

// Game state enum
type GameState = 'ready' | 'playing' | 'gameOver' | 'victory';

// Obstacle types based on decoration themes
type ObstacleTheme = {
  shape: 'cube' | 'sphere' | 'cone' | 'torus';
  color: string;
  scale: [number, number, number];
};

// Obstacle themes based on decoration types
const obstacleThemes: Record<DecorationType, ObstacleTheme[]> = {
  default: [
    { shape: 'cube', color: '#663300', scale: [1, 1, 1] },      // Tree stump
    { shape: 'sphere', color: '#4CA64C', scale: [1.2, 1.2, 1.2] }, // Bush
  ],
  winter: [
    { shape: 'cone', color: '#FFFFFF', scale: [1, 1.5, 1] },     // Snow pile
    { shape: 'cube', color: '#ADD8E6', scale: [1, 1, 1] },       // Ice block
  ],
  autumn: [
    { shape: 'sphere', color: '#FF6600', scale: [1, 0.3, 1] },   // Leaf pile
    { shape: 'cube', color: '#8B4513', scale: [0.8, 0.8, 0.8] }, // Log
  ],
  fantasy: [
    { shape: 'torus', color: '#DA70D6', scale: [1, 1, 0.3] },    // Magic ring
    { shape: 'cone', color: '#00FFFF', scale: [0.8, 1.5, 0.8] }, // Crystal
  ],
};

// Collectible item
const Collectible: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  collected: boolean;
}> = ({ position, onCollect, collected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Rotate and float animation
  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });
  
  if (collected) return null;
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      onClick={onCollect}
    >
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFFF00"
        emissiveIntensity={0.5}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
};

// Obstacle component
const Obstacle: React.FC<{
  position: [number, number, number];
  theme: ObstacleTheme;
  onCollision: () => void;
  playerRef: React.RefObject<THREE.Group>;
}> = ({ position, theme, onCollision, playerRef }) => {
  const obstacleRef = useRef<THREE.Mesh>(null);
  
  // Collision detection
  useFrame(() => {
    if (obstacleRef.current && playerRef.current) {
      const playerPos = playerRef.current.position;
      const obstaclePos = obstacleRef.current.position;
      
      const dx = playerPos.x - obstaclePos.x;
      const dz = playerPos.z - obstaclePos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Adjust collision radius based on shape
      let collisionRadius = 0.8;
      if (theme.shape === 'sphere') collisionRadius = 0.6 * theme.scale[0];
      if (theme.shape === 'cone') collisionRadius = 0.5 * theme.scale[0];
      if (theme.shape === 'torus') collisionRadius = 0.9 * theme.scale[0];
      
      if (distance < collisionRadius) {
        onCollision();
      }
    }
  });
  
  // Render the appropriate geometry based on theme
  const renderGeometry = () => {
    switch (theme.shape) {
      case 'sphere':
        return <sphereGeometry args={[0.5, 16, 16]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 16]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case 'cube':
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  return (
    <mesh 
      ref={obstacleRef} 
      position={position}
      scale={theme.scale}
      castShadow
      receiveShadow
    >
      {renderGeometry()}
      <meshStandardMaterial
        color={theme.color}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

// Player character
const Player: React.FC<{
  controls: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
  speed: number;
  gameState: GameState;
}> = ({ controls, speed, gameState }) => {
  const playerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Player physics state
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const position = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));
  
  // Update player movement
  useFrame((_, delta) => {
    if (gameState !== 'playing') return;
    
    // Calculate movement direction
    let moveX = 0;
    let moveZ = 0;
    
    if (controls.forward) moveZ -= 1;
    if (controls.backward) moveZ += 1;
    if (controls.left) moveX -= 1;
    if (controls.right) moveX += 1;
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
      moveX *= 0.7071; // 1/√2
      moveZ *= 0.7071;
    }
    
    // Update velocity with some smoothing
    velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, moveX * speed, 0.2);
    velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, moveZ * speed, 0.2);
    
    // Apply velocity to position
    position.current.x += velocity.current.x * delta;
    position.current.z += velocity.current.z * delta;
    
    // Stay within game bounds
    position.current.x = Math.max(-15, Math.min(15, position.current.x));
    position.current.z = Math.max(-5, Math.min(30, position.current.z));
    
    // Update player position
    if (playerRef.current) {
      playerRef.current.position.copy(position.current);
      
      // Rotate player to face movement direction
      if (Math.abs(velocity.current.x) > 0.1 || Math.abs(velocity.current.z) > 0.1) {
        const angle = Math.atan2(velocity.current.x, velocity.current.z);
        playerRef.current.rotation.y = angle;
      }
    }
    
    // Make camera follow player
    camera.position.x = position.current.x;
    camera.position.z = position.current.z + 5; // Camera follows a bit behind
    camera.position.y = 3; // Camera height
    camera.lookAt(position.current.x, position.current.y, position.current.z);
  });
  
  return (
    <group ref={playerRef} position={[0, 0.5, 0]}>
      {/* Player body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#1E90FF" />
      </mesh>
      
      {/* Player head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#87CEFA" />
      </mesh>
    </group>
  );
};

// Main game scene
const GameScene: React.FC<{
  targetDecoration: DecorationType;
  onComplete: (result: DecorationMinigameResult) => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}> = ({ targetDecoration, onComplete, gameState, setGameState }) => {
  const playerRef = useRef<THREE.Group>(null);
  
  // Game controls state
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  
  // Game progress state
  const [collectibles, setCollectibles] = useState<Array<{
    position: [number, number, number];
    collected: boolean;
  }>>([]);
  const [obstacles, setObstacles] = useState<Array<{
    position: [number, number, number];
    theme: ObstacleTheme;
  }>>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  
  // Generate level when game starts
  useEffect(() => {
    if (gameState === 'ready') {
      // Generate collectibles
      const newCollectibles = [];
      for (let i = 0; i < 6; i++) {
        // Position collectibles along a path
        newCollectibles.push({
          position: [
            (Math.random() - 0.5) * 8,
            0.5,
            5 + i * 4
          ] as [number, number, number],
          collected: false
        });
      }
      setCollectibles(newCollectibles);
      
      // Generate obstacles
      const newObstacles = [];
      const themeOptions = obstacleThemes[targetDecoration];
      
      for (let i = 0; i < 15; i++) {
        // Position obstacles throughout the path but ensure they don't block collectibles
        let posX: number = 0;
        let posZ: number = 0;
        let isTooClose: boolean;
        
        do {
          posX = (Math.random() - 0.5) * 16;
          posZ = 2 + i * 2;
          isTooClose = newCollectibles.some(c => {
            const dx = c.position[0] - posX;
            const dz = c.position[2] - posZ;
            return Math.sqrt(dx * dx + dz * dz) < 1.5;
          });
        } while (isTooClose);
        
        newObstacles.push({
          position: [posX, 0, posZ] as [number, number, number],
          theme: themeOptions[Math.floor(Math.random() * themeOptions.length)]
        });
      }
      setObstacles(newObstacles);
    }
  }, [gameState, targetDecoration]);
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls(prev => ({ ...prev, forward: true }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControls(prev => ({ ...prev, backward: true }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setControls(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControls(prev => ({ ...prev, right: true }));
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls(prev => ({ ...prev, forward: false }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControls(prev => ({ ...prev, backward: false }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setControls(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControls(prev => ({ ...prev, right: false }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);
  
  // Handle collectible pickup
  const handleCollect = (index: number) => {
    setCollectibles(prev => 
      prev.map((item, i) => (i === index ? { ...item, collected: true } : item))
    );
    setCollectedCount(prev => prev + 1);
  };
  
  // Handle obstacle collision
  const handleCollision = () => {
    if (gameState === 'playing') {
      setGameState('gameOver');
    }
  };
  
  // Check for victory condition
  useEffect(() => {
    if (collectedCount === collectibles.length && collectibles.length > 0) {
      setGameState('victory');
      
      // Calculate score based on collected items
      const score = collectedCount * 100;
      
      // Complete the game
      onComplete({
        completed: true,
        score,
        unlockedDecoration: targetDecoration
      });
    }
  }, [collectedCount, collectibles.length, targetDecoration, onComplete, setGameState]);
  
  return (
    <>
      {/* Environment lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 15]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4A6542" />
      </mesh>
      
      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 15]} receiveShadow>
        <planeGeometry args={[6, 40]} />
        <meshStandardMaterial color="#8B7D6B" />
      </mesh>
      
      {/* Finish line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 28]} receiveShadow>
        <planeGeometry args={[6, 0.5]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Collectibles */}
      {collectibles.map((item, index) => (
        <Collectible
          key={index}
          position={item.position}
          collected={item.collected}
          onCollect={() => handleCollect(index)}
        />
      ))}
      
      {/* Obstacles */}
      {obstacles.map((item, index) => (
        <Obstacle
          key={index}
          position={item.position}
          theme={item.theme}
          onCollision={handleCollision}
          playerRef={playerRef}
        />
      ))}
      
      {/* Player character */}
      <Player
        controls={controls}
        speed={5}
        gameState={gameState}
      />
    </>
  );
};

// Interface component for displaying game state
const GameInterface: React.FC<{
  gameState: GameState;
  startGame: () => void;
  collectiblesCount: number;
  collectedCount: number;
  targetDecoration: DecorationType;
}> = ({ gameState, startGame, collectiblesCount, collectedCount, targetDecoration }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {gameState === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-auto">
          <div className="bg-white rounded-lg p-6 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Decoration Runner</h2>
            <p className="mb-4">
              Collect all the gems to unlock the {targetDecoration} decoration style!
              Avoid obstacles along the path.
            </p>
            <p className="mb-6 text-sm">
              Use W, A, S, D or arrow keys to move.
            </p>
            <button
              onClick={startGame}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded">
          <div>Gems: {collectedCount} / {collectiblesCount}</div>
          <div>Goal: Collect all gems</div>
        </div>
      )}
      
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-auto">
          <div className="bg-white rounded-lg p-6 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Game Over!</h2>
            <p className="mb-6">
              You hit an obstacle! Try again to unlock the {targetDecoration} decoration.
            </p>
            <button
              onClick={startGame}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'victory' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg p-6 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Success!</h2>
            <p className="mb-4">
              You've collected all the gems and unlocked the {targetDecoration} decoration style!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component that combines MinigameBase with the decoration runner
interface DecorationRunnerProps extends Omit<MinigameBaseProps, 'onComplete'> {
  targetDecoration: DecorationType;
  onComplete: (result: DecorationMinigameResult) => void;
}

const DecorationRunner: React.FC<DecorationRunnerProps> = ({
  targetDecoration,
  onComplete,
  onCancel,
  ...props
}) => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [collectedCount, setCollectedCount] = useState(0);
  const [collectiblesCount, setCollectiblesCount] = useState(6);
  
  const startGame = () => {
    setGameState('playing');
    setCollectedCount(0);
  };
  
  // Update collectibles count when tracked in game scene
  const handleComplete = (result: DecorationMinigameResult) => {
    setGameState('victory');
    onComplete(result);
  };
  
  return (
    <MinigameBase
      onComplete={(result) => {
        // Convert generic result to decoration-specific result
        if (!result.completed) {
          onComplete({
            ...result,
            unlockedDecoration: 'default' // Default if failed
          });
        }
      }}
      onCancel={onCancel}
      {...props}
    >
      <div className="relative w-full h-[500px]">
        <Canvas
          shadows
          camera={{ position: [0, 3, 5], fov: 60 }}
        >
          <GameScene
            targetDecoration={targetDecoration}
            onComplete={handleComplete}
            gameState={gameState}
            setGameState={setGameState}
          />
        </Canvas>
        
        <GameInterface
          gameState={gameState}
          startGame={startGame}
          collectiblesCount={collectiblesCount}
          collectedCount={collectedCount}
          targetDecoration={targetDecoration}
        />
      </div>
    </MinigameBase>
  );
};

export default DecorationRunner;