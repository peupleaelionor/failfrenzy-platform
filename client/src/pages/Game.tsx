import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { GameCanvas } from '@/game/GameComponents';
import type { GameMode } from '@/game/FailFrenzyGame';
import { AssetLoader, preloadAssets } from '@/game/AssetLoader';
import NavBar from '@/components/NavBar';
import StarField from '@/components/StarField';

const BASE = import.meta.env.BASE_URL;

const MODES: Array<{
  mode: GameMode;
  displayName: string;
  desc: string;
  color: string;
  icon: string;
  bg: string;
}> = [
  {
    mode: { name: 'Classic', description: '3 lives, progressive difficulty', difficulty: 1 },
    displayName: 'CLASSIC',
    desc: '3 vies - Difficulte progressive - Le mode original',
    color: '#00f0ff',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    bg: '03_ENVIRONNEMENTS/BG_Nebuleuse_Spatiale.png',
  },
  {
    mode: { name: 'Time Trial', description: '60 seconds challenge', duration: 60, difficulty: 1.5 },
    displayName: 'TIME TRIAL',
    desc: '60 secondes - Course contre la montre - Score maximum',
    color: '#00ff88',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: '03_ENVIRONNEMENTS/BG_Tunnel_Donnees.png',
  },
  {
    mode: { name: 'Infinite', description: 'Endless mode, no game over', difficulty: 1 },
    displayName: 'INFINITE',
    desc: 'Sans fin - Pas de game over - Repoussez vos limites',
    color: '#ff00ff',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    bg: '03_ENVIRONNEMENTS/BG_Ville_Cyberpunk.png',
  },
  {
    mode: { name: 'Seeds', description: 'Reproducible challenges', seed: 12345, difficulty: 1 },
    displayName: 'SEEDS',
    desc: 'Challenges reproductibles - Partagez vos codes',
    color: '#ffff00',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    bg: '03_ENVIRONNEMENTS/Planete_X_Destination.png',
  },
];

export default function Game() {
  const [selectedModeName, setSelectedModeName] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [assets, setAssets] = useState<AssetLoader | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const selectedModeData = useMemo(() => {
    if (!selectedModeName) return null;
    return MODES.find((m) => m.mode.name === selectedModeName) || null;
  }, [selectedModeName]);

  const selectedMode = selectedModeData?.mode || null;

  const handleModeSelect = async (modeName: string) => {
    setSelectedModeName(modeName);
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
    if (selectedMode) setGameStarted(true);
  };

  const handleBackToModes = () => {
    setGameStarted(false);
    setSelectedModeName(null);
  };

  if (gameStarted && selectedMode && assets && !isLoading) {
    return (
      <div className="min-h-screen bg-[#050818]">
        <GameCanvas
          mode={selectedMode}
          assets={assets}
          onGameOver={() => handleBackToModes()}
        />
      </div>
    );
  }

  const sc = selectedModeData?.color || '#00f0ff';
  const bgMode = hoveredMode
    ? MODES.find((m) => m.mode.name === hoveredMode)?.bg
    : selectedModeData?.bg;

  return (
    <div className="min-h-screen bg-[#050818] text-white overflow-hidden">
      <NavBar />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="absolute inset-0 overflow-hidden">
          {bgMode && (
            <div
              className="absolute inset-0 opacity-20 transition-opacity duration-700"
              style={{
                backgroundImage: `url(${BASE}${bgMode})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(4px) saturate(1.2)',
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px), linear-gradient(0deg, rgba(0,240,255,0.02) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050818] via-transparent to-[#050818]" />
        </div>

        <StarField count={20} />

        <div className="relative z-10 w-full max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black mb-3 tracking-tighter"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #00f0ff 60%, #0080ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.3))',
              }}
            >
              {selectedModeName ? selectedModeData?.displayName : 'SELECTIONNEZ UN MODE'}
            </h1>
            {!selectedModeName && (
              <p className="text-gray-500 text-sm font-mono tracking-wider">
                Choisissez votre mission dans le Vide Stellaire
              </p>
            )}
          </div>

          {!selectedModeName ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {MODES.map((mode) => (
                <button
                  key={mode.mode.name}
                  onClick={() => handleModeSelect(mode.mode.name)}
                  onMouseEnter={() => setHoveredMode(mode.mode.name)}
                  onMouseLeave={() => setHoveredMode(null)}
                  className="group relative p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${mode.color}12 0%, rgba(5,8,24,0.9) 100%)`,
                    border: `1px solid ${mode.color}30`,
                    boxShadow: `0 0 30px ${mode.color}15`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${mode.color}10 0%, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: `${mode.color}18`,
                          border: `1px solid ${mode.color}40`,
                          boxShadow: `0 0 20px ${mode.color}25`,
                        }}
                      >
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={mode.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={mode.icon} />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-2xl sm:text-3xl font-black tracking-wider mb-2"
                          style={{
                            color: mode.color,
                            textShadow: `0 0 20px ${mode.color}60`,
                          }}
                        >
                          {mode.displayName}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                          {mode.desc}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 text-xs font-bold tracking-wider opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ color: mode.color }}
                    >
                      <span>SELECTIONNER</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div
                className="p-10 rounded-2xl text-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${sc}15 0%, rgba(10,15,40,0.98) 100%)`,
                  border: `2px solid ${sc}60`,
                  boxShadow: `0 0 60px ${sc}25, inset 0 0 40px ${sc}08`,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${sc}, transparent)`,
                  }}
                />

                <div
                  className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center"
                  style={{
                    background: `${sc}20`,
                    border: `2px solid ${sc}60`,
                    boxShadow: `0 0 40px ${sc}40`,
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={sc}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={selectedModeData?.icon} />
                  </svg>
                </div>

                <h2
                  className="text-4xl sm:text-5xl font-black mb-4 tracking-wider"
                  style={{ color: sc, textShadow: `0 0 30px ${sc}80` }}
                >
                  {selectedModeData?.displayName}
                </h2>
                <p className="text-gray-300 text-base sm:text-lg mb-10 font-medium">
                  {selectedModeData?.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleStartGame}
                    disabled={isLoading}
                    className="relative px-14 py-5 rounded-xl text-xl sm:text-2xl font-black tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${sc}, ${sc}DD)`,
                      color: '#050818',
                      boxShadow: `0 0 50px ${sc}60, 0 8px 30px rgba(0,0,0,0.5)`,
                      border: `2px solid ${sc}`,
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-3">
                        <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {Math.round(loadProgress * 100)}%
                      </span>
                    ) : (
                      'START'
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedModeName(null)}
                    className="px-10 py-5 rounded-xl text-lg font-black tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    RETOUR
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/dashboard">
              <button
                className="px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105"
                style={{
                  background: 'rgba(0,255,136,0.08)',
                  border: '1px solid rgba(0,255,136,0.2)',
                  color: '#00ff88',
                }}
              >
                MON PROFIL
              </button>
            </Link>
            <Link href="/leaderboard">
              <button
                className="px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,215,0,0.08)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  color: '#ffd700',
                }}
              >
                CLASSEMENT
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
