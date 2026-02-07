# ⚡ Déploiement Express (2 minutes)

## 🚂 Railway (Backend)

1. **https://railway.app/new** → Deploy from GitHub → `peupleaelionor/failfrenzy-platform`
2. **+ New** → Database → MySQL
3. **Settings → Variables** → Ajouter :
   ```
   CORS_ORIGINS=*
   JWT_SECRET=secret123
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Copier l'URL Railway (ex: `https://xxx.up.railway.app`)

---

## ▲ Vercel (Frontend)

1. **https://vercel.com/new** → Import → `peupleaelionor/failfrenzy-platform`
2. **Build Settings** :
   - Build Command: `pnpm run build:frontend`
   - Output Directory: `dist/public`
3. **Environment Variables** :
   ```
   VITE_API_URL=https://xxx.up.railway.app
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. **Deploy** ✅

---

## 🗄️ Base de données

```bash
# Local
git clone https://github.com/peupleaelionor/failfrenzy-platform.git
cd failfrenzy-platform
pnpm install
echo "DATABASE_URL=mysql://..." > .env
pnpm run db:push
```

---

## ✅ Tester

- Frontend : Votre URL Vercel
- Backend : `https://xxx.up.railway.app/api/trpc/auth.me`
- Paiement : Carte test `4242 4242 4242 4242`

---

**C'est tout !** 🎉
