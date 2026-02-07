/**
 * FAIL FRENZY - Leaderboard Page
 * Global rankings with filters by mode, country, and time period
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Crown } from "lucide-react";

const ASSETS = {
  logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663278017338/OzPqrjVSMXFHuMQc.png",
};

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');

  const { data: leaderboard } = trpc.leaderboard.getGlobal.useQuery({
    mode: selectedMode === 'all' ? undefined : (selectedMode as 'classic' | 'time_trial' | 'infinite' | 'seeds'),
    limit: 50,
  });

  const modes = [
    { id: 'all', name: 'TOUS', color: '#fff' },
    { id: 'classic', name: 'CLASSIC', color: '#00f0ff' },
    { id: 'time-trial', name: 'TIME TRIAL', color: '#00ff88' },
    { id: 'infinite', name: 'INFINITE', color: '#ff00ff' },
    { id: 'seeds', name: 'SEEDS', color: '#ffff00' },
  ];

  const periods = [
    { id: 'day', name: 'AUJOURD\'HUI' },
    { id: 'week', name: 'SEMAINE' },
    { id: 'month', name: 'MOIS' },
    { id: 'all', name: 'TOUS TEMPS' },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6" style={{ color: '#ffd700' }} />;
    if (rank === 2) return <Medal className="w-6 h-6" style={{ color: '#c0c0c0' }} />;
    if (rank === 3) return <Award className="w-6 h-6" style={{ color: '#cd7f32' }} />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return { bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', text: '#ffd700' };
    if (rank === 2) return { bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.3)', text: '#c0c0c0' };
    if (rank === 3) return { bg: 'rgba(205,127,50,0.1)', border: 'rgba(205,127,50,0.3)', text: '#cd7f32' };
    return { bg: 'rgba(0,240,255,0.05)', border: 'rgba(0,240,255,0.1)', text: '#00f0ff' };
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      
      {/* === NAV BAR === */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3" style={{ background: 'rgba(5,8,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            <Link href="/game" className="text-gray-400 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">JOUER</Link>
            <Link href="/shop" className="text-gray-400 hover:text-[#ff00ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">BOUTIQUE</Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
                  <span className="text-[#00f0ff] text-xs font-bold">{user?.name || 'JOUEUR'}</span>
                </div>
              </Link>
            ) : (
              <a href={`/api/oauth/login`} className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105" style={{ background: 'rgba(255,0,255,0.15)', border: '1px solid rgba(255,0,255,0.3)', color: '#ff00ff' }}>
                CONNEXION
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="pt-20 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
              <span style={{ color: '#00f0ff', textShadow: '0 0 30px rgba(0,240,255,0.5)' }}>LEADER</span>
              <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>BOARD</span>
            </h1>
            <p className="text-gray-500 text-sm font-mono">Classement mondial des meilleurs joueurs</p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Mode Filter */}
            <div>
              <p className="text-xs text-gray-500 font-mono mb-2">MODE</p>
              <div className="flex flex-wrap gap-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-all ${selectedMode === mode.id ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                    style={{
                      background: selectedMode === mode.id ? `${mode.color}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedMode === mode.id ? `${mode.color}40` : 'rgba(255,255,255,0.1)'}`,
                      color: selectedMode === mode.id ? mode.color : '#888',
                    }}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Filter */}
            <div>
              <p className="text-xs text-gray-500 font-mono mb-2">PÉRIODE</p>
              <div className="flex flex-wrap gap-2">
                {periods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-all ${selectedPeriod === period.id ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                    style={{
                      background: selectedPeriod === period.id ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedPeriod === period.id ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: selectedPeriod === period.id ? '#00f0ff' : '#888',
                    }}
                  >
                    {period.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <Card style={{ background: 'rgba(13,18,48,0.6)', border: '1px solid rgba(0,240,255,0.15)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00f0ff]">
                <Trophy className="w-5 h-5" />
                Classement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const colors = getRankColor(rank);
                    const isCurrentUser = isAuthenticated && entry.userId === user?.id;

                    return (
                      <div
                        key={`${entry.userId}-${entry.score}`}
                        className="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
                        style={{
                          background: isCurrentUser ? 'rgba(255,0,255,0.1)' : colors.bg,
                          border: `1px solid ${isCurrentUser ? 'rgba(255,0,255,0.3)' : colors.border}`,
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0"
                            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                            {getRankIcon(rank) || `#${rank}`}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">
                              {entry.userName || 'Joueur'}
                              {isCurrentUser && <span className="ml-2 text-xs" style={{ color: '#ff00ff' }}>(VOUS)</span>}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{entry.mode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black" style={{ color: colors.text }}>
                            {entry.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{new Date(entry.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: '#00f0ff' }} />
                  <p className="text-gray-500 mb-4">Aucun score pour cette période</p>
                  <Link href="/game">
                    <Button style={{ background: 'rgba(0,240,255,0.2)', color: '#00f0ff' }}>
                      Soyez le premier !
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
