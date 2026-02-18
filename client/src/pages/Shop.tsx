/**
 * FAIL FRENZY — HANGAR DES VAISSEAUX
 * Boutique premium avec vraies images, bonus/malus, effets spéciaux, lore
 */

import { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { SKINS, type SkinDefinition, isSkinUnlocked, purchaseSkin, getSelectedSkinId, setSelectedSkin } from '../game/SkinSystem';

const BASE = import.meta.env.BASE_URL || '/';

const RARITY_STYLES = {
  common: { label: 'COMMUN', bg: 'rgba(0,240,255,0.06)', border: 'rgba(0,240,255,0.25)', text: '#00f0ff', glow: '0 0 20px rgba(0,240,255,0.15)', gradient: 'linear-gradient(135deg, rgba(0,240,255,0.08), transparent)' },
  rare: { label: 'RARE', bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.25)', text: '#00ff88', glow: '0 0 20px rgba(0,255,136,0.15)', gradient: 'linear-gradient(135deg, rgba(0,255,136,0.08), transparent)' },
  epic: { label: 'ÉPIQUE', bg: 'rgba(255,0,255,0.06)', border: 'rgba(255,0,255,0.25)', text: '#ff00ff', glow: '0 0 20px rgba(255,0,255,0.15)', gradient: 'linear-gradient(135deg, rgba(255,0,255,0.08), transparent)' },
  legendary: { label: 'LÉGENDAIRE', bg: 'rgba(255,215,0,0.06)', border: 'rgba(255,215,0,0.3)', text: '#ffd700', glow: '0 0 25px rgba(255,215,0,0.2)', gradient: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,100,0,0.05), transparent)' },
};

