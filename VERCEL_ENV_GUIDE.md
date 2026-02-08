# 🚀 Guide : Configuration des Variables d'Environnement sur Vercel pour Fail Frenzy

Ce guide vous explique comment configurer les variables d'environnement nécessaires pour connecter votre projet Fail Frenzy à Stripe et à la base de données depuis Vercel.

---

## 📄 Contexte

Le backend de Fail Frenzy a besoin de clés secrètes (API keys) pour communiquer de manière sécurisée avec des services externes comme Stripe (pour les paiements) et votre base de données. Pour des raisons de sécurité, ces clés ne doivent **jamais** être écrites directement dans le code. On utilise à la place des variables d'environnement.

## 🔑 Variables Requises

Voici la liste complète des variables que vous devez ajouter à votre projet Vercel.

### Base de Données

| Variable | Description | Exemple | Source | 
|---|---|---|---|
| `DATABASE_URL` | L'URL de connexion complète à votre base de données MySQL. | `mysql://user:pass@host:port/db` | Fourni par votre hébergeur de base de données (ex: PlanetScale, Railway, etc.) |

### Stripe

| Variable | Description | Exemple | Source | 
|---|---|---|---|
| `STRIPE_SECRET_KEY` | La clé secrète de l'API Stripe. | `sk_test_...` ou `sk_live_...` | [Dashboard Stripe > Développeurs > Clés API](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Le secret pour sécuriser le webhook. | `whsec_...` | [Dashboard Stripe > Développeurs > Webhooks](https://dashboard.stripe.com/webhooks) > Endpoint > Secret de signature |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | L'ID du prix pour l'abonnement mensuel. | `price_...` | Dashboard Stripe > Produits > Votre Produit > Prix |
| `STRIPE_PRICE_PREMIUM_YEARLY` | L'ID du prix pour l'abonnement annuel. | `price_...` | Dashboard Stripe > Produits > Votre Produit > Prix |
| `STRIPE_PRICE_TOKENS_100` | L'ID du prix pour le pack de 100 tokens. | `price_...` | Dashboard Stripe > Produits > Votre Produit > Prix |
| `STRIPE_PRICE_TOKENS_500` | L'ID du prix pour le pack de 500 tokens. | `price_...` | Dashboard Stripe > Produits > Votre Produit > Prix |
| `STRIPE_PRICE_TOKENS_1000` | L'ID du prix pour le pack de 1000 tokens. | `price_...` | Dashboard Stripe > Produits > Votre Produit > Prix |

### Authentification & Sécurité

| Variable | Description | Exemple | Source |
|---|---|---|---|
| `CORS_ORIGINS` | Liste des URLs autorisées à appeler votre API. | `https://votre-domaine.com,http://localhost:5173` | Votre nom de domaine de production et votre URL de développement local. |
| `MANUS_OAUTH_CLIENT_ID` | L'ID client pour l'authentification Manus. | `manus_...` | Fourni dans les paramètres de votre application Manus. |
| `MANUS_OAUTH_CLIENT_SECRET` | Le secret client pour l'authentification Manus. | `manus_secret_...` | Fourni dans les paramètres de votre application Manus. |
| `JWT_SECRET` | Une chaîne de caractères aléatoire et secrète pour signer les tokens d'authentification. | `une-phrase-secrete-tres-longue` | Générez-en une vous-même. |

---

## ⚙️ Étapes de Configuration sur Vercel

1.  **Accédez à votre projet Vercel** :
    - Connectez-vous à votre compte Vercel.
    - Sélectionnez le projet `failfrenzy-platform`.

2.  **Ouvrez les Paramètres** :
    - Allez dans l'onglet **Settings**.

3.  **Allez dans "Environment Variables"** :
    - Dans le menu de gauche, cliquez sur **Environment Variables**.

4.  **Ajoutez chaque variable** :
    - Pour chaque variable listée ci-dessus, entrez le **Nom** (ex: `DATABASE_URL`) et la **Valeur** (la clé secrète correspondante).
    - **IMPORTANT** : Assurez-vous de décocher la case "Development" et de laisser cochées **Production** et **Preview**. Les clés secrètes ne doivent être exposées que sur les environnements serveur.
    - Cliquez sur **Add** pour chaque variable.

5.  **Redéployez votre projet** :
    - Une fois toutes les variables ajoutées, vous devez redéployer votre projet pour qu'elles soient prises en compte.
    - Allez dans l'onglet **Deployments**, sélectionnez le dernier déploiement, et cliquez sur le bouton **Redeploy**.

---

## ✅ Vérification

Une fois le redéploiement terminé, votre backend devrait être capable de se connecter à la base de données et à Stripe. Vous pouvez tester en créant un compte utilisateur et en essayant d'initier un paiement en mode test.

Bonne configuration ! 🚀
