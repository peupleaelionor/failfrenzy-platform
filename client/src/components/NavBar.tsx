import { Link, useLocation } from 'wouter';

const BASE = import.meta.env.BASE_URL;

const NAV_LINKS = [
  { href: '/game', label: 'JOUER', color: '#00f0ff' },
  { href: '/shop', label: 'HANGAR', color: '#ff00ff' },
  { href: '/leaderboard', label: 'CLASSEMENT', color: '#ffd700' },
  { href: '/dashboard', label: 'PROFIL', color: '#00ff88' },
  { href: '/premium', label: 'PREMIUM', color: '#ff6600' },
];

export default function NavBar() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      style={{
        background: 'rgba(5,8,24,0.92)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid rgba(0,240,255,0.12)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <img
                src={`${BASE}01_BRANDING/Favicon_Simplifie.png`}
                alt="FF"
                className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.7))',
                }}
              />
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}
              />
            </div>
            <span className="text-xl font-black tracking-tight select-none">
              <span
                style={{
                  color: '#00f0ff',
                  textShadow: '0 0 10px rgba(0,240,255,0.5)',
                }}
              >
                FAIL
              </span>
              <span
                style={{
                  color: '#ff00ff',
                  textShadow: '0 0 10px rgba(255,0,255,0.5)',
                }}
                className="ml-1"
              >
                FRENZY
              </span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <button
                  className="relative px-4 py-2 text-xs font-black tracking-widest transition-all duration-200 rounded-lg"
                  style={{
                    color: isActive ? link.color : 'rgba(255,255,255,0.4)',
                    background: isActive ? `${link.color}12` : 'transparent',
                    textShadow: isActive
                      ? `0 0 12px ${link.color}80`
                      : 'none',
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                      style={{
                        background: link.color,
                        boxShadow: `0 0 8px ${link.color}`,
                      }}
                    />
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Link href="/game">
            <button
              className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider"
              style={{
                background: 'rgba(0,240,255,0.12)',
                border: '1px solid rgba(0,240,255,0.3)',
                color: '#00f0ff',
              }}
            >
              JOUER
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
