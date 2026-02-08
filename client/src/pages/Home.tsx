/**
 * FAIL FRENZY: ECHOES OF THE VOID - Landing Page
 * Expérience immersive spatiale avec les nouveaux assets.
 */

import { useState, useEffect } from 'react';
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
        
        {/* Animated space background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}03_ENVIRONNEMENTS/BG_Nebuleuse_Spatiale.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${1.1 + scrollY * 0.0005}) translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
          }} />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050818] via-transparent to-[#050818]/80" />
          
          {/* Planete X in the background */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] opacity-30"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}03_ENVIRONNEMENTS/Planete_X_Destination.png)`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              filter: 'blur(2px)',
              transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.02}deg)`,
            }}
          />
        </div>

        {/* Floating particles (Star Echoes) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#00f0ff', '#ff00ff', '#ffff00', '#ffffff'][i % 4],
                boxShadow: `0 0 ${6 + Math.random() * 10}px currentColor`,
                animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          
          {/* Logo Skull Glitch */}
          <div className="mb-6 sm:mb-8 relative inline-block">
            <img 
              src={`${import.meta.env.BASE_URL}logo-skull-glitch.png`} 
              alt="Fail Frenzy: Echoes of the Void" 
              className="w-36 h-36 sm:w-52 sm:h-52 mx-auto" 
              style={{
                filter: `drop-shadow(0 0 25px rgba(255,0,255,0.8)) drop-shadow(0 0 50px rgba(0,240,255,0.6)) ${glitchActive ? 'hue-rotate(180deg)' : ''}`,
                animation: 'skullPulse 4s ease-in-out infinite',
              }}
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-3 tracking-tighter leading-none">
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
          <p className="text-lg sm:text-xl md:text-2xl font-bold mb-2 tracking-wide"
            style={{
              background: 'linear-gradient(90deg, #00f0ff, #ff00ff, #ffffff)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 4s linear infinite',
            }}>
            ÉCHOS DU VIDE
          </p>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mb-8 tracking-widest uppercase">
            Collectez la lumière. Alimentez Xylos. Ne regardez pas en arrière.
          </p>
          
          {/* Univers narratif - Le Briefing */}
          <div className="max-w-2xl mx-auto mb-10 sm:mb-12 px-4">
            <div className="relative p-6 rounded-xl" style={{ 
              background: 'linear-gradient(135deg, rgba(255,0,255,0.12) 0%, rgba(0,240,255,0.08) 100%)',
              border: '2px solid rgba(0,240,255,0.3)',
              boxShadow: '0 0 40px rgba(0,240,255,0.15), inset 0 0 30px rgba(255,0,255,0.08)',
            }}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img 
                  src={`${import.meta.env.BASE_URL}02_SKINS_VAISSEAUX/COMMUN_Vaisseau_Cyan.png`} 
                  alt="Vaisseau-Écho" 
                  className="w-24 h-24 flex-shrink-0" 
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.6))', animation: 'float 3s ease-in-out infinite' }}
                />
                <div className="text-center sm:text-left flex-1">
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-3 font-medium">
                    L'univers s'éteint. En tant qu'<span style={{ color: '#00f0ff', fontWeight: 900 }}>Écho-Pilote</span>, votre mission est vitale : traversez les courants du vide pour ramener les derniers échos de lumière stellaire vers <span style={{ color: '#ff00ff', fontWeight: 900 }}>Xylos</span>.
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm italic font-medium">
                    « L'échec n'est pas une fin, c'est le carburant de notre survie. »
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 sm:mb-16">
            <Link href="/game">
              <button className="group relative px-12 py-5 border-3 border-[#00f0ff] rounded-full overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
                style={{ background: 'rgba(0,240,255,0.15)', border: '3px solid #00f0ff', boxShadow: '0 0 40px rgba(0,240,255,0.4)' }}>
                <span className="relative text-xl sm:text-2xl font-black tracking-widest text-[#00f0ff]" style={{ textShadow: '0 0 15px rgba(0,240,255,0.8)' }}>
                  LANCER LA MISSION
                </span>
              </button>
            </Link>
            
            <Link href="/shop">
              <button className="group relative px-12 py-5 border-3 border-[#ff00ff] rounded-full overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
                style={{ background: 'rgba(255,0,255,0.15)', border: '3px solid #ff00ff', boxShadow: '0 0 40px rgba(255,0,255,0.4)' }}>
                <span className="relative text-xl sm:text-2xl font-black tracking-widest text-[#ff00ff]" style={{ textShadow: '0 0 15px rgba(255,0,255,0.8)' }}>
                  HANGAR DES VAISSEAUX
                </span>
              </button>
            </Link>
          </div>

          {/* High score */}
          {highScore > 0 && (
            <div className="inline-block px-6 py-3 rounded-full mb-12" style={{ border: '2px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.1)', boxShadow: '0 0 20px rgba(255,215,0,0.2)' }}>
              <span className="text-gray-300 font-bold text-sm">RECORD DE LUMIÈRE : </span>
              <span className="text-[#ffd700] font-black text-lg" style={{ textShadow: '0 0 10px rgba(255,215,0,0.6)' }}>{highScore.toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>

      {/* Style for animations */}
      <style>{`
        @keyframes skullPulse {
          0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 20px rgba(255,0,255,0.8)) drop-shadow(0 0 40px rgba(0,240,255,0.6)); }
          50% { transform: scale(1.05) translateY(-10px); filter: drop-shadow(0 0 30px rgba(255,0,255,1)) drop-shadow(0 0 60px rgba(0,240,255,0.8)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
