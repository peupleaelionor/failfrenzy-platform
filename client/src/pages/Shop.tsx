/**
 * FAIL FRENZY - Shop Page
 * Skins marketplace with visual previews, token purchase, and rarity system
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Sparkles, Lock, Check, Coins, Star } from "lucide-react";
import { toast } from "sonner";

const ASSETS = {
  logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663278017338/OzPqrjVSMXFHuMQc.png",
};

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'rgba(128,128,128,0.1)', border: 'rgba(128,128,128,0.3)', text: '#888888', glow: 'rgba(128,128,128,0.2)' },
  rare: { bg: 'rgba(0,240,255,0.1)', border: 'rgba(0,240,255,0.3)', text: '#00f0ff', glow: 'rgba(0,240,255,0.3)' },
  epic: { bg: 'rgba(255,0,255,0.1)', border: 'rgba(255,0,255,0.3)', text: '#ff00ff', glow: 'rgba(255,0,255,0.3)' },
  legendary: { bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', text: '#ffd700', glow: 'rgba(255,215,0,0.3)' },
};

export default function Shop() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Fetch data
  const { data: skins, refetch: refetchSkins } = trpc.shop.getSkins.useQuery(undefined, { enabled: isAuthenticated });
  const { data: mySkins } = trpc.shop.getMySkins.useQuery(undefined, { enabled: isAuthenticated });
  const { data: tokenBalance, refetch: refetchBalance } = trpc.tokens.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  
  const purchaseSkin = trpc.shop.purchaseSkin.useMutation({
    onSuccess: () => {
      toast.success('Skin acheté avec succès !');
      refetchSkins();
      refetchBalance();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'achat');
    },
  });

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

  const mySkinIds = new Set(mySkins?.map(s => s.id) || []);
  const filteredSkins = skins?.filter(s => selectedRarity === 'all' || s.rarity === selectedRarity) || [];

  const handlePurchase = (skinId: string, price: number) => {
    if ((tokenBalance || 0) < price) {
      toast.error('Tokens insuffisants');
      return;
    }
    purchaseSkin.mutate({ skinId });
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
            <Link href="/leaderboard" className="text-gray-400 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">CLASSEMENT</Link>
            <Link href="/dashboard">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
                <span className="text-[#00f0ff] text-xs font-bold">{user?.name || 'JOUEUR'}</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                  <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>BOUTIQUE</span>
                  <span className="text-white ml-3">DE SKINS</span>
                </h1>
                <p className="text-gray-500 text-sm font-mono">Personnalise ton joueur avec des skins exclusifs</p>
              </div>
              
              {/* Token Balance */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(255,255,0,0.1)', border: '1px solid rgba(255,255,0,0.3)' }}>
                  <Coins className="w-5 h-5" style={{ color: '#ffff00' }} />
                  <div>
                    <p className="text-xs text-gray-500 font-mono">TOKENS</p>
                    <p className="text-xl font-black" style={{ color: '#ffff00', textShadow: '0 0 15px rgba(255,255,0,0.4)' }}>
                      {tokenBalance || 0}
                    </p>
                  </div>
                </div>
                <Link href="/premium">
                  <Button className="gap-2" style={{ background: 'linear-gradient(90deg, #ffff00, #ff6600)', color: '#050818' }}>
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-bold">ACHETER</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Rarity Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRarity('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-all ${selectedRarity === 'all' ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                style={{
                  background: selectedRarity === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedRarity === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: '#fff',
                }}
              >
                TOUS
              </button>
              {Object.entries(RARITY_COLORS).map(([rarity, colors]) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-all uppercase ${selectedRarity === rarity ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                  style={{
                    background: selectedRarity === rarity ? colors.bg : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedRarity === rarity ? colors.border : 'rgba(255,255,255,0.1)'}`,
                    color: selectedRarity === rarity ? colors.text : '#888',
                    boxShadow: selectedRarity === rarity ? `0 0 20px ${colors.glow}` : 'none',
                  }}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>

          {/* Skins Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSkins.map((skin) => {
              const isOwned = mySkinIds.has(skin.id);
              const rarity = RARITY_COLORS[skin.rarity || 'common'];

              return (
                <Card
                  key={skin.id}
                  className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${rarity.bg} 0%, rgba(13,18,48,0.6) 100%)`,
                    border: `1px solid ${rarity.border}`,
                    boxShadow: `0 0 20px ${rarity.glow}`,
                  }}
                >
                  <CardContent className="p-0">
                    {/* Skin Preview */}
                    <div className="relative aspect-square p-6 flex items-center justify-center" style={{ background: 'rgba(5,8,24,0.5)' }}>
                      {/* Placeholder for skin preview - would use SkinPreviewCanvas from GameComponents */}
                      <div className="w-24 h-24 rounded-full" style={{
                        background: `radial-gradient(circle, ${rarity.text} 0%, transparent 70%)`,
                        boxShadow: `0 0 40px ${rarity.glow}, inset 0 0 30px ${rarity.glow}`,
                      }} />
                      
                      {/* Rarity Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="uppercase text-xs font-bold" style={{ background: rarity.bg, color: rarity.text, border: `1px solid ${rarity.border}` }}>
                          {skin.rarity}
                        </Badge>
                      </div>

                      {/* Owned Badge */}
                      {isOwned && (
                        <div className="absolute top-2 left-2">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,255,136,0.2)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>
                            <Check className="w-3 h-3" />
                            <span>POSSÉDÉ</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skin Info */}
                    <div className="p-4">
                      <h3 className="font-black text-lg mb-1 tracking-wide" style={{ color: rarity.text }}>
                        {skin.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                        {skin.description || 'Skin exclusif pour personnaliser votre joueur'}
                      </p>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4" style={{ color: '#ffff00' }} />
                          <span className="font-black text-lg" style={{ color: '#ffff00' }}>
                            {skin.priceTokens}
                          </span>
                        </div>

                        {isOwned ? (
                          <Button size="sm" disabled className="gap-1.5" style={{ background: 'rgba(0,255,136,0.2)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>
                            <Check className="w-4 h-4" />
                            <span className="font-bold">POSSÉDÉ</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(skin.id, skin.priceTokens)}
                            disabled={purchaseSkin.isPending || (tokenBalance || 0) < skin.priceTokens}
                            className="gap-1.5"
                            style={{
                              background: (tokenBalance || 0) >= skin.priceTokens ? `linear-gradient(90deg, ${rarity.text}, ${rarity.text}CC)` : 'rgba(128,128,128,0.2)',
                              color: (tokenBalance || 0) >= skin.priceTokens ? '#050818' : '#666',
                              border: `1px solid ${(tokenBalance || 0) >= skin.priceTokens ? rarity.border : 'rgba(128,128,128,0.3)'}`,
                            }}
                          >
                            {(tokenBalance || 0) < skin.priceTokens ? (
                              <>
                                <Lock className="w-4 h-4" />
                                <span className="font-bold">LOCKED</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span className="font-bold">ACHETER</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredSkins.length === 0 && (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: '#ff00ff' }} />
              <p className="text-gray-500 text-lg mb-2">Aucun skin disponible</p>
              <p className="text-gray-600 text-sm">Revenez plus tard pour découvrir de nouveaux skins !</p>
            </div>
          )}

          {/* Token Packs Section */}
          <div className="mt-16 pt-12 border-t" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                <span style={{ color: '#ffff00', textShadow: '0 0 30px rgba(255,255,0,0.5)' }}>PACKS</span>
                <span className="text-white ml-2">DE TOKENS</span>
              </h2>
              <p className="text-gray-500 text-sm">Achetez des tokens pour débloquer vos skins préférés</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { tokens: 100, price: 0.99, popular: false },
                { tokens: 500, price: 3.99, popular: true },
                { tokens: 1000, price: 6.99, popular: false },
              ].map((pack) => (
                <Card
                  key={pack.tokens}
                  className="relative overflow-hidden"
                  style={{
                    background: pack.popular ? 'linear-gradient(135deg, rgba(255,255,0,0.1) 0%, rgba(13,18,48,0.6) 100%)' : 'rgba(13,18,48,0.6)',
                    border: pack.popular ? '2px solid rgba(255,255,0,0.4)' : '1px solid rgba(255,255,0,0.2)',
                  }}
                >
                  {pack.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold tracking-wider rounded-bl-lg" style={{ background: '#ffff00', color: '#050818' }}>
                      POPULAIRE
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <Coins className="w-12 h-12 mx-auto mb-4" style={{ color: '#ffff00' }} />
                    <p className="text-3xl font-black mb-2" style={{ color: '#ffff00', textShadow: '0 0 20px rgba(255,255,0,0.4)' }}>
                      {pack.tokens}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">TOKENS</p>
                    <div className="mb-4">
                      <span className="text-2xl font-black text-white">{pack.price}</span>
                      <span className="text-gray-400 ml-1">&euro;</span>
                    </div>
                    <Link href="/premium">
                      <Button className="w-full" style={{ background: pack.popular ? 'linear-gradient(90deg, #ffff00, #ff6600)' : 'rgba(255,255,0,0.2)', color: pack.popular ? '#050818' : '#ffff00' }}>
                        <span className="font-bold">ACHETER</span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
