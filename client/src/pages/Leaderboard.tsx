import { useState } from 'react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const BASE = import.meta.env.BASE_URL;

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  mode: string;
  country: string;
  isYou?: boolean;
}

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

  let userScore = 0;
  try {
    const d = localStorage.getItem('failfrenzy_highscores');
    if (d) {
      const p = JSON.parse(d);
      userScore = Math.max(0, ...Object.values(p).map(Number));
    }
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

  if (userScore > 0) {
    const userRank = entries.findIndex((e) => userScore > e.score);
    const insertAt = userRank >= 0 ? userRank : entries.length;
    entries.splice(insertAt, 0, {
      rank: insertAt + 1,
      name: 'TOI',
      score: userScore,
      mode: 'classic',
      country: 'FR',
      isYou: true,
    });
    entries.forEach((e, i) => (e.rank = i + 1));
    if (entries.length > 25) entries.pop();
  }

  return entries;
}

const MODES = [
  { id: 'all', name: 'TOUS', color: '#fff' },
  { id: 'classic', name: 'CLASSIC', color: '#00f0ff' },
  { id: 'time-trial', name: 'TIME TRIAL', color: '#00ff88' },
  { id: 'infinite', name: 'INFINITE', color: '#ff00ff' },
  { id: 'seeds', name: 'SEEDS', color: '#ffff00' },
];

const PERIODS = [
  { id: 'day', name: "AUJOURD'HUI" },
  { id: 'week', name: 'SEMAINE' },
  { id: 'month', name: 'MOIS' },
  { id: 'all', name: 'TOUS TEMPS' },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
        style={{
          background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
          boxShadow: '0 0 20px rgba(255,215,0,0.5)',
          color: '#050818',
        }}
      >
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
        style={{
          background: 'linear-gradient(135deg, #c0c0c0, #808080)',
          boxShadow: '0 0 15px rgba(192,192,192,0.4)',
          color: '#050818',
        }}
      >
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
        style={{
          background: 'linear-gradient(135deg, #cd7f32, #8b4513)',
          boxShadow: '0 0 15px rgba(205,127,50,0.4)',
          color: '#050818',
        }}
      >
        3
      </div>
    );
  }
  return (
    <div className="w-10 h-10 flex items-center justify-center font-bold text-sm text-gray-600">
      {rank}
    </div>
  );
}

export default function Leaderboard() {
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const leaderboard = generateLeaderboard(selectedMode);

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <NavBar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `url(${BASE}03_ENVIRONNEMENTS/BG_Nebuleuse_Spatiale.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            opacity: 0.08,
          }}
        />
      </div>

      <StarField count={20} />

      <main className="relative z-10 px-4 pt-24 pb-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <img
            src={`${BASE}04_UI_UX/Leaderboard_Classement.png`}
            alt=""
            className="w-20 h-20 mx-auto mb-4 object-contain"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' }}
          />
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ff00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PANTHEON DES ECHOS
          </h1>
          <p className="text-gray-500 text-sm font-mono tracking-wider">
            Seuls les meilleurs survivent au Vide Stellaire
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className="px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-200"
              style={{
                background: selectedMode === m.id ? `${m.color}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedMode === m.id ? `${m.color}40` : 'rgba(255,255,255,0.08)'}`,
                color: selectedMode === m.id ? m.color : 'rgba(255,255,255,0.35)',
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className="px-3 py-1.5 text-[10px] font-mono tracking-wider transition-all"
              style={{
                color: selectedPeriod === p.id ? '#00f0ff' : 'rgba(255,255,255,0.3)',
                borderBottom: selectedPeriod === p.id ? '2px solid #00f0ff' : '2px solid transparent',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10,14,39,0.5)',
            border: '1px solid rgba(0,240,255,0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="grid grid-cols-[60px_1fr_110px_70px] sm:grid-cols-[70px_1fr_130px_80px] px-5 py-3 text-[10px] font-mono tracking-widest text-gray-600"
            style={{ borderBottom: '1px solid rgba(0,240,255,0.06)' }}
          >
            <span>RANG</span>
            <span>JOUEUR</span>
            <span className="text-right">SCORE</span>
            <span className="text-right">PAYS</span>
          </div>

          {leaderboard.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankColors = ['', '#ffd700', '#c0c0c0', '#cd7f32'];
            const rc = isTop3 ? rankColors[entry.rank] : '';

            return (
              <div
                key={`${entry.rank}-${entry.name}`}
                className="grid grid-cols-[60px_1fr_110px_70px] sm:grid-cols-[70px_1fr_130px_80px] px-5 py-3 items-center transition-all duration-200 hover:bg-white/[0.02]"
                style={{
                  background: entry.isYou
                    ? 'rgba(0,240,255,0.06)'
                    : isTop3
                    ? `${rc}06`
                    : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  borderLeft: entry.isYou
                    ? '3px solid #00f0ff'
                    : isTop3
                    ? `3px solid ${rc}`
                    : '3px solid transparent',
                }}
              >
                <div>
                  <RankBadge rank={entry.rank} />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="text-sm font-bold truncate"
                    style={{
                      color: entry.isYou
                        ? '#00f0ff'
                        : isTop3
                        ? rc
                        : 'rgba(255,255,255,0.65)',
                    }}
                  >
                    {entry.name}
                  </span>
                  {entry.isYou && (
                    <span
                      className="flex-shrink-0 text-[8px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: 'rgba(0,240,255,0.12)',
                        color: '#00f0ff',
                        border: '1px solid rgba(0,240,255,0.3)',
                      }}
                    >
                      TOI
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className="text-sm font-black font-mono"
                    style={{
                      color: entry.isYou
                        ? '#00f0ff'
                        : isTop3
                        ? rc
                        : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-gray-600">{entry.country}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm font-mono mb-5">
            Tu n'es pas dans le top ? Retente ta chance.
          </p>
          <Link href="/game">
            <button
              className="px-10 py-4 rounded-xl font-black tracking-wider transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #ff00ff)',
                color: '#050818',
                boxShadow: '0 0 30px rgba(0,240,255,0.3)',
              }}
            >
              JOUER MAINTENANT
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
