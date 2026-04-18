# Notes d'Intégration Stripe - Fail Frenzy

## Informations extraites du PDF

### État actuel du projet
- **Architecture actuelle** : Application web standalone (pas de backend ni base de données initialement)
- **Déploiement** : Vercel via GitHub (peupleaelionor/failfrenzy-platform)
- **Stack** : React 19, TypeScript, Vite, Tailwind CSS 4

### Roadmap V1 - Lancement Public (Standalone)
- ✅ Finaliser le site standalone
- ✅ Intégrer le logo skull partout
- ✅ Créer l'univers narratif
- ✅ Rendre les pages Shop/Leaderboard/Dashboard fonctionnelles avec localStorage
- ⏳ **Intégrer les payment links Stripe** (tâche actuelle)

### Instructions d'Intégration Stripe (Version Standalone - V1)

1. **Récupérer les clés Stripe** :
   - `pk_live_...` (Publishable Key)
   - `sk_live_...` (Secret Key)
   - `whsec_...` (Webhook Secret)

2. **Créer les produits sur Stripe** (déjà fait, voir stripe_ids.md)

3. **Créer les Payment Links** pour chaque produit/prix via l'API Stripe ou le dashboard

4. **Intégrer les Payment Links dans le frontend** :
   - Dans `Premium.tsx`, `Shop.tsx`, etc., faire pointer les boutons "Acheter" vers les URLs des Payment Links

5. **(Pour la V2 avec backend) Mettre en place les webhooks** :
   - Créer une route `POST /api/stripe/webhooks` qui écoute les événements `checkout.session.completed`
   - Quand un paiement est réussi, mettre à jour la base de données (donner les tokens, activer le statut premium)
   - Sécuriser le webhook avec le `whsec_...`

### Roadmap V2 - Backend & Vrai Jeu en Ligne

**CONSTAT ACTUEL** : Le projet a déjà un backend complet avec :
- Express + tRPC
- Base de données MySQL avec Drizzle ORM
- Authentification OAuth
- **Intégration Stripe complète** déjà implémentée :
  - ✅ `server/stripe/router.ts` - Routes tRPC pour créer des sessions de paiement
  - ✅ `server/stripe/webhook.ts` - Gestion des webhooks Stripe
  - ✅ `server/stripe/products.ts` - Configuration des produits
  - ✅ Webhook endpoint configuré dans `server/_core/index.ts`

### Produits Stripe configurés

**Abonnements Premium** :
- PREMIUM_MONTHLY : 4.99 EUR/mois
- PREMIUM_YEARLY : 39.99 EUR/an (Save 33%)

**Packs de Tokens** :
- TOKENS_100 : 0.99 EUR (100 tokens)
- TOKENS_500 : 3.99 EUR (500 tokens)
- TOKENS_1000 : 6.99 EUR (1000 tokens)

### Variables d'environnement nécessaires

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...
STRIPE_PRICE_TOKENS_100=price_...
STRIPE_PRICE_TOKENS_500=price_...
STRIPE_PRICE_TOKENS_1000=price_...
```

### Fonctionnalités Stripe déjà implémentées

1. **Création de sessions de paiement** (`stripeRouter.createCheckout`)
   - Support abonnements et paiements uniques
   - Métadonnées utilisateur incluses
   - URLs de succès/annulation configurables

2. **Portail client Stripe** (`stripeRouter.getCustomerPortalUrl`)
   - Permet aux utilisateurs de gérer leurs abonnements

3. **Gestion des webhooks** :
   - `checkout.session.completed` : Active premium ou ajoute tokens
   - `invoice.paid` : Renouvelle l'abonnement premium
   - `customer.subscription.updated` : Met à jour le statut premium
   - `customer.subscription.deleted` : Désactive le premium
   - `payment_intent.succeeded` : Logique additionnelle

### Ce qui reste à faire

1. **Configurer les variables d'environnement sur Vercel**
2. **Créer les produits et prix sur Stripe Dashboard**
3. **Configurer le webhook Stripe** pointant vers `https://[votre-domaine]/api/stripe/webhook`
4. **Tester l'intégration** en mode test puis en production
5. **Connecter le frontend** aux routes tRPC Stripe

### Schéma de base de données (déjà implémenté)

Le projet utilise Drizzle ORM avec les tables suivantes (voir `drizzle/schema`):
- `users` : Informations utilisateur, tokens, premium_status, stripeCustomerId
- `scores` : Scores des joueurs
- `skins` : Cosmétiques disponibles
- `user_skins` : Skins débloqués par utilisateur
- `purchases` : Historique des achats
- `token_transactions` : Historique des transactions de tokens
