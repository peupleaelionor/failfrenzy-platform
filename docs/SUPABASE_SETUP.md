# 🚀 Fail Frenzy: Configuration Supabase

Ce document explique comment finaliser la configuration de Supabase pour Fail Frenzy: Échos du Vide.

## ✅ Ce qui a été fait

- ✅ Suppression complète de toutes les dépendances Manus
- ✅ Installation de `@supabase/supabase-js`
- ✅ Création du client Supabase (`client/src/lib/supabase.ts`)
- ✅ Réécriture du hook `useAuth` pour utiliser Supabase
- ✅ Création des pages de connexion et d'inscription
- ✅ Configuration des variables d'environnement

## 📋 Étapes à suivre

### 1. Exécuter le schéma SQL dans Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **lgsiafwtadkaxpidmink**
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Créez une nouvelle requête
5. Copiez-collez le contenu du fichier `supabase_schema.sql`
6. Exécutez la requête (bouton **Run** ou `Ctrl+Enter`)

Cela va créer :
- Les tables `users`, `game_scores`, `user_skins`, `user_tokens`
- Les index pour optimiser les performances
- Les politiques de sécurité (Row Level Security)
- Les triggers pour gérer automatiquement les nouveaux utilisateurs

### 2. Configurer l'authentification par email

1. Dans votre dashboard Supabase, allez dans **Authentication** → **Providers**
2. Activez **Email** si ce n'est pas déjà fait
3. (Optionnel) Configurez **Email Templates** pour personnaliser les emails de confirmation

### 3. Configurer les variables d'environnement sur Vercel

Allez dans votre projet Vercel → **Settings** → **Environment Variables** et ajoutez :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `VITE_SUPABASE_URL` | `https://lgsiafwtadkaxpidmink.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (votre clé anon) | Production, Preview, Development |

### 4. Tester l'authentification

1. Déployez sur Vercel (push sur GitHub)
2. Visitez votre site
3. Cliquez sur "S'inscrire" et créez un compte test
4. Vérifiez votre email pour confirmer l'inscription
5. Connectez-vous avec vos identifiants

## 🔐 Sécurité

- ✅ **Row Level Security (RLS)** activé sur toutes les tables
- ✅ Les utilisateurs ne peuvent voir/modifier que leurs propres données
- ✅ Les scores sont publics (pour le leaderboard)
- ✅ L'anon key est publique et sécurisée par RLS

## 🎮 Fonctionnalités disponibles

### Authentification
- Inscription par email/mot de passe
- Connexion
- Déconnexion
- Gestion de session automatique

### Base de données
- **users** : Profils utilisateurs
- **game_scores** : Scores de jeu par mode
- **user_skins** : Skins achetés par utilisateur
- **user_tokens** : Solde de tokens par utilisateur

### Bonus de démarrage
- Chaque nouvel utilisateur reçoit **500 tokens** automatiquement

## 📚 Documentation utile

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

## 🆘 Dépannage

### Erreur "Invalid API key"
- Vérifiez que `VITE_SUPABASE_ANON_KEY` est correctement configurée sur Vercel
- Vérifiez que la clé commence par `eyJ`

### Erreur "User already registered"
- L'email est déjà utilisé
- Utilisez la fonction "Mot de passe oublié" ou un autre email

### Les utilisateurs ne peuvent pas s'inscrire
- Vérifiez que le schéma SQL a bien été exécuté
- Vérifiez les logs dans **Supabase Dashboard** → **Logs**

## 🎉 C'est tout !

Votre application est maintenant 100% indépendante avec Supabase comme backend d'authentification et de base de données.
