# 🎮 Fail Frenzy: Échos du Vide

Un jeu arcade spatial compétitif — pilotez votre Vaisseau-Écho, collectez les échos de lumière stellaire et alimentez Xylos.

## 🚀 Présentation

**Fail Frenzy** est un jeu arcade "edge-first" conçu pour être ultra-rapide, immersif, compétitif et monétisable. Le joueur pilote un vaisseau spatial à travers des environnements cyberpunk et nébuleux, esquive des obstacles, collecte des ressources et progresse dans un récit cosmique.

### Modes de jeu
- **Classic** — Score par survie, difficulté croissante
- **Time Trial** — Score maximum en temps limité
- **Infinite** — Endurance sans fin
- **Seeds** — Runs reproductibles via seed partagé

## ✨ Fonctionnalités

- 🎨 Moteur de rendu Canvas 2D custom avec effets néon (NeonRenderer)
- 🚀 Système physique complet (collisions, trajectoires)
- 🏆 Classement global, achievements, streaks et combos
- 🛒 Boutique de skins de vaisseaux (10+ skins avec raretés)
- 💎 Système de tokens et progression
- 💳 Intégration Stripe (abonnements Premium, packs de tokens)
- 🔐 Authentification Supabase
- 📖 Univers narratif complet (Xylos, Échos, Le Grand Silence)
- 📱 Interface mobile-first, responsive

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite, TailwindCSS 4, Framer Motion
- **Backend** : Express, tRPC 11, TypeScript
- **Base de données** : MySQL via Drizzle ORM
- **Auth** : Supabase
- **Paiements** : Stripe (webhooks, checkout, portail client)
- **UI** : shadcn/ui (Radix), Lucide Icons
- **Déploiement** : Vercel (frontend), Railway (backend)

## 📂 Structure du projet

```
├── client/src/          # Application React
│   ├── engine/          # Moteur de jeu (GameEngine, NeonRenderer, Physics)
│   ├── game/            # Logique Fail Frenzy (FailFrenzyGame, Skins, Config)
│   ├── systems/         # Systèmes (Audio, Achievements, Combos, Xylos...)
│   ├── pages/           # Pages (Home, Game, Dashboard, Shop, Leaderboard...)
│   ├── components/      # Composants React + shadcn/ui
│   └── contexts/        # Contextes React (Theme)
├── server/              # Backend Express + tRPC
│   ├── _core/           # Configuration serveur, auth, tRPC
│   └── stripe/          # Intégration Stripe (checkout, webhooks)
├── shared/              # Types et constantes partagés
├── drizzle/             # Schéma DB et migrations
├── docs/                # Documentation détaillée
└── assets/              # Assets conceptuels
```

## 🏁 Démarrage Rapide

```bash
pnpm install
pnpm dev
```

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build frontend + backend |
| `pnpm check` | Vérification TypeScript |
| `pnpm test` | Lancer les tests |
| `pnpm format` | Formater le code (Prettier) |
| `pnpm db:push` | Générer et appliquer les migrations DB |

## 📖 Documentation

La documentation détaillée se trouve dans le dossier [`docs/`](./docs/) :

- [Gameplay System](./docs/GAMEPLAY_SYSTEM.md) — Mécaniques de jeu détaillées
- [Lore & Narrative](./docs/LORE_AND_NARRATIVE.md) — Univers et backstory
- [Design Brief](./docs/DESIGN_BRIEF.md) — Direction artistique "Glitch Pop Arcade"
- [UX Experience](./docs/UX_EXPERIENCE.md) — Parcours utilisateur complet
- [Features Xylos](./docs/FEATURES_XYLOS.md) — Système Xylos et skins
- [Optimizations](./docs/OPTIMIZATIONS.md) — Optimisations de performance
- [Stripe Integration](./docs/STRIPE_INTEGRATION_NOTES.md) — Configuration Stripe
- [Supabase Setup](./docs/SUPABASE_SETUP.md) — Configuration Supabase
- [Vercel Domain Guide](./docs/VERCEL_DOMAIN_GUIDE.md) — Déploiement Vercel

## 📄 Licence

Ce projet est sous licence MIT.

---

*Créé par [Kevin B. / peupleaelionor](https://github.com/peupleaelionor)*
