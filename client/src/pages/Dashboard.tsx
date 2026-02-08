/**
 * FAIL FRENZY - Dashboard / Profil (Standalone)
 * Page de profil joueur avec stats locales, succès et connexion
 */

import { useState } from 'react';
import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL || '/';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (stats: PlayerStats) => boolean;
}

interface PlayerStats {
  totalGames: number;
  totalScore: number;
  highScore: number;
  totalFails: number;
  totalTime: number;
  classicBest: number;
  timeBest: number;
  infiniteBest: number;
  seedsBest: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-game', name: 'Premier Pas', description: 'Joue ta première partie', icon: '🎮', color: '#00f0ff', condition: (s) => s.totalGames >= 1 },
  { id: 'fail-10', name: 'Apprenti du Fail', description: 'Accumule 10 fails', icon: '💀', color: '#ff2d7b', condition: (s) => s.totalFails >= 10 },
  { id: 'score-1000', name: 'Millénaire', description: 'Atteins 1000 points', icon: '⭐', color: '#ffff00', condition: (s) => s.highScore >= 1000 },
  { id: 'games-10', name: 'Accro', description: 'Joue 10 parties', icon: '🔥', color: '#ff6600', condition: (s) => s.totalGames >= 10 },
  { id: 'score-5000', name: 'Neon Master', description: 'Atteins 5000 points', icon: '💎', color: '#00f0ff', condition: (s) => s.highScore >= 5000 },
  { id: 'fail-50', name: 'Roi du Fail', description: 'Accumule 50 fails', icon: '👑', color: '#ffd700', condition: (s) => s.totalFails >= 50 },
  { id: 'score-10000', name: 'Légende Glitch', description: 'Atteins 10000 points', icon: '🌟', color: '#ff00ff', condition: (s) => s.highScore >= 10000 },
  { id: 'games-50', name: 'Vétéran', description: 'Joue 50 parties', icon: '🏆', color: '#ffd700', condition: (s) => s.totalGames >= 50 },
  { id: 'score-50000', name: 'Crâne Cosmique', description: 'Atteins 50000 points', icon: '💀', color: '#ffffff', condition: (s) => s.highScore >= 50000 },
];

function getStats(): PlayerStats {
  try {
    const hs = JSON.parse(localStorage.getItem('failfrenzy_highscores') || '{}');
    const gs = JSON.parse(localStorage.getItem('failfrenzy_gamestats') || '{"totalGames":0,"totalScore":0,"totalFails":0,"totalTime":0}');
    return {
      totalGames: gs.totalGames || 0,
      totalScore: gs.totalScore || 0,
      highScore: Math.max(0, ...Object.values(hs).map(Number)),
      totalFails: gs.totalFails || 0,
      totalTime: gs.totalTime || 0,
      classicBest: hs.Classic || 0,
      timeBest: hs['Time Trial'] || 0,
      infiniteBest: hs.Infinite || 0,
      seedsBest: hs.Seeds || 0,
    };
  } catch {
    return { totalGames: 0, totalScore: 0, highScore: 0, totalFails: 0, totalTime: 0, classicBest: 0, timeBest: 0, infiniteBest: 0, seedsBest: 0 };
  }
}

function getTokens(): number {
  try { return parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10); } catch { return 500; }
}

