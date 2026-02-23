import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { SKINS, type SkinDefinition, isSkinUnlocked, purchaseSkin } from '../game/SkinSystem';
import { AssetLoader } from '../game/AssetLoader';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const BASE = import.meta.env.BASE_URL;

function getRarity(skin: SkinDefinition): 'common' | 'rare' | 'epic' | 'legendary' {
  if (skin.tier === 'free') return 'common';
  if (!skin.price) return 'common';
  if (skin.price < 150) return 'rare';
  if (skin.price < 250) return 'epic';
  return 'legendary';
}

const RARITY_STYLES = {
  common: { label: 'COMMUN', color: '#00f0ff', glow: 'rgba(0,240,255,0.2)' },
  rare: { label: 'RARE', color: '#00ff88', glow: 'rgba(0,255,136,0.2)' },
  epic: { label: 'EPIQUE', color: '#ff00ff', glow: 'rgba(255,0,255,0.2)' },
  legendary: { label: 'LEGENDAIRE', color: '#ffd700', glow: 'rgba(255,215,0,0.25)' },
};

function SkinPreview({ skin, size = 100 }: { skin: SkinDefinition; size?: number }) {
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    if (skin.imageKey) {
      const loader = new AssetLoader();
      const img = loader.get(skin.imageKey);
      if (img) {
        setImgSrc(img.src);
      } else {
        const filename = AssetLoader.MANIFEST[skin.imageKey]?.split('/').pop() || '';
        setImgSrc(`${BASE}02_SKINS_VAISSEAUX/${filename}`);
      }
    }
  }, [skin]);

  if (imgSrc) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <img
          src={imgSrc}
          alt={skin.name}
          className="max-w-full max-h-full object-contain"
          style={{
            filter: `drop-shadow(0 0 ${size * 0.15}px ${skin.core.glowColor})`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-lg"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${skin.core.color}, ${skin.core.glowColor})`,
        opacity: 0.6,
      }}
    />
  );
}

function getTokens(): number {
  try {
    return parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10);
  } catch {
    return 500;
  }
}

function setTokens(n: number) {
  localStorage.setItem('failfrenzy_tokens', String(n));
}

