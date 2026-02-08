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
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-4" style={{ background: 'rgba(5,8,24,0.98)', backdropFilter: 'blur(16px)', borderBottom: '2px solid rgba(0,240,255,0.2)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img src={`${BASE}logo-skull-glitch.png`} alt="" className="w-10 h-10 transition-transform group-hover:rotate-12"
                style={{ filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.6))' }} />
              <span className="text-xl font-black tracking-tight">
                <span style={{ color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>FAIL</span>
                <span style={{ color: '#ff00ff', textShadow: '0 0 10px rgba(255,0,255,0.5)' }} className="ml-1">FRENZY</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/game" className="text-gray-400 hover:text-[#00f0ff] text-sm font-bold tracking-wider transition-colors hidden sm:block">JOUER</Link>
            <Link href="/shop" className="text-gray-400 hover:text-[#ff00ff] text-sm font-bold tracking-wider transition-colors hidden sm:block">BOUTIQUE</Link>
            <Link href="/leaderboard" className="text-gray-400 hover:text-[#ffff00] text-sm font-bold tracking-wider transition-colors hidden sm:block">CLASSEMENT</Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 py-10 max-w-5xl mx-auto">
        
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <img src={`${BASE}logo-skull-glitch.png`} alt="" className="w-28 h-28 mx-auto"
              style={{ filter: 'drop-shadow(0 0 30px rgba(0,240,255,0.6)) drop-shadow(0 0 60px rgba(255,0,255,0.4))' }} />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', boxShadow: '0 0 20px rgba(0,240,255,0.6)' }}>
              {stats.totalGames > 50 ? '🏆' : stats.totalGames > 10 ? '⭐' : '🎮'}
            </div>
          </div>

          {/* Player Name */}
          {isEditing ? (
            <div className="flex items-center justify-center gap-3 mb-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
                className="bg-transparent text-center text-3xl font-black tracking-tight outline-none px-3 py-2 rounded-lg"
                style={{ color: '#00f0ff', border: '2px solid rgba(0,240,255,0.6)', caretColor: '#00f0ff', boxShadow: '0 0 20px rgba(0,240,255,0.3)' }}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
              <button onClick={saveName} className="px-4 py-2 rounded-lg text-sm font-black"
                style={{ background: 'rgba(0,255,136,0.25)', color: '#00ff88', border: '2px solid rgba(0,255,136,0.5)', boxShadow: '0 0 15px rgba(0,255,136,0.3)' }}>OK</button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 mb-3 cursor-pointer group" onClick={() => { setIsEditing(true); setNameInput(playerName || 'JOUEUR'); }}>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: '#00f0ff', textShadow: '0 0 25px rgba(0,240,255,0.6)' }}>
                {playerName || 'JOUEUR ANONYME'}
              </h1>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          )}
          <p className="text-gray-500 text-sm font-bold">Clique sur ton nom pour le modifier</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-12">
          {[
            { label: 'MEILLEUR SCORE', value: stats.highScore.toLocaleString(), color: '#ffd700' },
            { label: 'PARTIES JOUÉES', value: stats.totalGames.toString(), color: '#00f0ff' },
            { label: 'TOTAL FAILS', value: stats.totalFails.toString(), color: '#ff2d7b' },
            { label: 'TOKENS', value: tokens.toString(), color: '#ffff00' },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-xl text-center transition-transform hover:scale-105" 
              style={{ background: `${s.color}20`, border: `2px solid ${s.color}`, boxShadow: `0 0 25px ${s.color}40` }}>
              <div className="text-3xl sm:text-4xl font-black mb-2" style={{ color: s.color, textShadow: `0 0 20px ${s.color}80` }}>{s.value}</div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-gray-300">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode Records */}
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-wider mb-5" style={{ color: '#ff00ff', textShadow: '0 0 20px rgba(255,0,255,0.5)' }}>RECORDS PAR MODE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Classic', score: stats.classicBest, color: '#00f0ff' },
              { name: 'Time Trial', score: stats.timeBest, color: '#00ff88' },
              { name: 'Infinite', score: stats.infiniteBest, color: '#ff00ff' },
              { name: 'Seeds', score: stats.seedsBest, color: '#ffff00' },
            ].map(m => (
              <div key={m.name} className="p-4 rounded-xl transition-transform hover:scale-105" 
                style={{ background: `${m.color}18`, border: `2px solid ${m.color}80`, boxShadow: `0 0 20px ${m.color}30` }}>
                <div className="text-xs sm:text-sm font-black tracking-wider mb-2" style={{ color: m.color, textShadow: `0 0 10px ${m.color}` }}>{m.name.toUpperCase()}</div>
                <div className="text-xl sm:text-2xl font-black" style={{ color: m.score > 0 ? 'white' : 'rgba(255,255,255,0.3)', textShadow: m.score > 0 ? '0 0 10px rgba(255,255,255,0.5)' : 'none' }}>
                  {m.score > 0 ? m.score.toLocaleString() : '---'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-wider mb-2" style={{ color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>SUCCÈS</h2>
          <p className="text-gray-400 text-sm font-bold mb-5">{unlockedAchievements.length}/{ACHIEVEMENTS.length} débloqués</p>
          
          <div className="h-3 rounded-full overflow-hidden mb-8" style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%`, background: 'linear-gradient(90deg, #ffd700, #ff00ff)', boxShadow: '0 0 15px rgba(255,215,0,0.6)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map(a => (
              <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: `${a.color}20`, border: `2px solid ${a.color}`, boxShadow: `0 0 20px ${a.color}40` }}>
                <span className="text-3xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black truncate" style={{ color: a.color, textShadow: `0 0 10px ${a.color}` }}>{a.name}</div>
                  <div className="text-xs text-gray-300 font-medium truncate">{a.description}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#00ff88"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
            ))}
            {lockedAchievements.map(a => (
              <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl opacity-50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.15)' }}>
                <span className="text-3xl grayscale">🔒</span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black text-gray-400 truncate">{a.name}</div>
                  <div className="text-xs text-gray-500 font-medium truncate">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/game">
            <button className="px-10 py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:scale-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', color: '#050818', boxShadow: '0 0 40px rgba(0,240,255,0.5)', border: '2px solid #00f0ff' }}>
              CONTINUER À JOUER
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-12" style={{ borderColor: 'rgba(0,240,255,0.2)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={`${BASE}logo-skull-glitch.png`} alt="" className="w-8 h-8" style={{ filter: 'drop-shadow(0 0 8px rgba(255,0,255,0.6))' }} />
            <span className="text-gray-500 text-sm font-bold">Fail Frenzy: Échos du Vide © 2026</span>
          </div>
          <div className="flex gap-6 text-gray-500 text-sm font-bold">
            <Link href="/" className="hover:text-[#00f0ff] transition-colors">Accueil</Link>
            <Link href="/shop" className="hover:text-[#ff00ff] transition-colors">Boutique</Link>
            <Link href="/leaderboard" className="hover:text-[#ffff00] transition-colors">Classement</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
