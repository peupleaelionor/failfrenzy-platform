/**
 * FAIL FRENZY — PAGE D'ACCUEIL PREMIUM
 * 
 * Landing page ultra dynamique et professionnelle avec :
 * - Hero section animée avec particules
 * - Section features avec icônes animées
 * - Showcase des skins avec carousel
 * - Section statistiques
 * - Call to action premium
 * - Footer professionnel
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { SKINS } from '../game/SkinSystem';

const BASE = import.meta.env.BASE_URL || '/';

// ==================== PARTICLE CANVAS ====================

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number }[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Create particles
    const colors = ['#00f0ff', '#ff00ff', '#ffd700', '#00ff88'];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.2 + Math.random() * 0.5,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // Draw connections
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.globalAlpha = (1 - dist / 150) * 0.08;
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
      
      animId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

// ==================== ANIMATED COUNTER ====================

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.3 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  
  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

// ==================== SKIN CAROUSEL ====================

function SkinShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const premiumSkins = SKINS.filter(s => s.rarity === 'epic' || s.rarity === 'legendary');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % premiumSkins.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [premiumSkins.length]);
  
  const skin = premiumSkins[activeIndex];
  if (!skin) return null;
  
  const rarityLabel = skin.rarity === 'legendary' ? 'LÉGENDAIRE' : 'ÉPIQUE';
  const rarityColor = skin.rarity === 'legendary' ? '#ffd700' : '#ff00ff';
  
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        position: 'relative', display: 'inline-block',
        animation: 'floatSkin 3s ease-in-out infinite',
      }}>
        <img
          src={skin.imagePath}
          alt={skin.name}
          style={{
            width: 180, height: 180, objectFit: 'contain',
            filter: `drop-shadow(0 0 20px ${skin.core.glowColor}) drop-shadow(0 0 40px ${skin.core.glowColor}60)`,
            transition: 'all 0.5s',
          }}
        />
      </div>
      
      <div style={{ marginTop: 16 }}>
        <span style={{
          display: 'inline-block', padding: '3px 14px',
          background: `${rarityColor}15`, border: `1px solid ${rarityColor}40`,
          borderRadius: 20, fontSize: '0.65rem', fontWeight: 800,
          color: rarityColor, letterSpacing: 2, marginBottom: 8,
        }}>{rarityLabel}</span>
        <h3 style={{
          fontSize: '1.4rem', fontWeight: 900, color: rarityColor,
          textShadow: `0 0 20px ${skin.core.glowColor}40`, marginBottom: 4,
        }}>{skin.name}</h3>
        <p style={{ color: '#888', fontSize: '0.85rem', fontStyle: 'italic' }}>{skin.tagline}</p>
      </div>
      
      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
        {premiumSkins.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: i === activeIndex ? 24 : 8, height: 8,
              borderRadius: 4, border: 'none',
              background: i === activeIndex ? '#00f0ff' : 'rgba(255,255,255,0.15)',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function Home() {
  const [highScore, setHighScore] = useState(0);
  
  useEffect(() => {
    try {
      const data = localStorage.getItem('failfrenzy_highscores');
      if (data) {
        const scores = JSON.parse(data);
        const max = Math.max(0, ...Object.values(scores).map(v => Number(v)));
        setHighScore(max);
      }
    } catch {}
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #030610 0%, #0a0e27 30%, #0d0a2a 60%, #050818 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      <ParticleBackground />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes floatSkin { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(0,240,255,0.3); } 50% { box-shadow: 0 0 40px rgba(0,240,255,0.6); } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes skullFloat { 0%, 100% { transform: scale(1) translateY(0); } 50% { transform: scale(1.03) translateY(-8px); } }
        .feature-card:hover { transform: translateY(-6px); border-color: rgba(0,240,255,0.4) !important; }
        .feature-card { transition: all 0.3s ease; }
        .cta-btn:hover { transform: scale(1.05); box-shadow: 0 0 40px rgba(0,240,255,0.4) !important; }
        .cta-btn { transition: all 0.3s ease; }
      `}</style>
      
      {/* ==================== NAV ==================== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(3,6,16,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,240,255,0.08)',
        padding: '12px 24px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={`${BASE}logo-skull-imposing.png`} alt="Fail Frenzy" style={{
              width: 36, height: 36, objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.5))',
            }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: -0.5 }}>
              <span style={{ color: '#00f0ff' }}>FAIL</span>
              <span style={{ color: '#ff00ff' }}> FRENZY</span>
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop"><span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '6px 12px', transition: 'color 0.2s' }}>Boutique</span></Link>
            <Link href="/leaderboard"><span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '6px 12px' }}>Classement</span></Link>
            <Link href="/payment"><span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '6px 12px' }}>Premium</span></Link>
            <Link href="/game">
              <button className="cta-btn" style={{
                padding: '8px 20px', background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
                border: 'none', borderRadius: 8, color: '#050818',
                fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', letterSpacing: 1,
              }}>JOUER</button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* ==================== HERO SECTION ==================== */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ animation: 'skullFloat 4s ease-in-out infinite', marginBottom: 32 }}>
          <img src={`${BASE}logo-skull-imposing.png`} alt="Fail Frenzy" style={{
            width: 'clamp(100px, 20vw, 160px)', height: 'auto', objectFit: 'contain',
            filter: 'drop-shadow(0 0 30px rgba(255,0,255,0.6)) drop-shadow(0 0 60px rgba(0,240,255,0.4))',
          }} />
        </div>
        
        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900,
          lineHeight: 1.05, marginBottom: 16, letterSpacing: -2,
          animation: 'slideUp 0.8s ease-out',
        }}>
          <span style={{ color: '#00f0ff', textShadow: '0 0 40px rgba(0,240,255,0.5)' }}>FAIL</span>
          {' '}
          <span style={{ color: '#ff00ff', textShadow: '0 0 40px rgba(255,0,255,0.5)' }}>FRENZY</span>
        </h1>
        
        <p style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.15rem)', color: '#999',
          maxWidth: 550, margin: '0 auto 8px', lineHeight: 1.6,
          animation: 'slideUp 0.8s ease-out 0.1s both',
        }}>
          Échos du Vide — Esquive, tire, survis.
        </p>
        <p style={{
          fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)', color: '#666',
          maxWidth: 480, margin: '0 auto 32px',
          animation: 'slideUp 0.8s ease-out 0.2s both',
        }}>
          Un jeu d'arcade spatial néon où chaque seconde compte. Personnalise ton vaisseau, affronte des engins spéciaux, et domine le classement mondial.
        </p>
        
        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          animation: 'slideUp 0.8s ease-out 0.3s both',
        }}>
          <Link href="/game">
            <button className="cta-btn" style={{
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
              border: 'none', borderRadius: 14, color: '#050818',
              fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer',
              letterSpacing: 2, boxShadow: '0 0 30px rgba(0,240,255,0.3)',
            }}>
              JOUER MAINTENANT
            </button>
          </Link>
          <Link href="/shop">
            <button className="cta-btn" style={{
              padding: '16px 40px',
              background: 'transparent',
              border: '2px solid rgba(255,0,255,0.5)', borderRadius: 14, color: '#ff00ff',
              fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              letterSpacing: 2,
            }}>
              VOIR LES SKINS
            </button>
          </Link>
        </div>
        
        {/* High score */}
        {highScore > 0 && (
          <div style={{
            display: 'inline-block', marginTop: 24,
            padding: '8px 24px', background: 'rgba(255,215,0,0.06)',
            border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12,
          }}>
            <span style={{ color: '#999', fontSize: '0.8rem', fontWeight: 600 }}>Votre record : </span>
            <span style={{ color: '#ffd700', fontWeight: 900, fontSize: '1.1rem' }}>{highScore.toLocaleString()}</span>
          </div>
        )}
      </section>
      
      {/* ==================== FEATURES ==================== */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1100, margin: '0 auto',
        padding: '40px 24px 60px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: 8 }}>
            <span style={{ color: '#fff' }}>Pourquoi </span>
            <span style={{ color: '#00f0ff' }}>Fail Frenzy</span>
            <span style={{ color: '#fff' }}> ?</span>
          </h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Un jeu d'arcade nouvelle génération.</p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}>
          {[
            { icon: '🎯', title: 'Esquive Intense', desc: '6 types d\'obstacles uniques avec IA adaptative. Chaque partie est différente.', color: '#00f0ff' },
            { icon: '🔫', title: 'Système de Tir', desc: 'Tire automatiquement sur des engins spéciaux : Sentinelles, Fantômes, Titans, Essaims.', color: '#ff00ff' },
            { icon: '🚀', title: '11 Vaisseaux', desc: 'Chaque skin a des bonus, malus et effets spéciaux uniques qui changent le gameplay.', color: '#ffd700' },
            { icon: '🌌', title: 'Galaxies', desc: 'Traverse 5 galaxies avec des environnements et obstacles différents.', color: '#00ff88' },
            { icon: '🏆', title: 'Classement', desc: 'Affronte les meilleurs joueurs du monde. Chaque point compte.', color: '#ff4400' },
            { icon: '💎', title: 'Boutique Stripe', desc: 'Achète des tokens et skins premium via paiement sécurisé Stripe.', color: '#635bff' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
            }}>
              <div style={{
                fontSize: '2rem', marginBottom: 12,
                width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${f.color}10`, borderRadius: 12,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: f.color, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* ==================== SKIN SHOWCASE ==================== */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '60px 24px',
        background: 'linear-gradient(180deg, transparent, rgba(255,0,255,0.03), transparent)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 40, alignItems: 'center',
          }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: 12 }}>
                <span style={{ color: '#ff00ff' }}>Skins</span>{' '}
                <span style={{ color: '#fff' }}>Exclusifs</span>
              </h2>
              <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
                Chaque vaisseau est unique. Des bonus de vitesse aux résurrections divines, en passant par les éruptions volcaniques — choisis ton style de combat.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/shop">
                  <button className="cta-btn" style={{
                    padding: '12px 28px', background: 'rgba(255,0,255,0.1)',
                    border: '2px solid #ff00ff', borderRadius: 10, color: '#ff00ff',
                    fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: 1,
                  }}>EXPLORER LA BOUTIQUE</button>
                </Link>
                <Link href="/payment">
                  <button className="cta-btn" style={{
                    padding: '12px 28px', background: 'rgba(255,215,0,0.1)',
                    border: '2px solid #ffd700', borderRadius: 10, color: '#ffd700',
                    fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: 1,
                  }}>ACHETER PREMIUM</button>
                </Link>
              </div>
            </div>
            <SkinShowcase />
          </div>
        </div>
      </section>
      
      {/* ==================== STATS ==================== */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1100, margin: '0 auto',
        padding: '40px 24px 60px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
        }}>
          {[
            { value: 11, suffix: '', label: 'Vaisseaux', color: '#00f0ff' },
            { value: 4, suffix: '', label: 'Modes de jeu', color: '#ff00ff' },
            { value: 5, suffix: '', label: 'Galaxies', color: '#ffd700' },
            { value: 6, suffix: '', label: 'Types d\'obstacles', color: '#00ff88' },
            { value: 4, suffix: '', label: 'Engins spéciaux', color: '#ff4400' },
          ].map((stat, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '24px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: stat.color, marginBottom: 4 }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, letterSpacing: 1 }}>
                {stat.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* ==================== GAME MODES ==================== */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1100, margin: '0 auto',
        padding: '20px 24px 60px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: 8 }}>
            <span style={{ color: '#ffd700' }}>Modes</span>{' '}
            <span style={{ color: '#fff' }}>de Jeu</span>
          </h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {[
            { name: 'Classic', desc: 'Esquive et survie. 2 vies, difficulté croissante.', color: '#00f0ff', icon: '🎮' },
            { name: 'Time Trial', desc: '60 secondes pour scorer un maximum de points.', color: '#ff00ff', icon: '⏱' },
            { name: 'Infinite', desc: 'Pas de game over. Repousse tes limites.', color: '#00ff88', icon: '♾' },
            { name: 'Seed', desc: 'Même obstacles pour tous. Compétition pure.', color: '#ffd700', icon: '🎲' },
          ].map((mode, i) => (
            <Link key={i} href="/game">
              <div className="feature-card" style={{
                padding: '24px 20px', cursor: 'pointer',
                background: `${mode.color}05`,
                border: `1px solid ${mode.color}20`,
                borderRadius: 14,
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{mode.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: mode.color, marginBottom: 4 }}>{mode.name}</h3>
                <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.4 }}>{mode.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* ==================== FINAL CTA ==================== */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '60px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(0,240,255,0.03), transparent)',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900,
          marginBottom: 12,
        }}>
          <span style={{ color: '#fff' }}>Prêt à </span>
          <span style={{ color: '#00f0ff' }}>dominer</span>
          <span style={{ color: '#fff' }}> ?</span>
        </h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
          Rejoins la Zone Glitch. Chaque seconde de survie est une victoire.
        </p>
        <Link href="/game">
          <button className="cta-btn" style={{
            padding: '18px 48px',
            background: 'linear-gradient(135deg, #00f0ff, #ff00ff)',
            border: 'none', borderRadius: 16, color: '#050818',
            fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer',
            letterSpacing: 2, boxShadow: '0 0 40px rgba(0,240,255,0.3)',
          }}>
            LANCER LE JEU
          </button>
        </Link>
      </section>
      
      {/* ==================== FOOTER ==================== */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(0,240,255,0.08)',
        padding: '32px 24px',
        background: 'rgba(3,6,16,0.5)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <img src={`${BASE}logo-skull-imposing.png`} alt="" style={{
                width: 28, height: 28, objectFit: 'contain',
                filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.4))',
              }} />
              <span style={{ fontWeight: 900, fontSize: '1rem' }}>
                <span style={{ color: '#00f0ff' }}>FAIL</span>
                <span style={{ color: '#ff00ff' }}> FRENZY</span>
              </span>
            </div>
            <p style={{ color: '#666', fontSize: '0.75rem', lineHeight: 1.5 }}>
              Échos du Vide — Jeu d'arcade spatial néon. Esquive, tire, survis.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>JEU</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link href="/game"><span style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Jouer</span></Link>
              <Link href="/shop"><span style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Boutique</span></Link>
              <Link href="/leaderboard"><span style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Classement</span></Link>
              <Link href="/achievements"><span style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Succès</span></Link>
            </div>
          </div>
          
          {/* Premium */}
          <div>
            <h4 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>PREMIUM</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link href="/payment"><span style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Acheter des Tokens</span></Link>
              <Link href="/payment"><span style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Abonnement Premium</span></Link>
              <Link href="/payment"><span style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>Skins Exclusifs</span></Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h4 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>LÉGAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: '#666', fontSize: '0.8rem' }}>Conditions d'utilisation</span>
              <span style={{ color: '#666', fontSize: '0.8rem' }}>Politique de confidentialité</span>
              <span style={{ color: '#666', fontSize: '0.8rem' }}>Mentions légales</span>
            </div>
          </div>
        </div>
        
        <div style={{
          maxWidth: 1100, margin: '24px auto 0',
          paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'monospace' }}>
            Fail Frenzy: Échos du Vide © 2026
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#444', fontSize: '0.65rem' }}>Paiements par</span>
            <span style={{ color: '#635bff', fontSize: '0.75rem', fontWeight: 800 }}>Stripe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
