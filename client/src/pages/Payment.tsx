/**
 * FAIL FRENZY — PAGE DE PAIEMENT STRIPE
 * 
 * Page de paiement dédiée avec :
 * - Packs de tokens (1000 / 5500 / 13000)
 * - Abonnements Premium (Mensuel / Annuel)
 * - Skins premium individuels
 * - Intégration Stripe Payment Links
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { SKINS, type SkinDefinition } from '../game/SkinSystem';

const BASE = import.meta.env.BASE_URL || '/';

// ==================== STRIPE CONFIG ====================
// Liens de paiement directs (Payment Links)
const STRIPE_LINKS = {
  // Token packs
  tokens_1000: 'https://buy.stripe.com/test_5500_tokens_starter', // À remplacer par vos vrais liens
  tokens_5500: 'https://buy.stripe.com/test_5500_tokens_pro',
  tokens_13000: 'https://buy.stripe.com/test_13000_tokens_ultimate',
  
  // Premium subscriptions
  premium_monthly: 'https://buy.stripe.com/test_premium_monthly',
  premium_yearly: 'https://buy.stripe.com/test_premium_yearly',
  
  // Skins (mapping par ID de skin)
  skins: {
    'cyber-ninja': 'https://buy.stripe.com/test_skin_cyber_ninja',
    'pirate-spatial': 'https://buy.stripe.com/test_skin_pirate_spatial',
    'vaisseau-fantome': 'https://buy.stripe.com/test_skin_vaisseau_fantome',
    'entite-cosmique': 'https://buy.stripe.com/test_skin_entite_cosmique',
    'ange-dechu': 'https://buy.stripe.com/test_skin_ange_dechu',
    'golem-lave': 'https://buy.stripe.com/test_skin_golem_lave',
  } as Record<string, string>
};

function skinPriceEur(tokenPrice: number): number {
  if (tokenPrice <= 99) return 99;
  if (tokenPrice <= 199) return 199;
  if (tokenPrice <= 249) return 249;
  return 299;
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + '€';
}

// ==================== COMPONENTS ====================

function TokenPackCard({ name, tokens, bonus, price, popular, link }: {
  name: string; tokens: number; bonus: number; price: number; popular?: boolean; link: string;
}) {
  return (
    <div style={{
      position: 'relative',
      background: popular
        ? 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,0,255,0.05))'
        : 'rgba(255,255,255,0.02)',
      border: popular ? '2px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '28px 24px',
      textAlign: 'center',
      transition: 'all 0.3s',
      boxShadow: popular ? '0 0 40px rgba(255,215,0,0.1)' : 'none',
    }}>
      {popular && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          padding: '4px 16px', background: 'linear-gradient(90deg, #ffd700, #ff00ff)',
          color: '#050818', fontSize: '0.65rem', fontWeight: 900, letterSpacing: 2,
          borderRadius: 20,
        }}>POPULAIRE</div>
      )}
      
      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffd700', marginBottom: 4 }}>
        {tokens.toLocaleString()}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600, marginBottom: 8 }}>TOKENS</div>
      
      {bonus > 0 && (
        <div style={{
          display: 'inline-block', padding: '3px 12px', background: 'rgba(0,255,136,0.1)',
          border: '1px solid rgba(0,255,136,0.3)', borderRadius: 12,
          color: '#00ff88', fontSize: '0.7rem', fontWeight: 800, marginBottom: 12,
        }}>+{bonus}% BONUS</div>
      )}
      
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
        {formatPrice(price)}
      </div>
      
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <button style={{
          width: '100%', padding: '14px 0',
          background: popular ? 'linear-gradient(135deg, #ffd700, #ff8800)' : 'rgba(0,240,255,0.1)',
          border: popular ? 'none' : '2px solid rgba(0,240,255,0.3)',
          borderRadius: 12,
          color: popular ? '#050818' : '#00f0ff',
          fontWeight: 900, fontSize: '0.9rem', letterSpacing: 2,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          ACHETER
        </button>
      </a>
    </div>
  );
}

function PremiumPlanCard({ name, price, period, features, recommended, link }: {
  name: string; price: number; period: string; features: string[]; recommended?: boolean; link: string;
}) {
  return (
    <div style={{
      position: 'relative',
      background: recommended
        ? 'linear-gradient(135deg, rgba(255,0,255,0.08), rgba(0,240,255,0.05))'
        : 'rgba(255,255,255,0.02)',
      border: recommended ? '2px solid rgba(255,0,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '28px 24px',
      transition: 'all 0.3s',
      boxShadow: recommended ? '0 0 40px rgba(255,0,255,0.1)' : 'none',
    }}>
      {recommended && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          padding: '4px 16px', background: 'linear-gradient(90deg, #ff00ff, #00f0ff)',
          color: '#050818', fontSize: '0.65rem', fontWeight: 900, letterSpacing: 2,
          borderRadius: 20,
        }}>RECOMMANDÉ</div>
      )}
      
      <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: recommended ? '#ff00ff' : '#888', marginBottom: 8 }}>
        {name}
      </h3>
      
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>{formatPrice(price)}</span>
        <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: 4 }}>/{period}</span>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left' }}>
        {features.map((f, i) => (
          <li key={i} style={{
            padding: '6px 0', fontSize: '0.8rem', color: '#ccc',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: '#00ff88', fontSize: '0.9rem' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <button style={{
          width: '100%', padding: '14px 0',
          background: recommended ? 'linear-gradient(135deg, #ff00ff, #8800ff)' : 'rgba(255,255,255,0.05)',
          border: recommended ? 'none' : '2px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          color: recommended ? '#fff' : '#888',
          fontWeight: 900, fontSize: '0.9rem', letterSpacing: 2,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          S'ABONNER
        </button>
      </a>
    </div>
  );
}

function SkinPurchaseCard({ skin, link }: { skin: SkinDefinition; link: string }) {
  const priceEur = skinPriceEur(skin.price || 0);
  const rarityColors: Record<string, { text: string; border: string; bg: string }> = {
    epic: { text: '#ff00ff', border: 'rgba(255,0,255,0.3)', bg: 'rgba(255,0,255,0.05)' },
    legendary: { text: '#ffd700', border: 'rgba(255,215,0,0.3)', bg: 'rgba(255,215,0,0.05)' },
  };
  const rc = rarityColors[skin.rarity] || rarityColors.epic;
  
  return (
    <div style={{
      background: rc.bg,
      border: `1px solid ${rc.border}`,
      borderRadius: 16,
      padding: '20px 16px',
      textAlign: 'center',
      transition: 'all 0.3s',
    }}>
      <div style={{ marginBottom: 12 }}>
        <img
          src={skin.imagePath}
          alt={skin.name}
          style={{
            width: 80, height: 80, objectFit: 'contain',
            transform: 'rotate(90deg)',
            filter: `drop-shadow(0 0 12px ${skin.core.glowColor})`,
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      
      <div style={{
        display: 'inline-block', padding: '2px 10px', marginBottom: 6,
        background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 12,
        fontSize: '0.6rem', fontWeight: 800, color: rc.text, letterSpacing: 2,
      }}>
        {skin.rarity === 'legendary' ? 'LÉGENDAIRE' : 'ÉPIQUE'}
      </div>
      
      <h4 style={{ fontSize: '1rem', fontWeight: 900, color: rc.text, marginBottom: 4 }}>
        {skin.name}
      </h4>
      <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: 12, fontStyle: 'italic' }}>
        {skin.tagline}
      </p>
      
      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', marginBottom: 10 }}>
        {formatPrice(priceEur)}
      </div>
      
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <button style={{
          width: '100%', padding: '10px 0',
          background: rc.bg,
          border: `2px solid ${rc.border}`,
          borderRadius: 10,
          color: rc.text,
          fontWeight: 800, fontSize: '0.8rem', letterSpacing: 1,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          ACHETER
        </button>
      </a>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function Payment() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'premium' | 'skins'>('tokens');
  const premiumSkins = SKINS.filter(s => s.tier === 'premium');
  
  const tabs = [
    { id: 'tokens' as const, label: 'TOKENS', icon: '💎', color: '#ffd700' },
    { id: 'premium' as const, label: 'PREMIUM', icon: '👑', color: '#ff00ff' },
    { id: 'skins' as const, label: 'SKINS', icon: '🚀', color: '#00f0ff' },
  ];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050818 0%, #0d0a2a 50%, #050818 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .pay-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important; }
        .pay-card { transition: transform 0.3s, box-shadow 0.3s; }
      `}</style>
      
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: 'linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <header style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <img src={`${BASE}logo-skull-imposing.png`} alt="" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.5))' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 900 }}><span style={{ color: '#00f0ff' }}>FAIL</span><span style={{ color: '#ff00ff' }}> FRENZY</span></span>
          </div>
        </Link>
        <nav style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/game"><button style={{ padding: '8px 18px', background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', borderRadius: 8, color: '#00f0ff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>JOUER</button></Link>
          <Link href="/shop"><button style={{ padding: '8px 18px', background: 'rgba(255,215,0,0.1)', border: '2px solid #ffd700', borderRadius: 8, color: '#ffd700', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>BOUTIQUE</button></Link>
        </nav>
      </header>
      
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ animation: 'float 3s ease-in-out infinite', marginBottom: 16 }}>
            <img src={`${BASE}logo-skull-imposing.png`} alt="" style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(255,0,255,0.6)) drop-shadow(0 0 40px rgba(0,240,255,0.4))' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, marginBottom: 8 }}>
            <span style={{ color: '#ffd700', textShadow: '0 0 30px rgba(255,215,0,0.4)' }}>BOUTIQUE</span>{' '}
            <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.4)' }}>PREMIUM</span>
          </h1>
          <p style={{ color: '#888', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto' }}>Paiement sécurisé par Stripe. Débloquez des skins exclusifs et boostez votre expérience.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '6px 16px', background: 'rgba(99,91,255,0.1)', border: '1px solid rgba(99,91,255,0.3)', borderRadius: 20 }}>
            <span style={{ fontSize: '0.7rem', color: '#635bff', fontWeight: 700 }}>Powered by</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#635bff' }}>Stripe</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 28px', background: activeTab === tab.id ? `${tab.color}15` : 'rgba(255,255,255,0.02)', border: `2px solid ${activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, color: activeTab === tab.id ? tab.color : '#666', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 2, cursor: 'pointer', transition: 'all 0.3s' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'tokens' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            <div className="pay-card"><TokenPackCard name="Starter" tokens={1000} bonus={0} price={499} link={STRIPE_LINKS.tokens_1000} /></div>
            <div className="pay-card"><TokenPackCard name="Pro" tokens={5500} bonus={10} price={1999} popular link={STRIPE_LINKS.tokens_5500} /></div>
            <div className="pay-card"><TokenPackCard name="Ultimate" tokens={13000} bonus={30} price={3999} link={STRIPE_LINKS.tokens_13000} /></div>
          </div>
        )}
        
        {activeTab === 'premium' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>
            <div className="pay-card"><PremiumPlanCard name="Mensuel" price={499} period="mois" features={['Tous les skins premium débloqués', 'Aucune publicité', '500 tokens/mois offerts', 'Badge Premium exclusif']} link={STRIPE_LINKS.premium_monthly} /></div>
            <div className="pay-card"><PremiumPlanCard name="Annuel" price={2999} period="an" recommended features={['Tout le contenu Mensuel', 'Économisez 50% vs mensuel', '1000 tokens/mois offerts', 'Badge Crâne Doré exclusif']} link={STRIPE_LINKS.premium_yearly} /></div>
          </div>
        )}
        
        {activeTab === 'skins' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            {premiumSkins.map(skin => (
              <div key={skin.id} className="pay-card">
                <SkinPurchaseCard skin={skin} link={STRIPE_LINKS.skins[skin.id] || '#'} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <footer style={{ borderTop: '1px solid rgba(0,240,255,0.1)', padding: '20px', marginTop: 40 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={`${BASE}01_BRANDING/Favicon_Simplifie.png`} alt="" style={{ width: 20, height: 20, filter: 'drop-shadow(0 0 4px rgba(255,0,255,0.5))' }} />
            <span style={{ color: '#666', fontSize: '0.7rem', fontFamily: 'monospace' }}>Fail Frenzy © 2026 — Paiements sécurisés par Stripe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
