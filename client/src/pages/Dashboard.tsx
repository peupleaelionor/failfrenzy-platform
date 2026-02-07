/**
 * FAIL FRENZY - Dashboard Page
 * User statistics, game history, achievements, and progression graphs
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, Target, Clock, TrendingUp, Award, Star, Flame } from "lucide-react";

const ASSETS = {
  logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663278017338/OzPqrjVSMXFHuMQc.png",
};

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Fetch user data
  const { data: stats } = trpc.game.getMyStats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: scores } = trpc.game.getMyScores.useQuery({ limit: 10 }, { enabled: isAuthenticated });
  const { data: achievements } = trpc.achievements.getMy.useQuery(undefined, { enabled: isAuthenticated });
  const { data: tokenBalance } = trpc.tokens.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const { data: premiumStatus } = trpc.premium.checkStatus.useQuery(undefined, { enabled: isAuthenticated });

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050818] flex items-center justify-center">
        <div className="text-center">
          <img src={ASSETS.logo} alt="Loading" className="w-24 h-24 mx-auto mb-4 animate-spin"
            style={{ filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.5))' }} />
          <p className="text-[#00f0ff] font-mono text-sm">LOADING...</p>
        </div>
      </div>
    );
  }

  const totalGames = stats?.totalGames || 0;
  const highScore = stats?.highScore || 0;
  const totalPlayTime = stats?.totalPlayTime || 0;
  const avgScore = stats?.totalGames ? Math.round(stats.totalScore / stats.totalGames) : 0;

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
            <Link href="/leaderboard" className="text-gray-400 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">CLASSEMENT</Link>
            <Link href="/shop" className="text-gray-400 hover:text-[#ff00ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">BOUTIQUE</Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
              <span className="text-[#00f0ff] text-xs font-bold">{user?.name || 'JOUEUR'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                  <span style={{ color: '#00f0ff', textShadow: '0 0 30px rgba(0,240,255,0.5)' }}>DASHBOARD</span>
                </h1>
                <p className="text-gray-500 text-sm font-mono">Bienvenue, {user?.name}</p>
              </div>
              {!premiumStatus && (
                <Link href="/premium">
                  <Button className="gap-2" style={{ background: 'linear-gradient(90deg, #ff00ff, #00f0ff)', color: '#050818' }}>
                    <Star className="w-4 h-4" />
                    <span className="font-bold">GO PREMIUM</span>
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(0,240,255,0.02) 100%)', border: '1px solid rgba(0,240,255,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5" style={{ color: '#00f0ff' }} />
                  <span className="text-xs font-mono text-gray-500">HIGH SCORE</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: '#00f0ff', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
                  {highScore.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,0,255,0.08) 0%, rgba(255,0,255,0.02) 100%)', border: '1px solid rgba(255,0,255,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" style={{ color: '#ff00ff' }} />
                  <span className="text-xs font-mono text-gray-500">PARTIES</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: '#ff00ff', textShadow: '0 0 20px rgba(255,0,255,0.4)' }}>
                  {totalGames}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,0,0.08) 0%, rgba(255,255,0,0.02) 100%)', border: '1px solid rgba(255,255,0,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5" style={{ color: '#ffff00' }} />
                  <span className="text-xs font-mono text-gray-500">TOKENS</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: '#ffff00', textShadow: '0 0 20px rgba(255,255,0,0.4)' }}>
                  {tokenBalance || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.08) 0%, rgba(0,255,136,0.02) 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" style={{ color: '#00ff88' }} />
                  <span className="text-xs font-mono text-gray-500">TEMPS</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>
                  {Math.floor(totalPlayTime / 60)}m
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6" style={{ background: 'rgba(13,18,48,0.6)', border: '1px solid rgba(0,240,255,0.1)' }}>
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#00f0ff]/20 data-[state=active]:text-[#00f0ff]">
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#ff00ff]/20 data-[state=active]:text-[#ff00ff]">
                Historique
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-[#ffff00]/20 data-[state=active]:text-[#ffff00]">
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Performance Chart */}
                <Card style={{ background: 'rgba(13,18,48,0.6)', border: '1px solid rgba(0,240,255,0.15)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00f0ff]">
                      <TrendingUp className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Score moyen</span>
                          <span className="font-bold text-[#00f0ff]">{Math.round(avgScore)}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,240,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (avgScore / highScore) * 100)}%`, background: 'linear-gradient(90deg, #00f0ff, #00ff88)' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Meilleur score</span>
                          <span className="font-bold text-[#ff00ff]">{highScore}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,0,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #ff00ff, #ffff00)' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Parties jouées</span>
                          <span className="font-bold text-[#ffff00]">{totalGames}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,0,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (totalGames / 100) * 100)}%`, background: 'linear-gradient(90deg, #ffff00, #ff6600)' }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card style={{ background: 'rgba(13,18,48,0.6)', border: '1px solid rgba(255,0,255,0.15)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#ff00ff]">
                      <Target className="w-5 h-5" />
                      Actions Rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/game">
                      <Button className="w-full justify-start gap-2" variant="outline" style={{ borderColor: 'rgba(0,240,255,0.3)', color: '#00f0ff' }}>
                        <Zap className="w-4 h-4" />
                        Jouer une partie
                      </Button>
                    </Link>
                    <Link href="/shop">
                      <Button className="w-full justify-start gap-2" variant="outline" style={{ borderColor: 'rgba(255,0,255,0.3)', color: '#ff00ff' }}>
                        <Star className="w-4 h-4" />
                        Boutique de skins
                      </Button>
                    </Link>
                    <Link href="/leaderboard">
                      <Button className="w-full justify-start gap-2" variant="outline" style={{ borderColor: 'rgba(255,255,0,0.3)', color: '#ffff00' }}>
                        <Trophy className="w-4 h-4" />
                        Voir le classement
                      </Button>
                    </Link>
                    {!premiumStatus && (
                      <Link href="/premium">
                        <Button className="w-full justify-start gap-2" style={{ background: 'linear-gradient(90deg, #ff00ff, #00f0ff)', color: '#050818' }}>
                          <Award className="w-4 h-4" />
                          Passer Premium
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card style={{ background: 'rgba(13,18,48,0.6)', border: '1px solid rgba(0,240,255,0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-[#00f0ff]">Historique des Parties</CardTitle>
                </CardHeader>
                <CardContent>
                  {scores && scores.length > 0 ? (
                    <div className="space-y-3">
                      {scores.map((score, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black" style={{ background: 'rgba(0,240,255,0.2)', color: '#00f0ff' }}>
                              #{idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-white">{score.score} points</p>
                              <p className="text-xs text-gray-500 font-mono">{score.mode} • {score.fails} fails</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono text-gray-400">{new Date(score.createdAt).toLocaleDateString('fr-FR')}</p>
                            <p className="text-xs text-gray-600">{score.time}s</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Aucune partie jouée pour le moment</p>
                      <Link href="/game">
                        <Button style={{ background: 'rgba(0,240,255,0.2)', color: '#00f0ff' }}>
                          Jouer maintenant
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card style={{ background: 'rgba(13,18,48,0.6)', border: '1px solid rgba(255,255,0,0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-[#ffff00]">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements && achievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 rounded-lg text-center" style={{ background: 'rgba(255,255,0,0.05)', border: '1px solid rgba(255,255,0,0.2)' }}>
                          <Award className="w-12 h-12 mx-auto mb-3" style={{ color: '#ffff00' }} />
                          <p className="font-bold text-white mb-1">{achievement.name}</p>
                          <p className="text-xs text-gray-500">{achievement.description}</p>
                          <p className="text-xs font-mono mt-2" style={{ color: '#ffff00' }}>+{achievement.rewardTokens} tokens</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: '#ffff00' }} />
                      <p className="text-gray-500 mb-4">Aucun achievement débloqué</p>
                      <Link href="/game">
                        <Button style={{ background: 'rgba(255,255,0,0.2)', color: '#ffff00' }}>
                          Commencer à jouer
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
