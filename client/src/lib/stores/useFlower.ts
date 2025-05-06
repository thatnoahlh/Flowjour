import { create } from "zustand";
import { FlowerData } from "../../types";
import { getLocalStorage, setLocalStorage } from "../utils";
import { apiRequest } from "../queryClient";

interface FlowerState {
  flowers: FlowerData[];
  currentFlower: FlowerData | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchFlowers: () => Promise<void>;
  findNonOverlappingPosition: () => [number, number, number]; // New method for positioning flowers
  addFlower: (flower: FlowerData) => Promise<void>;
  getFlowerById: (id: string) => FlowerData | null;
  getFlowerByJournalId: (journalId: string) => FlowerData | null;
}

export const useFlower = create<FlowerState>((set, get) => ({
  flowers: getLocalStorage("flowers") || [],
  currentFlower: null,
  loading: false,
  error: null,
  
  fetchFlowers: async () => {
    set({ loading: true, error: null });
    
    try {
      // Try to fetch from server
      const response = await apiRequest("GET", "/api/flowers", undefined);
      const data = await response.json();
      
      set({ flowers: data, loading: false });
      setLocalStorage("flowers", data);
    } catch (error) {
      console.log("Failed to fetch flowers from server, using local storage:", error);
      
      // Fallback to local storage
      const localFlowers = getLocalStorage("flowers") || [];
      set({ 
        flowers: localFlowers, 
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch flowers"
      });
    }
  },
  
  // Helper function to find a non-overlapping position within garden circle
  findNonOverlappingPosition: () => {
    const flowers = get().flowers;
    const minDistance = 2.0; // Minimum distance between flowers
    const gardenRadius = 10.0; // Radius of garden area (slighter smaller than the 12 unit circle)
    
    // Try 50 times to find a non-overlapping position
    for (let attempts = 0; attempts < 50; attempts++) {
      // Generate random angle and distance from center (but within garden)
      const angle = Math.random() * Math.PI * 2;
      // Distribute more evenly throughout garden (not just at the edges)
      // Use square root to get more even distribution across the area
      const distance = Math.sqrt(Math.random()) * gardenRadius;
      
      // Calculate potential position
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Check if this position overlaps with any existing flower
      let overlaps = false;
      for (const existingFlower of flowers) {
        const dx = existingFlower.position[0] - x;
        const dz = existingFlower.position[2] - z;
        const distanceSquared = dx * dx + dz * dz;
        
        if (distanceSquared < minDistance * minDistance) {
          overlaps = true;
          break;
        }
      }
      
      // If no overlap found, return this position
      if (!overlaps) {
        return [x, 0, z] as [number, number, number];
      }
    }
    
    // If we couldn't find non-overlapping position after 50 tries,
    // place it at a random position on the perimeter of the garden
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * (gardenRadius - 0.5); // Slightly inside perimeter
    const z = Math.sin(angle) * (gardenRadius - 0.5);
    return [x, 0, z] as [number, number, number];
  },
  
  addFlower: async (flower: FlowerData) => {
    set({ loading: true, error: null });
    
    try {
      // Find non-overlapping position for the new flower
      const position = get().findNonOverlappingPosition();
      
      // Update the flower with the calculated position
      const flowerWithPosition = {
        ...flower,
        position
      };
      
      // Try to save to server
      await apiRequest("POST", "/api/flowers", flowerWithPosition);
      
      // Update local state
      const updatedFlowers = [...get().flowers, flowerWithPosition];
      set({ flowers: updatedFlowers, currentFlower: flowerWithPosition, loading: false });
      
      // Backup to local storage
      setLocalStorage("flowers", updatedFlowers);
    } catch (error) {
      console.log("Failed to save flower to server, saving locally:", error);
      
      // Find non-overlapping position again (in case the server call failed)
      const position = get().findNonOverlappingPosition();
      
      // Update the flower with the calculated position
      const flowerWithPosition = {
        ...flower,
        position
      };
      
      // Fallback to just local storage
      const updatedFlowers = [...get().flowers, flowerWithPosition];
      set({ 
        flowers: updatedFlowers, 
        currentFlower: flowerWithPosition,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to save flower"
      });
      
      setLocalStorage("flowers", updatedFlowers);
    }
  },
  
  getFlowerById: (id: string) => {
    return get().flowers.find(f => f.id === id) || null;
  },
  
  getFlowerByJournalId: (journalId: string) => {
    return get().flowers.find(f => f.journalId === journalId) || null;
  }
}));
