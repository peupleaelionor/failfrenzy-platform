import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const BASE = import.meta.env.BASE_URL;

function useParallax() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) =>
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return { mouse, scroll };
}

function useGlitch() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const loop = setInterval(() => {
      setActive(true);
      setTimeout(() => setActive(false), 120);
    }, 2500 + Math.random() * 3000);
    return () => clearInterval(loop);
  }, []);
  return active;
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current || target === 0) return;
    ref.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <>{value.toLocaleString()}</>;
}

const SHIP_SKINS = [
  { name: 'Cyber Ninja', rarity: 'EPIQUE', img: '02_SKINS_VAISSEAUX/EPIQUE_Vaisseau_Cyber_Ninja.png', color: '#ff00ff' },
  { name: 'Entite Cosmique', rarity: 'LEGENDAIRE', img: '02_SKINS_VAISSEAUX/LEGENDAIRE_Entite_Cosmique.png', color: '#ffd700' },
  { name: 'Golem Lave', rarity: 'LEGENDAIRE', img: '02_SKINS_VAISSEAUX/LEGENDAIRE_Golem_Lave.png', color: '#ff6600' },
  { name: 'Pirate Spatial', rarity: 'EPIQUE', img: '02_SKINS_VAISSEAUX/EPIQUE_Vaisseau_Pirate_Spatial.png', color: '#00ff88' },
  { name: 'Steampunk', rarity: 'RARE', img: '02_SKINS_VAISSEAUX/RARE_Vaisseau_Steampunk.png', color: '#cd7f32' },
  { name: 'Vaporwave', rarity: 'RARE', img: '02_SKINS_VAISSEAUX/RARE_Vaisseau_Vaporwave.png', color: '#ff69b4' },
];

