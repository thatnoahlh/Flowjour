import React, { useMemo, useState } from 'react';
import Coin from './Coin';
import { useCoinStore } from '../../lib/stores/useCoinStore';

interface CoinsProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
}

const Coins: React.FC<CoinsProps> = ({
  count = 20,
  minRadius = 10,
  maxRadius = 30
}) => {
  const { collectCoin, collectedPositions } = useCoinStore();
  const [collectedCoins, setCollectedCoins] = useState<string[]>([]);
  
  // Generate fixed coin positions in a ring around the garden
  const coinData = useMemo(() => {
    const coins = [];
    
    // Generate positions in a circle pattern with some variation
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radiusVariation = Math.random() * (maxRadius - minRadius);
      const distance = minRadius + radiusVariation;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Add some random variation to make it look more natural
      const xOffset = (Math.random() - 0.5) * 5;
      const zOffset = (Math.random() - 0.5) * 5;
      
      coins.push({
        id: `coin-${i}`,
        position: [x + xOffset, 0.5, z + zOffset] as [number, number, number]
      });
    }
    
    return coins;
  }, [count, minRadius, maxRadius]);
  
  // Handle coin collection
  const handleCollectCoin = (id: string) => {
    collectCoin();
    setCollectedCoins(prev => [...prev, id]);
  };
  
  return (
    <group>
      {coinData.map(coin => (
        !collectedCoins.includes(coin.id) && (
          <Coin
            key={coin.id}
            id={coin.id}
            position={coin.position}
            onCollect={() => handleCollectCoin(coin.id)}
          />
        )
      ))}
    </group>
  );
};

export default Coins;