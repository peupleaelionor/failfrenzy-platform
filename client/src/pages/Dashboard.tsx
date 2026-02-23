import { useState } from 'react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const BASE = import.meta.env.BASE_URL;

interface Achievement {
  id: string;
  name: string;
  description: string;
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
  { id: 'first-game', name: 'Premier Pas', description: 'Joue ta premiere partie', color: '#00f0ff', condition: (s) => s.totalGames >= 1 },
  { id: 'fail-10', name: 'Apprenti du Fail', description: 'Accumule 10 fails', color: '#ff2d7b', condition: (s) => s.totalFails >= 10 },
  { id: 'score-1000', name: 'Millenaire', description: 'Atteins 1000 points', color: '#ffff00', condition: (s) => s.highScore >= 1000 },
  { id: 'games-10', name: 'Accro', description: 'Joue 10 parties', color: '#ff6600', condition: (s) => s.totalGames >= 10 },
  { id: 'score-5000', name: 'Neon Master', description: 'Atteins 5000 points', color: '#00f0ff', condition: (s) => s.highScore >= 5000 },
  { id: 'fail-50', name: 'Roi du Fail', description: 'Accumule 50 fails', color: '#ffd700', condition: (s) => s.totalFails >= 50 },
  { id: 'score-10000', name: 'Legende Glitch', description: 'Atteins 10000 points', color: '#ff00ff', condition: (s) => s.highScore >= 10000 },
  { id: 'games-50', name: 'Veteran', description: 'Joue 50 parties', color: '#ffd700', condition: (s) => s.totalGames >= 50 },
  { id: 'score-50000', name: 'Crane Cosmique', description: 'Atteins 50000 points', color: '#ffffff', condition: (s) => s.highScore >= 50000 },
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
  try {
    return parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10);
  } catch {
    return 500;
  }
}

