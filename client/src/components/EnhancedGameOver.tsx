/**
 * FAIL FRENZY — ENHANCED GAME OVER SCREEN v3.0 (Phase 3)
 * 
 * Immersif, animé, bien-être joueur
 * Toujours afficher: Échos récupérés, Contribution Xylos, Message positif
 */

import React, { useEffect, useState, useRef } from 'react';
import { getXylosSystem } from '../systems/XylosSystem';
import { getSelectedSkin } from '../systems/GameplaySkinSystem';

interface EnhancedGameOverProps {
  score: number;
  time: number;
  fails: number;
  combo: number;
  onRestart: () => void;
  onMenu: () => void;
}

const POSITIVE_MESSAGES = [
  'FAILURE CONVERTED TO DATA',
  'EVERY RUN MATTERS',
  'XYLOS REMEMBERS',
  'PROGRESS LOGGED',
  'YOU\'RE LEARNING',
  'DATA COLLECTED',
  'CONTRIBUTION ACCEPTED',
  'KEEP GOING',
  'THE CORE GROWS STRONGER',
  'NOTHING IS WASTED',
  'EACH ECHO COUNTS',
  'YOUR SIGNAL WAS RECEIVED',
];

const RANK_MESSAGES: Record<string, string> = {
  S: 'LEGENDARY PERFORMANCE',
  A: 'EXCEPTIONAL RUN',
  B: 'SOLID PERFORMANCE',
  C: 'DECENT ATTEMPT',
  D: 'ROOM TO GROW',
  F: 'XYLOS STILL BELIEVES IN YOU',
};

function getRank(score: number, combo: number, time: number): string {
  const total = score + combo * 50 + time * 10;
  if (total > 5000) return 'S';
  if (total > 3000) return 'A';
  if (total > 1500) return 'B';
  if (total > 500) return 'C';
  if (total > 100) return 'D';
  return 'F';
}

const RANK_COLORS: Record<string, string> = {
  S: '#ffd700', A: '#00ff88', B: '#00f0ff',
  C: '#ffffff', D: '#aaaaaa', F: '#ff4444',
};

