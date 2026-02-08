/**
 * FAIL FRENZY - Signup Page
 * Page d'inscription avec Supabase Auth
 */

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const BASE = import.meta.env.BASE_URL || '/';

export default function Signup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setMessage('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
        setTimeout(() => setLocation('/login'), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
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
            <img src={`${BASE}logo-skull-glitch.png`} alt="" className="w-16 h-auto transition-transform group-hover:rotate-12"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,0,255,0.5))' }} />
            <div className="text-2xl font-black tracking-tight">
              <span style={{ color: '#00f0ff' }}>FAIL</span>
              <span style={{ color: '#ff00ff' }} className="ml-1">FRENZY</span>
            </div>
          </div>
        </Link>

        {/* Signup Card */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(10,14,39,0.8)', border: '1px solid rgba(255,0,255,0.2)', boxShadow: '0 0 40px rgba(255,0,255,0.1)' }}>
          <h1 className="text-2xl font-black mb-2 text-center">
            <span style={{ color: '#ff00ff' }}>INSCRIPTION</span>
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6 font-mono">Devenez un Écho-Pilote</p>

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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-2 text-gray-400 font-mono">NOM DE PILOTE</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,0,255,0.2)', color: '#fff' }}
                placeholder="EchoPilot42"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-gray-400 font-mono">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,0,255,0.2)', color: '#fff' }}
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
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,0,255,0.2)', color: '#fff' }}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-600 mt-1 font-mono">Minimum 6 caractères</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-sm tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #ff00ff, #00f0ff)', color: '#050818', boxShadow: '0 0 25px rgba(255,0,255,0.3)' }}>
              {loading ? 'CRÉATION...' : 'CRÉER MON COMPTE'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm font-mono">
              Déjà un compte ?{' '}
              <Link href="/login">
                <span className="font-bold cursor-pointer transition-colors" style={{ color: '#ff00ff' }}>
                  Se connecter
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
