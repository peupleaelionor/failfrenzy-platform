/**
 * GAME CONTROLS — Touch + Keyboard
 * 
 * Mobile: D-pad tactile (haut/bas/gauche/droite)
 * Desktop: Flèches clavier
 */

import { useEffect, useState } from 'react';

interface GameControlsProps {
  onDirectionPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionRelease: () => void;
  visible?: boolean;
}

export function GameControls({ onDirectionPress, onDirectionRelease, visible = true }: GameControlsProps) {
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
      }

      if (direction) {
        e.preventDefault();
        setActiveDirection(direction);
        onDirectionPress(direction);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
        setActiveDirection(null);
        onDirectionRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onDirectionPress, onDirectionRelease]);

  if (!visible || !isMobile) return null;

  const handleTouchStart = (direction: 'up' | 'down' | 'left' | 'right') => {
    setActiveDirection(direction);
    onDirectionPress(direction);
  };

  const handleTouchEnd = () => {
    setActiveDirection(null);
    onDirectionRelease();
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 select-none">
      {/* D-Pad Container */}
      <div className="relative w-40 h-40">
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40" />

        {/* Up */}
        <button
          onTouchStart={() => handleTouchStart('up')}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('up')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-14 rounded-t-lg transition-all ${
            activeDirection === 'up'
              ? 'bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.8)]'
              : 'bg-cyan-500/30 border border-cyan-500/50'
          }`}
        >
          <div className="text-white text-xl">▲</div>
        </button>

        {/* Down */}
        <button
          onTouchStart={() => handleTouchStart('down')}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('down')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-14 rounded-b-lg transition-all ${
            activeDirection === 'down'
              ? 'bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.8)]'
              : 'bg-cyan-500/30 border border-cyan-500/50'
          }`}
        >
          <div className="text-white text-xl">▼</div>
        </button>

        {/* Left */}
        <button
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-14 h-12 rounded-l-lg transition-all ${
            activeDirection === 'left'
              ? 'bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.8)]'
              : 'bg-cyan-500/30 border border-cyan-500/50'
          }`}
        >
          <div className="text-white text-xl">◀</div>
        </button>

        {/* Right */}
        <button
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-14 h-12 rounded-r-lg transition-all ${
            activeDirection === 'right'
              ? 'bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.8)]'
              : 'bg-cyan-500/30 border border-cyan-500/50'
          }`}
        >
          <div className="text-white text-xl">▶</div>
        </button>
      </div>

      {/* Hint text */}
      <div className="mt-2 text-center text-xs text-cyan-400/60 font-mono">
        TOUCH CONTROLS
      </div>
    </div>
  );
}
