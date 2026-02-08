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
  logo: `${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`,
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={ASSETS.logo} alt="FF" className="w-8 h-8" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
              <span className="font-black text-sm tracking-wider">
                <span style={{ color: '#00f0ff' }}>FAIL</span>
                <span style={{ color: '#ff00ff' }} className="ml-1">FRENZY</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="text-gray-400 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">CLASSEMENT</Link>
            <Link href="/shop" className="text-gray-400 hover:text-[#ff00ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">BOUTIQUE</Link>
            <Link href="/dashboard">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
                <span className="text-[#00f0ff] text-xs font-bold">PROFIL</span>
              </div>
            </Link>
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
          
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 tracking-tight">
              <span style={{ color: '#00f0ff', textShadow: '0 0 30px rgba(0,240,255,0.5)' }}>CHOOSE</span>
              <span className="text-white mx-3">YOUR</span>
              <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>MODE</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-mono tracking-wider">
              SELECT YOUR CHALLENGE AND PROVE YOUR SKILLS
            </p>
          </div>

          {/* Mode Selection */}
          {!selectedMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {modes.map((mode) => (
                <button
                  key={mode.mode.name}
                  onClick={() => handleModeSelect(mode.mode)}
                  className="group relative p-6 sm:p-8 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left"
                  style={{
                    background: `linear-gradient(135deg, ${mode.color}08 0%, #050818 100%)`,
                    borderColor: `${mode.color}30`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${mode.color}80`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${mode.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${mode.color}30`;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${mode.color}15`, border: `1px solid ${mode.color}30` }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={mode.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={mode.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-black tracking-wider mb-2" style={{ color: mode.color }}>
                        {mode.displayName}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                        {mode.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: mode.color }}>
                    <span>SELECT MODE</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Mode Confirmation
            <div className="max-w-2xl mx-auto">
              <div className="p-8 rounded-xl border-2 text-center"
                style={{
                  background: `linear-gradient(135deg, ${modes.find(m => m.mode === selectedMode)?.color}10 0%, #050818 100%)`,
                  borderColor: `${modes.find(m => m.mode === selectedMode)?.color}50`,
                  boxShadow: `0 0 60px ${modes.find(m => m.mode === selectedMode)?.color}15`,
                }}>
                
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{
                    background: `${modes.find(m => m.mode === selectedMode)?.color}20`,
                    border: `2px solid ${modes.find(m => m.mode === selectedMode)?.color}`,
                    boxShadow: `0 0 30px ${modes.find(m => m.mode === selectedMode)?.color}40`,
                  }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={modes.find(m => m.mode === selectedMode)?.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={modes.find(m => m.mode === selectedMode)?.icon} />
                  </svg>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-wider"
                  style={{ color: modes.find(m => m.mode === selectedMode)?.color }}>
                  {modes.find(m => m.mode === selectedMode)?.displayName}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mb-8">
                  {modes.find(m => m.mode === selectedMode)?.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleStartGame}
                    className="px-8 py-4 rounded-lg text-lg font-bold tracking-wider transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(90deg, ${modes.find(m => m.mode === selectedMode)?.color}, ${modes.find(m => m.mode === selectedMode)?.color}CC)`,
                      color: '#050818',
                      boxShadow: `0 0 30px ${modes.find(m => m.mode === selectedMode)?.color}40`,
                    }}
                  >
                    START GAME
                  </button>
                  <button
                    onClick={() => setSelectedMode(null)}
                    className="px-8 py-4 rounded-lg text-lg font-bold tracking-wider transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
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
