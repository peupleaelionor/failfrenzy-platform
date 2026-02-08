/**
 * FAIL FRENZY: ÉCHOS DU VIDE - Hangar des Vaisseaux
 * Boutique de skins avec preview visuel, système de rareté, tokens locaux
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { SKINS, type SkinDefinition, isSkinUnlocked, purchaseSkin } from '../game/SkinSystem';
import { AssetLoader } from '../game/AssetLoader';

const BASE = import.meta.env.BASE_URL || '/';

// Mapping rareté basé sur le prix
function getRarity(skin: SkinDefinition): 'common' | 'rare' | 'epic' | 'legendary' {
  if (skin.tier === 'free') return 'common';
  if (!skin.price) return 'common';
  if (skin.price < 150) return 'rare';
  if (skin.price < 250) return 'epic';
  return 'legendary';
}

const RARITY = {
  common: { label: 'COMMUN', bg: 'rgba(0,240,255,0.08)', border: 'rgba(0,240,255,0.25)', text: '#00f0ff', glow: 'rgba(0,240,255,0.2)' },
  rare: { label: 'RARE', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)', text: '#00ff88', glow: 'rgba(0,255,136,0.2)' },
  epic: { label: 'ÉPIQUE', bg: 'rgba(255,0,255,0.08)', border: 'rgba(255,0,255,0.25)', text: '#ff00ff', glow: 'rgba(255,0,255,0.2)' },
  legendary: { label: 'LÉGENDAIRE', bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.25)', text: '#ffd700', glow: 'rgba(255,215,0,0.25)' },
};

function SkinPreview({ skin, size = 80 }: { skin: SkinDefinition; size?: number }) {
  const [imgSrc, setImgSrc] = useState<string>('');
  
  useEffect(() => {
    const loader = new AssetLoader();
    if (skin.imageKey) {
      const img = loader.get(skin.imageKey);
      if (img) {
        setImgSrc(img.src);
      } else {
        // Fallback: construct path manually
        setImgSrc(`${BASE}02_SKINS_VAISSEAUX/${AssetLoader.MANIFEST[skin.imageKey]?.split('/').pop() || ''}`);
      }
    }
  }, [skin]);

  if (imgSrc) {
    return (
      <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={imgSrc} 
          alt={skin.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            filter: `drop-shadow(0 0 ${size * 0.2}px ${skin.core.glowColor})`,
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  // Fallback: draw diamond
  return <div style={{ width: size, height: size, background: skin.core.color, borderRadius: '4px' }} />;
}

function getTokens(): number {
  try { return parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10); } catch { return 500; }
}
function setTokens(n: number) { localStorage.setItem('failfrenzy_tokens', String(n)); }

export default function Shop() {
  const [tokens, setTokensState] = useState(getTokens());
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [message, setMessage] = useState('');

  const handlePurchase = (skin: SkinDefinition) => {
    const price = skin.tier === 'free' ? 0 : (skin.price || 0);
    if (tokens >= price) {
      const success = purchaseSkin(skin.id);
      if (success) {
        const newTokens = tokens - price;
        setTokens(newTokens);
        setTokensState(newTokens);
        setMessage(`✅ ${skin.name} équipé !`);
        setTimeout(() => setMessage(''), 3000);
      }
    } else {
      setMessage(`❌ Pas assez de tokens (besoin de ${price - tokens} de plus)`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredSkins = SKINS.filter(s => filter === 'all' || getRarity(s) === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`} alt="Fail Frenzy" style={{ width: 50, height: 50 }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(90deg, #00f0ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            FAIL<span style={{ color: '#ff00ff' }}>FRENZY</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/game"><button style={{ padding: '10px 20px', background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', borderRadius: '8px', color: '#00f0ff', fontWeight: 700, cursor: 'pointer' }}>JOUER</button></Link>
          <Link href="/leaderboard"><button style={{ padding: '10px 20px', background: 'rgba(255,0,255,0.1)', border: '2px solid #ff00ff', borderRadius: '8px', color: '#ff00ff', fontWeight: 700, cursor: 'pointer' }}>CLASSEMENT</button></Link>
          <div style={{ padding: '10px 20px', background: 'rgba(255,215,0,0.1)', border: '2px solid #ffd700', borderRadius: '8px', fontWeight: 700, color: '#ffd700' }}>
            🪙 TOKENS <span style={{ fontSize: '1.2rem', marginLeft: '5px' }}>{tokens}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 40px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textAlign: 'center', marginBottom: '10px', textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>
          🚀 HANGAR DES VAISSEAUX
        </h2>
        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '1.1rem' }}>
          Personnalise ton Vaisseau-Écho. Collectionne. Domine le Vide Stellaire.
        </p>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 20px',
              background: filter === f ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.05)',
              border: filter === f ? '2px solid #00f0ff' : '2px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: filter === f ? '#00f0ff' : '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            {f === 'all' ? 'TOUS' : RARITY[f].label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 20px', padding: '15px', background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', borderRadius: '8px', textAlign: 'center', fontWeight: 700 }}>
          {message}
        </div>
      )}

      {/* Skins Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredSkins.map(skin => {
          const rarity = getRarity(skin);
          const rarityStyle = RARITY[rarity];
          const owned = isSkinUnlocked(skin.id);
          const price = skin.tier === 'free' ? 0 : (skin.price || 0);

          return (
            <div
              key={skin.id}
              style={{
                background: rarityStyle.bg,
                border: `2px solid ${rarityStyle.border}`,
                borderRadius: '12px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 0 20px ${rarityStyle.glow}`,
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Rarity Badge */}
              <div style={{ position: 'absolute', top: 10, right: 10, padding: '5px 10px', background: rarityStyle.bg, border: `1px solid ${rarityStyle.border}`, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: rarityStyle.text }}>
                {owned ? '✅ POSSÉDÉ' : rarityStyle.label}
              </div>

              {/* Preview */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', minHeight: '120px', alignItems: 'center' }}>
                <SkinPreview skin={skin} size={100} />
              </div>

              {/* Info */}
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '8px', color: rarityStyle.text }}>{skin.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#bbb', marginBottom: '15px', minHeight: '40px' }}>{skin.unlock.label}</p>

              {/* Action */}
              {owned ? (
                <button style={{ width: '100%', padding: '12px', background: 'rgba(0,255,136,0.2)', border: '2px solid #00ff88', borderRadius: '8px', color: '#00ff88', fontWeight: 700, cursor: 'default' }}>
                  ✅ ÉQUIPÉ
                </button>
              ) : price === 0 ? (
                <button onClick={() => handlePurchase(skin)} style={{ width: '100%', padding: '12px', background: 'rgba(0,240,255,0.2)', border: '2px solid #00f0ff', borderRadius: '8px', color: '#00f0ff', fontWeight: 700, cursor: 'pointer' }}>
                  🎁 GRATUIT
                </button>
              ) : (
                <button onClick={() => handlePurchase(skin)} disabled={tokens < price} style={{ width: '100%', padding: '12px', background: tokens >= price ? rarityStyle.bg : 'rgba(128,128,128,0.1)', border: `2px solid ${tokens >= price ? rarityStyle.border : '#555'}`, borderRadius: '8px', color: tokens >= price ? rarityStyle.text : '#555', fontWeight: 700, cursor: tokens >= price ? 'pointer' : 'not-allowed' }}>
                  🪙 {price}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: '1200px', margin: '60px auto 0', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
        <p>Fail Frenzy: Échos du Vide © 2026 — Tous les skins sont cosmétiques uniquement. Aucun avantage gameplay.</p>
      </div>
    </div>
  );
}
