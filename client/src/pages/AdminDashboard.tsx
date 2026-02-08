/**
 * FAIL FRENZY — Admin Dashboard
 * Dashboard de suivi pour investisseurs et administrateurs.
 * Affiche les KPIs clés, les métriques de croissance et l'état du projet.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL;

// ==================== TYPES ====================

interface KPI {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  color: string;
  icon: string;
}

interface MilestoneItem {
  title: string;
  status: 'done' | 'in-progress' | 'planned';
  date?: string;
  description: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  users: number;
  premium: number;
}

// ==================== ADMIN LOGIN ====================

const ADMIN_PASSWORD = 'failfrenzy2026';

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('failfrenzy_admin_auth', 'true');
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050818' }}>
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <img src={`${BASE}logo-skull-glitch.png`} alt=""
            className="w-20 mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.5))' }} />
          <h1 className="text-2xl font-black tracking-tight">
            <span style={{ color: '#00f0ff' }}>FAIL</span>
            <span style={{ color: '#ff00ff' }} className="ml-1">FRENZY</span>
          </h1>
          <p className="text-xs font-mono mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>ADMIN DASHBOARD</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe admin"
            className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white placeholder-gray-600 mb-4 outline-none transition-all focus:ring-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: error ? '1px solid #ff4444' : '1px solid rgba(0,240,255,0.15)', focusRingColor: '#00f0ff' }} />
          <button type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00ff)', color: '#000' }}>
            ACCÉDER AU DASHBOARD
          </button>
          {error && <p className="text-center text-xs mt-3" style={{ color: '#ff4444' }}>Mot de passe incorrect</p>}
        </form>
      </div>
    </div>
  );
};

// ==================== MINI CHART ====================

const MiniChart: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 40 }) => {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// ==================== PROGRESS BAR ====================

const ProgressBar: React.FC<{ progress: number; color: string; label: string }> = ({ progress, color, label }) => (
  <div className="mb-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span className="text-[10px] font-bold" style={{ color }}>{Math.round(progress)}%</span>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: color }} />
    </div>
  </div>
);

// ==================== MAIN DASHBOARD ====================

export const AdminDashboard: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('failfrenzy_admin_auth') === 'true');
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'revenue' | 'users'>('overview');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />;

  // ==================== KPI DATA ====================

  const kpis: KPI[] = [
    { label: 'Joueurs Actifs', value: '—', change: 'En attente de lancement', positive: true, color: '#00f0ff', icon: '👥' },
    { label: 'Revenus MRR', value: '0€', change: 'Stripe en configuration', positive: true, color: '#00ff88', icon: '💰' },
    { label: 'Taux de Rétention', value: '—', change: 'Données après lancement', positive: true, color: '#ffd700', icon: '📊' },
    { label: 'Skins Vendus', value: '0', change: 'Boutique prête', positive: true, color: '#ff00ff', icon: '🎨' },
    { label: 'Premium Actifs', value: '0', change: 'Abonnements prêts', positive: true, color: '#bb44ff', icon: '⭐' },
    { label: 'Score Moyen', value: '—', change: 'Après lancement', positive: true, color: '#ff4444', icon: '🎮' },
  ];

  // ==================== MILESTONES ====================

  const milestones: MilestoneItem[] = [
    { title: 'Architecture & Moteur de Jeu', status: 'done', date: 'Jan 2026', description: 'Canvas 2D 60fps, système de particules, physique, audio, skins' },
    { title: 'Système de Skins & Boutique', status: 'done', date: 'Jan 2026', description: '10+ skins, système de rareté, tokens, boutique intégrée' },
    { title: 'Intégration Stripe', status: 'done', date: 'Fév 2026', description: 'Paiements, abonnements Premium, packs de tokens, webhooks' },
    { title: 'Migration Supabase', status: 'done', date: 'Fév 2026', description: 'Auth indépendante, base de données, Row Level Security' },
    { title: 'Univers Narratif "Échos du Vide"', status: 'done', date: 'Fév 2026', description: 'Lore de Xylos, galaxies, Écho-Pilotes, identité visuelle' },
    { title: 'Phase 1: Gameplay Avancé', status: 'done', date: 'Fév 2026', description: 'Trous noirs, bouclier, jauge Xylos, étoiles d\'énergie, galaxies' },
    { title: 'Tutoriel & Cinématique', status: 'done', date: 'Fév 2026', description: 'Onboarding interactif, cinématique narrative, réduction du churn' },
    { title: 'Monétisation Optimisée', status: 'done', date: 'Fév 2026', description: 'Popup tokens, offre premier achat -60%, funnel de conversion' },
    { title: 'Dashboard Admin / Investisseurs', status: 'done', date: 'Fév 2026', description: 'KPIs, roadmap, suivi des revenus et utilisateurs' },
    { title: 'Phase Pub & Marketing', status: 'in-progress', date: 'Fév 2026', description: 'Campagnes pub, réseaux sociaux, influenceurs, ASO' },
    { title: 'Mode Multijoueur', status: 'planned', date: 'Mar 2026', description: 'Duels en temps réel, classements live, tournois' },
    { title: 'Battle Pass Saisonnier', status: 'planned', date: 'Avr 2026', description: 'Saison 1: "L\'Éveil de Xylos", 50 niveaux, récompenses exclusives' },
    { title: 'Application Mobile Native', status: 'planned', date: 'Mai 2026', description: 'iOS & Android via React Native, notifications push' },
    { title: 'Événements Live', status: 'planned', date: 'Juin 2026', description: 'Boss raids, événements communautaires, skins limités' },
  ];

  // ==================== REVENUE PROJECTIONS ====================

  const revenueProjections: RevenueData[] = [
    { month: 'Fév', revenue: 0, users: 0, premium: 0 },
    { month: 'Mar', revenue: 500, users: 1000, premium: 20 },
    { month: 'Avr', revenue: 2000, users: 5000, premium: 80 },
    { month: 'Mai', revenue: 5000, users: 15000, premium: 200 },
    { month: 'Jun', revenue: 12000, users: 40000, premium: 500 },
    { month: 'Jul', revenue: 25000, users: 80000, premium: 1000 },
    { month: 'Aoû', revenue: 40000, users: 150000, premium: 2000 },
    { month: 'Sep', revenue: 60000, users: 250000, premium: 3500 },
  ];

  // ==================== TECH STACK ====================

  const techStack = [
    { name: 'Frontend', tech: 'React + TypeScript + TailwindCSS', status: 'Production' },
    { name: 'Game Engine', tech: 'Canvas 2D Custom (60fps)', status: 'Production' },
    { name: 'Backend', tech: 'Express + tRPC', status: 'Production' },
    { name: 'Auth', tech: 'Supabase Auth', status: 'Production' },
    { name: 'Database', tech: 'Supabase PostgreSQL + Drizzle ORM', status: 'Production' },
    { name: 'Paiements', tech: 'Stripe (Checkout + Webhooks)', status: 'Configuration' },
    { name: 'Hosting', tech: 'Vercel (Edge Network)', status: 'Production' },
    { name: 'Analytics', tech: 'À intégrer (Mixpanel/Amplitude)', status: 'Planifié' },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'VUE D\'ENSEMBLE', color: '#00f0ff' },
    { id: 'roadmap' as const, label: 'ROADMAP', color: '#ff00ff' },
    { id: 'revenue' as const, label: 'REVENUS', color: '#00ff88' },
    { id: 'users' as const, label: 'TECH STACK', color: '#ffd700' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: '#050818' }}>
      {/* Header */}
      <header className="border-b px-4 py-3" style={{ borderColor: 'rgba(0,240,255,0.1)', background: 'rgba(5,8,24,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer group">
                <img src={`${BASE}logo-skull-glitch.png`} alt=""
                  className="w-8 h-auto transition-transform group-hover:rotate-12"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }} />
                <span className="text-lg font-black tracking-tight">
                  <span style={{ color: '#00f0ff' }}>FAIL</span>
                  <span style={{ color: '#ff00ff' }} className="ml-0.5">FRENZY</span>
                </span>
              </div>
            </Link>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)' }}>ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {liveTime.toLocaleString('fr-FR')}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
              <span className="text-[10px] font-mono" style={{ color: '#00ff88' }}>LIVE</span>
            </div>
            <button onClick={() => { localStorage.removeItem('failfrenzy_admin_auth'); setAuthenticated(false); }}
              className="text-[10px] font-mono px-2 py-1 rounded-lg transition-all hover:opacity-100"
              style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              DÉCONNEXION
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b px-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-[10px] font-bold tracking-wider transition-all"
              style={{
                color: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.3)',
                borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {kpis.map((kpi, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${kpi.color}15` }}>
                  <div className="text-lg mb-1">{kpi.icon}</div>
                  <div className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{kpi.label}</div>
                  <div className="text-[8px] font-mono mt-1" style={{ color: kpi.positive ? '#00ff88' : '#ff4444' }}>{kpi.change}</div>
                </div>
              ))}
            </div>

            {/* Project Status */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,240,255,0.1)' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: '#00f0ff' }}>PROGRESSION DU PROJET</h3>
                <ProgressBar progress={100} color="#00ff88" label="Architecture & Moteur" />
                <ProgressBar progress={100} color="#00ff88" label="Système de Skins & Boutique" />
                <ProgressBar progress={100} color="#00ff88" label="Intégration Stripe" />
                <ProgressBar progress={100} color="#00ff88" label="Migration Supabase" />
                <ProgressBar progress={100} color="#00ff88" label="Univers Narratif" />
                <ProgressBar progress={100} color="#00ff88" label="Phase 1: Gameplay Avancé" />
                <ProgressBar progress={30} color="#ffd700" label="Phase Pub & Marketing" />
                <ProgressBar progress={0} color="#ff00ff" label="Mode Multijoueur" />
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>PROGRESSION GLOBALE</span>
                    <span className="text-sm font-black" style={{ color: '#00f0ff' }}>78%</span>
                  </div>
                  <div className="h-2 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: '78%', background: 'linear-gradient(90deg, #00f0ff, #ff00ff)' }} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,0,255,0.1)' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: '#ff00ff' }}>PROCHAINES ÉTAPES</h3>
                <div className="space-y-3">
                  {[
                    { task: 'Configurer les variables d\'environnement Vercel', priority: 'URGENT', color: '#ff4444' },
                    { task: 'Exécuter le schéma SQL dans Supabase', priority: 'URGENT', color: '#ff4444' },
                    { task: 'Créer les produits Stripe (Dashboard)', priority: 'HAUTE', color: '#ffd700' },
                    { task: 'Configurer le webhook Stripe', priority: 'HAUTE', color: '#ffd700' },
                    { task: 'Acheter le nom de domaine', priority: 'HAUTE', color: '#ffd700' },
                    { task: 'Lancer la première campagne pub', priority: 'MOYENNE', color: '#00f0ff' },
                    { task: 'Intégrer Mixpanel/Amplitude', priority: 'MOYENNE', color: '#00f0ff' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-xs font-mono flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.task}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                        style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Projection Chart */}
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,136,0.1)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: '#00ff88' }}>PROJECTION DE REVENUS (2026)</h3>
              <MiniChart data={revenueProjections.map(r => r.revenue)} color="#00ff88" height={120} />
              <div className="flex justify-between mt-2">
                {revenueProjections.map((r, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{r.month}</div>
                    <div className="text-[9px] font-bold" style={{ color: '#00ff88' }}>{r.revenue > 0 ? `${(r.revenue / 1000).toFixed(0)}k€` : '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ROADMAP TAB ==================== */}
        {activeTab === 'roadmap' && (
          <div>
            <h2 className="text-xl font-black mb-6" style={{ color: '#ff00ff' }}>ROADMAP PRODUIT</h2>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4 rounded-xl p-4 transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${m.status === 'done' ? 'rgba(0,255,136,0.15)' : m.status === 'in-progress' ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
                  <div className="flex-shrink-0 mt-0.5">
                    {m.status === 'done' && <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>✓</div>}
                    {m.status === 'in-progress' && <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs animate-pulse" style={{ background: 'rgba(255,215,0,0.15)', color: '#ffd700' }}>◉</div>}
                    {m.status === 'planned' && <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>○</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold" style={{ color: m.status === 'done' ? '#00ff88' : m.status === 'in-progress' ? '#ffd700' : 'rgba(255,255,255,0.5)' }}>{m.title}</span>
                      {m.date && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>{m.date}</span>}
                    </div>
                    <p className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== REVENUE TAB ==================== */}
        {activeTab === 'revenue' && (
          <div>
            <h2 className="text-xl font-black mb-6" style={{ color: '#00ff88' }}>MODÈLE DE REVENUS</h2>

            {/* Revenue Streams */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { title: 'Abonnements Premium', desc: 'Commandeur Mensuel (4.99€) & Annuel (39.99€)', projection: '40% du MRR', color: '#ff00ff', icon: '⭐' },
                { title: 'Packs de Tokens', desc: '50 (0.99€), 200 (2.99€), 500 (4.99€)', projection: '35% du MRR', color: '#ffd700', icon: '🪙' },
                { title: 'Skins Exclusifs', desc: 'Skins limités, événements saisonniers', projection: '25% du MRR', color: '#00f0ff', icon: '🎨' },
              ].map((stream, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${stream.color}15` }}>
                  <div className="text-2xl mb-2">{stream.icon}</div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: stream.color }}>{stream.title}</h3>
                  <p className="text-[10px] font-mono mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{stream.desc}</p>
                  <div className="text-xs font-bold" style={{ color: stream.color }}>{stream.projection}</div>
                </div>
              ))}
            </div>

            {/* Projections Table */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,255,136,0.1)' }}>
              <div className="px-4 py-3" style={{ background: 'rgba(0,255,136,0.05)' }}>
                <h3 className="text-sm font-bold" style={{ color: '#00ff88' }}>PROJECTIONS MENSUELLES</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <th className="text-left text-[10px] font-mono px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Mois</th>
                      <th className="text-right text-[10px] font-mono px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Utilisateurs</th>
                      <th className="text-right text-[10px] font-mono px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Premium</th>
                      <th className="text-right text-[10px] font-mono px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Revenus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueProjections.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="text-xs font-mono px-4 py-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.month} 2026</td>
                        <td className="text-right text-xs font-bold px-4 py-2" style={{ color: '#00f0ff' }}>{r.users.toLocaleString()}</td>
                        <td className="text-right text-xs font-bold px-4 py-2" style={{ color: '#ff00ff' }}>{r.premium.toLocaleString()}</td>
                        <td className="text-right text-xs font-bold px-4 py-2" style={{ color: '#00ff88' }}>{r.revenue.toLocaleString()}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'ARPU Cible', value: '0.50€', color: '#00ff88' },
                { label: 'Taux de Conversion', value: '3-5%', color: '#ffd700' },
                { label: 'LTV Estimée', value: '8-12€', color: '#ff00ff' },
                { label: 'CAC Cible', value: '<2€', color: '#00f0ff' },
              ].map((m, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${m.color}15` }}>
                  <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-[8px] font-mono mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TECH STACK TAB ==================== */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-black mb-6" style={{ color: '#ffd700' }}>STACK TECHNIQUE</h2>
            <div className="space-y-2">
              {techStack.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span className="text-sm font-bold text-white">{t.name}</span>
                    <span className="text-xs font-mono ml-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.tech}</span>
                  </div>
                  <span className="text-[9px] px-2 py-1 rounded-full font-bold"
                    style={{
                      background: t.status === 'Production' ? 'rgba(0,255,136,0.1)' : t.status === 'Configuration' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                      color: t.status === 'Production' ? '#00ff88' : t.status === 'Configuration' ? '#ffd700' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${t.status === 'Production' ? 'rgba(0,255,136,0.2)' : t.status === 'Configuration' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            {/* Architecture Diagram */}
            <div className="mt-8 rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,240,255,0.1)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: '#00f0ff' }}>ARCHITECTURE</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg p-3" style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)' }}>
                  <div className="text-lg mb-1">🎮</div>
                  <div className="text-[10px] font-bold" style={{ color: '#00f0ff' }}>CLIENT</div>
                  <div className="text-[8px] font-mono mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>React + Canvas 2D</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,0,255,0.05)', border: '1px solid rgba(255,0,255,0.15)' }}>
                  <div className="text-lg mb-1">⚡</div>
                  <div className="text-[10px] font-bold" style={{ color: '#ff00ff' }}>API</div>
                  <div className="text-[8px] font-mono mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Express + tRPC</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)' }}>
                  <div className="text-lg mb-1">🗄️</div>
                  <div className="text-[10px] font-bold" style={{ color: '#00ff88' }}>DATA</div>
                  <div className="text-[8px] font-mono mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Supabase + Stripe</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>Vercel Edge Network</span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-3 mt-8" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>Fail Frenzy: Échos du Vide — Admin Dashboard v1.0</span>
          <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 Flowtech</span>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