export default function Shop() {
  const [tokens, setTokensState] = useState(getTokens());
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [message, setMessage] = useState('');
  const [selectedSkin, setSelectedSkin] = useState<SkinDefinition | null>(null);

  const handlePurchase = (skin: SkinDefinition) => {
    const price = skin.tier === 'free' ? 0 : (skin.price || 0);
    if (tokens >= price) {
      const success = purchaseSkin(skin.id);
      if (success) {
        const newTokens = tokens - price;
        setTokens(newTokens);
        setTokensState(newTokens);
        setMessage(`${skin.name} requisitionne avec succes !`);
        setTimeout(() => setMessage(''), 3000);
      }
    } else {
      setMessage(`Pas assez de tokens (besoin de ${price - tokens} de plus)`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredSkins = SKINS.filter((s) => filter === 'all' || getRarity(s) === filter);

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <NavBar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${BASE}03_ENVIRONNEMENTS/BG_Tunnel_Donnees.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050818] via-[#050818]/80 to-[#050818]" />
      </div>

      <StarField count={25} />

      <main className="relative z-10 px-4 pt-24 pb-10 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <img
            src={`${BASE}04_UI_UX/Shop_Interface_Boutique.png`}
            alt=""
            className="w-20 h-20 mx-auto mb-4 object-contain"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,0,255,0.5))' }}
          />
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3"
            style={{
              background: 'linear-gradient(135deg, #ff00ff, #00f0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            HANGAR DES VAISSEAUX
          </h1>
          <p className="text-gray-500 text-sm font-mono tracking-wider">
            Personnalise ton Vaisseau-Echo. Collectionne. Domine le Vide.
          </p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((f) => {
              const style = f === 'all' ? { color: '#fff' } : RARITY_STYLES[f];
              const c = f === 'all' ? '#fff' : style.color;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-200"
                  style={{
                    background: filter === f ? `${c}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${filter === f ? `${c}50` : 'rgba(255,255,255,0.08)'}`,
                    color: filter === f ? c : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {f === 'all' ? 'TOUS' : RARITY_STYLES[f].label}
                </button>
              );
            })}
          </div>

          <div
            className="px-5 py-2.5 rounded-lg font-black text-sm tracking-wider"
            style={{
              background: 'rgba(255,215,0,0.08)',
              border: '1px solid rgba(255,215,0,0.3)',
              color: '#ffd700',
              boxShadow: '0 0 15px rgba(255,215,0,0.1)',
            }}
          >
            TOKENS: {tokens}
          </div>
        </div>

        {message && (
          <div
            className="mb-6 p-4 rounded-xl text-center font-bold text-sm tracking-wider"
            style={{
              background: message.includes('succes')
                ? 'rgba(0,255,136,0.08)'
                : 'rgba(255,45,123,0.08)',
              border: `1px solid ${message.includes('succes') ? 'rgba(0,255,136,0.3)' : 'rgba(255,45,123,0.3)'}`,
              color: message.includes('succes') ? '#00ff88' : '#ff2d7b',
            }}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkins.map((skin) => {
            const rarity = getRarity(skin);
            const rs = RARITY_STYLES[rarity];
            const owned = isSkinUnlocked(skin.id);
            const price = skin.tier === 'free' ? 0 : (skin.price || 0);
            const isSelected = selectedSkin?.id === skin.id;

            return (
              <div
                key={skin.id}
                className="group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedSkin(isSelected ? null : skin)}
                style={{
                  background: `linear-gradient(135deg, ${rs.color}08 0%, rgba(5,8,24,0.95) 100%)`,
                  border: `1px solid ${isSelected ? rs.color : `${rs.color}20`}`,
                  boxShadow: isSelected
                    ? `0 0 40px ${rs.glow}, inset 0 0 20px ${rs.color}08`
                    : `0 0 15px ${rs.glow}`,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider z-10"
                  style={{
                    background: `${rs.color}15`,
                    border: `1px solid ${rs.color}40`,
                    color: rs.color,
                  }}
                >
                  {owned ? 'POSSEDE' : rs.label}
                </div>

                <div className="p-6 flex flex-col items-center">
                  <div
                    className="relative mb-5 transition-transform duration-500 group-hover:scale-110"
                    style={{ minHeight: 120 }}
                  >
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-40"
                      style={{
                        background: `radial-gradient(circle, ${rs.color}30 0%, transparent 70%)`,
                        filter: 'blur(15px)',
                      }}
                    />
                    <SkinPreview skin={skin} size={110} />
                  </div>

                  <h3
                    className="text-xl font-black tracking-wider mb-1"
                    style={{ color: rs.color }}
                  >
                    {skin.name}
                  </h3>
                  <p className="text-gray-500 text-xs text-center mb-5 min-h-[32px]">
                    {skin.unlock.label}
                  </p>

                  {owned ? (
                    <div
                      className="w-full py-3 rounded-xl text-center text-sm font-black tracking-wider"
                      style={{
                        background: 'rgba(0,255,136,0.08)',
                        border: '1px solid rgba(0,255,136,0.3)',
                        color: '#00ff88',
                      }}
                    >
                      EQUIPE
                    </div>
                  ) : price === 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(skin);
                      }}
                      className="w-full py-3 rounded-xl text-sm font-black tracking-wider transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(0,240,255,0.12)',
                        border: '1px solid rgba(0,240,255,0.3)',
                        color: '#00f0ff',
                      }}
                    >
                      GRATUIT
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(skin);
                      }}
                      disabled={tokens < price}
                      className="w-full py-3 rounded-xl text-sm font-black tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background:
                          tokens >= price ? `${rs.color}12` : 'rgba(128,128,128,0.06)',
                        border: `1px solid ${tokens >= price ? `${rs.color}40` : 'rgba(128,128,128,0.2)'}`,
                        color: tokens >= price ? rs.color : '#555',
                      }}
                    >
                      {price} TOKENS
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/game">
            <button
              className="px-10 py-4 rounded-xl font-black tracking-wider transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #ff00ff)',
                color: '#050818',
                boxShadow: '0 0 30px rgba(0,240,255,0.3)',
              }}
            >
              TESTER EN MISSION
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
