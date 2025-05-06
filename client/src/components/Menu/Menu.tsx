import React, { useState } from 'react';
import { useEnvironment } from '../../lib/stores/useEnvironment';
import { useCoinStore } from '../../lib/stores/useCoinStore';

export type SkyboxType = 'default' | 'night' | 'sunset' | 'cosmic';
export type DecorationType = 'default' | 'winter' | 'autumn' | 'fantasy';
export type LightingType = 'default' | 'warm' | 'cool' | 'dramatic';
export type GroundType = 'grass' | 'sand' | 'snow' | 'alien';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeSkybox: (type: SkyboxType) => void;
  onChangeDecorations: (type: DecorationType) => void;
  onChangeLighting: (type: LightingType) => void;
  onChangeGround: (type: GroundType) => void;
  currentSkybox: SkyboxType;
  currentDecorations: DecorationType;
  currentLighting: LightingType;
  currentGround: GroundType;
}

const Menu: React.FC<MenuProps> = ({
  isOpen,
  onClose,
  onChangeSkybox,
  onChangeDecorations,
  onChangeLighting,
  onChangeGround,
  currentSkybox,
  currentDecorations,
  currentLighting,
  currentGround
}) => {
  const [activeTab, setActiveTab] = useState<'customization' | 'settings'>('customization');
  
  // Use environment and coin stores
  const { unlockSkybox, unlockDecoration, unlockLighting, unlockGround } = useEnvironment();
  
  const { 
    coins,
    skyboxCost,
    decorationCost,
    lightingCost,
    groundCost,
    unlockSkybox: paySkybox,
    unlockDecoration: payDecoration,
    unlockLighting: payLighting,
    unlockGround: payGround,
    isSkyboxUnlocked,
    isDecorationUnlocked,
    isLightingUnlocked,
    isGroundUnlocked
  } = useCoinStore();

  if (!isOpen) return null;

  // We'll unlock the pointer when menu is open
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }
  
  // Ensure mouse cursor is visible when menu is open
  document.body.style.cursor = 'auto';
  
  // Handle feature unlocking with coins
  const handleSkyboxUnlock = (skybox: SkyboxType) => {
    if (isSkyboxUnlocked(skybox)) {
      onChangeSkybox(skybox);
    } else if (paySkybox(skybox)) {
      unlockSkybox(skybox);
      onChangeSkybox(skybox);
    }
  };
  
  const handleDecorationUnlock = (decoration: DecorationType) => {
    if (isDecorationUnlocked(decoration)) {
      onChangeDecorations(decoration);
    } else if (payDecoration(decoration)) {
      unlockDecoration(decoration);
      onChangeDecorations(decoration);
    }
  };
  
  const handleLightingUnlock = (lighting: LightingType) => {
    if (isLightingUnlocked(lighting)) {
      onChangeLighting(lighting);
    } else if (payLighting(lighting)) {
      unlockLighting(lighting);
      onChangeLighting(lighting);
    }
  };
  
  const handleGroundUnlock = (ground: GroundType) => {
    if (isGroundUnlocked(ground)) {
      onChangeGround(ground);
    } else if (payGround(ground)) {
      unlockGround(ground);
      onChangeGround(ground);
    }
  };
  
  // Close menu
  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white border border-gray-300 max-w-4xl w-full rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-300">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md font-medium ${activeTab === 'customization' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => setActiveTab('customization')}
            >
              Customization
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium ${activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
          <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full">
            <span className="text-amber-600 font-bold">🪙 {coins}</span>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="p-6 bg-gradient-to-b from-indigo-900 to-purple-800 text-white">
          {activeTab === 'customization' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-yellow-300">Garden Customization</h2>
              <p className="text-yellow-100">Collect coins around the garden to unlock different features!</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-white/20 rounded-lg p-4 hover:border-yellow-300 cursor-pointer transition-colors bg-black/30">
                  <h3 className="text-lg font-medium mb-2 text-yellow-300">Skybox</h3>
                  <p className="text-sm text-yellow-100 mb-4">Change the appearance of the sky</p>
                  <div className="flex flex-wrap gap-2">
                    {(['default', 'night', 'sunset', 'cosmic'] as SkyboxType[]).map(type => (
                      <button
                        key={type}
                        className={`px-3 py-1 rounded text-xs ${
                          !isSkyboxUnlocked(type) ? 'bg-gray-300 text-gray-600' :
                          currentSkybox === type ? 'bg-primary text-primary-foreground' : 
                          'bg-secondary text-secondary-foreground'
                        }`}
                        onClick={() => handleSkyboxUnlock(type)}
                      >
                        {isSkyboxUnlocked(type) ? (
                          type.charAt(0).toUpperCase() + type.slice(1)
                        ) : (
                          <span className="flex items-center">
                            <span className="mr-1">🔒</span> {type.charAt(0).toUpperCase() + type.slice(1)} ({skyboxCost} 🪙)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-white/20 rounded-lg p-4 hover:border-yellow-300 cursor-pointer transition-colors bg-black/30">
                  <h3 className="text-lg font-medium mb-2 text-yellow-300">Garden Decorations</h3>
                  <p className="text-sm text-yellow-100 mb-4">Customize trees and decorative elements</p>
                  <div className="flex flex-wrap gap-2">
                    {(['default', 'winter', 'autumn', 'fantasy'] as DecorationType[]).map(type => (
                      <button
                        key={type}
                        className={`px-3 py-1 rounded text-xs ${
                          !isDecorationUnlocked(type) ? 'bg-gray-300 text-gray-600' :
                          currentDecorations === type ? 'bg-primary text-primary-foreground' : 
                          'bg-secondary text-secondary-foreground'
                        }`}
                        onClick={() => handleDecorationUnlock(type)}
                      >
                        {isDecorationUnlocked(type) ? (
                          type.charAt(0).toUpperCase() + type.slice(1)
                        ) : (
                          <span className="flex items-center">
                            <span className="mr-1">🔒</span> {type.charAt(0).toUpperCase() + type.slice(1)} ({decorationCost} 🪙)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-white/20 rounded-lg p-4 hover:border-yellow-300 cursor-pointer transition-colors bg-black/30">
                  <h3 className="text-lg font-medium mb-2 text-yellow-300">Lighting</h3>
                  <p className="text-sm text-yellow-100 mb-4">Change the mood with different lighting</p>
                  <div className="flex flex-wrap gap-2">
                    {(['default', 'warm', 'cool', 'dramatic'] as LightingType[]).map(type => (
                      <button
                        key={type}
                        className={`px-3 py-1 rounded text-xs ${
                          !isLightingUnlocked(type) ? 'bg-gray-300 text-gray-600' :
                          currentLighting === type ? 'bg-primary text-primary-foreground' : 
                          'bg-secondary text-secondary-foreground'
                        }`}
                        onClick={() => handleLightingUnlock(type)}
                      >
                        {isLightingUnlocked(type) ? (
                          type.charAt(0).toUpperCase() + type.slice(1)
                        ) : (
                          <span className="flex items-center">
                            <span className="mr-1">🔒</span> {type.charAt(0).toUpperCase() + type.slice(1)} ({lightingCost} 🪙)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-white/20 rounded-lg p-4 hover:border-yellow-300 cursor-pointer transition-colors bg-black/30">
                  <h3 className="text-lg font-medium mb-2 text-yellow-300">Terrain Type</h3>
                  <p className="text-sm text-yellow-100 mb-4">Change the ground appearance</p>
                  <div className="flex flex-wrap gap-2">
                    {(['grass', 'sand', 'snow', 'alien'] as GroundType[]).map(type => (
                      <button
                        key={type}
                        className={`px-3 py-1 rounded text-xs ${
                          !isGroundUnlocked(type) ? 'bg-gray-300 text-gray-600' :
                          currentGround === type ? 'bg-primary text-primary-foreground' : 
                          'bg-secondary text-secondary-foreground'
                        }`}
                        onClick={() => handleGroundUnlock(type)}
                      >
                        {isGroundUnlocked(type) ? (
                          type.charAt(0).toUpperCase() + type.slice(1)
                        ) : (
                          <span className="flex items-center">
                            <span className="mr-1">🔒</span> {type.charAt(0).toUpperCase() + type.slice(1)} ({groundCost} 🪙)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-yellow-300">Settings</h2>
              <p className="text-yellow-100">Adjust your preferences for the garden experience.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-100">Sound Volume</span>
                  <input type="range" min="0" max="100" defaultValue="50" className="w-1/2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-yellow-100">Flower Size</span>
                  <input type="range" min="0" max="100" defaultValue="50" className="w-1/2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-yellow-100">Movement Speed</span>
                  <input type="range" min="0" max="100" defaultValue="50" className="w-1/2" />
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h3 className="text-lg font-medium mb-4 text-yellow-300">Create New Flower</h3>
                  <button 
                    onClick={() => {
                      handleClose();
                      setTimeout(() => window.location.href = '/', 100);
                    }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 rounded-lg px-6 py-3 font-medium shadow-md hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-[1.01] flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <path d="M12 8v8"></path>
                      <path d="M8 12h8"></path>
                    </svg>
                    Create New Flower
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-indigo-900 p-4 flex justify-end border-t border-white/20">
          <button 
            onClick={handleClose}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 px-4 py-2 rounded-md font-medium hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-[1.02]"
          >
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;