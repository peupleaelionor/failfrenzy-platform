/**
 * FAIL FRENZY PREMIUM - Landing Page
 * Immersive game-first experience with premium assets, mobile-first responsive
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';

export default function Home() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);
  const [highScore] = useState(() => {
    try {
      const data = localStorage.getItem('failfrenzy_highscores');
      if (data) {
        const parsed = JSON.parse(data);
        return Math.max(0, ...Object.values(parsed).map(Number));
      }
    } catch {}
    return 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white overflow-hidden" onMouseMove={handleMouseMove}>
      
      {/* === HERO SECTION === */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* Animated neon grid background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0,240,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `perspective(500px) rotateX(${20 + mousePos.y * 5}deg)`,
            transformOrigin: 'center 120%',
          }} />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050818] via-transparent to-[#050818]/80" />
          
          {/* Arcade room background */}
          <div className="absolute bottom-0 left-0 right-0 h-[50vh] opacity-20"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}images/assets/hero-arcade-room.jpeg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#00f0ff', '#ff00ff', '#ffff00', '#00ff88'][i % 4],
                boxShadow: `0 0 ${6 + Math.random() * 10}px currentColor`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          
          {/* Premium Logo */}
          <div className="mb-6 sm:mb-8">
            <img 
              src={`${import.meta.env.BASE_URL}images/assets/pulse_clicker_logo_512.png`} 
              alt="Fail Frenzy Premium" 
              className="w-28 sm:w-36 md:w-44 mx-auto"
              style={{
                filter: glitchActive 
                  ? 'hue-rotate(90deg) brightness(1.5) drop-shadow(0 0 40px rgba(255,0,255,0.6))' 
                  : 'drop-shadow(0 0 40px rgba(0,240,255,0.5))',
                transition: 'filter 0.1s',
                animation: 'logoFloat 4s ease-in-out infinite',
              }}
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-3 tracking-tighter leading-none">
            <span style={{ 
              color: '#00f0ff', 
              textShadow: '0 0 30px rgba(0,240,255,0.5), 0 0 60px rgba(0,240,255,0.2)',
              display: 'inline-block',
              transform: glitchActive ? 'translateX(3px)' : 'none',
              transition: 'transform 0.05s',
            }}>FAIL</span>
            <span className="mx-1 sm:mx-2" style={{ 
              color: '#ff00ff', 
              textShadow: '0 0 30px rgba(255,0,255,0.5), 0 0 60px rgba(255,0,255,0.2)',
              display: 'inline-block',
              transform: glitchActive ? 'translateX(-3px)' : 'none',
              transition: 'transform 0.05s',
            }}>FRENZY</span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg md:text-xl font-bold mb-2 tracking-wide"
            style={{
              background: 'linear-gradient(90deg, #00f0ff, #ff00ff, #ffff00)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 4s linear infinite',
            }}>
            WHERE FAILURE IS THE MAIN REWARD
          </p>
          <p className="text-gray-500 text-xs sm:text-sm font-mono mb-8 sm:mb-10 tracking-wider">
            DODGE. FAIL. REPEAT. COMPETE.
          </p>

          {/* CTA Button - Using JOUER asset */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-14">
            <Link href="/game">
              <button className="group relative transition-all duration-300 hover:scale-110 active:scale-95">
                <img 
                  src={`${import.meta.env.BASE_URL}images/assets/button_jouer_pulse_2.png`} 
                  alt="JOUER" 
                  className="w-48 sm:w-56 md:w-64"
                  style={{
                    filter: 'drop-shadow(0 0 25px rgba(0,240,255,0.4)) drop-shadow(0 0 50px rgba(255,0,255,0.2))',
                    animation: 'buttonPulse 2s ease-in-out infinite',
                  }}
                />
              </button>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)' }}>
              <div className="text-2xl sm:text-3xl font-black text-[#00f0ff]" style={{ textShadow: '0 0 20px rgba(0,240,255,0.6)' }}>
                60
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wider mt-1">FPS</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,0,255,0.05)', border: '1px solid rgba(255,0,255,0.15)' }}>
              <div className="text-2xl sm:text-3xl font-black text-[#ff00ff]" style={{ textShadow: '0 0 20px rgba(255,0,255,0.6)' }}>
                4
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wider mt-1">MODES</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,0,0.05)', border: '1px solid rgba(255,255,0,0.15)' }}>
              <div className="text-2xl sm:text-3xl font-black text-[#ffff00]" style={{ textShadow: '0 0 20px rgba(255,255,0,0.6)' }}>
                {highScore > 0 ? highScore : '---'}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wider mt-1">BEST</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </div>
      </section>

      {/* === GAME ASSETS SHOWCASE === */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span style={{ color: '#00f0ff', textShadow: '0 0 30px rgba(0,240,255,0.5)' }}>NEON</span>
            <span className="text-white mx-2">GLITCH</span>
            <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>ENGINE</span>
          </h2>
          <p className="text-center text-gray-500 text-sm sm:text-base mb-12 max-w-xl mx-auto">
            A brutally fast arcade experience powered by a custom neon rendering engine with real-time particle effects and procedural audio.
          </p>

          {/* Premium asset showcase */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-16 max-w-3xl mx-auto">
            <div className="text-center group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 transition-transform group-hover:scale-110">
                <img src={`${import.meta.env.BASE_URL}images/assets/pulse_clicker_logo_512.png`} alt="Player" className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.5))' }} />
              </div>
              <p className="text-[10px] sm:text-xs font-mono tracking-wider" style={{ color: '#00f0ff' }}>PLAYER</p>
            </div>
            <div className="text-center group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 transition-transform group-hover:scale-110">
                <img src={`${import.meta.env.BASE_URL}images/assets/target_fire_glow.png`} alt="Fire Target" className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(255,102,0,0.5))' }} />
              </div>
              <p className="text-[10px] sm:text-xs font-mono tracking-wider" style={{ color: '#ff6600' }}>FIRE TARGET</p>
            </div>
            <div className="text-center group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 transition-transform group-hover:scale-110">
                <img src={`${import.meta.env.BASE_URL}images/assets/target_classic_glow.png`} alt="Classic Target" className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0,100,255,0.5))' }} />
              </div>
              <p className="text-[10px] sm:text-xs font-mono tracking-wider" style={{ color: '#0066ff' }}>CLASSIC TARGET</p>
            </div>
            <div className="text-center group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 transition-transform group-hover:scale-110">
                <img src={`${import.meta.env.BASE_URL}images/assets/target_neon_glow.png`} alt="Neon Power-up" className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(255,0,255,0.5))' }} />
              </div>
              <p className="text-[10px] sm:text-xs font-mono tracking-wider" style={{ color: '#ff00ff' }}>POWER-UP</p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: 'NEON RENDERER',
                desc: 'Custom canvas engine with dynamic glow, chromatic aberration, scanlines and shockwave effects at 60 FPS.',
                color: '#00f0ff',
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              },
              {
                title: 'PROCEDURAL AUDIO',
                desc: 'Real-time synthwave soundtrack generated via Web Audio API. No loading, no buffering, pure vibes.',
                color: '#ff00ff',
                icon: 'M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
              },
              {
                title: 'COMBO SYSTEM',
                desc: '7 combo tiers from Good to Godlike. Near-miss detection rewards precision with massive score multipliers.',
                color: '#ffff00',
                icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
              },
              {
                title: 'POWER-UPS',
                desc: 'Shield, SlowMo, Magnet, Multiplier, Bomb and more. Each with unique visual effects and strategic value.',
                color: '#00ff88',
                icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
              },
              {
                title: 'ADAPTIVE DIFFICULTY',
                desc: 'AI-driven difficulty that keeps you in the flow state. From Easy to Nightmare, the game adapts to YOU.',
                color: '#ff6600',
                icon: 'M2 20h20L12 4 2 20zm11-3h-2v-2h2v2zm0-4h-2V9h2v4z',
              },
              {
                title: 'PARTICLE SYSTEM',
                desc: 'Up to 1000 simultaneous particles. Explosions, trails, sparkles and confetti for every action.',
                color: '#ff2d7b',
                icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-5 sm:p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}08 0%, ${feature.color}03 100%)`,
                  borderColor: `${feature.color}30`,
                  boxShadow: `inset 0 0 30px ${feature.color}05`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${feature.color}80`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${feature.color}20, inset 0 0 30px ${feature.color}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${feature.color}30`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 30px ${feature.color}05`;
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base tracking-wider" style={{ color: feature.color }}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === GAME MODES SECTION === */}
      <section className="relative py-16 sm:py-24 px-4" style={{ background: 'linear-gradient(180deg, transparent 0%, #0d1230 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span className="text-white">CHOOSE YOUR</span>
            <span className="ml-3" style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>CHALLENGE</span>
          </h2>
          <p className="text-center text-gray-500 text-sm sm:text-base mb-12 max-w-xl mx-auto">
            Four distinct game modes, each designed to test a different aspect of your reflexes and strategy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { name: 'CLASSIC', desc: '3 lives. Progressive difficulty. How far can you go before the neon consumes you?', color: '#00f0ff', tag: 'MOST POPULAR' },
              { name: 'TIME TRIAL', desc: '60 seconds on the clock. Every millisecond counts. Pure speed, pure pressure.', color: '#00ff88', tag: '60 SECONDS' },
              { name: 'INFINITE', desc: 'No game over. No limits. Just you, the obstacles, and an ever-growing score.', color: '#ff00ff', tag: 'ENDLESS' },
              { name: 'SEEDS', desc: 'Reproducible challenges. Share your seed code and compete on the exact same run.', color: '#ffff00', tag: 'COMPETITIVE' },
            ].map((mode) => (
              <Link key={mode.name} href="/game">
                <div
                  className="group relative p-6 sm:p-8 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${mode.color}08 0%, #050818 100%)`,
                    borderColor: `${mode.color}30`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${mode.color}80`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${mode.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${mode.color}30`;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl sm:text-2xl font-black tracking-wider" style={{ color: mode.color }}>
                      {mode.name}
                    </h3>
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full tracking-wider"
                      style={{ background: `${mode.color}15`, color: mode.color, border: `1px solid ${mode.color}30` }}>
                      {mode.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {mode.desc}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: mode.color }}>
                    <span>PLAY NOW</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === HIT EFFECT SHOWCASE === */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight">
            <span style={{ color: '#ffff00', textShadow: '0 0 30px rgba(255,255,0,0.5)' }}>PREMIUM</span>
            <span className="text-white ml-3">EFFECTS</span>
          </h2>
          
          {/* Hit effect showcase */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 mb-8">
            <div className="text-center">
              <img src={`${import.meta.env.BASE_URL}images/assets/hit_fx_spark.png`} alt="Hit Effect" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.6))', animation: 'hitPulse 1.5s ease-in-out infinite' }} />
              <p className="text-[10px] sm:text-xs font-mono tracking-wider text-[#00f0ff]">COLLISION FX</p>
            </div>
            <div className="text-center">
              <img src={`${import.meta.env.BASE_URL}images/assets/target_neon_glow.png`} alt="Neon Glow" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3"
                style={{ filter: 'drop-shadow(0 0 20px rgba(255,0,255,0.6))', animation: 'neonSpin 4s linear infinite' }} />
              <p className="text-[10px] sm:text-xs font-mono tracking-wider text-[#ff00ff]">NEON GLOW</p>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto">
            Every collision, every dodge, every power-up triggers hand-crafted visual effects designed for maximum impact.
          </p>
        </div>
      </section>

      {/* === APP COMING SOON SECTION === */}
      <section className="relative py-16 sm:py-24 px-4" style={{ background: 'linear-gradient(180deg, transparent 0%, #0a0e2a 50%, transparent 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span style={{ color: '#ffff00', textShadow: '0 0 30px rgba(255,255,0,0.5)' }}>APP MOBILE</span>
            <span className="text-white ml-3">BIENT\u00D4T DISPONIBLE</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-10 max-w-xl mx-auto">
            Fail Frenzy arrive sur iOS et Android. Emportez le chaos partout avec vous. Inscrivez-vous pour \u00EAtre notifi\u00E9 du lancement.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
            {/* iOS Badge */}
            <div className="group relative px-8 py-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(0,240,255,0.05)', borderColor: 'rgba(0,240,255,0.3)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.8)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,240,255,0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}>
              <div className="flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#00f0ff">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-mono tracking-wider">BIENT\u00D4T SUR</div>
                  <div className="text-lg font-bold" style={{ color: '#00f0ff' }}>App Store</div>
                </div>
              </div>
            </div>

            {/* Android Badge */}
            <div className="group relative px-8 py-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(0,255,136,0.05)', borderColor: 'rgba(0,255,136,0.3)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,136,0.8)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,255,136,0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,136,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}>
              <div className="flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#00ff88">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-mono tracking-wider">BIENT\u00D4T SUR</div>
                  <div className="text-lg font-bold" style={{ color: '#00ff88' }}>Google Play</div>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown / Hype bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-[10px] font-mono tracking-wider text-gray-500 mb-2">
              <span>D\u00C9VELOPPEMENT</span>
              <span style={{ color: '#ffff00' }}>78%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,0,0.1)' }}>
              <div className="h-full rounded-full" style={{
                width: '78%',
                background: 'linear-gradient(90deg, #ffff00, #ff00ff)',
                boxShadow: '0 0 15px rgba(255,255,0,0.4)',
                animation: 'progressPulse 2s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="relative py-20 sm:py-32 px-4 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}images/assets/ui-pattern-arcade.jpeg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) saturate(1.5)',
            }}
          />
          <div className="absolute inset-0 bg-[#050818]/85" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <img src={`${import.meta.env.BASE_URL}images/assets/logo-skull.jpeg`} alt="Skull" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full"
            style={{ border: '2px solid rgba(0,240,255,0.3)', boxShadow: '0 0 30px rgba(0,240,255,0.2)', filter: 'saturate(1.3)' }} />
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            <span className="text-white">READY TO</span><br />
            <span style={{
              background: 'linear-gradient(90deg, #00f0ff, #ff00ff, #ffff00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>FAIL FORWARD?</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-10 max-w-md mx-auto">
            Rejoins la boucle. Ma\u00EEtrise le chaos. C\u00E9l\u00E8bre chaque \u00E9chec.
          </p>
          <Link href="/game">
            <button className="group relative transition-all duration-300 hover:scale-110 active:scale-95">
              <img 
                src={`${import.meta.env.BASE_URL}images/assets/button_jouer_pulse_2.png`} 
                alt="JOUER" 
                className="w-52 sm:w-60 md:w-72 mx-auto"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(0,240,255,0.4)) drop-shadow(0 0 60px rgba(255,0,255,0.2))',
                }}
              />
            </button>
          </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t py-8 px-4" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/assets/pulse_clicker_logo_512.png`} alt="FF" className="w-7 h-7"
              style={{ filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.4))' }} />
            <span className="text-gray-600 text-xs font-mono">&copy; 2026 Fail Frenzy Studios</span>
          </div>
          <div className="flex gap-6 text-gray-600 text-xs font-mono">
            <a href="#" className="hover:text-[#00f0ff] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#ff00ff] transition-colors">TikTok</a>
            <a href="#" className="hover:text-[#ffff00] transition-colors">Discord</a>
            <a href="#" className="hover:text-[#00ff88] transition-colors">Instagram</a>
          </div>
        </div>
      </footer>

      {/* Global animations */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes buttonPulse {
          0%, 100% { filter: drop-shadow(0 0 25px rgba(0,240,255,0.4)) drop-shadow(0 0 50px rgba(255,0,255,0.2)); }
          50% { filter: drop-shadow(0 0 35px rgba(0,240,255,0.6)) drop-shadow(0 0 70px rgba(255,0,255,0.3)); }
        }
        @keyframes hitPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes neonSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