const FEATURES = [
  { title: '4 MODES', desc: 'Classic, Time Trial, Infinite, Seeds', color: '#00f0ff', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { title: '10+ SKINS', desc: 'Du Commun au Legendaire avec effets uniques', color: '#ff00ff', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
  { title: '6 GALAXIES', desc: 'De la Nebuleuse Alpha au Coeur de Xylos', color: '#ffd700', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  { title: 'XYLOS', desc: 'Entite vivante a alimenter avec vos echoes', color: '#00ff88', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

export default function Home() {
  const { mouse, scroll } = useParallax();
  const glitch = useGlitch();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [skinIndex, setSkinIndex] = useState(0);

  const highScore = (() => {
    try {
      const data = localStorage.getItem('failfrenzy_highscores');
      if (data) {
        const parsed = JSON.parse(data);
        return Math.max(0, ...Object.values(parsed).map(Number));
      }
    } catch {}
    return 0;
  })();

  useEffect(() => {
    const interval = setInterval(() => {
      setSkinIndex((i) => (i + 1) % SHIP_SKINS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const sectionClass = (id: string) =>
    `transition-all duration-700 ${visibleSections.has(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`;

  const currentSkin = SHIP_SKINS[skinIndex];

  return (
    <div className="min-h-screen bg-[#050818] text-white overflow-hidden">
      <NavBar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: `url(${BASE}03_ENVIRONNEMENTS/BG_Nebuleuse_Spatiale.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${1.15 + scroll * 0.0003}) translate(${(mouse.x - 0.5) * 20}px, ${(mouse.y - 0.5) * 15}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050818]/60 via-transparent to-[#050818]" />

          <div
            className="absolute bottom-[-15%] right-[-8%] w-[55vw] h-[55vw] opacity-20"
            style={{
              backgroundImage: `url(${BASE}03_ENVIRONNEMENTS/Planete_X_Destination.png)`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              filter: 'blur(3px) saturate(1.3)',
              transform: `translateY(${scroll * 0.15}px) rotate(${scroll * 0.01}deg)`,
            }}
          />
        </div>

        <StarField count={50} />

        <div className="absolute inset-0 pointer-events-none scanlines opacity-[0.03]" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="mb-8 relative inline-block">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, rgba(255,0,255,0.08) 50%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
            <img
              src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`}
              alt="Fail Frenzy"
              className="w-40 h-40 sm:w-56 sm:h-56 mx-auto relative z-10"
              style={{
                filter: `drop-shadow(0 0 30px rgba(255,0,255,0.7)) drop-shadow(0 0 60px rgba(0,240,255,0.5)) ${glitch ? 'hue-rotate(180deg) brightness(1.5)' : ''}`,
                animation: 'heroFloat 5s ease-in-out infinite',
                transition: 'filter 0.05s',
              }}
            />
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-9xl font-black mb-2 tracking-tighter leading-none select-none">
            <span
              className="inline-block"
              style={{
                color: '#00f0ff',
                textShadow: '0 0 40px rgba(0,240,255,0.6), 0 0 80px rgba(0,240,255,0.2)',
                transform: glitch ? 'translateX(4px) skewX(-2deg)' : 'none',
                transition: 'transform 0.05s',
              }}
            >
              FAIL
            </span>
            <span
              className="inline-block ml-3 sm:ml-5"
              style={{
                color: '#ff00ff',
                textShadow: '0 0 40px rgba(255,0,255,0.6), 0 0 80px rgba(255,0,255,0.2)',
                transform: glitch ? 'translateX(-4px) skewX(2deg)' : 'none',
                transition: 'transform 0.05s',
              }}
            >
              FRENZY
            </span>
          </h1>

          <p
            className="text-xl sm:text-2xl md:text-3xl font-black mb-3 tracking-[0.3em]"
            style={{
              background: 'linear-gradient(90deg, #00f0ff, #ff00ff, #ffd700, #00f0ff)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientFlow 6s linear infinite',
            }}
          >
            ECHOS DU VIDE
          </p>

          <p className="text-gray-400 text-sm sm:text-base font-mono mb-10 tracking-widest max-w-xl mx-auto leading-relaxed">
            L'univers s'eteint. Collectez la lumiere stellaire.
            <br />
            Alimentez Xylos. Ne regardez pas en arriere.
          </p>

          <div className="max-w-2xl mx-auto mb-10">
            <div
              className="relative p-6 sm:p-8 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,255,0.08) 0%, rgba(0,240,255,0.06) 100%)',
                border: '1px solid rgba(0,240,255,0.2)',
                boxShadow: '0 0 50px rgba(0,240,255,0.1), inset 0 0 40px rgba(255,0,255,0.05)',
              }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={`${BASE}02_SKINS_VAISSEAUX/COMMUN_Vaisseau_Magenta.png`}
                    alt="Vaisseau-Echo"
                    className="w-28 h-28"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.6))',
                      animation: 'heroFloat 4s ease-in-out infinite',
                    }}
                  />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-3 font-medium">
                    En tant qu'
                    <span style={{ color: '#00f0ff', fontWeight: 900 }}>Echo-Pilote</span>,
                    traversez les courants du vide pour ramener les derniers echos de lumiere
                    stellaire vers{' '}
                    <span style={{ color: '#ff00ff', fontWeight: 900 }}>Xylos</span>, derniere
                    citadelle de vie.
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm italic font-mono">
                    "L'echec n'est pas une fin, c'est le carburant de notre survie."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-10">
            <Link href="/game">
              <button
                className="group relative px-14 py-5 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(0,240,255,0.05) 100%)',
                  border: '2px solid #00f0ff',
                  boxShadow: '0 0 40px rgba(0,240,255,0.3), inset 0 0 20px rgba(0,240,255,0.1)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.3), rgba(0,240,255,0.1))',
                  }}
                />
                <span
                  className="relative text-xl sm:text-2xl font-black tracking-[0.2em]"
                  style={{ color: '#00f0ff', textShadow: '0 0 20px rgba(0,240,255,0.8)' }}
                >
                  LANCER LA MISSION
                </span>
              </button>
            </Link>

            <Link href="/shop">
              <button
                className="group relative px-14 py-5 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,0,255,0.15) 0%, rgba(255,0,255,0.03) 100%)',
                  border: '2px solid rgba(255,0,255,0.6)',
                  boxShadow: '0 0 30px rgba(255,0,255,0.2)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,0,255,0.25), rgba(255,0,255,0.05))',
                  }}
                />
                <span
                  className="relative text-xl sm:text-2xl font-black tracking-[0.2em]"
                  style={{ color: '#ff00ff', textShadow: '0 0 20px rgba(255,0,255,0.8)' }}
                >
                  HANGAR
                </span>
              </button>
            </Link>
          </div>

          {highScore > 0 && (
            <div
              className="inline-block px-8 py-3 rounded-full mb-8"
              style={{
                border: '1px solid rgba(255,215,0,0.3)',
                background: 'rgba(255,215,0,0.06)',
                boxShadow: '0 0 25px rgba(255,215,0,0.1)',
              }}
            >
              <span className="text-gray-400 font-bold text-sm tracking-wider mr-2">
                RECORD :
              </span>
              <span
                className="text-xl font-black"
                style={{ color: '#ffd700', textShadow: '0 0 15px rgba(255,215,0,0.6)' }}
              >
                <AnimatedCounter target={highScore} />
              </span>
            </div>
          )}

          <div className="animate-bounce mt-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(0,240,255,0.4)"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative py-24 px-4" id="features" data-animate>
        <div className={`max-w-6xl mx-auto ${sectionClass('features')}`}>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4 tracking-tight"
            style={{
              color: '#00f0ff',
              textShadow: '0 0 30px rgba(0,240,255,0.4)',
            }}
          >
            SYSTEME DE JEU
          </h2>
          <p className="text-gray-500 text-center text-sm font-mono mb-16 tracking-wider">
            Un gameplay arcade de haute intensite
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl transition-all duration-500 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${f.color}0A 0%, rgba(5,8,24,0.8) 100%)`,
                  border: `1px solid ${f.color}25`,
                  boxShadow: `0 0 25px ${f.color}10`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}40`,
                    boxShadow: `0 0 20px ${f.color}20`,
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={f.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3
                  className="text-xl font-black tracking-wider mb-2"
                  style={{ color: f.color }}
                >
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SKINS SHOWCASE ===== */}
      <section
        className="relative py-24 px-4"
        id="skins"
        data-animate
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,0,255,0.03) 50%, transparent 100%)',
        }}
      >
        <div className={`max-w-6xl mx-auto ${sectionClass('skins')}`}>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4 tracking-tight"
            style={{
              color: '#ff00ff',
              textShadow: '0 0 30px rgba(255,0,255,0.4)',
            }}
          >
            COLLECTION DE VAISSEAUX
          </h2>
          <p className="text-gray-500 text-center text-sm font-mono mb-16 tracking-wider">
            Du Commun au Legendaire - chaque vaisseau a ses bonus et malus
          </p>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${currentSkin.color}20 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                  }}
                />
                <img
                  key={skinIndex}
                  src={`${BASE}${currentSkin.img}`}
                  alt={currentSkin.name}
                  className="w-64 h-64 sm:w-80 sm:h-80 object-contain relative z-10"
                  style={{
                    filter: `drop-shadow(0 0 40px ${currentSkin.color}80)`,
                    animation: 'heroFloat 4s ease-in-out infinite, skinFadeIn 0.6s ease-out',
                  }}
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                  <span
                    className="px-5 py-2 rounded-full text-xs font-black tracking-wider"
                    style={{
                      background: `${currentSkin.color}20`,
                      border: `1px solid ${currentSkin.color}60`,
                      color: currentSkin.color,
                      boxShadow: `0 0 15px ${currentSkin.color}30`,
                    }}
                  >
                    {currentSkin.rarity} - {currentSkin.name.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-3">
              {SHIP_SKINS.map((skin, i) => (
                <button
                  key={skin.name}
                  onClick={() => setSkinIndex(i)}
                  className="p-3 rounded-xl transition-all duration-300"
                  style={{
                    background:
                      i === skinIndex
                        ? `${skin.color}15`
                        : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === skinIndex ? `${skin.color}60` : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: i === skinIndex ? `0 0 20px ${skin.color}20` : 'none',
                    transform: i === skinIndex ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <img
                    src={`${BASE}${skin.img}`}
                    alt={skin.name}
                    className="w-16 h-16 mx-auto object-contain mb-2"
                    style={{
                      filter:
                        i === skinIndex
                          ? `drop-shadow(0 0 10px ${skin.color}80)`
                          : 'brightness(0.6)',
                    }}
                  />
                  <p
                    className="text-[10px] font-bold tracking-wider text-center truncate"
                    style={{
                      color: i === skinIndex ? skin.color : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {skin.name.toUpperCase()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/shop">
              <button
                className="px-10 py-4 rounded-xl font-black tracking-wider transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255,0,255,0.12)',
                  border: '1px solid rgba(255,0,255,0.4)',
                  color: '#ff00ff',
                  boxShadow: '0 0 25px rgba(255,0,255,0.15)',
                }}
              >
                VOIR TOUS LES VAISSEAUX
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ENVIRONMENTS SECTION ===== */}
      <section className="relative py-24 px-4" id="envs" data-animate>
        <div className={`max-w-6xl mx-auto ${sectionClass('envs')}`}>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4 tracking-tight"
            style={{
              color: '#ffd700',
              textShadow: '0 0 30px rgba(255,215,0,0.4)',
            }}
          >
            EXPLOREZ LES GALAXIES
          </h2>
          <p className="text-gray-500 text-center text-sm font-mono mb-16 tracking-wider">
            6 environnements uniques avec difficulte progressive
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: 'Nebuleuse Spatiale', img: '03_ENVIRONNEMENTS/BG_Nebuleuse_Spatiale.png', color: '#00f0ff' },
              { name: 'Ville Cyberpunk', img: '03_ENVIRONNEMENTS/BG_Ville_Cyberpunk.png', color: '#ff00ff' },
              { name: 'Tunnel de Donnees', img: '03_ENVIRONNEMENTS/BG_Tunnel_Donnees.png', color: '#00ff88' },
            ].map((env) => (
              <div
                key={env.name}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
                style={{
                  border: `1px solid ${env.color}25`,
                  boxShadow: `0 0 25px ${env.color}10`,
                }}
              >
                <img
                  src={`${BASE}${env.img}`}
                  alt={env.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(180deg, transparent 40%, rgba(5,8,24,0.9) 100%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3
                    className="text-lg font-black tracking-wider"
                    style={{ color: env.color, textShadow: `0 0 15px ${env.color}` }}
                  >
                    {env.name.toUpperCase()}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GAME ELEMENTS SHOWCASE ===== */}
      <section
        className="relative py-24 px-4"
        id="elements"
        data-animate
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,240,255,0.02) 50%, transparent 100%)',
        }}
      >
        <div className={`max-w-6xl mx-auto ${sectionClass('elements')}`}>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-16 tracking-tight"
            style={{
              color: '#00ff88',
              textShadow: '0 0 30px rgba(0,255,136,0.4)',
            }}
          >
            ELEMENTS DE JEU
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { name: 'Power-Ups', img: '06_GAME_ELEMENTS/PowerUps_Icon_Set.png', color: '#00f0ff' },
              { name: 'Obstacles', img: '06_GAME_ELEMENTS/Obstacle_Glitch_Neon.png', color: '#ff2d7b' },
              { name: 'Succes', img: '06_GAME_ELEMENTS/Badges_Succes.png', color: '#ffd700' },
              { name: 'Stickers', img: '06_GAME_ELEMENTS/Stickers_Pack_Gaming.png', color: '#ff00ff' },
            ].map((elem) => (
              <div
                key={elem.name}
                className="group p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: `${elem.color}08`,
                  border: `1px solid ${elem.color}20`,
                }}
              >
                <img
                  src={`${BASE}${elem.img}`}
                  alt={elem.name}
                  className="w-full aspect-square object-contain mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: `drop-shadow(0 0 15px ${elem.color}40)`,
                  }}
                />
                <p
                  className="text-xs font-black tracking-wider"
                  style={{ color: elem.color }}
                >
                  {elem.name.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-32 px-4" id="cta" data-animate>
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url(${BASE}03_ENVIRONNEMENTS/BG_Ville_Cyberpunk.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(5px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050818] via-transparent to-[#050818]" />
        </div>

        <div className={`relative z-10 text-center max-w-3xl mx-auto ${sectionClass('cta')}`}>
          <img
            src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`}
            alt=""
            className="w-24 h-24 mx-auto mb-8"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255,0,255,0.6))',
              animation: 'heroFloat 4s ease-in-out infinite',
            }}
          />
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #ff00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PRET POUR LE VIDE ?
          </h2>
          <p className="text-gray-400 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Xylos attend votre lumiere. Chaque echec vous rapproche de la victoire.
            Combien de temps survivrez-vous ?
          </p>
          <Link href="/game">
            <button
              className="px-16 py-6 rounded-2xl text-2xl font-black tracking-[0.2em] transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #ff00ff)',
                color: '#050818',
                boxShadow: '0 0 60px rgba(0,240,255,0.4), 0 0 120px rgba(255,0,255,0.2)',
              }}
            >
              JOUER
            </button>
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes skinFadeIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
