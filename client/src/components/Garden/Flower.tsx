import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FlowerData } from "../../types";
import { useJournal } from "../../lib/stores/useJournal";
import { useEnvironment } from "../../lib/stores/useEnvironment";
import FlowerPot from "./FlowerPot";
import FlowerStem from "./FlowerStem";
import FlowerPetal from "./FlowerPetal";

interface FlowerProps {
  flower: FlowerData;
}

const Flower: React.FC<FlowerProps> = ({ flower }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const { getEntry } = useJournal();
  const { menuOpen } = useEnvironment();
  const { camera } = useThree();
  
  // Calculate stem height based on journal content length (simulated)
  // Ensure flowers are not taller than 80% of camera height (camera height is 1.7)
  const stemHeight = useMemo(() => {
    return flower.stemHeight;
  }, [flower.stemHeight]);
  
  // Handle keyboard press for viewing journal entry
  useEffect(() => {
    if (!hovered) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e' && hovered) {
        setSelected(true);
        
        // Find the journal entry
        const entry = getEntry(flower.journalId);
        if (!entry) return;
        
        // Check if a journal modal already exists and remove it
        const existingModal = document.getElementById('journal-modal');
        if (existingModal) {
          document.body.removeChild(existingModal);
        }
        
        // Get the pointer lock controls and ensure mouse cursor is visible
        const controls = document.querySelector('.canvas-container canvas');
        if (document.pointerLockElement) {
          // Exit pointer lock to regain mouse control
          document.exitPointerLock();
        }
        
        // Make sure cursor is visible
        document.body.style.cursor = 'auto';
        
        // Display journal content in a modal with solid white background
        const modal = document.createElement('div');
        modal.id = 'journal-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        
        // Create modal content as a separate element
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-gradient-to-br from-indigo-900 to-purple-900 max-w-2xl w-full rounded-lg shadow-lg overflow-hidden border border-white/20';
        modalContent.innerHTML = `
          <div class="flex justify-between items-center p-4 border-b border-white/20">
            <h2 class="text-xl font-bold text-yellow-300">Journal Entry</h2>
            <button id="close-journal-x-btn" class="p-2 rounded-full hover:bg-white/10 text-yellow-300">
              ✕
            </button>
          </div>
          
          <div class="p-6">
            <h3 class="text-lg font-medium mb-2 text-yellow-300">${entry.title}</h3>
            <div class="text-sm text-yellow-100 mb-4">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="prose prose-sm max-h-[60vh] overflow-y-auto text-white">
              ${entry.content.split('\n').map(line => `<p class="mb-4">${line}</p>`).join('')}
            </div>
          </div>
          
          <div class="p-4 flex justify-end border-t border-white/20">
            <button id="close-journal-btn" class="bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 px-4 py-2 rounded-md font-medium hover:from-yellow-500 hover:to-amber-600 transition-all">
              Close
            </button>
          </div>
        `;
        
        // Append content to modal
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Always ensure cursor is visible when modal is open
        document.body.style.cursor = 'auto';
        
        // CRITICAL FIX: Prevent clicks outside the modal from giving camera control back
        // We'll add a mousedown listener to the modal backdrop to prevent pointer lock 
        modal.addEventListener('mousedown', (e) => {
          // Only stop propagation if clicking the backdrop (not the modal content)
          if (e.target === modal) {
            e.stopPropagation();
            e.preventDefault();
            // Keep focus on the modal and ensure cursor remains visible
            document.body.style.cursor = 'auto';
          }
        });
        
        // Function to close modal
        const closeModal = () => {
          const modalToRemove = document.getElementById('journal-modal');
          if (modalToRemove) {
            document.body.removeChild(modalToRemove);
          }
          setSelected(false);
          
          // Hide cursor and re-lock pointer after a short delay to allow the UI to update
          setTimeout(() => {
            document.body.style.cursor = 'none';
            // Only request pointer lock if we're not already back at menu or some other UI element
            if (!document.getElementById('journal-modal') && !menuOpen) {
              controls?.requestPointerLock();
            }
          }, 100);
        };
        
        // Handle close buttons
        document.getElementById('close-journal-btn')?.addEventListener('click', closeModal);
        document.getElementById('close-journal-x-btn')?.addEventListener('click', closeModal);
        
        // Also close when pressing Escape
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            closeModal();
            window.removeEventListener('keydown', handleEscape);
          }
        };
        
        window.addEventListener('keydown', handleEscape);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hovered, flower.journalId, getEntry, menuOpen]);
  
  // Generate petal positions with pointed ends toward center and rounded ends outward
  // EXACTLY as shown in the RIGHT side of the reference example
  const petalPositions = useMemo(() => {
    // Position flower higher above stem to prevent stem clipping
    const stemTop = stemHeight + 0.35; // Much higher above stem to prevent clipping
    
    // Calculate petal arrangement based on number of petals
    return flower.answers.map((_, index) => {
      // Calculate position in a perfect circle around the center
      const totalPetals = flower.answers.length;
      const angle = (index / totalPetals) * Math.PI * 2;
      
      // Calculate radius - matches exactly the pistil radius for perfect connection
      const radius = 0.10; // Equal to pistil radius (0.1) so petals touch pistil perfectly
      
      // Calculate positions along the circle
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // All petals are at the same height (flat flower)
      const y = stemTop;
      
      // CRITICAL CHANGE: We need to rotate the petals so the POINTED END (at 0,0 in shape coords)
      // is at the CENTER of the flower, and the ROUNDED END points OUTWARD
      
      // Calculate the angle from center to petal position
      const facingAngle = Math.atan2(z, x) + Math.PI; // Add 180 degrees to point sharp end toward center
      
      return { 
        position: [x, y, z], 
        rotation: [
          Math.PI/2,      // Lay flat (90 degrees)
          0,              // No tilt on Y axis
          facingAngle     // Key rotation: align with radius line + 180° so point faces center
        ],
        index
      };
    });
  }, [flower.answers, stemHeight]);
  
  // Gentle swaying animation
  useFrame((state) => {
    if (groupRef.current) {
      // Very subtle movement
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.03;
      groupRef.current.rotation.z = Math.sin(time * 0.2) * 0.03;
    }
  });
  
  // Handle hover state
  const handlePointerOver = () => {
    setHovered(true);
    document.getElementById("flower-info")!.style.opacity = "1";
    document.getElementById("flower-title")!.textContent = flower.journalTitle;
    document.getElementById("flower-date")!.textContent = flower.journalDate;
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.getElementById("flower-info")!.style.opacity = "0";
  };
  
  return (
    <group 
      ref={groupRef}
      position={[flower.position[0], 0, flower.position[2]]}
      scale={0.5}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* No pot needed as flowers grow directly from garden ground */}
      
      {/* Flower stem */}
      <FlowerStem 
        position={[0, 0.3, 0]} 
        height={stemHeight}
      />
      
      {/* Yellow pistil/center - positioned at EXACT same height as petals to prevent clipping */}
      <group position={[0, stemHeight + 0.35, 0]}>
        {/* Main center cylinder - matching the reference drawing */}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFFF00" 
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>
        
        {/* Octagonal pattern on pistil to match your reference */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 0.07; // At edge of center
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <mesh key={i} position={[x, 0.015, z]} castShadow>
              <boxGeometry args={[0.02, 0.015, 0.02]} />
              <meshStandardMaterial 
                color="#FFA000"
                emissive="#FFD54F"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Flower petals - more natural arrangement */}
      {flower.answers.map((answer, index) => (
        <FlowerPetal
          key={index}
          position={petalPositions[index].position as [number, number, number]}
          rotation={petalPositions[index].rotation as [number, number, number]}
          color={answer}
          scale={hovered ? 1.1 : 1}
          index={index}
          angleOffset={(index / flower.answers.length) * Math.PI * 2}
        />
      ))}
    </group>
  );
};

export default Flower;
