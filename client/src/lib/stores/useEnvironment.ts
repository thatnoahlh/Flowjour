import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SkyboxType, 
  DecorationType, 
  LightingType, 
  GroundType 
} from '../../components/Menu/Menu';

// Track which features are unlocked
interface UnlockedFeatures {
  skyboxes: Record<SkyboxType, boolean>;
  decorations: Record<DecorationType, boolean>;
  lighting: Record<LightingType, boolean>;
  grounds: Record<GroundType, boolean>;
}

// Active minigame type
export type MinigameType = 'skybox' | 'decoration' | 'lighting' | 'ground' | null;

interface EnvironmentState {
  // Sky settings
  skyboxType: SkyboxType;
  
  // Decorations settings
  decorationType: DecorationType;
  
  // Lighting settings
  lightingType: LightingType;
  
  // Ground settings
  groundType: GroundType;
  
  // Menu visibility
  menuOpen: boolean;
  
  // Minigame state
  activeMinigame: MinigameType;
  
  // Unlocked features state
  unlockedFeatures: UnlockedFeatures;
  
  // Actions
  setSkyboxType: (type: SkyboxType) => void;
  setDecorationType: (type: DecorationType) => void;
  setLightingType: (type: LightingType) => void;
  setGroundType: (type: GroundType) => void;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
  
  // Minigame actions
  setActiveMinigame: (type: MinigameType) => void;
  
  // Unlock actions
  unlockSkybox: (type: SkyboxType) => void;
  unlockDecoration: (type: DecorationType) => void;
  unlockLighting: (type: LightingType) => void;
  unlockGround: (type: GroundType) => void;
  
  // Check if a feature is unlocked
  isSkyboxUnlocked: (type: SkyboxType) => boolean;
  isDecorationUnlocked: (type: DecorationType) => boolean;
  isLightingUnlocked: (type: LightingType) => boolean;
  isGroundUnlocked: (type: GroundType) => boolean;
}

// Create the persisted store
export const useEnvironment = create<EnvironmentState>()(
  persist(
    (set, get) => ({
      // Initial settings
      skyboxType: 'cosmic', // Set the cosmic theme as default
      decorationType: 'default',
      lightingType: 'default',
      groundType: 'grass',
      menuOpen: false,
      activeMinigame: null,
      
      // Initial unlocked features
      unlockedFeatures: {
        skyboxes: {
          default: true, // Default is always unlocked
          night: false,
          sunset: false,
          cosmic: true // Unlocked cosmic theme
        },
        decorations: {
          default: true, // Default is always unlocked
          winter: false,
          autumn: false,
          fantasy: false
        },
        lighting: {
          default: true, // Default is always unlocked
          warm: false,
          cool: false, 
          dramatic: false
        },
        grounds: {
          grass: true, // Default is always unlocked
          sand: false,
          snow: false,
          alien: false
        }
      },
      
      // Actions
      setSkyboxType: (type) => {
        if (get().isSkyboxUnlocked(type)) {
          set({ skyboxType: type });
        }
      },
      
      setDecorationType: (type) => {
        if (get().isDecorationUnlocked(type)) {
          set({ decorationType: type });
        }
      },
      
      setLightingType: (type) => {
        if (get().isLightingUnlocked(type)) {
          set({ lightingType: type });
        }
      },
      
      setGroundType: (type) => {
        if (get().isGroundUnlocked(type)) {
          set({ groundType: type });
        }
      },
      
      toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
      setMenuOpen: (open) => set({ menuOpen: open }),
      
      // Minigame actions
      setActiveMinigame: (type) => set({ activeMinigame: type }),
      
      // Unlock actions
      unlockSkybox: (type) => set((state) => ({
        unlockedFeatures: {
          ...state.unlockedFeatures,
          skyboxes: {
            ...state.unlockedFeatures.skyboxes,
            [type]: true
          }
        }
      })),
      
      unlockDecoration: (type) => set((state) => ({
        unlockedFeatures: {
          ...state.unlockedFeatures,
          decorations: {
            ...state.unlockedFeatures.decorations,
            [type]: true
          }
        }
      })),
      
      unlockLighting: (type) => set((state) => ({
        unlockedFeatures: {
          ...state.unlockedFeatures,
          lighting: {
            ...state.unlockedFeatures.lighting,
            [type]: true
          }
        }
      })),
      
      unlockGround: (type) => set((state) => ({
        unlockedFeatures: {
          ...state.unlockedFeatures,
          grounds: {
            ...state.unlockedFeatures.grounds,
            [type]: true
          }
        }
      })),
      
      // Check if features are unlocked
      isSkyboxUnlocked: (type) => get().unlockedFeatures.skyboxes[type],
      isDecorationUnlocked: (type) => get().unlockedFeatures.decorations[type],
      isLightingUnlocked: (type) => get().unlockedFeatures.lighting[type],
      isGroundUnlocked: (type) => get().unlockedFeatures.grounds[type],
    }),
    {
      name: 'garden-environment',
      // Only persist certain parts of the state
      partialize: (state) => ({
        skyboxType: state.skyboxType,
        decorationType: state.decorationType,
        lightingType: state.lightingType,
        groundType: state.groundType,
        unlockedFeatures: state.unlockedFeatures
      }),
    }
  )
);