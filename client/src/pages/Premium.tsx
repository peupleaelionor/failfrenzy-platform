import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const BASE = import.meta.env.BASE_URL;

const FREE_FEATURES = [
  '4 modes de jeu',
  '3 skins gratuits',
  'Classement local',
  'Succes de base',
  'Publicites entre les parties',
];

const PREMIUM_FEATURES = [
  { text: 'Tout le contenu gratuit', color: '#00ff88' },
  { text: '10 skins exclusifs', color: '#ffd700' },
  { text: 'Aucune publicite', color: '#ff00ff' },
  { text: 'Classement mondial', color: '#00f0ff' },
  { text: 'Succes premium', color: '#ffff00' },
  { text: '500 tokens/mois offerts', color: '#ff6600' },
  { text: 'Badge Crane Dore', color: '#ffd700' },
];

export default function Premium() {
  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <NavBar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${BASE}03_ENVIRONNEMENTS/BG_Nebuleuse_Spatiale.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(12px)',
            opacity: 0.08,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050818] via-transparent to-[#050818]" />
      </div>

      <StarField count={20} />

      <main className="relative z-10 px-4 pt-24 pb-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <img
            src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`}
            alt=""
            className="w-20 h-20 mx-auto mb-5"
            style={{
              filter: 'drop-shadow(0 0 25px rgba(255,215,0,0.6)) drop-shadow(0 0 50px rgba(255,0,255,0.3))',
            }}
          />
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ff00ff, #ffd700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'premiumGradient 4s linear infinite',
            }}
          >
            PREMIUM
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Debloque tout le potentiel de Fail Frenzy.
            <br />
            Skins exclusifs, pas de pub, et le respect du Crane Cosmique.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-14">
          <div
            className="p-7 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3 className="text-lg font-black mb-1 text-gray-500 tracking-wider">GRATUIT</h3>
            <div className="text-4xl font-black text-white mb-6">
              0<span className="text-lg text-gray-600">EUR</span>
            </div>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#00ff88">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative p-7 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,0,255,0.04) 100%)',
              border: '2px solid rgba(255,215,0,0.3)',
              boxShadow: '0 0 40px rgba(255,215,0,0.1), inset 0 0 30px rgba(255,215,0,0.03)',
            }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-[10px] font-black tracking-widest"
              style={{
                background: 'linear-gradient(90deg, #ffd700, #ff00ff)',
                color: '#050818',
              }}
            >
              RECOMMANDE
            </div>
            <h3
              className="text-lg font-black mb-1 tracking-wider"
              style={{ color: '#ffd700' }}
            >
              PREMIUM
            </h3>
            <div className="text-4xl font-black text-white mb-1">
              4.99<span className="text-lg text-gray-500">EUR/mois</span>
            </div>
            <p className="text-[10px] text-gray-600 font-mono mb-6">
              ou 29.99EUR/an (economise 50%)
            </p>
            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li
                  key={f.text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: f.color }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {f.text}
                </li>
              ))}
            </ul>
            <button
              className="w-full mt-8 py-4 rounded-xl font-black text-sm tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ff00ff)',
                color: '#050818',
                boxShadow: '0 0 30px rgba(255,215,0,0.25)',
              }}
            >
              BIENTOT DISPONIBLE
            </button>
          </div>
        </div>

        <div
          className="max-w-3xl mx-auto p-8 rounded-2xl text-center mb-10"
          style={{
            background: 'rgba(0,240,255,0.04)',
            border: '1px solid rgba(0,240,255,0.12)',
          }}
        >
          <h3
            className="text-2xl font-black tracking-wider mb-4"
            style={{ color: '#00f0ff' }}
          >
            POURQUOI PREMIUM ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {[
              { title: 'SKINS EXCLUSIFS', desc: 'Legendaires et Epiques avec effets VFX uniques', color: '#ffd700' },
              { title: 'ZERO PUB', desc: 'Experience fluide sans interruption', color: '#ff00ff' },
              { title: '500 TOKENS/MOIS', desc: 'Debloquez du contenu plus rapidement', color: '#00ff88' },
            ].map((item) => (
              <div key={item.title}>
                <h4
                  className="text-sm font-black tracking-wider mb-2"
                  style={{ color: item.color }}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/game">
            <button
              className="px-8 py-3 rounded-xl text-sm font-bold tracking-wider transition-all hover:scale-105"
              style={{
                background: 'rgba(0,240,255,0.08)',
                border: '1px solid rgba(0,240,255,0.2)',
                color: '#00f0ff',
              }}
            >
              RETOUR AU JEU
            </button>
          </Link>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes premiumGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
