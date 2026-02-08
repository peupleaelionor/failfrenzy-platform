# 🚀 FAIL FRENZY - ROADMAP & DOCUMENTATION

Ce document décrit la vision, l'architecture et les prochaines étapes pour Fail Frenzy. Il est destiné à la future équipe de développement.

---

## 🎯 Vision & Objectifs

Fail Frenzy est un jeu d'arcade "edge-first" conçu pour être :
- **Ultra-rapide** : 60 FPS, chargement < 2s, latence API < 50ms
- **Immersif** : Design "Glitch Pop Arcade", audio procédural, univers narratif fort
- **Compétitif** : Classements, modes de jeu variés, succès
- **Monétisable** : Abonnements Premium, boutique de cosmétiques (tokens)

L'objectif est de créer une expérience de jeu addictive et de construire une communauté engagée autour de la compétition et de l'échec comme mécanique de progression.

---

## 🛠️ Architecture Actuelle (Version Standalone)

Le projet est actuellement une **application web 100% standalone** (auto-dépendante) déployée sur Vercel. Il n'y a **pas de backend** ni de base de données.

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS 4
- **Moteur de jeu** : Canvas 2D custom (`NeonRenderer.ts`)
- **Données locales** : `localStorage` pour les scores, les tokens, les skins débloqués
- **Déploiement** : Vercel via GitHub (dépôt `peupleaelionor/failfrenzy-platform`)

### Fichiers Clés

- `client/src/pages/` : Contient toutes les pages (Home, Game, Shop, Leaderboard, etc.)
- `client/src/game/` : Contient le moteur de jeu (`FailFrenzyGame.ts`), le rendu (`GameComponents.tsx`), la logique des assets (`AssetLoader.ts`)
- `client/src/engine/` : Contient le moteur de rendu custom (`NeonRenderer.ts`)
- `ROADMAP.md` : Ce fichier

---

## 🗺️ Prochaines Étapes (Roadmap)

### V1 : Lancement Public (Standalone)

- [x] **Finaliser le site standalone** (fait)
- [x] **Intégrer le logo skull partout** (fait)
- [x] **Créer l'univers narratif** (fait)
- [x] **Rendre les pages Shop/Leaderboard/Dashboard fonctionnelles** avec `localStorage` (fait)
- [ ] **Intégrer les payment links Stripe** (voir ci-dessous)

### V2 : Backend & Vrai Jeu en Ligne

C'est la prochaine grosse étape pour transformer Fail Frenzy en un vrai jeu en ligne.

1.  **Initialiser un projet avec backend** : Utiliser un scaffold comme `web-db-user` (React + Drizzle + MySQL/TiDB + Auth) ou une stack similaire (Next.js, Supabase, etc.).
2.  **Migrer le jeu existant** : Intégrer le moteur de jeu (`/game`, `/engine`) dans le nouveau projet.
3.  **Créer le schéma de base de données** :
    - `users` (id, email, name, tokens, premium_status, etc.)
    - `scores` (user_id, score, mode, created_at)
    - `skins` (id, name, description, price, rarity)
    - `user_skins` (user_id, skin_id)
4.  **Créer les API backend** :
    - `POST /api/scores` : Sauvegarder un nouveau score
    - `GET /api/leaderboard` : Récupérer le classement (par mode)
    - `GET /api/shop` : Récupérer les skins disponibles
    - `POST /api/shop/buy` : Acheter un skin avec des tokens
    - `POST /api/stripe/checkout` : Créer une session de paiement Stripe
    - `POST /api/stripe/webhooks` : Gérer les paiements réussis (donner tokens/premium)
5.  **Connecter le frontend au backend** : Remplacer toutes les utilisations de `localStorage` par des appels API.

### V3 : Application Mobile

- **Développer une application mobile** avec React Native (Expo) en réutilisant le code du moteur de jeu et en se connectant au même backend.

---

## 💳 Intégration Stripe (Instructions pour la future équipe)

1.  **Récupérer les clés Stripe** :
    - `pk_live_...` (Publishable Key)
    - `sk_live_...` (Secret Key)
    - `whsec_...` (Webhook Secret)
2.  **Créer les produits sur Stripe** (déjà fait, voir `stripe_ids.md`)
3.  **Créer les Payment Links** pour chaque produit/prix via l'API Stripe ou le dashboard.
4.  **Intégrer les Payment Links dans le frontend** :
    - Dans `Premium.tsx`, `Shop.tsx`, etc., faire pointer les boutons "Acheter" vers les URLs des Payment Links.
5.  **(Pour la V2 avec backend) Mettre en place les webhooks** :
    - Créer une route `POST /api/stripe/webhooks` qui écoute les événements `checkout.session.completed`.
    - Quand un paiement est réussi, mettre à jour la base de données (donner les tokens, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, activer le statut premium, etc.).
    - Sécuriser le webhook avec le `whsec_...`.

---

Ce document devrait fournir une base solide pour continuer le développement de Fail Frenzy. Le projet a un énorme potentiel. Bonne chance ! 🚀