export default function Dashboard() {
  const [stats] = useState(getStats);
  const [tokens] = useState(getTokens);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('failfrenzy_name') || '');
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  const saveName = () => {
    const name = nameInput.trim().slice(0, 20);
    if (name) {
      localStorage.setItem('failfrenzy_name', name);
      setPlayerName(name);
    }
    setIsEditing(false);
  };

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.condition(stats));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.condition(stats));

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: 'rgba(5,8,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <img src={`${BASE}logo-skull-glitch.png`} alt="" className="w-8 h-auto transition-transform group-hover:rotate-12"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
              <span className="text-lg font-black tracking-tight">
                <span style={{ color: '#00f0ff' }}>FAIL</span>
                <span style={{ color: '#ff00ff' }} className="ml-0.5">FRENZY</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/game" className="text-gray-500 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">JOUER</Link>
            <Link href="/shop" className="text-gray-500 hover:text-[#ff00ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">BOUTIQUE</Link>
            <Link href="/leaderboard" className="text-gray-500 hover:text-[#ffff00] text-xs font-mono tracking-wider transition-colors hidden sm:block">CLASSEMENT</Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 py-8 max-w-5xl mx-auto">
        
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-4">
            <img src={`${BASE}logo-skull-glitch.png`} alt="" className="w-24 h-24 mx-auto"
              style={{ filter: 'drop-shadow(0 0 25px rgba(0,240,255,0.5)) drop-shadow(0 0 50px rgba(255,0,255,0.3))' }} />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', boxShadow: '0 0 15px rgba(0,240,255,0.5)' }}>
              {stats.totalGames > 50 ? '🏆' : stats.totalGames > 10 ? '⭐' : '🎮'}
            </div>
          </div>

          {/* Player Name */}
          {isEditing ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
                className="bg-transparent text-center text-2xl font-black tracking-tight outline-none px-2 py-1 rounded-lg"
                style={{ color: '#00f0ff', border: '1px solid rgba(0,240,255,0.4)', caretColor: '#00f0ff' }}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
              <button onClick={saveName} className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>OK</button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-2 cursor-pointer group" onClick={() => { setIsEditing(true); setNameInput(playerName || 'JOUEUR'); }}>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#00f0ff', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
                {playerName || 'JOUEUR ANONYME'}
              </h1>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          )}
          <p className="text-gray-600 text-xs font-mono">Clique sur ton nom pour le modifier</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {[
            { label: 'MEILLEUR SCORE', value: stats.highScore.toLocaleString(), color: '#ffd700' },
            { label: 'PARTIES JOUÉES', value: stats.totalGames.toString(), color: '#00f0ff' },
            { label: 'TOTAL FAILS', value: stats.totalFails.toString(), color: '#ff2d7b' },
            { label: 'TOKENS', value: tokens.toString(), color: '#ffff00' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
              <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: s.color, textShadow: `0 0 15px ${s.color}40` }}>{s.value}</div>
              <div className="text-[9px] sm:text-[10px] font-mono tracking-wider text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode Records */}
        <div className="mb-10">
          <h2 className="text-xl font-black tracking-wider mb-4" style={{ color: '#ff00ff', textShadow: '0 0 15px rgba(255,0,255,0.3)' }}>RECORDS PAR MODE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Classic', score: stats.classicBest, color: '#00f0ff' },
              { name: 'Time Trial', score: stats.timeBest, color: '#00ff88' },
              { name: 'Infinite', score: stats.infiniteBest, color: '#ff00ff' },
              { name: 'Seeds', score: stats.seedsBest, color: '#ffff00' },
            ].map(m => (
              <div key={m.name} className="p-3 rounded-xl" style={{ background: `${m.color}06`, border: `1px solid ${m.color}15` }}>
                <div className="text-[10px] font-mono tracking-wider mb-1" style={{ color: m.color }}>{m.name.toUpperCase()}</div>
                <div className="text-lg font-black" style={{ color: m.score > 0 ? 'white' : 'rgba(255,255,255,0.2)' }}>
                  {m.score > 0 ? m.score.toLocaleString() : '---'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-10">
          <h2 className="text-xl font-black tracking-wider mb-1" style={{ color: '#ffd700', textShadow: '0 0 15px rgba(255,215,0,0.3)' }}>SUCCÈS</h2>
          <p className="text-gray-600 text-xs font-mono mb-4">{unlockedAchievements.length}/{ACHIEVEMENTS.length} débloqués</p>
          
          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden mb-6" style={{ background: 'rgba(255,215,0,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%`, background: 'linear-gradient(90deg, #ffd700, #ff00ff)', boxShadow: '0 0 10px rgba(255,215,0,0.4)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unlockedAchievements.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: `${a.color}08`, border: `1px solid ${a.color}25` }}>
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: a.color }}>{a.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono truncate">{a.description}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#00ff88"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
            ))}
            {lockedAchievements.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl opacity-40"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-2xl grayscale">🔒</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-500 truncate">{a.name}</div>
                  <div className="text-[10px] text-gray-600 font-mono truncate">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/game">
            <button className="px-8 py-3 rounded-xl font-black text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', color: '#050818', boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}>
              CONTINUER À JOUER
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 mt-8" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={`${BASE}01_BRANDING/Favicon_Simplifie.png`} alt="" className="w-6 h-6" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.5))' }} />
            <span className="text-gray-600 text-xs font-mono">Fail Frenzy: Échos du Vide © 2026</span>
          </div>
          <div className="flex gap-4 text-gray-600 text-xs font-mono">
            <Link href="/" className="hover:text-[#00f0ff] transition-colors">Accueil</Link>
            <Link href="/shop" className="hover:text-[#ff00ff] transition-colors">Boutique</Link>
            <Link href="/leaderboard" className="hover:text-[#ffff00] transition-colors">Classement</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