/** Composant image de vaisseau - uniquement l'image avec glow, pas de cercle */
function SkinImage({ skin, size = 120, selected = false }: { skin: SkinDefinition; size?: number; selected?: boolean }) {
  return (
    <div style={{
      width: size, height: size, position: 'relative', display: 'inline-block',
    }}>
      <img
        src={skin.imagePath}
        alt={skin.name}
        style={{
          width: '100%', height: '100%', objectFit: 'contain',
          // Correction orientation : tous les vaisseaux vers la droite
          transform: 'rotate(90deg)',
          filter: selected ? `drop-shadow(0 0 15px ${skin.core.glowColor}) drop-shadow(0 0 30px ${skin.core.glowColor}80)` : `drop-shadow(0 0 8px ${skin.core.glowColor}60)`,
          transition: 'filter 0.3s',
        }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
}

/** Composant détail d'un skin en modal */
function SkinDetailModal({ skin, onClose, onEquip, onPurchase, owned, equipped, tokens }: {
  skin: SkinDefinition; onClose: () => void; onEquip: () => void; onPurchase: () => void;
  owned: boolean; equipped: boolean; tokens: number;
}) {
  const r = RARITY_STYLES[skin.rarity];
  const price = skin.price || 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
      
      {/* Modal */}
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', maxWidth: 520, width: '100%', background: '#0a0e1a',
        border: `2px solid ${r.border}`, borderRadius: 20, padding: '30px 24px',
        boxShadow: `0 0 60px ${skin.core.glowColor}20, inset 0 0 30px rgba(0,0,0,0.5)`,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
          color: '#666', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1,
        }}>✕</button>

        {/* Rarity badge */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ padding: '4px 16px', background: r.bg, border: `1px solid ${r.border}`, borderRadius: 20, fontSize: '0.7rem', fontWeight: 800, color: r.text, letterSpacing: 2 }}>
            {r.label}
          </span>
        </div>

        {/* Image */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0', animation: 'floatSkin 3s ease-in-out infinite' }}>
          <SkinImage skin={skin} size={160} selected={equipped} />
        </div>

        {/* Name & tagline */}
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 900, color: r.text, marginBottom: 4, textShadow: `0 0 20px ${skin.core.glowColor}40` }}>
          {skin.name}
        </h2>
        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: 16 }}>
          « {skin.tagline} »
        </p>

        {/* Lore */}
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 16 }}>
          <p style={{ color: '#888', fontSize: '0.8rem', lineHeight: 1.5 }}>{skin.lore}</p>
        </div>

        {/* Bonuses */}
        {skin.bonuses.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <h4 style={{ color: '#00ff88', fontSize: '0.75rem', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>AVANTAGES</h4>
            {skin.bonuses.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
                <span style={{ color: '#00ff88', fontWeight: 700, fontSize: '0.85rem' }}>{b.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Maluses */}
        {skin.maluses.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <h4 style={{ color: '#ff4444', fontSize: '0.75rem', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>INCONVÉNIENTS</h4>
            {skin.maluses.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.12)', borderRadius: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                <span style={{ color: '#ff6666', fontWeight: 700, fontSize: '0.85rem' }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Special Effect */}
        {skin.specialEffect && (
          <div style={{ marginBottom: 20, padding: '14px 16px', background: `linear-gradient(135deg, ${skin.core.glowColor}10, transparent)`, border: `1px solid ${skin.core.glowColor}30`, borderRadius: 12 }}>
            <h4 style={{ color: skin.core.glowColor, fontSize: '0.75rem', fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>
              EFFET SPÉCIAL — {skin.specialEffect.name.toUpperCase()}
            </h4>
            <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: 1.4 }}>{skin.specialEffect.description}</p>
            {skin.specialEffect.cooldown && skin.specialEffect.cooldown < 900 && (
              <p style={{ color: '#888', fontSize: '0.7rem', marginTop: 4 }}>Cooldown: {skin.specialEffect.cooldown}s</p>
            )}
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, fontSize: '0.65rem', color: '#aaa', fontWeight: 600 }}>
              {skin.specialEffect.trigger === 'passive' ? 'PASSIF' :
               skin.specialEffect.trigger === 'on_dodge' ? 'SUR ESQUIVE' :
               skin.specialEffect.trigger === 'on_hit' ? 'SUR IMPACT' :
               skin.specialEffect.trigger === 'on_combo' ? 'SUR COMBO' :
               skin.specialEffect.trigger === 'timed' ? 'AUTOMATIQUE' : 'SPÉCIAL'}
            </span>
          </div>
        )}

        {/* Trail style */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{ padding: '4px 10px', background: `${skin.trail.color}15`, border: `1px solid ${skin.trail.color}30`, borderRadius: 6, fontSize: '0.65rem', color: skin.trail.color, fontWeight: 700 }}>
            TRAÎNÉE {skin.trail.style.toUpperCase()}
          </span>
          {skin.effects.pulse && <span style={{ padding: '4px 10px', background: 'rgba(255,0,255,0.1)', border: '1px solid rgba(255,0,255,0.2)', borderRadius: 6, fontSize: '0.65rem', color: '#ff00ff', fontWeight: 700 }}>PULSE</span>}
          {skin.effects.particles && <span style={{ padding: '4px 10px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 6, fontSize: '0.65rem', color: '#ffd700', fontWeight: 700 }}>PARTICULES</span>}
          {skin.effects.distortion && <span style={{ padding: '4px 10px', background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.2)', borderRadius: 6, fontSize: '0.65rem', color: '#8a2be2', fontWeight: 700 }}>DISTORTION</span>}
          {skin.effects.scanlines && <span style={{ padding: '4px 10px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 6, fontSize: '0.65rem', color: '#00ff88', fontWeight: 700 }}>SCANLINES</span>}
        </div>

        {/* Action */}
        {equipped ? (
          <button style={{ width: '100%', padding: 16, background: 'rgba(0,240,255,0.15)', border: '2px solid #00f0ff', borderRadius: 12, color: '#00f0ff', fontWeight: 800, cursor: 'default', fontSize: '1rem', letterSpacing: 2 }}>
            ÉQUIPÉ
          </button>
        ) : owned ? (
          <button onClick={onEquip} style={{ width: '100%', padding: 16, background: 'rgba(0,255,136,0.1)', border: '2px solid #00ff88', borderRadius: 12, color: '#00ff88', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', letterSpacing: 2, transition: 'all 0.2s' }}>
            ÉQUIPER CE VAISSEAU
          </button>
        ) : skin.tier === 'free' ? (
          <button onClick={onPurchase} style={{ width: '100%', padding: 16, background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', borderRadius: 12, color: '#00f0ff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', letterSpacing: 2 }}>
            DÉBLOQUER
          </button>
        ) : (
          <button onClick={onPurchase} disabled={tokens < price} style={{
            width: '100%', padding: 16,
            background: tokens >= price ? r.bg : 'rgba(128,128,128,0.05)',
            border: `2px solid ${tokens >= price ? r.border : '#333'}`,
            borderRadius: 12, color: tokens >= price ? r.text : '#444',
            fontWeight: 800, cursor: tokens >= price ? 'pointer' : 'not-allowed',
            fontSize: '1rem', letterSpacing: 2,
          }}>
            {tokens >= price ? `${price} TOKENS — ACHETER` : `${price} TOKENS (${price - tokens} manquants)`}
          </button>
        )}
      </div>
    </div>
  );
}

function getTokens(): number {
  try { return parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10); } catch { return 500; }
}
function saveTokens(n: number) { localStorage.setItem('failfrenzy_tokens', String(n)); }

export default function Shop() {
  const [tokens, setTokensState] = useState(getTokens());
  const [selectedId, setSelectedId] = useState(getSelectedSkinId());
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [message, setMessage] = useState('');
  const [detailSkin, setDetailSkin] = useState<SkinDefinition | null>(null);
  const [, setUpdate] = useState(0);

  const showMsg = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const handleEquip = (skin: SkinDefinition) => {
    setSelectedSkin(skin.id);
    setSelectedId(skin.id);
    setDetailSkin(null);
    showMsg(`${skin.name} équipé !`);
  };

  const handlePurchase = (skin: SkinDefinition) => {
    if (skin.tier === 'free') {
      purchaseSkin(skin.id);
      setSelectedSkin(skin.id);
      setSelectedId(skin.id);
      setDetailSkin(null);
      setUpdate(n => n + 1);
      showMsg(`${skin.name} débloqué et équipé !`);
      return;
    }
    const price = skin.price || 0;
    if (tokens >= price) {
      purchaseSkin(skin.id);
      const newTokens = tokens - price;
      saveTokens(newTokens);
      setTokensState(newTokens);
      setSelectedSkin(skin.id);
      setSelectedId(skin.id);
      setDetailSkin(null);
      setUpdate(n => n + 1);
      showMsg(`${skin.name} acheté et équipé !`);
    } else {
      showMsg(`Pas assez de tokens ! Redirection vers la page de paiement...`);
      // Redirect to payment page after 1.5s
      setTimeout(() => { window.location.href = '/payment'; }, 1500);
    }
  };

  const filteredSkins = SKINS.filter(s => filter === 'all' || s.rarity === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #050818 0%, #0d0a2a 50%, #050818 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* CSS animations */}
      <style>{`
        @keyframes skinPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        @keyframes floatSkin { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes legendaryRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skin-card:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important; }
        .skin-card { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
        .skin-card:active { transform: scale(0.98); }
      `}</style>

      {/* Grid background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: 'linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <header style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <img src={`${BASE}logo-skull-imposing.png`} alt="" style={{ width: 44, height: 44, objectFit: 'cover', filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.5))' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>
              <span style={{ color: '#00f0ff' }}>FAIL</span><span style={{ color: '#ff00ff' }}> FRENZY</span>
            </span>
          </div>
        </Link>
        <nav style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/game"><button style={{ padding: '8px 18px', background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', borderRadius: 8, color: '#00f0ff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>JOUER</button></Link>
          <Link href="/leaderboard"><button style={{ padding: '8px 18px', background: 'rgba(255,0,255,0.1)', border: '2px solid #ff00ff', borderRadius: 8, color: '#ff00ff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>CLASSEMENT</button></Link>
          <Link href="/dashboard"><button style={{ padding: '8px 18px', background: 'rgba(0,255,136,0.1)', border: '2px solid #00ff88', borderRadius: 8, color: '#00ff88', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>PROFIL</button></Link>
          <Link href="/payment"><button style={{ padding: '8px 18px', background: 'rgba(0,255,136,0.1)', border: '2px solid #00ff88', borderRadius: 8, color: '#00ff88', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>ACHETER TOKENS</button></Link>
          <div style={{ padding: '8px 18px', background: 'rgba(255,215,0,0.1)', border: '2px solid #ffd700', borderRadius: 8, fontWeight: 700, color: '#ffd700', fontSize: '0.85rem' }}>
            {tokens} TOKENS
          </div>
        </nav>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, marginBottom: 8 }}>
            <span style={{ color: '#00f0ff', textShadow: '0 0 30px rgba(0,240,255,0.4)' }}>HANGAR</span>{' '}
            <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.4)' }}>DES VAISSEAUX</span>
          </h1>
          <p style={{ color: '#888', fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>
            Chaque vaisseau a ses forces et faiblesses. Choisis ta stratégie. Domine la Zone Glitch.
          </p>
        </div>

        {/* Currently equipped */}
        {(() => {
          const activeSkin = SKINS.find(s => s.id === selectedId) || SKINS[0];
          const ar = RARITY_STYLES[activeSkin.rarity];
          return (
            <div style={{ textAlign: 'center', marginBottom: 30, padding: '24px 20px', background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 16 }}>
              <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 700, marginBottom: 12, letterSpacing: 2 }}>VAISSEAU ACTIF</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                <SkinImage skin={activeSkin} size={80} selected />
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: ar.text, display: 'block' }}>{activeSkin.name}</span>
                  <span style={{ fontSize: '0.75rem', color: ar.text, fontWeight: 700 }}>{ar.label}</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {activeSkin.bonuses.slice(0, 2).map((b, i) => (
                      <span key={i} style={{ padding: '2px 8px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 4, fontSize: '0.6rem', color: '#00ff88', fontWeight: 600 }}>
                        {b.icon} {b.label}
                      </span>
                    ))}
                    {activeSkin.specialEffect && (
                      <span style={{ padding: '2px 8px', background: `${activeSkin.core.glowColor}10`, border: `1px solid ${activeSkin.core.glowColor}25`, borderRadius: 4, fontSize: '0.6rem', color: activeSkin.core.glowColor, fontWeight: 600 }}>
                        ★ {activeSkin.specialEffect.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 25 }}>
          {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                background: filter === f ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: filter === f ? '2px solid #00f0ff' : '2px solid rgba(255,255,255,0.08)',
                color: filter === f ? '#00f0ff' : '#777',
              }}
            >
              {f === 'all' ? `TOUS (${SKINS.length})` : `${RARITY_STYLES[f].label} (${SKINS.filter(s => s.rarity === f).length})`}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{ maxWidth: 600, margin: '0 auto 20px', padding: 14, background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
            {message}
          </div>
        )}

        {/* Skins Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredSkins.map(skin => {
            const r = RARITY_STYLES[skin.rarity];
            const owned = isSkinUnlocked(skin.id);
            const equipped = selectedId === skin.id;
            const price = skin.price || 0;

            return (
              <div
                key={skin.id}
                className="skin-card"
                onClick={() => setDetailSkin(skin)}
                style={{
                  background: equipped ? 'rgba(0,240,255,0.1)' : r.bg,
                  border: equipped ? '2px solid #00f0ff' : `2px solid ${r.border}`,
                  borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
                  boxShadow: equipped ? '0 0 30px rgba(0,240,255,0.2)' : r.glow,
                }}
              >
                {/* Gradient overlay for legendary */}
                {skin.rarity === 'legendary' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,215,0,0.04), transparent, rgba(255,100,0,0.03))', pointerEvents: 'none' }} />
                )}

                {/* Badge rareté */}
                <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 12px', background: equipped ? 'rgba(0,240,255,0.2)' : r.bg, border: `1px solid ${equipped ? '#00f0ff' : r.border}`, borderRadius: 6, fontSize: '0.6rem', fontWeight: 700, color: equipped ? '#00f0ff' : r.text, letterSpacing: 1 }}>
                  {equipped ? '★ ACTIF' : owned ? 'POSSÉDÉ' : r.label}
                </div>

                {/* Tier badge */}
                {skin.tier === 'premium' && !owned && (
                  <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 6, fontSize: '0.55rem', fontWeight: 700, color: '#ffd700', letterSpacing: 1 }}>
                    {price} TOKENS
                  </div>
                )}

                {/* Image du vaisseau */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0 16px', animation: equipped ? 'floatSkin 3s ease-in-out infinite' : 'none' }}>
                  <SkinImage skin={skin} size={120} selected={equipped} />
                </div>

                {/* Name & tagline */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 4, color: r.text, textAlign: 'center' }}>{skin.name}</h3>
                <p style={{ fontSize: '0.75rem', color: '#777', marginBottom: 12, textAlign: 'center', fontStyle: 'italic' }}>
                  « {skin.tagline} »
                </p>

                {/* Quick bonus/malus summary */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
                  {skin.bonuses.slice(0, 2).map((b, i) => (
                    <span key={`b${i}`} style={{ padding: '3px 8px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 4, fontSize: '0.6rem', color: '#00ff88', fontWeight: 600 }}>
                      {b.icon} {b.label}
                    </span>
                  ))}
                  {skin.maluses.slice(0, 1).map((m, i) => (
                    <span key={`m${i}`} style={{ padding: '3px 8px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: 4, fontSize: '0.6rem', color: '#ff6666', fontWeight: 600 }}>
                      {m.icon} {m.label}
                    </span>
                  ))}
                </div>

                {/* Special effect teaser */}
                {skin.specialEffect && (
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <span style={{ padding: '4px 12px', background: `${skin.core.glowColor}10`, border: `1px solid ${skin.core.glowColor}25`, borderRadius: 6, fontSize: '0.65rem', color: skin.core.glowColor, fontWeight: 700 }}>
                      ★ {skin.specialEffect.name}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ marginTop: 'auto' }}>
                  {equipped ? (
                    <button style={{ width: '100%', padding: '10px 0', background: 'rgba(0,240,255,0.1)', border: '1px solid #00f0ff', borderRadius: 8, color: '#00f0ff', fontWeight: 700, fontSize: '0.8rem', cursor: 'default' }}>ÉQUIPÉ</button>
                  ) : owned ? (
                    <button onClick={(e) => { e.stopPropagation(); handleEquip(skin); }} style={{ width: '100%', padding: '10px 0', background: 'rgba(0,255,136,0.05)', border: '1px solid #00ff88', borderRadius: 8, color: '#00ff88', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>ÉQUIPER</button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handlePurchase(skin); }} style={{ width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      {skin.tier === 'free' ? 'DÉBLOQUER' : `ACHETER (${price})`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {detailSkin && (
        <SkinDetailModal
          skin={detailSkin}
          tokens={tokens}
          owned={isSkinUnlocked(detailSkin.id)}
          equipped={selectedId === detailSkin.id}
          onClose={() => setDetailSkin(null)}
          onEquip={() => handleEquip(detailSkin)}
          onPurchase={() => handlePurchase(detailSkin)}
        />
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#444', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <p>Chaque skin modifie le gameplay. Bonus + Malus = Stratégie unique.</p>
        <p style={{ marginTop: 8 }}>Fail Frenzy Studios © 2026</p>
      </footer>
    </div>
  );
}
