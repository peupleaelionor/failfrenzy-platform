# 🚀 Déploiement Fail Frenzy Platform

## Architecture

- **Frontend** : Vercel (React + Vite)
- **Backend** : Railway (Express + tRPC + MySQL)
- **Base de données** : Railway MySQL
- **Paiements** : Stripe

---

## 📋 Prérequis

- Compte Vercel (avec abonnement)
- Compte Railway (avec abonnement)
- Compte Stripe
- Repository GitHub : `peupleaelionor/failfrenzy-platform`

---

## 🔧 Étape 1 : Déployer le Backend sur Railway

### 1.1 Créer un nouveau projet Railway

1. Allez sur **https://railway.app/new**
2. Cliquez **"Deploy from GitHub repo"**
3. Sélectionnez `peupleaelionor/failfrenzy-platform`
4. Railway détectera automatiquement le `Dockerfile`

### 1.2 Ajouter une base de données MySQL

1. Dans votre projet Railway, cliquez **"+ New"**
2. Sélectionnez **"Database" → "MySQL"**
3. Railway créera automatiquement la variable `DATABASE_URL`

### 1.3 Configurer les variables d'environnement

Dans **Settings → Variables**, ajoutez :

```bash
# Base de données (automatique via Railway MySQL)
DATABASE_URL=${{MySQL.DATABASE_URL}}

# Node
NODE_ENV=production
PORT=3000

# CORS (remplacez par votre domaine Vercel)
CORS_ORIGINS=https://failfrenzy-platform.vercel.app,https://failfrenzy.com

# JWT & Auth (générez des secrets sécurisés)
JWT_SECRET=votre_secret_jwt_super_securise_32_chars_minimum
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=votre_app_id_manus
OWNER_OPEN_ID=votre_owner_openid
OWNER_NAME=Votre Nom

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Forge API (optionnel si vous n'utilisez pas les features Manus)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=votre_forge_api_key
```

### 1.4 Déployer

Railway déploiera automatiquement. Notez l'URL générée (ex: `https://failfrenzy-platform-production.up.railway.app`)

---

## 🌐 Étape 2 : Déployer le Frontend sur Vercel

### 2.1 Importer le projet

1. Allez sur **https://vercel.com/new**
2. Importez `peupleaelionor/failfrenzy-platform`

### 2.2 Configurer le build

Dans **Settings → Build & Development Settings** :

- **Framework Preset** : Vite
- **Build Command** : `pnpm run build:frontend`
- **Output Directory** : `dist/public`
- **Install Command** : `pnpm install`

### 2.3 Configurer les variables d'environnement

Dans **Settings → Environment Variables**, ajoutez :

```bash
# URL du backend Railway
VITE_API_URL=https://failfrenzy-platform-production.up.railway.app

# Auth Manus
VITE_APP_ID=votre_app_id_manus
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Stripe (clé publique)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics (optionnel)
VITE_ANALYTICS_WEBSITE_ID=votre_website_id
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im

# Forge API Frontend (optionnel)
VITE_FRONTEND_FORGE_API_KEY=votre_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
```

### 2.4 Déployer

Cliquez **"Deploy"**. Vercel construira et déploiera automatiquement.

---

## 🔗 Étape 3 : Connecter Frontend ↔ Backend

### 3.1 Mettre à jour CORS sur Railway

Retournez dans Railway → Variables et mettez à jour `CORS_ORIGINS` avec votre domaine Vercel :

```bash
CORS_ORIGINS=https://votre-domaine.vercel.app,https://votre-domaine-custom.com
```

### 3.2 Configurer Stripe Webhook

1. Allez sur **https://dashboard.stripe.com/webhooks**
2. Créez un nouveau webhook pointant vers :
   ```
   https://failfrenzy-platform-production.up.railway.app/api/stripe/webhook
   ```
3. Sélectionnez les événements :
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiez le **Signing Secret** et mettez-le dans Railway (`STRIPE_WEBHOOK_SECRET`)

---

## 🗄️ Étape 4 : Initialiser la base de données

### 4.1 Pousser le schéma

Depuis votre machine locale :

```bash
# Cloner le repo
git clone https://github.com/peupleaelionor/failfrenzy-platform.git
cd failfrenzy-platform

# Installer les dépendances
pnpm install

# Créer un fichier .env avec DATABASE_URL de Railway
echo "DATABASE_URL=mysql://..." > .env

# Pousser le schéma
pnpm run db:push
```

### 4.2 Peupler les données initiales (optionnel)

Créez un script `seed.mjs` pour ajouter des skins, achievements, etc.

---

## ✅ Étape 5 : Tester

1. **Frontend** : Ouvrez votre domaine Vercel
2. **Backend** : Testez `https://votre-backend.railway.app/api/trpc/auth.me`
3. **Authentification** : Cliquez sur "CONNEXION" et testez le flow OAuth
4. **Paiements** : Testez un achat avec la carte test `4242 4242 4242 4242`

---

## 🔄 Déploiements automatiques

Les deux plateformes sont connectées à GitHub :
- **Push sur `main`** → Railway et Vercel redéploient automatiquement
- **Pull Request** → Vercel crée un preview deployment

---

## 📊 Monitoring

- **Railway** : Logs en temps réel dans le dashboard
- **Vercel** : Analytics et logs dans le dashboard
- **Stripe** : Dashboard pour les paiements

---

## 🆘 Troubleshooting

### Erreur CORS
Vérifiez que `CORS_ORIGINS` sur Railway contient votre domaine Vercel.

### Erreur de connexion DB
Vérifiez que `DATABASE_URL` est bien configurée sur Railway.

### Webhook Stripe ne fonctionne pas
Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret du dashboard Stripe.

### OAuth ne fonctionne pas
Vérifiez que `VITE_APP_ID` et `OAUTH_SERVER_URL` sont corrects.

---

## 💰 Coûts estimés

- **Vercel Pro** : $20/mois
- **Railway** : ~$5-20/mois (selon usage)
- **Stripe** : Frais de transaction uniquement

**Total** : ~$25-40/mois
