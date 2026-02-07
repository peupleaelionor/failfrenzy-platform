/**
 * FAIL FRENZY PREMIUM v6.0 — Game Components
 * Ecran Game Over premium : emotion -> ego -> action -> argent
 * Systeme de skins, leaderboard regional, micro-phrases UX
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FailFrenzyGame, GameMode } from './FailFrenzyGame';
import { GameState } from '../engine/GameEngine';
import { AssetLoader, preloadAssets } from './AssetLoader';
import { Link } from 'wouter';
import {
  SKINS, SkinDefinition, getSelectedSkin, getSelectedSkinId, setSelectedSkin,
  isSkinUnlocked, updatePlayerStats, renderSkinPreview, getAllSkins,
} from './SkinSystem';
import {
  generateLeaderboard, getCountryTop, getPlayerCountryRank, getPlayerEuropeRank,
  getContextualPhrase, getGameOverSubtext, getContinueSubtext, type LeaderboardEntry,
} from './UXPhrases';

const BASE = import.meta.env.BASE_URL;

// ==================== SKIN PREVIEW CANVAS ====================

const SkinPreviewCanvas: React.FC<{ skin: SkinDefinition; size?: number }> = ({ skin, size = 80 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const t0 = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = size * 2;
    canvas.height = size * 2;
    const draw = () => {
      const t = (Date.now() - t0.current) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderSkinPreview(ctx, skin, size, size, size * 1.4, t);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [skin, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

// ==================== LOADING SCREEN ====================

const LoadingScreen: React.FC<{ progress: number }> = ({ progress }) => {
  const pct = Math.round(progress * 100);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 rounded-xl" style={{ background: '#050818' }}>
      <div className="mb-8">
        <img src={`${BASE}images/assets/logo-skull-256.png`} alt="" className="w-24 h-auto sm:w-32 mx-auto"
          style={{ filter: 'drop-shadow(0 0 30px rgba(0,240,255,0.6))', animation: 'ffSpin 3s linear infinite' }} />
      </div>
      <div className="w-48 sm:w-64 h-2 rounded-full overflow-hidden mb-3"
        style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00f0ff, #ff00ff)', boxShadow: '0 0 15px rgba(0,240,255,0.5)' }} />
      </div>
      <p className="text-xs sm:text-sm font-mono tracking-widest" style={{ color: '#00f0ff' }}>LOADING {pct}%</p>
      <style>{`@keyframes ffSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ==================== GAME OVER SCREEN ====================

interface GameOverProps {
  score: number;
  fails: number;
  time: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverProps> = ({ score, fails, time, onRestart }) => {
  const [visible, setVisible] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0);
  const [showLB, setShowLB] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [skinId, setSkinId] = useState(getSelectedSkinId());

  const board = useMemo(() => generateLeaderboard(score), [score]);
  const top5 = useMemo(() => getCountryTop(board, 5), [board]);
  const cRank = useMemo(() => getPlayerCountryRank(board), [board]);
  const eRank = useMemo(() => getPlayerEuropeRank(board), [board]);
  const phrase = useMemo(() => getContextualPhrase(score, fails, time, board), [score, fails, time, board]);
  const sub = useMemo(() => getGameOverSubtext(score, fails, time), [score, fails, time]);
  const contText = useMemo(() => getContinueSubtext(cRank), [cRank]);
  const curSkin = useMemo(() => SKINS.find(s => s.id === skinId) || SKINS[0], [skinId]);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  useEffect(() => { updatePlayerStats(score, time); }, [score, time]);

  // Score count-up
  useEffect(() => {
    if (!visible) return;
    const dur = 800;
    const s = Date.now();
    const anim = () => {
      const p = Math.min((Date.now() - s) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setScoreAnim(Math.floor(score * e));
      if (p < 1) requestAnimationFrame(anim);
    };
    setTimeout(anim, 200);
  }, [visible, score]);

  // Leaderboard slide-in delay
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setShowLB(true), 600);
    return () => clearTimeout(t);
  }, [visible]);

  const pickSkin = (id: string) => {
    if (isSkinUnlocked(id)) { setSelectedSkin(id); setSkinId(id); }
  };

  const share = () => {
    const txt = `Fail Frenzy — Score ${score} | Fails ${fails} | ${time.toFixed(1)}s | #${cRank} France`;
    if (navigator.share) navigator.share({ title: 'Fail Frenzy: The Loop', text: txt, url: location.href });
    else navigator.clipboard.writeText(txt);
  };

  const phraseColor = phrase.category === 'ego' ? '#ff2d7b' : phrase.category === 'pride' ? '#ffd700' : '#00f0ff';

  return (
    <div className="absolute inset-0 flex items-start justify-center rounded-xl z-20 overflow-y-auto"
      style={{ background: 'rgba(5,8,24,0.96)', backdropFilter: 'blur(16px)', opacity: visible ? 1 : 0, transition: 'opacity 0.4s' }}>
      <div className="text-center px-4 sm:px-6 w-full max-w-sm py-5 sm:py-6">

        {/* 1. GAME OVER */}
        <h2 className="text-3xl sm:text-4xl font-black mb-0.5 tracking-tight"
          style={{ color: '#ff2d7b', textShadow: '0 0 40px rgba(255,45,123,0.5)' }}>GAME OVER</h2>
        <p className="text-gray-500 text-[11px] sm:text-xs font-mono mb-4">{sub}</p>

        {/* 2. SCORE (gros, anime) */}
        <div className="mb-3" style={{ transform: visible ? 'scale(1)' : 'scale(0.5)', transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s' }}>
          <div className="text-5xl sm:text-6xl font-black text-white leading-none"
            style={{ textShadow: '0 0 30px rgba(0,240,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>
            {scoreAnim}
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono tracking-[0.3em] mt-1" style={{ color: '#00f0ff' }}>POINTS</div>
        </div>

        {/* 3. STATS COMPACT */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <span><span style={{ color: '#ff2d7b' }}>Fails</span> <span className="text-white font-bold">{fails}</span></span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <span><span style={{ color: '#00ff88' }}>Time</span> <span className="text-white font-bold">{time.toFixed(1)}s</span></span>
        </div>

        {/* 4. LEADERBOARD REGIONAL */}
        <div className="mb-3" style={{ transform: showLB ? 'translateX(0)' : 'translateX(40px)', opacity: showLB ? 1 : 0, transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.12)' }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(0,240,255,0.08)' }}>
              <span className="text-[10px] sm:text-xs font-bold tracking-wider" style={{ color: '#ffd700' }}>TOP 5 FRANCE</span>
              <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>#{eRank} Europe</span>
            </div>
            <div className="px-2 py-1.5">
              {top5.map((e) => {
                const me = e.name === 'YOU';
                return (
                  <div key={`${e.rank}-${e.name}`} className="flex items-center justify-between py-1 px-1.5 rounded-md mb-0.5"
                    style={{ background: me ? 'rgba(0,240,255,0.08)' : 'transparent', border: me ? '1px solid rgba(0,240,255,0.2)' : '1px solid transparent' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-bold w-5 text-right" style={{ color: e.rank <= 3 ? '#ffd700' : 'rgba(255,255,255,0.3)' }}>{e.rank}</span>
                      <span className="text-[10px] sm:text-xs font-mono" style={{ color: me ? '#00f0ff' : 'rgba(255,255,255,0.6)' }}>{me ? 'YOU' : e.name}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold" style={{ color: me ? '#00f0ff' : 'rgba(255,255,255,0.4)' }}>{e.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. CALL EMOTIONNEL */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm font-bold" style={{ color: phraseColor, textShadow: `0 0 15px ${phraseColor}66` }}>{phrase.text}</p>
        </div>

        {/* 6. PLAY AGAIN */}
        <button onClick={onRestart}
          className="w-full max-w-xs mx-auto block py-3.5 font-black text-base rounded-xl transition-all hover:scale-105 active:scale-95 mb-2.5"
          style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', color: '#000', boxShadow: '0 0 30px rgba(0,240,255,0.25)', letterSpacing: '0.05em' }}>
          PLAY AGAIN
        </button>

        {/* 7. CONTINUER (monetisation soft) */}
        <button onClick={onRestart}
          className="w-full max-w-xs mx-auto block py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 mb-4"
          style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="text-sm font-bold" style={{ color: '#ffd700' }}>CONTINUER</span>
          <span className="block text-[9px] font-mono mt-0.5" style={{ color: 'rgba(255,215,0,0.5)' }}>{contText} — Pub ou 1 token</span>
        </button>

        {/* 8. SKIN PREVIEW */}
        <div className="mb-3">
          <button onClick={() => setShowSkins(!showSkins)}
            className="flex items-center justify-center gap-2 mx-auto px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SkinPreviewCanvas skin={curSkin} size={28} />
            <span className="text-[10px] sm:text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>Changer de style</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"
              style={{ transform: showSkins ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
          {showSkins && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ background: 'rgba(10,14,39,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Free skins */}
              <div className="px-2 pt-2 pb-1">
                <div className="text-[8px] font-mono tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>GRATUITS</div>
                <div className="grid grid-cols-5 gap-1">
                  {SKINS.filter(s => s.tier === 'free').map(s => {
                    const ok = isSkinUnlocked(s.id);
                    const sel = s.id === skinId;
                    return (
                      <button key={s.id} onClick={() => pickSkin(s.id)}
                        className="flex flex-col items-center p-1 rounded-lg transition-all"
                        style={{ background: sel ? 'rgba(0,240,255,0.1)' : 'transparent', border: sel ? '1px solid rgba(0,240,255,0.3)' : '1px solid transparent', opacity: ok ? 1 : 0.35, cursor: ok ? 'pointer' : 'default' }}>
                        <SkinPreviewCanvas skin={s} size={28} />
                        <span className="text-[7px] font-mono mt-0.5" style={{ color: ok ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>{s.name.split(' ')[0]}</span>
                        {!ok && <span className="text-[6px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.unlock.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Premium skins */}
              <div className="px-2 pt-1 pb-2" style={{ borderTop: '1px solid rgba(255,215,0,0.1)' }}>
                <div className="text-[8px] font-mono tracking-wider mb-1" style={{ color: '#ffd700' }}>PREMIUM</div>
                <div className="grid grid-cols-5 gap-1">
                  {SKINS.filter(s => s.tier === 'premium').map(s => {
                    const ok = isSkinUnlocked(s.id);
                    const sel = s.id === skinId;
                    return (
                      <button key={s.id} onClick={() => pickSkin(s.id)}
                        className="relative flex flex-col items-center p-1 rounded-lg transition-all"
                        style={{ background: sel ? 'rgba(255,215,0,0.1)' : 'transparent', border: sel ? '1px solid rgba(255,215,0,0.3)' : '1px solid transparent', opacity: ok ? 1 : 0.4, cursor: ok ? 'pointer' : 'default' }}>
                        <SkinPreviewCanvas skin={s} size={28} />
                        <span className="text-[7px] font-mono mt-0.5" style={{ color: ok ? '#ffd700' : 'rgba(255,215,0,0.4)' }}>{s.name.split(' ')[0]}</span>
                        {!ok && <span className="text-[6px] font-bold" style={{ color: '#ffd700' }}>{s.unlock.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 9. SHARE */}
        <button onClick={share}
          className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg transition-all hover:scale-105"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
          </svg>
          <span className="text-[10px] sm:text-xs font-mono">Partager mon score</span>
        </button>

      </div>
    </div>
  );
};

// ==================== GAME CANVAS ====================

interface GameCanvasProps {
  mode: GameMode;
  assets: AssetLoader;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, fails: number, time: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ mode, assets, onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<FailFrenzyGame | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState<{ score: number; fails: number; time: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new FailFrenzyGame('game-canvas', mode, assets);
    gameRef.current = game;
    game.start();

    const iv = setInterval(() => {
      const st = game.getState();
      setGameState(st);
      if (onScoreUpdate) onScoreUpdate(st.score);
      if (st.isGameOver && !showGameOver) {
        setShowGameOver(true);
        setFinalStats({ score: st.score, fails: st.fails, time: st.time });
        if (onGameOver) onGameOver(st.score, st.fails, st.time);
        try {
          const key = 'failfrenzy_highscores';
          const ex = JSON.parse(localStorage.getItem(key) || '{}');
          const mn = mode.name || 'classic';
          if (!ex[mn] || st.score > ex[mn]) { ex[mn] = st.score; localStorage.setItem(key, JSON.stringify(ex)); }
        } catch {}
      }
    }, 100);

    return () => { clearInterval(iv); game.destroy(); };
  }, [mode, assets]);

  const handlePause = useCallback(() => {
    if (!gameRef.current) return;
    isPaused ? gameRef.current.resume() : gameRef.current.pause();
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleRestart = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.restart();
    setIsPaused(false);
    setShowGameOver(false);
    setFinalStats(null);
  }, []);

  return (
    <div className="game-canvas-container relative w-full max-w-[900px] mx-auto">
      <canvas id="game-canvas" ref={canvasRef} className="w-full rounded-xl"
        style={{ aspectRatio: '16/10', border: '2px solid rgba(0,240,255,0.3)', boxShadow: '0 0 40px rgba(0,240,255,0.15), inset 0 0 40px rgba(0,0,0,0.5)', background: '#050818', touchAction: 'none' }} />

      {/* HUD Top */}
      {gameState && !showGameOver && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3 py-1.5 rounded-lg backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,240,255,0.3)' }}>
              <span className="text-[10px] sm:text-xs text-gray-500 font-mono block leading-none">SCORE</span>
              <span className="text-lg sm:text-xl font-black text-white leading-none" style={{ textShadow: '0 0 15px rgba(0,240,255,0.6)' }}>{gameState.score}</span>
            </div>
            {gameState.combo > 1 && (
              <div className="px-2 py-1 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,0,0.15)', border: '1px solid rgba(255,255,0,0.4)' }}>
                <span className="text-sm sm:text-base font-black" style={{ color: '#ffff00', textShadow: '0 0 10px rgba(255,255,0,0.8)' }}>x{gameState.combo}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <button onClick={handlePause} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg backdrop-blur-md transition-all hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,240,255,0.3)' }}>
              <span className="text-[#00f0ff] text-sm">{isPaused ? '\u25B6' : '\u23F8'}</span>
            </button>
            <button onClick={handleRestart} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg backdrop-blur-md transition-all hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,0,255,0.3)' }}>
              <span className="text-[#ff00ff] text-sm">{'\u21BB'}</span>
            </button>
          </div>
        </div>
      )}

      {/* HUD Bottom */}
      {gameState && !showGameOver && (
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-10">
          <div className="flex gap-2 sm:gap-3">
            <div className="px-2.5 py-1 rounded-lg backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,45,123,0.3)' }}>
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono">FAILS</span>
              <span className="text-sm sm:text-base font-bold text-white ml-1.5">{gameState.fails}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,255,136,0.3)' }}>
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono">TIME</span>
              <span className="text-sm sm:text-base font-bold text-white ml-1.5">{gameState.time.toFixed(1)}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !showGameOver && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl z-20" style={{ background: 'rgba(5,8,24,0.92)', backdropFilter: 'blur(8px)' }}>
          <div className="text-center px-6">
            <img src={`${BASE}images/assets/logo-skull-256.png`} alt="" className="w-16 h-auto mx-auto mb-4 opacity-60" style={{ filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.4))' }} />
            <h2 className="text-4xl sm:text-5xl font-black mb-2" style={{ color: '#00f0ff', textShadow: '0 0 40px rgba(0,240,255,0.6)' }}>PAUSED</h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-8 font-mono">Take a breath. The neon awaits.</p>
            <div className="flex flex-col gap-3 items-center">
              <button onClick={handlePause} className="w-48 py-3 font-bold text-sm rounded-xl transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #00f0ff, #0080ff)', color: '#000', boxShadow: '0 0 20px rgba(0,240,255,0.3)' }}>RESUME</button>
              <button onClick={handleRestart} className="w-48 py-3 font-bold text-sm rounded-xl transition-all hover:scale-105"
                style={{ background: 'rgba(255,0,255,0.15)', border: '1px solid rgba(255,0,255,0.4)', color: '#ff00ff' }}>RESTART</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {showGameOver && finalStats && (
        <GameOverScreen score={finalStats.score} fails={finalStats.fails} time={finalStats.time} onRestart={handleRestart} />
      )}
    </div>
  );
};

// ==================== GAME MODE SELECTOR ====================

interface GameModeSelectorProps { onModeSelect: (mode: GameMode) => void; }

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onModeSelect }) => {
  const modes: { mode: GameMode; color: string; tag: string; icon: string }[] = [
    { mode: { name: 'Classic', description: '3 lives, progressive difficulty', difficulty: 1 }, color: '#00f0ff', tag: 'POPULAR', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { mode: { name: 'Time Trial', description: 'Survive 60 seconds', duration: 60, difficulty: 1.5 }, color: '#00ff88', tag: '60 SEC', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5-1H11v6l5.25 3.15.75-1.23-4.5-2.67z' },
    { mode: { name: 'Infinite', description: 'No game over, infinite run', difficulty: 1 }, color: '#ff00ff', tag: 'ENDLESS', icon: 'M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 9.17 8.15C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53L12 13.34l2.83 2.51c.97.97 2.33 1.53 3.77 1.53C21.58 17.38 24 14.96 24 12s-2.42-5.38-5.4-5.38z' },
    { mode: { name: 'Seeds', description: 'Compete on the same run', seed: Math.floor(Date.now() / 1000), difficulty: 1.2 }, color: '#ffff00', tag: 'COMPETE', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
      {modes.map(({ mode, color, tag, icon }) => (
        <button key={mode.name} onClick={() => onModeSelect(mode)}
          className="group relative text-left p-5 sm:p-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${color}08 0%, #0a0e27 100%)`, border: `2px solid ${color}25` }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${color}60`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${color}15`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${color}25`; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={color}><path d={icon}/></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-wide" style={{ color }}>{mode.name}</h3>
            </div>
            <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest"
              style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>{tag}</span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">{mode.description}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <span>START</span>
          </div>
        </button>
      ))}
    </div>
  );
};

// ==================== MAIN GAME PAGE ====================

export const GamePage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [assets, setAssets] = useState<AssetLoader | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      const d = localStorage.getItem('failfrenzy_highscores');
      if (d) { const p = JSON.parse(d); return Math.max(0, ...Object.values(p).map(Number)); }
    } catch {} return 0;
  });

  const handleModeSelect = useCallback(async (mode: GameMode) => {
    if (assets) { setSelectedMode(mode); return; }
    setIsLoading(true);
    setSelectedMode(mode);
    try {
      const loaded = await preloadAssets((l, t) => setLoadProgress(l / t));
      setAssets(loaded);
    } catch {
      setAssets(new AssetLoader());
    }
    setIsLoading(false);
  }, [assets]);

  const handleGameOver = (score: number) => { if (score > highScore) setHighScore(score); };
  const handleBackToMenu = () => setSelectedMode(null);

  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ background: '#050818' }}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="relative z-10 border-b py-3 sm:py-4 px-4" style={{ borderColor: 'rgba(0,240,255,0.1)', background: 'rgba(5,8,24,0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <img src={`${BASE}images/assets/logo-skull-256.png`} alt="" className="w-8 h-auto sm:w-9 transition-transform group-hover:rotate-12"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
              <span className="text-xl sm:text-2xl font-black tracking-tight">
                <span style={{ color: '#00f0ff', textShadow: '0 0 15px rgba(0,240,255,0.5)' }}>FAIL</span>
                <span style={{ color: '#ff00ff', textShadow: '0 0 15px rgba(255,0,255,0.5)' }} className="ml-0.5">FRENZY</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {highScore > 0 && (
              <div className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono" style={{ background: 'rgba(255,255,0,0.08)', border: '1px solid rgba(255,255,0,0.2)' }}>
                <span className="text-gray-500">BEST </span><span className="font-bold" style={{ color: '#ffff00' }}>{highScore}</span>
              </div>
            )}
            {selectedMode && (
              <button onClick={handleBackToMenu} className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono transition-all hover:scale-105"
                style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', color: '#00f0ff' }}>MENU</button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 py-6 sm:py-8">
        {!selectedMode ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <img src={`${BASE}images/assets/logo-skull-512.png`} alt="" className="w-24 h-auto sm:w-32 mx-auto mb-4"
                style={{ filter: 'drop-shadow(0 0 25px rgba(0,240,255,0.5))' }} />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight">
                <span style={{ background: 'linear-gradient(90deg, #00f0ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SELECT MODE</span>
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm font-mono">Choose your challenge. Master the chaos.</p>
            </div>
            <GameModeSelector onModeSelect={handleModeSelect} />
            <div className="mt-10 flex items-center justify-center gap-4 sm:gap-6 opacity-40">
              <img src={`${BASE}images/assets/target_fire_glow.png`} alt="" className="w-10 h-10 sm:w-12 sm:h-12" style={{ filter: 'drop-shadow(0 0 8px rgba(255,102,0,0.5))' }} />
              <img src={`${BASE}images/assets/target_classic_glow.png`} alt="" className="w-10 h-10 sm:w-12 sm:h-12" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
              <img src={`${BASE}images/assets/target_neon_glow.png`} alt="" className="w-10 h-10 sm:w-12 sm:h-12" style={{ filter: 'drop-shadow(0 0 8px rgba(255,0,255,0.5))' }} />
              <img src={`${BASE}images/assets/hit_fx_spark.png`} alt="" className="w-10 h-10 sm:w-12 sm:h-12" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
            </div>
          </div>
        ) : (
          <div className="max-w-[900px] mx-auto relative">
            <div className="mb-3 sm:mb-4 text-center">
              <h2 className="text-lg sm:text-xl font-black tracking-wider" style={{ color: '#00f0ff', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
                {selectedMode.name?.toUpperCase()}
              </h2>
            </div>
            {(isLoading || !assets) && (
              <div className="relative" style={{ aspectRatio: '16/10' }}><LoadingScreen progress={loadProgress} /></div>
            )}
            {assets && !isLoading && (
              <GameCanvas mode={selectedMode} assets={assets} onGameOver={handleGameOver} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
