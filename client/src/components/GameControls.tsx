/**
 * GAME CONTROLS v3.0 — Touch Joystick + Keyboard
 * 
 * Mobile: Joystick virtuel (gauche) + bouton action (droite)
 * Desktop: Flèches / WASD
 * 
 * Feature flag: FEATURE_TOUCH_CONTROLS
 */

import { useEffect, useState, useRef, useCallback } from 'react';

export interface ControlState {
  dx: number;  // -1 to 1 horizontal
  dy: number;  // -1 to 1 vertical
  active: boolean;
}

interface GameControlsProps {
  onControlUpdate: (state: ControlState) => void;
  visible?: boolean;
}

export function GameControls({ onControlUpdate, visible = true }: GameControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  const keysDown = useRef<Set<string>>(new Set());

  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || ('ontouchstart' in window);
    setIsMobile(mobile);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysDown.current.add(key);
        updateFromKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDown.current.delete(key);
      updateFromKeys();
    };

    const updateFromKeys = () => {
      const keys = keysDown.current;
      let dx = 0, dy = 0;
      if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
      if (keys.has('arrowright') || keys.has('d')) dx += 1;
      if (keys.has('arrowup') || keys.has('w')) dy -= 1;
      if (keys.has('arrowdown') || keys.has('s')) dy += 1;
      onControlUpdate({ dx, dy, active: dx !== 0 || dy !== 0 });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onControlUpdate]);

  // Touch joystick handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;
    joystickCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setJoystickActive(true);
    handleTouchMove(e);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickCenter.current) return;
    const touch = e.touches[0];
    const maxRadius = 40;
    let dx = touch.clientX - joystickCenter.current.x;
    let dy = touch.clientY - joystickCenter.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setJoystickPos({ x: dx, y: dy });
    onControlUpdate({
      dx: dx / maxRadius,
      dy: dy / maxRadius,
      active: dist > 5,
    });
  }, [onControlUpdate]);

  const handleTouchEnd = useCallback(() => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    onControlUpdate({ dx: 0, dy: 0, active: false });
  }, [onControlUpdate]);

  if (!visible || !isMobile) return null;

  return (
    <>
      {/* Joystick Zone (left side) */}
      <div
        ref={joystickRef}
        className="fixed bottom-8 left-8 z-50 select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Joystick base */}
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(0,240,255,0.08)',
            border: `2px solid rgba(0,240,255,${joystickActive ? '0.5' : '0.2'})`,
            boxShadow: joystickActive ? '0 0 30px rgba(0,240,255,0.3)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Direction indicators */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-cyan-500/30 text-xs font-mono">▲</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-cyan-500/30 text-xs font-mono">▼</div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-cyan-500/30 text-xs font-mono">◀</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500/30 text-xs font-mono">▶</div>

          {/* Joystick thumb */}
          <div
            className="w-12 h-12 rounded-full transition-all duration-75"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
              background: joystickActive
                ? 'radial-gradient(circle, rgba(0,240,255,0.8) 0%, rgba(0,240,255,0.3) 100%)'
                : 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, rgba(0,240,255,0.1) 100%)',
              boxShadow: joystickActive ? '0 0 20px rgba(0,240,255,0.6)' : '0 0 10px rgba(0,240,255,0.2)',
              border: '2px solid rgba(0,240,255,0.5)',
            }}
          />
        </div>
      </div>

      {/* Hint */}
      <div className="fixed bottom-2 left-8 z-50 text-[10px] text-cyan-500/30 font-mono select-none">
        TOUCH TO MOVE
      </div>
    </>
  );
}
