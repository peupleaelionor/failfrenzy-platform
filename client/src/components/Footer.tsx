import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL;

export default function Footer() {
  return (
    <footer
      className="relative px-4 py-10 mt-16"
      style={{
        borderTop: '1px solid rgba(0,240,255,0.08)',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(5,8,24,0.95) 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={`${BASE}01_BRANDING/Favicon_Simplifie.png`}
              alt=""
              className="w-7 h-7"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.5))',
                opacity: 0.7,
              }}
            />
            <span className="text-gray-600 text-xs font-mono tracking-wide">
              Fail Frenzy: Echos du Vide &copy; 2026
            </span>
          </div>
          <div className="flex gap-6 text-gray-600 text-xs font-mono tracking-wide">
            <Link
              href="/"
              className="hover:text-[#00f0ff] transition-colors duration-200"
            >
              Accueil
            </Link>
            <Link
              href="/game"
              className="hover:text-[#ff00ff] transition-colors duration-200"
            >
              Jouer
            </Link>
            <Link
              href="/shop"
              className="hover:text-[#ffff00] transition-colors duration-200"
            >
              Boutique
            </Link>
            <Link
              href="/leaderboard"
              className="hover:text-[#ffd700] transition-colors duration-200"
            >
              Classement
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
