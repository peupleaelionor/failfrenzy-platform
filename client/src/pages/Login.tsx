/**
 * FAIL FRENZY - Login Page
 * Page de connexion avec Supabase Auth
 */

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const BASE = import.meta.env.BASE_URL || '/';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        setMessage('Connexion réussie ! Redirection...');
        setTimeout(() => setLocation('/game'), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white flex items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Nebula background */}
      <div className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(138,43,226,0.15), transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(0,240,255,0.15), transparent 50%)',
        }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center gap-3 mb-8 cursor-pointer group">
            <img src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`} alt="" className="w-16 h-auto transition-transform group-hover:rotate-12"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.5))' }} />
            <div className="text-2xl font-black tracking-tight">
              <span style={{ color: '#00f0ff' }}>FAIL</span>
              <span style={{ color: '#ff00ff' }} className="ml-1">FRENZY</span>
            </div>
          </div>
        </Link>

        {/* Login Card */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(10,14,39,0.8)', border: '1px solid rgba(0,240,255,0.2)', boxShadow: '0 0 40px rgba(0,240,255,0.1)' }}>
          <h1 className="text-2xl font-black mb-2 text-center">
            <span style={{ color: '#00f0ff' }}>CONNEXION</span>
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6 font-mono">Rejoignez les Écho-Pilotes</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)' }}>
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
              <p className="text-green-400 text-sm font-mono">{message}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-2 text-gray-400 font-mono">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.2)', color: '#fff' }}
                placeholder="pilote@xylos.space"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-gray-400 font-mono">MOT DE PASSE</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.2)', color: '#fff' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-sm tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', color: '#050818', boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}>
              {loading ? 'CONNEXION...' : 'SE CONNECTER'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm font-mono">
              Pas encore de compte ?{' '}
              <Link href="/signup">
                <span className="font-bold cursor-pointer transition-colors" style={{ color: '#00f0ff' }}>
                  S'inscrire
                </span>
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/">
              <span className="text-gray-600 text-xs font-mono hover:text-gray-400 transition-colors cursor-pointer">
                ← Retour à l'accueil
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
