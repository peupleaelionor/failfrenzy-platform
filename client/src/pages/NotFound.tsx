import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL || '/';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050818] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="relative z-10 text-center max-w-lg">
        <img src={`${BASE}images/assets/logo-skull-512.png`} alt="" className="w-32 h-32 mx-auto mb-8 opacity-50"
          style={{ filter: 'drop-shadow(0 0 30px rgba(255,0,255,0.3))' }} />
        
        <h1 className="text-8xl font-black mb-4 tracking-tight" style={{ color: '#ff00ff', textShadow: '0 0 40px rgba(255,0,255,0.5)' }}>404</h1>
        <h2 className="text-2xl font-black mb-3 tracking-wider" style={{ color: '#00f0ff' }}>PAGE NOT FOUND</h2>
        <p className="text-gray-500 text-sm mb-8 font-mono">Cette page n'existe pas dans la Zone Glitch.</p>
        
        <Link href="/">
          <button className="px-8 py-3 rounded-xl font-black text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', color: '#050818', boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}>
            RETOUR À L'ACCUEIL
          </button>
        </Link>
      </div>
    </div>
  );
}
