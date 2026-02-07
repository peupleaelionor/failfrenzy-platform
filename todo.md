# Fail Frenzy Platform - TODO

## Phase 1: Migration du Jeu
- [x] Copier le moteur de jeu Canvas (GameEngine.ts, NeonRenderer.ts, PhysicsSystem.ts)
- [x] Migrer les 4 modes de jeu (Classic, Time Trial, Infinite, Seeds)
- [x] Migrer les systèmes (AchievementSystem, AudioSystem, ComboSystem, ParticleSystem, PowerUpSystem)
- [x] Migrer les composants de jeu (FailFrenzyGame.ts, GameComponents.tsx)
- [x] Adapter le design néon au thème de la plateforme
- [ ] Créer la page /game avec sélection de mode

## Phase 2: Base de Données
- [x] Créer table users avec champs premium, tokens, role
- [x] Créer table scores (user_id, mode, score, fails, time, date)
- [x] Créer table achievements (user_id, achievement_id, unlocked_at, reward)
- [x] Créer table purchases (user_id, type, item_id, amount, stripe_payment_id, date)
- [x] Créer table skins (id, name, price_tokens, rarity, image_url)
- [x] Créer table user_skins (user_id, skin_id, unlocked_at)
- [x] Créer table daily_challenges (id, date, description, reward_tokens, mode)
- [x] Créer table user_challenges (user_id, challenge_id, completed_at)
- [x] Créer table referrals (referrer_id, referred_id, code, created_at, reward_claimed)
- [x] Exécuter db:push pour appliquer le schéma

## Phase 3: Backend tRPC
- [x] Créer router game avec procedures: startGame, submitScore, getStats
- [x] Créer router leaderboard avec: getGlobal, getByMode, getByCountry, getByPeriod
- [x] Créer router achievements avec: getUserAchievements, unlockAchievement
- [x] Créer router shop avec: getSkins, purchaseSkin, getTokenBalance
- [x] Créer router tokens avec: addTokens, spendTokens, getTransactionHistory
- [x] Créer router challenges avec: getDailyChallenges, completeChallenge, getStreak
- [x] Créer router referral avec: generateCode, applyCode, getReferralStats
- [x] Créer router premium avec: checkSubscription, getFeatures
- [x] Créer helpers dans db.ts pour toutes les queries

## Phase 4: Intégration Stripe
- [x] Configurer Stripe avec webdev_add_feature
- [x] Créer produit Premium Mensuel (4.99€/mois)
- [x] Créer produit Premium Annuel (39.99€/an)
- [x] Créer produits packs de tokens (100, 500, 1000)
- [x] Implémenter webhook Stripe pour validation paiements
- [x] Créer API route /api/stripe/create-checkout
- [x] Créer API route /api/stripe/webhook
- [x] Créer API route /api/stripe/customer-portal
- [ ] Tester paiements en mode test

## Phase 5: Pages Frontend
- [x] Créer page / (Landing page marketing avec CTA)
- [ ] Créer page /game (Sélection de mode + Canvas)
- [ ] Créer page /leaderboard (Classements globaux avec filtres)
- [ ] Créer page /dashboard (Stats utilisateur + graphiques)
- [ ] Créer page /shop (Boutique de skins avec tokens)
- [ ] Créer page /premium (Plans tarifaires + upgrade)
- [ ] Créer page /profile (Profil + paramètres)
- [ ] Créer page /achievements (Liste des achievements)
- [ ] Créer composant GameCanvas pour le jeu
- [ ] Créer composant LeaderboardTable
- [ ] Créer composant StatsChart pour graphiques
- [ ] Créer composant SkinCard pour boutique
- [ ] Créer composant PricingCard pour plans premium

## Phase 6: Système Freemium
- [ ] Implémenter logique de limitation pour utilisateurs gratuits
- [ ] Ajouter vérification premium dans procedures protégées
- [ ] Créer système de compteur de parties quotidiennes
- [ ] Implémenter blocage des modes premium pour users gratuits
- [ ] Ajouter bannières "Upgrade to Premium" dans l'UI

## Phase 7: Publicités (AdSense)
- [ ] Configurer Google AdSense
- [ ] Intégrer Interstitial Ads entre les parties
- [ ] Intégrer Rewarded Video Ads pour tokens gratuits
- [ ] Intégrer Banner Ads en bas de page
- [ ] Créer logique pour masquer pubs aux users premium

## Phase 8: Système de Notifications
- [ ] Implémenter notifications pour défis quotidiens
- [ ] Implémenter notifications pour achievements débloqués
- [ ] Implémenter notifications pour événements spéciaux
- [ ] Créer composant NotificationBell dans header
- [ ] Créer table notifications dans la BDD

## Phase 9: Features Sociales
- [ ] Implémenter partage de score sur Twitter/Facebook
- [ ] Créer système de défis entre amis
- [ ] Implémenter capture d'écran auto avec score
- [ ] Créer page /referral pour parrainage

## Phase 10: Analytics et Optimisation
- [ ] Configurer Vercel Analytics
- [ ] Ajouter tracking des conversions
- [ ] Optimiser les requêtes de leaderboard
- [ ] Implémenter cache pour scores
- [ ] Optimiser le bundle size

## Phase 11: Tests et Déploiement
- [ ] Écrire tests vitest pour procedures critiques
- [ ] Tester le flow complet d'inscription/connexion
- [ ] Tester le flow d'achat Stripe
- [ ] Tester le système de tokens
- [ ] Tester les leaderboards
- [ ] Créer premier checkpoint
- [ ] Déployer sur Vercel

## Design Restauration
- [x] Restaurer la palette de couleurs HEX originale (#050818, #00f0ff, #ff00ff, #ffff00, etc.)
- [x] Restaurer les effets glitch CSS (glitch-text, glitch-border, glitch-card, glitch-button)
- [x] Restaurer les effets néon glow (neon-glow-cyan, neon-glow-magenta, neon-glow-yellow)
- [x] Restaurer les scanlines et animations (pulse-glow, gradient, float, slide-up)
- [x] Restaurer la scrollbar custom cyan
- [x] Migrer les assets images (logo, boutons, targets, effets)
- [x] Restaurer la landing page originale avec grille néon, particules, et sections complètes

## Bugs
- [ ] Fix: Cliquer sur JOUER donne une erreur 404 (page /game manquante)

## Page /game
- [ ] Créer la page /game avec sélection de mode et moteur Canvas intégré
- [ ] Enregistrer la route /game dans App.tsx

## Nouvelles Pages à Créer
- [ ] Créer page /game avec moteur Canvas, sélection de mode, HUD, et intégration complète du jeu
- [ ] Créer page /dashboard avec stats utilisateur, graphiques de progression, historique des parties
- [ ] Créer page /shop avec boutique de skins, système de tokens, previews visuels
- [ ] Enregistrer toutes les routes dans App.tsx
- [ ] Créer pages /leaderboard et /premium si manquantes

## Déploiement Vercel + Railway
- [ ] Adapter vercel.json pour build frontend uniquement (SPA)
- [ ] Créer Dockerfile/Procfile pour Railway (backend Express)
- [ ] Configurer CORS pour communication frontend ↔ backend
- [ ] Adapter le client tRPC pour pointer vers l'URL Railway
- [ ] Pousser le code vers GitHub
- [ ] Déployer frontend sur Vercel
- [ ] Fournir instructions Railway avec variables d'environnement
