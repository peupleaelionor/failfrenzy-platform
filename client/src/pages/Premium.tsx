/**
 * FAIL FRENZY - Premium Page (Standalone)
 * Page d'offre premium avec plans et avantages
 */

import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL || '/';

export default function Premium() {
  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: 'rgba(5,8,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <img src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`} alt="" className="w-8 h-auto transition-transform group-hover:rotate-12"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
              <span className="text-lg font-black tracking-tight">
                <span style={{ color: '#00f0ff' }}>FAIL</span>
                <span style={{ color: '#ff00ff' }} className="ml-0.5">FRENZY</span>
              </span>
            </div>
          </Link>
          <Link href="/game" className="text-gray-500 hover:text-[#00f0ff] text-xs font-mono tracking-wider transition-colors">JOUER</Link>
        </div>
      </nav>

      <main className="relative z-10 px-4 py-12 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <img src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`} alt="" className="w-20 h-auto mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.6))' }} />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
            <span style={{ color: '#ffd700', textShadow: '0 0 40px rgba(255,215,0,0.5)' }}>PREMIUM</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
            Débloque tout le potentiel de Fail Frenzy. Skins exclusifs, pas de pub, et le respect du Crâne Cosmique.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          {/* Free */}
          <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-xl font-black mb-1 text-gray-400">GRATUIT</h3>
            <div className="text-3xl font-black text-white mb-4">0€</div>
            <ul className="space-y-3 text-sm text-gray-400">
              {['4 modes de jeu', '3 skins gratuits', 'Classement local', 'Succès de base', 'Publicités entre les parties'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#00ff88"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="relative p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,0,255,0.05) 100%)', border: '2px solid rgba(255,215,0,0.4)', boxShadow: '0 0 40px rgba(255,215,0,0.15)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold tracking-wider"
              style={{ background: 'linear-gradient(90deg, #ffd700, #ff00ff)', color: '#050818' }}>RECOMMANDÉ</div>
            <h3 className="text-xl font-black mb-1" style={{ color: '#ffd700' }}>PREMIUM</h3>
            <div className="text-3xl font-black text-white mb-1">4.99€<span className="text-sm text-gray-500 font-normal">/mois</span></div>
            <p className="text-[10px] text-gray-600 font-mono mb-4">ou 29.99€/an (économise 50%)</p>
            <ul className="space-y-3 text-sm">
              {[
                { text: 'Tout le contenu gratuit', color: '#00ff88' },
                { text: '10 skins exclusifs', color: '#ffd700' },
                { text: 'Aucune publicité', color: '#ff00ff' },
                { text: 'Classement mondial', color: '#00f0ff' },
                { text: 'Succès premium', color: '#ffff00' },
                { text: '500 tokens/mois offerts', color: '#ff6600' },
                { text: 'Badge Crâne Doré', color: '#ffd700' },
              ].map(f => (
                <li key={f.text} className="flex items-center gap-2" style={{ color: f.color }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <button className="w-full mt-6 py-3 rounded-xl font-black text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ffd700, #ff00ff)', color: '#050818', boxShadow: '0 0 25px rgba(255,215,0,0.3)' }}>
              BIENTÔT DISPONIBLE
            </button>
          </div>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link href="/game">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', color: '#00f0ff' }}>
              RETOUR AU JEU
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 mt-12" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={`${BASE}01_BRANDING/Favicon_Simplifie.png`} alt="" className="w-6 h-6" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.5))' }} />
            <span className="text-gray-600 text-xs font-mono">Fail Frenzy: Échos du Vide © 2026</span>
          </div>
          <div className="flex gap-4 text-gray-600 text-xs font-mono">
            <Link href="/" className="hover:text-[#00f0ff] transition-colors">Accueil</Link>
            <Link href="/game" className="hover:text-[#ff00ff] transition-colors">Jouer</Link>
            <Link href="/shop" className="hover:text-[#ffff00] transition-colors">Boutique</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
