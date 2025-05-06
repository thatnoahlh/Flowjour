import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SkyboxType, DecorationType, LightingType, GroundType } from '../../components/Menu/Menu';

interface CoinState {
  // Total coins collected
  coins: number;
  totalCoins: number;
  
  // Costs for unlocking features (in coins)
  skyboxCost: number;
  decorationCost: number;
  lightingCost: number;
  groundCost: number;
  
  // Unlocked features
  unlockedSkyboxes: Record<SkyboxType, boolean>;
  unlockedDecorations: Record<DecorationType, boolean>;
  unlockedLighting: Record<LightingType, boolean>;
  unlockedGrounds: Record<GroundType, boolean>;
  
  // Actions
  collectCoin: () => void;
  resetCoins: () => void; // For debugging
  unlockSkybox: (type: SkyboxType) => boolean;
  unlockDecoration: (type: DecorationType) => boolean;
  unlockLighting: (type: LightingType) => boolean;
  unlockGround: (type: GroundType) => boolean;
  
  // Check if features are unlocked
  isSkyboxUnlocked: (type: SkyboxType) => boolean;
  isDecorationUnlocked: (type: DecorationType) => boolean;
  isLightingUnlocked: (type: LightingType) => boolean;
  isGroundUnlocked: (type: GroundType) => boolean;
  
  // Collected locations tracking
  collectedPositions: [number, number, number][];
  addCollectedPosition: (position: [number, number, number]) => void;
}

export const useCoinStore = create<CoinState>()(
  persist(
    (set, get) => ({
      // Initial values
      coins: 0,
      totalCoins: 20, // Total coins in the garden
      
      // Feature costs
      skyboxCost: 1,
      decorationCost: 1,
      lightingCost: 1,
      groundCost: 1,
      
      // Initially unlocked features (defaults only)
      unlockedSkyboxes: {
        default: true,
        night: false,
        sunset: false,
        cosmic: false
      },
      unlockedDecorations: {
        default: true,
        winter: false,
        autumn: false,
        fantasy: false
      },
      unlockedLighting: {
        default: true,
        warm: false,
        cool: false,
        dramatic: false
      },
      unlockedGrounds: {
        grass: true,
        sand: false,
        snow: false,
        alien: false
      },
      
      // Track collected positions to avoid respawning coins that were already collected
      collectedPositions: [],
      
      // Actions
      collectCoin: () => set(state => ({ coins: state.coins + 1 })),
      resetCoins: () => set({ coins: 0, collectedPositions: [] }),
      
      // Unlocking features (returns true if successful)
      unlockSkybox: (type) => {
        const { coins, skyboxCost, unlockedSkyboxes } = get();
        if (unlockedSkyboxes[type]) return true; // Already unlocked
        if (coins >= skyboxCost) {
          set(state => ({
            coins: state.coins - skyboxCost,
            unlockedSkyboxes: {
              ...state.unlockedSkyboxes,
              [type]: true
            }
          }));
          return true;
        }
        return false;
      },
      
      unlockDecoration: (type) => {
        const { coins, decorationCost, unlockedDecorations } = get();
        if (unlockedDecorations[type]) return true; // Already unlocked
        if (coins >= decorationCost) {
          set(state => ({
            coins: state.coins - decorationCost,
            unlockedDecorations: {
              ...state.unlockedDecorations,
              [type]: true
            }
          }));
          return true;
        }
        return false;
      },
      
      unlockLighting: (type) => {
        const { coins, lightingCost, unlockedLighting } = get();
        if (unlockedLighting[type]) return true; // Already unlocked
        if (coins >= lightingCost) {
          set(state => ({
            coins: state.coins - lightingCost,
            unlockedLighting: {
              ...state.unlockedLighting,
              [type]: true
            }
          }));
          return true;
        }
        return false;
      },
      
      unlockGround: (type) => {
        const { coins, groundCost, unlockedGrounds } = get();
        if (unlockedGrounds[type]) return true; // Already unlocked
        if (coins >= groundCost) {
          set(state => ({
            coins: state.coins - groundCost,
            unlockedGrounds: {
              ...state.unlockedGrounds,
              [type]: true
            }
          }));
          return true;
        }
        return false;
      },
      
      // Check if features are unlocked
      isSkyboxUnlocked: (type) => get().unlockedSkyboxes[type],
      isDecorationUnlocked: (type) => get().unlockedDecorations[type],
      isLightingUnlocked: (type) => get().unlockedLighting[type],
      isGroundUnlocked: (type) => get().unlockedGrounds[type],
      
      // Track collected coins
      addCollectedPosition: (position) => 
        set(state => ({
          collectedPositions: [...state.collectedPositions, position]
        }))
    }),
    {
      name: 'garden-coins',
    }
  )
);