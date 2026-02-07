/**
 * FAIL FRENZY - Premium Page
 * Subscription plans and token packs with Stripe checkout
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Zap, Crown, Sparkles, Coins, Trophy } from "lucide-react";
import { toast } from "sonner";

const ASSETS = {
  logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663278017338/OzPqrjVSMXFHuMQc.png",
};

export default function Premium() {
  const { user, isAuthenticated, loading } = useAuth();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const { data: premiumStatus } = trpc.premium.checkStatus.useQuery(undefined, { enabled: isAuthenticated });
  
  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Redirection vers le paiement...');
      }
      setProcessingCheckout(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la création du checkout');
      setProcessingCheckout(false);
    },
  });

  const handleSubscribe = (priceId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setProcessingCheckout(true);
    createCheckout.mutate({ productKey: priceId as any });
  };

  const handleBuyTokens = (priceId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setProcessingCheckout(true);
    createCheckout.mutate({ productKey: priceId as any });
  };

  const subscriptionPlans = [
    {
      id: 'monthly',
      name: 'Premium Mensuel',
      price: 4.99,
      period: '/mois',
      priceId: 'PREMIUM_MONTHLY',
      popular: false,
      features: [
        'Tous les modes de jeu illimités',
        'Pas de publicités',
        'Leaderboard global',
        '20+ skins exclusifs',
        'Statistiques avancées',
        'Défis quotidiens premium',
        'Support prioritaire',
      ],
    },
    {
      id: 'yearly',
      name: 'Premium Annuel',
      price: 39.99,
      period: '/an',
      priceId: 'PREMIUM_YEARLY',
      popular: true,
      features: [
        'Tous les avantages mensuels',
        'Économisez 33% (2 mois gratuits)',
        'Badge exclusif "Founder"',
        'Accès anticipé aux nouveautés',
        'Skin légendaire offert',
        '1000 tokens bonus',
        'Nom en couleur dans le leaderboard',
      ],
    },
  ];

  const tokenPacks = [
    { tokens: 100, price: 0.99, priceId: 'TOKENS_100', popular: false },
    { tokens: 500, price: 3.99, priceId: 'TOKENS_500', popular: true },
    { tokens: 1000, price: 6.99, priceId: 'TOKENS_1000', popular: false },
  ];

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
              <a href={getLoginUrl()} className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105" style={{ background: 'rgba(255,0,255,0.15)', border: '1px solid rgba(255,0,255,0.3)', color: '#ff00ff' }}>
                CONNEXION
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-12 h-12" style={{ color: '#ffd700' }} />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span style={{ color: '#ffd700', textShadow: '0 0 40px rgba(255,215,0,0.5)' }}>PREMIUM</span>
            </h1>
            <p className="text-gray-400 text-lg mb-2">Débloquez tout le potentiel de Fail Frenzy</p>
            {premiumStatus && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-4" style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)' }}>
                <Check className="w-5 h-5" style={{ color: '#00ff88' }} />
                <span className="font-bold" style={{ color: '#00ff88' }}>VOUS ÊTES PREMIUM</span>
              </div>
            )}
          </div>

          {/* Subscription Plans */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">
              <span style={{ color: '#ff00ff' }}>ABONNEMENTS</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="relative overflow-hidden"
                  style={{
                    background: plan.popular ? 'linear-gradient(135deg, rgba(255,0,255,0.15) 0%, rgba(13,18,48,0.6) 100%)' : 'rgba(13,18,48,0.6)',
                    border: plan.popular ? '2px solid rgba(255,0,255,0.4)' : '1px solid rgba(0,240,255,0.2)',
                  }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold tracking-wider rounded-bl-lg" style={{ background: '#ff00ff', color: '#050818' }}>
                      POPULAIRE
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-center">
                      <p className="text-2xl font-black mb-2" style={{ color: plan.popular ? '#ff00ff' : '#00f0ff' }}>
                        {plan.name}
                      </p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-white">{plan.price}</span>
                        <span className="text-gray-400">&euro;</span>
                        <span className="text-gray-500 text-sm">{plan.period}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: plan.popular ? '#ff00ff' : '#00f0ff' }} />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={processingCheckout || premiumStatus}
                      className="w-full gap-2"
                      style={{
                        background: plan.popular ? 'linear-gradient(90deg, #ff00ff, #00f0ff)' : 'rgba(0,240,255,0.2)',
                        color: plan.popular ? '#050818' : '#00f0ff',
                      }}
                    >
                      {premiumStatus ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="font-bold">ACTIF</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          <span className="font-bold">S'ABONNER</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Token Packs */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">
              <span style={{ color: '#ffff00' }}>PACKS DE TOKENS</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {tokenPacks.map((pack) => (
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
                      MEILLEUR
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <Coins className="w-12 h-12 mx-auto mb-4" style={{ color: '#ffff00' }} />
                    <p className="text-4xl font-black mb-2" style={{ color: '#ffff00', textShadow: '0 0 20px rgba(255,255,0,0.4)' }}>
                      {pack.tokens}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">TOKENS</p>
                    <div className="mb-4">
                      <span className="text-3xl font-black text-white">{pack.price}</span>
                      <span className="text-gray-400 ml-1">&euro;</span>
                    </div>
                    <Button
                      onClick={() => handleBuyTokens(pack.priceId)}
                      disabled={processingCheckout}
                      className="w-full"
                      style={{
                        background: pack.popular ? 'linear-gradient(90deg, #ffff00, #ff6600)' : 'rgba(255,255,0,0.2)',
                        color: pack.popular ? '#050818' : '#ffff00',
                      }}
                    >
                      <span className="font-bold">ACHETER</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Features Showcase */}
          <section className="mt-16 pt-12 border-t" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">
              <span style={{ color: '#00f0ff' }}>POURQUOI</span>
              <span className="text-white ml-2">PREMIUM ?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: 'Sans Publicités', desc: 'Expérience de jeu fluide sans interruption', color: '#00f0ff' },
                { icon: Trophy, title: 'Leaderboard Global', desc: 'Comparez vos scores avec le monde entier', color: '#ff00ff' },
                { icon: Sparkles, title: 'Skins Exclusifs', desc: 'Accédez à plus de 20 skins premium', color: '#ffff00' },
                { icon: Crown, title: 'Badge Prestige', desc: 'Montrez votre statut dans le jeu', color: '#ffd700' },
                { icon: Star, title: 'Défis Premium', desc: 'Débloquez des défis uniques chaque jour', color: '#00ff88' },
                { icon: Zap, title: 'Support Prioritaire', desc: 'Assistance rapide et personnalisée', color: '#ff6600' },
              ].map((feature, idx) => (
                <div key={idx} className="p-6 rounded-xl text-center" style={{ background: 'rgba(13,18,48,0.6)', border: `1px solid ${feature.color}30` }}>
                  <feature.icon className="w-12 h-12 mx-auto mb-4" style={{ color: feature.color }} />
                  <h3 className="font-black text-lg mb-2" style={{ color: feature.color }}>{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          {!isAuthenticated && (
            <div className="mt-12 text-center">
              <p className="text-gray-500 mb-4">Connectez-vous pour accéder aux offres Premium</p>
              <a href={getLoginUrl()}>
                <Button className="gap-2" style={{ background: 'linear-gradient(90deg, #ff00ff, #00f0ff)', color: '#050818' }}>
                  <Star className="w-4 h-4" />
                  <span className="font-bold">SE CONNECTER</span>
                </Button>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
