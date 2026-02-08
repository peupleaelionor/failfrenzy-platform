/**
 * FAIL FRENZY - Shop Page (Standalone)
 * Boutique de skins avec preview visuel, système de rareté, tokens locaux
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL || '/';

interface Skin {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  colors: { primary: string; secondary: string; glow: string; trail: string };
  shape: 'diamond' | 'circle' | 'hexagon' | 'star';
}

const SKINS: Skin[] = [
  { id: 'neon-cyan', name: 'Neon Cyan', description: 'Le classique. Simple, efficace, mortel.', rarity: 'common', price: 0, colors: { primary: '#00f0ff', secondary: '#0080ff', glow: '#00f0ff', trail: '#00f0ff' }, shape: 'diamond' },
  { id: 'plasma-green', name: 'Plasma Vert', description: 'Énergie pure canalisée en forme.', rarity: 'common', price: 0, colors: { primary: '#00ff88', secondary: '#00cc66', glow: '#00ff88', trail: '#00ff88' }, shape: 'diamond' },
  { id: 'hot-pink', name: 'Hot Pink', description: 'Flashy, rapide, impossible à ignorer.', rarity: 'common', price: 50, colors: { primary: '#ff2d7b', secondary: '#ff0066', glow: '#ff2d7b', trail: '#ff2d7b' }, shape: 'diamond' },
  { id: 'solar-orange', name: 'Solar Orange', description: 'La chaleur du soleil dans tes mains.', rarity: 'rare', price: 150, colors: { primary: '#ff6600', secondary: '#ff9900', glow: '#ff6600', trail: '#ffaa00' }, shape: 'diamond' },
  { id: 'void-purple', name: 'Void Purple', description: 'Né du néant, forgé dans le glitch.', rarity: 'rare', price: 200, colors: { primary: '#9933ff', secondary: '#6600cc', glow: '#9933ff', trail: '#cc66ff' }, shape: 'hexagon' },
  { id: 'ice-crystal', name: 'Ice Crystal', description: 'Froid comme la mort, beau comme la glace.', rarity: 'rare', price: 250, colors: { primary: '#66ccff', secondary: '#3399ff', glow: '#66ccff', trail: '#99ddff' }, shape: 'hexagon' },
  { id: 'blood-moon', name: 'Blood Moon', description: 'Quand la lune saigne, le chaos commence.', rarity: 'epic', price: 500, colors: { primary: '#ff0033', secondary: '#cc0000', glow: '#ff0033', trail: '#ff3366' }, shape: 'star' },
  { id: 'galaxy-shift', name: 'Galaxy Shift', description: 'Les étoiles dansent autour de toi.', rarity: 'epic', price: 750, colors: { primary: '#ff00ff', secondary: '#00f0ff', glow: '#ff00ff', trail: '#00f0ff' }, shape: 'star' },
  { id: 'golden-skull', name: 'Golden Skull', description: 'Le Crâne Cosmique t\'a choisi. Porte sa marque.', rarity: 'legendary', price: 1500, colors: { primary: '#ffd700', secondary: '#ffaa00', glow: '#ffd700', trail: '#ffee88' }, shape: 'star' },
  { id: 'cosmic-void', name: 'Cosmic Void', description: 'L\'ultime. Le néant incarné. La fin de tout.', rarity: 'legendary', price: 3000, colors: { primary: '#ffffff', secondary: '#ff00ff', glow: '#ffffff', trail: '#ff00ff' }, shape: 'circle' },
];

const RARITY = {
  common: { label: 'COMMUN', bg: 'rgba(128,128,128,0.08)', border: 'rgba(128,128,128,0.25)', text: '#888888', glow: 'rgba(128,128,128,0.15)' },
  rare: { label: 'RARE', bg: 'rgba(0,240,255,0.08)', border: 'rgba(0,240,255,0.25)', text: '#00f0ff', glow: 'rgba(0,240,255,0.2)' },
  epic: { label: 'ÉPIQUE', bg: 'rgba(255,0,255,0.08)', border: 'rgba(255,0,255,0.25)', text: '#ff00ff', glow: 'rgba(255,0,255,0.2)' },
  legendary: { label: 'LÉGENDAIRE', bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.25)', text: '#ffd700', glow: 'rgba(255,215,0,0.25)' },
};

function SkinPreview({ skin, size = 80 }: { skin: Skin; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = size * 2;
    canvas.width = s; canvas.height = s;
    ctx.clearRect(0, 0, s, s);
    const cx = s / 2, cy = s / 2, r = s * 0.3;

    // Glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.8);
    grad.addColorStop(0, skin.colors.glow + '40');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    // Shape
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    if (skin.shape === 'diamond') {
      ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0);
    } else if (skin.shape === 'hexagon') {
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    } else if (skin.shape === 'star') {
      for (let i = 0; i < 5; i++) {
        const a1 = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
        ctx.lineTo(Math.cos(a2) * r * 0.5, Math.sin(a2) * r * 0.5);
      }
    } else {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }
    ctx.closePath();
    const fill = ctx.createLinearGradient(-r, -r, r, r);
    fill.addColorStop(0, skin.colors.primary);
    fill.addColorStop(1, skin.colors.secondary);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = skin.colors.glow;
    ctx.lineWidth = 3;
    ctx.shadowColor = skin.colors.glow;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();
  }, [skin, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function getTokens(): number {
  try { return parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10); } catch { return 500; }
}
function setTokens(n: number) { localStorage.setItem('failfrenzy_tokens', String(n)); }
function getOwned(): string[] {
  try { return JSON.parse(localStorage.getItem('failfrenzy_owned_skins') || '["neon-cyan","plasma-green"]'); } catch { return ['neon-cyan', 'plasma-green']; }
}
function setOwned(ids: string[]) { localStorage.setItem('failfrenzy_owned_skins', JSON.stringify(ids)); }

export default function Shop() {
  const [filter, setFilter] = useState<string>('all');
  const [tokens, setTokensState] = useState(getTokens);
  const [owned, setOwnedState] = useState(getOwned);
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);

  const showToast = (msg: string, color: string) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const handleBuy = (skin: Skin) => {
    if (owned.includes(skin.id)) return;
    if (tokens < skin.price) { showToast('Tokens insuffisants !', '#ff2d7b'); return; }
    setBuying(skin.id);
    setTimeout(() => {
      const newTokens = tokens - skin.price;
      const newOwned = [...owned, skin.id];
      setTokens(newTokens);
      setOwned(newOwned);
      setTokensState(newTokens);
      setOwnedState(newOwned);
      setBuying(null);
      showToast(`${skin.name} débloqué !`, RARITY[skin.rarity].text);
    }, 600);
  };

  const filtered = SKINS.filter(s => filter === 'all' || s.rarity === filter);

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: 'rgba(5,8,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <img src={`${BASE}images/assets/logo-skull-256.png`} alt="" className="w-8 h-auto transition-transform group-hover:rotate-12"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
              <span className="text-lg font-black tracking-tight">
                <span style={{ color: '#00f0ff' }}>FAIL</span>
                <span style={{ color: '#ff00ff' }} className="ml-0.5">FRENZY</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/game" className="text-gray-500 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">JOUER</Link>
            <Link href="/leaderboard" className="text-gray-500 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors hidden sm:block">CLASSEMENT</Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,0,0.08)', border: '1px solid rgba(255,255,0,0.2)' }}>
              <span className="text-[10px] text-gray-500 font-mono">TOKENS</span>
              <span className="font-black text-sm" style={{ color: '#ffff00' }}>{tokens}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl font-bold text-sm animate-bounce"
          style={{ background: 'rgba(5,8,24,0.95)', border: `1px solid ${toast.color}`, color: toast.color, boxShadow: `0 0 30px ${toast.color}40` }}>
          {toast.msg}
        </div>
      )}

      <main className="relative z-10 px-4 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>BOUTIQUE</span>
            <span className="text-white ml-3">DE SKINS</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mb-2">Personnalise ton joueur. Affirme ton style dans la Zone Glitch.</p>
          <p className="text-gray-600 text-xs font-mono italic">"Chaque skin raconte une histoire. Quelle sera la tienne ?"</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${filter === 'all' ? 'scale-105' : 'opacity-50 hover:opacity-80'}`}
            style={{ background: filter === 'all' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, color: '#fff' }}>
            TOUS
          </button>
          {(Object.keys(RARITY) as Array<keyof typeof RARITY>).map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all uppercase ${filter === r ? 'scale-105' : 'opacity-50 hover:opacity-80'}`}
              style={{ background: filter === r ? RARITY[r].bg : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === r ? RARITY[r].border : 'rgba(255,255,255,0.08)'}`, color: filter === r ? RARITY[r].text : '#666', boxShadow: filter === r ? `0 0 15px ${RARITY[r].glow}` : 'none' }}>
              {RARITY[r].label}
            </button>
          ))}
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(skin => {
            const r = RARITY[skin.rarity];
            const isOwned = owned.includes(skin.id);
            const isBuying = buying === skin.id;
            return (
              <div key={skin.id}
                className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${r.bg} 0%, rgba(10,14,39,0.8) 100%)`, border: `1px solid ${r.border}`, boxShadow: `0 0 15px ${r.glow}` }}>
                
                {/* Preview */}
                <div className="relative flex items-center justify-center py-8" style={{ background: 'rgba(5,8,24,0.5)' }}>
                  <SkinPreview skin={skin} size={90} />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
                    style={{ background: r.bg, color: r.text, border: `1px solid ${r.border}` }}>
                    {r.label}
                  </div>
                  {isOwned && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      POSSÉDÉ
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-black text-base mb-1 tracking-wide" style={{ color: r.text }}>{skin.name}</h3>
                  <p className="text-gray-500 text-xs mb-4 leading-relaxed">{skin.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffff00"><circle cx="12" cy="12" r="10"/><text x="12" y="16" textAnchor="middle" fill="#050818" fontSize="12" fontWeight="bold">T</text></svg>
                      <span className="font-black text-base" style={{ color: '#ffff00' }}>{skin.price === 0 ? 'GRATUIT' : skin.price}</span>
                    </div>
                    {isOwned ? (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>ÉQUIPÉ</span>
                    ) : (
                      <button onClick={() => handleBuy(skin)}
                        disabled={isBuying}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105 active:scale-95"
                        style={{ background: tokens >= skin.price ? `linear-gradient(135deg, ${skin.colors.primary}, ${skin.colors.secondary})` : 'rgba(255,255,255,0.05)', color: tokens >= skin.price ? '#050818' : '#666', border: tokens >= skin.price ? 'none' : '1px solid rgba(255,255,255,0.1)', boxShadow: tokens >= skin.price ? `0 0 15px ${r.glow}` : 'none' }}>
                        {isBuying ? 'ACHAT...' : tokens >= skin.price ? 'ACHETER' : 'INSUFFISANT'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info tokens */}
        <div className="mt-12 text-center">
          <div className="inline-block p-6 rounded-xl" style={{ background: 'rgba(255,255,0,0.04)', border: '1px solid rgba(255,255,0,0.15)' }}>
            <p className="text-sm font-bold mb-2" style={{ color: '#ffff00' }}>COMMENT GAGNER DES TOKENS ?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400 font-mono">
              <div><span style={{ color: '#00f0ff' }}>+10</span> par partie jouée</div>
              <div><span style={{ color: '#00ff88' }}>+50</span> par nouveau record</div>
              <div><span style={{ color: '#ff00ff' }}>+100</span> par succès débloqué</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 mt-8" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={`${BASE}images/assets/logo-skull-icon.png`} alt="" className="w-6 h-6" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.5))' }} />
            <span className="text-gray-600 text-xs font-mono">Fail Frenzy Studios 2026</span>
          </div>
          <div className="flex gap-4 text-gray-600 text-xs font-mono">
            <Link href="/" className="hover:text-[#00f0ff] transition-colors">Accueil</Link>
            <Link href="/game" className="hover:text-[#ff00ff] transition-colors">Jouer</Link>
            <Link href="/leaderboard" className="hover:text-[#ffff00] transition-colors">Classement</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