function getXylosState(totalScore: number) {
  if (totalScore >= 1000) return { name: 'Eveil Partiel', color: '#ffd700', progress: 1 };
  if (totalScore >= 500) return { name: 'Flux Stable', color: '#ff00ff', progress: totalScore / 1000 };
  if (totalScore >= 200) return { name: 'Resonance', color: '#00ff88', progress: totalScore / 1000 };
  if (totalScore >= 50) return { name: 'Premiers Echos', color: '#00f0ff', progress: totalScore / 1000 };
  return { name: 'Dormant', color: '#334155', progress: totalScore / 1000 };
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

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.condition(stats));
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !a.condition(stats));
  const xylos = getXylosState(stats.totalScore);

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <NavBar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${BASE}03_ENVIRONNEMENTS/BG_Ville_Cyberpunk.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(12px)',
            opacity: 0.06,
          }}
        />
      </div>

      <StarField count={15} />

      <main className="relative z-10 px-4 pt-24 pb-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <img
              src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`}
              alt=""
              className="w-28 h-28 mx-auto"
              style={{
                filter: 'drop-shadow(0 0 25px rgba(0,240,255,0.5)) drop-shadow(0 0 50px rgba(255,0,255,0.3))',
              }}
            />
            <div
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #ff00ff)',
                boxShadow: '0 0 15px rgba(0,240,255,0.5)',
                color: '#050818',
              }}
            >
              {stats.totalGames > 50 ? 'V' : stats.totalGames > 10 ? 'A' : 'N'}
            </div>
          </div>

          {isEditing ? (
            <div className="flex items-center justify-center gap-3 mb-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
                className="bg-transparent text-center text-3xl font-black tracking-tight outline-none px-3 py-2 rounded-lg"
                style={{
                  color: '#00f0ff',
                  border: '1px solid rgba(0,240,255,0.4)',
                  caretColor: '#00f0ff',
                  boxShadow: '0 0 20px rgba(0,240,255,0.15)',
                }}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
              <button
                onClick={saveName}
                className="px-4 py-2 rounded-lg text-sm font-black"
                style={{
                  background: 'rgba(0,255,136,0.15)',
                  color: '#00ff88',
                  border: '1px solid rgba(0,255,136,0.4)',
                }}
              >
                OK
              </button>
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-3 mb-3 cursor-pointer group"
              onClick={() => {
                setIsEditing(true);
                setNameInput(playerName || 'JOUEUR');
              }}
            >
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ color: '#00f0ff', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}
              >
                {playerName || 'JOUEUR ANONYME'}
              </h1>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          )}
          <p className="text-gray-600 text-xs font-mono tracking-wider">
            Clique sur ton nom pour le modifier
          </p>
        </div>

        <div
          className="p-5 rounded-2xl mb-10"
          style={{
            background: `linear-gradient(135deg, ${xylos.color}08 0%, rgba(5,8,24,0.9) 100%)`,
            border: `1px solid ${xylos.color}25`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black tracking-wider" style={{ color: xylos.color }}>
                ETAT DE XYLOS
              </h3>
              <p className="text-xs text-gray-500 font-mono">{xylos.name}</p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider"
              style={{
                background: `${xylos.color}15`,
                border: `1px solid ${xylos.color}40`,
                color: xylos.color,
              }}
            >
              {Math.round(xylos.progress * 100)}%
            </div>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(xylos.progress * 100, 100)}%`,
                background: `linear-gradient(90deg, ${xylos.color}, ${xylos.color}80)`,
                boxShadow: `0 0 10px ${xylos.color}60`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'MEILLEUR SCORE', value: stats.highScore.toLocaleString(), color: '#ffd700' },
            { label: 'PARTIES', value: stats.totalGames.toString(), color: '#00f0ff' },
            { label: 'TOTAL FAILS', value: stats.totalFails.toString(), color: '#ff2d7b' },
            { label: 'TOKENS', value: tokens.toString(), color: '#ffff00' },
          ].map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-xl text-center transition-transform duration-200 hover:scale-[1.03]"
              style={{
                background: `${s.color}08`,
                border: `1px solid ${s.color}20`,
                boxShadow: `0 0 15px ${s.color}10`,
              }}
            >
              <div
                className="text-3xl sm:text-4xl font-black mb-2"
                style={{ color: s.color, textShadow: `0 0 15px ${s.color}50` }}
              >
                {s.value}
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-wider text-gray-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-10">
          <h2
            className="text-xl font-black tracking-wider mb-5"
            style={{ color: '#ff00ff', textShadow: '0 0 15px rgba(255,0,255,0.3)' }}
          >
            RECORDS PAR MODE
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Classic', score: stats.classicBest, color: '#00f0ff' },
              { name: 'Time Trial', score: stats.timeBest, color: '#00ff88' },
              { name: 'Infinite', score: stats.infiniteBest, color: '#ff00ff' },
              { name: 'Seeds', score: stats.seedsBest, color: '#ffff00' },
            ].map((m) => (
              <div
                key={m.name}
                className="p-4 rounded-xl transition-transform duration-200 hover:scale-[1.03]"
                style={{
                  background: `${m.color}08`,
                  border: `1px solid ${m.color}18`,
                }}
              >
                <div
                  className="text-xs font-black tracking-wider mb-2"
                  style={{ color: m.color }}
                >
                  {m.name.toUpperCase()}
                </div>
                <div
                  className="text-xl sm:text-2xl font-black"
                  style={{
                    color: m.score > 0 ? 'white' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {m.score > 0 ? m.score.toLocaleString() : '---'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-xl font-black tracking-wider"
              style={{ color: '#ffd700', textShadow: '0 0 15px rgba(255,215,0,0.3)' }}
            >
              SUCCES
            </h2>
            <span className="text-xs font-mono text-gray-500">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
          </div>

          <div
            className="h-2 rounded-full overflow-hidden mb-8"
            style={{ background: 'rgba(255,215,0,0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%`,
                background: 'linear-gradient(90deg, #ffd700, #ff00ff)',
                boxShadow: '0 0 10px rgba(255,215,0,0.4)',
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unlockedAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: `${a.color}08`,
                  border: `1px solid ${a.color}25`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${a.color}15`,
                    border: `1px solid ${a.color}40`,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={a.color}
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black truncate" style={{ color: a.color }}>
                    {a.name}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">{a.description}</div>
                </div>
              </div>
            ))}
            {lockedAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-4 rounded-xl opacity-40"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-gray-600 truncate">{a.name}</div>
                  <div className="text-[10px] text-gray-700 truncate">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/game">
            <button
              className="px-10 py-4 rounded-xl font-black tracking-wider transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #ff00ff)',
                color: '#050818',
                boxShadow: '0 0 30px rgba(0,240,255,0.3)',
              }}
            >
              CONTINUER A JOUER
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
