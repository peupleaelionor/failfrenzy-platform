/**
 * FAIL FRENZY - Game Page
 * Mode selection + Full Canvas game integration with neon HUD
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
// Auth removed for standalone mode
import { GameCanvas } from '@/game/GameComponents';
import type { GameMode } from '@/game/FailFrenzyGame';
import { AssetLoader, preloadAssets } from '@/game/AssetLoader';

const BASE = import.meta.env.BASE_URL;
const ASSETS = {
  logo: `${BASE}logo-skull-glitch.png`,
};

export default function Game() {
  const isAuthenticated = false; // Standalone mode
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [assets, setAssets] = useState<AssetLoader | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const modes: Array<{ mode: GameMode; displayName: string; desc: string; color: string; icon: string }> = [
    {
      mode: { name: 'Classic', description: '3 lives, progressive difficulty', difficulty: 1 },
      displayName: 'CLASSIC',
      desc: '3 vies • Difficulté progressive • Mode original',
      color: '#00f0ff',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    },
    {
      mode: { name: 'Time Trial', description: '60 seconds challenge', duration: 60, difficulty: 1.5 },
      displayName: 'TIME TRIAL',
      desc: '60 secondes • Course contre la montre • Maximum de points',
      color: '#00ff88',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      mode: { name: 'Infinite', description: 'Endless mode, no game over', difficulty: 1 },
      displayName: 'INFINITE',
      desc: 'Sans fin • Pas de game over • Score illimité',
      color: '#ff00ff',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    },
    {
      mode: { name: 'Seeds', description: 'Reproducible challenges', seed: 12345, difficulty: 1 },
      displayName: 'SEEDS',
      desc: 'Challenges reproductibles • Partage de codes • Compétition',
      color: '#ffff00',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
  ];

  const handleModeSelect = async (mode: GameMode) => {
    // Mode invité : pas besoin d'authentification pour jouer
    setSelectedMode(mode);
    if (assets) return;
    setIsLoading(true);
    try {
      const loaded = await preloadAssets((l, t) => setLoadProgress(l / t));
      setAssets(loaded);
    } catch {
      setAssets(new AssetLoader());
    }
    setIsLoading(false);
  };

  const handleStartGame = () => {
    if (selectedMode) {
      setGameStarted(true);
    }
  };

  const handleBackToModes = () => {
    setGameStarted(false);
    setSelectedMode(null);
  };

  // Si le jeu est démarré, afficher le composant de jeu
  if (gameStarted && selectedMode && assets && !isLoading) {
    return (
      <div className="min-h-screen bg-[#050818]">
        <GameCanvas
          mode={selectedMode}
          assets={assets}
          onGameOver={(score) => {
            console.log('Game Over! Score:', score);
            handleBackToModes();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050818] text-white overflow-hidden">
      
      {/* === NAV BAR === */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3" style={{ background: 'rgba(5,8,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ASSETS.logo} alt="FF" className="w-12 h-12" style={{ filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.6))' }} />
            <span className="font-black text-xl tracking-wider">
              <span style={{ color: '#00f0ff' }}>FAIL</span>
              <span style={{ color: '#ff00ff' }} className="ml-1">FRENZY</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(255,215,0,0.1)', border: '2px solid rgba(255,215,0,0.3)' }}>
              <span className="text-gray-400 text-sm font-bold mr-2">BEST</span>
              <span className="text-[#ffd700] text-xl font-black">{localStorage.getItem('failfrenzy_highscore') || '0'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0,240,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050818] via-transparent to-[#050818]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#00f0ff', '#ff00ff', '#ffff00'][i % 3],
                boxShadow: `0 0 ${8 + Math.random() * 12}px currentColor`,
                animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto">
          
          {/* Logo Central + Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <img src={ASSETS.logo} alt="Fail Frenzy" className="w-48 h-48 sm:w-64 sm:h-64" style={{ filter: 'drop-shadow(0 0 40px rgba(0,240,255,0.6))' }} />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-3 tracking-tight" style={{
              background: 'linear-gradient(90deg, #00f0ff 0%, #0080ff 25%, #ff00ff 75%, #ff0080 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(0,240,255,0.4)'
            }}>
              SELECT MODE
            </h1>
          </div>

          {/* Mode Selection */}
          {!selectedMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {modes.map((mode) => (
                <button
                  key={mode.mode.name}
                  onClick={() => handleModeSelect(mode.mode)}
                  className="group relative p-6 sm:p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] text-left"
                  style={{
                    background: `linear-gradient(135deg, ${mode.color}20 0%, rgba(5,8,24,0.8) 100%)`,
                    borderColor: `${mode.color}`,
                    boxShadow: `0 0 30px ${mode.color}40`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 50px ${mode.color}80, inset 0 0 30px ${mode.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${mode.color}40`;
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${mode.color}30`, border: `2px solid ${mode.color}`, boxShadow: `0 0 20px ${mode.color}50` }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mode.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={mode.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl sm:text-3xl font-black tracking-wider mb-2" style={{ color: mode.color, textShadow: `0 0 20px ${mode.color}80` }}>
                        {mode.displayName}
                      </h3>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                        {mode.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold tracking-wider opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{ color: mode.color }}>
                    <span>SELECT MODE</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Mode Confirmation - BOUTONS ULTRA VISIBLES
            <div className="max-w-2xl mx-auto">
              <div className="p-10 rounded-2xl border-4 text-center"
                style={{
                  background: `linear-gradient(135deg, ${modes.find(m => m.mode === selectedMode)?.color}25 0%, rgba(5,8,24,0.95) 100%)`,
                  borderColor: `${modes.find(m => m.mode === selectedMode)?.color}`,
                  boxShadow: `0 0 80px ${modes.find(m => m.mode === selectedMode)?.color}60, inset 0 0 40px ${modes.find(m => m.mode === selectedMode)?.color}15`,
                }}>
                
                <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center"
                  style={{
                    background: `${modes.find(m => m.mode === selectedMode)?.color}40`,
                    border: `3px solid ${modes.find(m => m.mode === selectedMode)?.color}`,
                    boxShadow: `0 0 40px ${modes.find(m => m.mode === selectedMode)?.color}80`,
                  }}>
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke={modes.find(m => m.mode === selectedMode)?.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={modes.find(m => m.mode === selectedMode)?.icon} />
                  </svg>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-wider"
                  style={{ color: modes.find(m => m.mode === selectedMode)?.color, textShadow: `0 0 30px ${modes.find(m => m.mode === selectedMode)?.color}` }}>
                  {modes.find(m => m.mode === selectedMode)?.displayName}
                </h2>
                <p className="text-gray-200 text-base sm:text-lg mb-10 font-medium">
                  {modes.find(m => m.mode === selectedMode)?.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  {/* BOUTON START GAME - ULTRA VISIBLE */}
                  <button
                    onClick={handleStartGame}
                    disabled={isLoading}
                    className="relative px-12 py-5 rounded-xl text-xl sm:text-2xl font-black tracking-widest transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${modes.find(m => m.mode === selectedMode)?.color}, ${modes.find(m => m.mode === selectedMode)?.color}DD)`,
                      color: '#050818',
                      boxShadow: `0 0 50px ${modes.find(m => m.mode === selectedMode)?.color}80, 0 10px 30px rgba(0,0,0,0.5)`,
                      border: `3px solid ${modes.find(m => m.mode === selectedMode)?.color}`,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {isLoading ? `LOADING ${Math.round(loadProgress * 100)}%` : 'START GAME'}
                  </button>
                  
                  {/* BOUTON BACK - BIEN VISIBLE */}
                  <button
                    onClick={() => setSelectedMode(null)}
                    className="px-10 py-5 rounded-xl text-xl font-black tracking-widest transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '3px solid rgba(255,255,255,0.4)',
                      color: '#ffffff',
                      boxShadow: '0 0 30px rgba(255,255,255,0.2)',
                    }}
                  >
                    BACK
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-15px) scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
