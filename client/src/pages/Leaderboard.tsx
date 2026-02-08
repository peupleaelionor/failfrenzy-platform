/**
 * FAIL FRENZY - Leaderboard Page (Standalone)
 * Classement global avec filtres par mode et période, données locales
 */

import { useState } from 'react';
import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL || '/';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  mode: string;
  country: string;
  isYou?: boolean;
}

// Simulated leaderboard data
const FAKE_PLAYERS = [
  'xNeonSlayer', 'GlitchQueen', 'SkullMaster_FR', 'DarkVoid99', 'NightFury_X',
  'PixelDemon', 'CyberWolf', 'ArcadeKing', 'NovaStrike', 'PhantomRush',
  'BlazeFury', 'ShadowNeon', 'TurboFail', 'ElectroZone', 'VortexPro',
  'MegaGlitch', 'NeonDragon', 'ChaosLord', 'FlashByte', 'StormRider',
  'ZeroGravity', 'PulseWave', 'InfinityX', 'RogueNeon', 'ThunderBolt',
];

function generateLeaderboard(mode: string): LeaderboardEntry[] {
  const seed = mode === 'all' ? 42 : mode.charCodeAt(0) * 7;
  const entries: LeaderboardEntry[] = [];
  const countries = ['FR', 'FR', 'FR', 'BE', 'CH', 'CA', 'US', 'UK', 'DE', 'ES'];
  
  // Get user high score
  let userScore = 0;
  try {
    const d = localStorage.getItem('failfrenzy_highscores');
    if (d) { const p = JSON.parse(d); userScore = Math.max(0, ...Object.values(p).map(Number)); }
  } catch {}

  for (let i = 0; i < 25; i++) {
    const base = 100000 - i * (3000 + ((seed + i * 13) % 1500));
    entries.push({
      rank: i + 1,
      name: FAKE_PLAYERS[i],
      score: Math.max(1000, base + ((seed * (i + 1)) % 2000)),
      mode: mode === 'all' ? ['classic', 'time-trial', 'infinite', 'seeds'][i % 4] : mode,
      country: countries[i % countries.length],
    });
  }

  // Insert user
  if (userScore > 0) {
    const userRank = entries.findIndex(e => userScore > e.score);
    const insertAt = userRank >= 0 ? userRank : entries.length;
    entries.splice(insertAt, 0, {
      rank: insertAt + 1,
      name: 'TOI',
      score: userScore,
      mode: 'classic',
      country: 'FR',
      isYou: true,
    });
    // Re-rank
    entries.forEach((e, i) => e.rank = i + 1);
    if (entries.length > 25) entries.pop();
  }

  return entries;
}

export default function Leaderboard() {
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const modes = [
    { id: 'all', name: 'TOUS', color: '#fff' },
    { id: 'classic', name: 'CLASSIC', color: '#00f0ff' },
    { id: 'time-trial', name: 'TIME TRIAL', color: '#00ff88' },
    { id: 'infinite', name: 'INFINITE', color: '#ff00ff' },
    { id: 'seeds', name: 'SEEDS', color: '#ffff00' },
  ];

  const periods = [
    { id: 'day', name: "AUJOURD'HUI" },
    { id: 'week', name: 'SEMAINE' },
    { id: 'month', name: 'MOIS' },
    { id: 'all', name: 'TOUS TEMPS' },
  ];

  const leaderboard = generateLeaderboard(selectedMode);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '👑', color: '#ffd700', bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)' };
    if (rank === 2) return { icon: '🥈', color: '#c0c0c0', bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.2)' };
    if (rank === 3) return { icon: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.2)' };
    return { icon: '', color: 'rgba(255,255,255,0.4)', bg: 'transparent', border: 'transparent' };
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: 'rgba(5,8,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <img src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`} alt="" className="w-8 h-auto transition-transform group-hover:rotate-12"
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
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`} alt="" className="w-16 h-auto mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' }} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            <span style={{ color: '#ffd700', textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>CLASSEMENT</span>
            <span className="text-white ml-3">MONDIAL</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono">"Seuls les meilleurs survivent au Vide Stellaire."</p>
        </div>

        {/* Mode filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {modes.map(m => (
            <button key={m.id} onClick={() => setSelectedMode(m.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider transition-all ${selectedMode === m.id ? 'scale-105' : 'opacity-50 hover:opacity-80'}`}
              style={{ background: selectedMode === m.id ? `${m.color}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedMode === m.id ? `${m.color}40` : 'rgba(255,255,255,0.08)'}`, color: selectedMode === m.id ? m.color : '#666' }}>
              {m.name}
            </button>
          ))}
        </div>

        {/* Period filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {periods.map(p => (
            <button key={p.id} onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 py-1 rounded-md text-[9px] sm:text-[10px] font-mono tracking-wider transition-all ${selectedPeriod === p.id ? '' : 'opacity-40 hover:opacity-70'}`}
              style={{ color: selectedPeriod === p.id ? '#00f0ff' : '#666', borderBottom: selectedPeriod === p.id ? '2px solid #00f0ff' : '2px solid transparent' }}>
              {p.name}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(10,14,39,0.6)', border: '1px solid rgba(0,240,255,0.1)' }}>
          {/* Header row */}
          <div className="grid grid-cols-[60px_1fr_100px_80px] sm:grid-cols-[80px_1fr_120px_100px] px-4 py-3 text-[9px] sm:text-[10px] font-mono tracking-wider text-gray-600"
            style={{ borderBottom: '1px solid rgba(0,240,255,0.08)' }}>
            <span>RANG</span>
            <span>JOUEUR</span>
            <span className="text-right">SCORE</span>
            <span className="text-right">PAYS</span>
          </div>

          {/* Entries */}
          {leaderboard.map(entry => {
            const rd = getRankDisplay(entry.rank);
            return (
              <div key={`${entry.rank}-${entry.name}`}
                className="grid grid-cols-[60px_1fr_100px_80px] sm:grid-cols-[80px_1fr_120px_100px] px-4 py-3 items-center transition-all hover:bg-white/[0.02]"
                style={{
                  background: entry.isYou ? 'rgba(0,240,255,0.06)' : rd.bg,
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  borderLeft: entry.isYou ? '3px solid #00f0ff' : entry.rank <= 3 ? `3px solid ${rd.color}` : '3px solid transparent',
                }}>
                <div className="flex items-center gap-2">
                  {rd.icon ? <span className="text-lg">{rd.icon}</span> : <span className="text-sm font-bold" style={{ color: rd.color }}>{entry.rank}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${entry.isYou ? '' : ''}`} style={{ color: entry.isYou ? '#00f0ff' : entry.rank <= 3 ? rd.color : 'rgba(255,255,255,0.7)' }}>
                    {entry.name}
                  </span>
                  {entry.isYou && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.3)' }}>TOI</span>}
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono" style={{ color: entry.isYou ? '#00f0ff' : entry.rank <= 3 ? rd.color : 'rgba(255,255,255,0.5)' }}>
                    {entry.score.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{entry.country}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-4 font-mono">Tu n'es pas dans le top ? Retente ta chance.</p>
          <Link href="/game">
            <button className="px-8 py-3 rounded-xl font-black text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', color: '#050818', boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}>
              JOUER MAINTENANT
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
            <Link href="/game" className="hover:text-[#ff00ff] transition-colors">Jouer</Link>
            <Link href="/shop" className="hover:text-[#ffff00] transition-colors">Boutique</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