export const EnhancedGameOver: React.FC<EnhancedGameOverProps> = ({
  score, time, fails, combo, onRestart, onMenu,
}) => {
  const xylos = getXylosSystem();
  const xylosData = xylos.getData();
  const skin = getSelectedSkin();
  const [visible, setVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showXylos, setShowXylos] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [countScore, setCountScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const echoesThisRun = Math.floor(fails * skin.modifiers.xylosEchoMultiplier);
  const lightThisRun = Math.floor(score * 0.5);
  const rank = getRank(score, combo, time);
  const rankColor = RANK_COLORS[rank];
  const randomMessage = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
  const xylosColor = xylos.getStateColor();

  // Staggered entrance animations
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setShowStats(true), 600);
    setTimeout(() => setShowXylos(true), 1200);
    setTimeout(() => setShowActions(true), 1800);
  }, []);

  // Score counter animation
  useEffect(() => {
    if (!showStats) return;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountScore(Math.floor(score * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [showStats, score]);

  // Background particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random() * 1,
        size: 1 + Math.random() * 3,
        alpha: 0.1 + Math.random() * 0.4,
        color: [xylosColor, '#00f0ff', '#ff00ff', rankColor][Math.floor(Math.random() * 4)],
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [xylosColor, rankColor]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${visible ? 'bg-black/90' : 'bg-transparent'}`}>
      {/* Background particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className={`relative max-w-2xl w-full mx-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* RANK BADGE */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <span className="text-8xl font-black" style={{ 
              color: rankColor, 
              textShadow: `0 0 40px ${rankColor}, 0 0 80px ${rankColor}40`,
              fontFamily: '"Courier New", monospace',
            }}>
              {rank}
            </span>
            <div className="absolute -inset-4 rounded-full opacity-20 animate-ping" style={{ background: rankColor }} />
          </div>
          <h1 className="text-3xl font-bold text-white mt-2 tracking-wider font-mono">
            RUN COMPLETE
          </h1>
          <p className="text-lg text-gray-400 font-mono mt-1">{RANK_MESSAGES[rank]}</p>
        </div>

        {/* STATS GRID */}
        <div className={`grid grid-cols-2 gap-3 mb-6 transition-all duration-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg border border-cyan-500/30" style={{ boxShadow: '0 0 15px rgba(0,240,255,0.1)' }}>
            <div className="text-xs text-gray-500 mb-1 font-mono">SCORE</div>
            <div className="text-3xl font-black text-white font-mono">{countScore.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg border border-cyan-500/30">
            <div className="text-xs text-gray-500 mb-1 font-mono">TIME</div>
            <div className="text-3xl font-black text-white font-mono">{time.toFixed(1)}s</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg border border-yellow-500/30">
            <div className="text-xs text-gray-500 mb-1 font-mono">MAX COMBO</div>
            <div className="text-3xl font-black font-mono" style={{ color: '#ffd700' }}>x{combo}</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg border border-red-500/30">
            <div className="text-xs text-gray-500 mb-1 font-mono">FAILS</div>
            <div className="text-3xl font-black text-red-400 font-mono">{fails}</div>
          </div>
        </div>

        {/* XYLOS CONTRIBUTION */}
        <div className={`mb-6 p-5 rounded-lg border-2 transition-all duration-500 ${showXylos ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
             style={{ 
               borderColor: xylosColor, 
               background: `linear-gradient(135deg, ${xylosColor}15 0%, rgba(0,0,0,0.8) 100%)`,
               boxShadow: `0 0 30px ${xylosColor}20`,
             }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-mono" style={{ color: xylosColor }}>
              XYLOS CONTRIBUTION
            </h2>
            <span className="text-xs px-3 py-1 rounded-full font-mono font-bold" style={{ 
              background: `${xylosColor}20`, 
              color: xylosColor,
              border: `1px solid ${xylosColor}40`,
            }}>
              {xylosData.currentState.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 font-mono">ECHOES RECOVERED</div>
              <div className="text-2xl font-black text-purple-400 font-mono">+{echoesThisRun}</div>
              <div className="text-xs text-gray-600 font-mono">Total: {xylosData.totalEchoes}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 font-mono">LIGHT ABSORBED</div>
              <div className="text-2xl font-black font-mono" style={{ color: xylosColor }}>+{lightThisRun}</div>
              <div className="text-xs text-gray-600 font-mono">Total: {Math.floor(xylosData.totalLight)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ 
              width: `${xylosData.stateProgress}%`,
              background: `linear-gradient(90deg, ${xylosColor}, ${xylosColor}cc)`,
              boxShadow: `0 0 10px ${xylosColor}`,
            }} />
          </div>
          <div className="text-center text-xs text-gray-500 mt-2 font-mono">
            Next state: {Math.floor(xylosData.stateProgress)}%
          </div>
        </div>

        {/* SKIN INFO */}
        {skin.id !== 'standard' && (
          <div className={`mb-4 p-3 bg-gray-900/60 rounded-lg border border-gray-700/50 transition-all duration-500 ${showXylos ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">{skin.name}</span>
              <span className="text-xs text-gray-500 font-mono">{skin.keyMessage}</span>
            </div>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-green-400 font-mono">+ {skin.bonusText}</span>
              <span className="text-xs text-red-400 font-mono">- {skin.malusText}</span>
            </div>
          </div>
        )}

        {/* POSITIVE MESSAGE */}
        <div className={`text-center mb-6 transition-all duration-500 ${showXylos ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm font-mono tracking-widest" style={{ color: xylosColor }}>
            {randomMessage}
          </p>
        </div>

        {/* ACTIONS */}
        <div className={`flex gap-4 transition-all duration-500 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <button
            onClick={onRestart}
            className="flex-1 py-4 font-black text-lg rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-mono tracking-wider"
            style={{ 
              background: `linear-gradient(135deg, ${xylosColor}, ${xylosColor}cc)`,
              boxShadow: `0 0 30px ${xylosColor}40`,
              color: '#000',
            }}
          >
            RESTART
          </button>
          <button
            onClick={onMenu}
            className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white font-black text-lg rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-mono tracking-wider border border-gray-600"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
};
