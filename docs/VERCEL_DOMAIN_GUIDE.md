# 🌐 Guide : Configuration du Nom de Domaine sur Vercel - Fail Frenzy

Ce guide vous explique comment configurer votre nouveau nom de domaine sur Vercel pour lancer officiellement **Fail Frenzy: Échos du Vide**.

---

## 📄 Étapes de Configuration

1.  **Accédez à votre projet Vercel** :
    - Connectez-vous à votre compte Vercel.
    - Sélectionnez le projet `failfrenzy-platform`.

2.  **Ouvrez les Paramètres de Domaine** :
    - Allez dans l'onglet **Settings**.
    - Dans le menu de gauche, cliquez sur **Domains**.

3.  **Ajoutez votre domaine** :
    - Entrez votre nom de domaine (ex: `failfrenzy.com`) dans le champ prévu à cet effet.
    - Cliquez sur **Add**.
    - Vercel vous recommandera d'ajouter également la version `www` (ex: `www.failfrenzy.com`). Acceptez cette recommandation.

4.  **Configurez les DNS** :
    - Si vous avez acheté votre domaine via Vercel, tout sera automatique.
    - Si vous avez acheté votre domaine ailleurs (ex: OVH, Namecheap), Vercel affichera les enregistrements DNS (A record ou CNAME) que vous devez ajouter chez votre registraire.
    - Une fois les enregistrements ajoutés, cliquez sur **Refresh** dans Vercel. La propagation peut prendre de quelques minutes à quelques heures.

5.  **Mise à jour des variables d'environnement** :
    - Une fois le domaine actif, retournez dans **Settings > Environment Variables**.
    - Mettez à jour la variable `CORS_ORIGINS` pour inclure votre nouveau domaine (ex: `https://failfrenzy.com,https://www.failfrenzy.com`).
    - Si vous utilisez l'authentification OAuth, n'oubliez pas de mettre à jour l'URL de redirection dans votre console de développeur Manus.

---

## ✅ Vérification Finale

Une fois le domaine configuré et les variables mises à jour, testez l'accès au site via votre nouveau nom de domaine. Vérifiez que :
- Le certificat SSL est bien actif (cadenas vert dans le navigateur).
- Les assets (images, sons) se chargent correctement.
- L'authentification et les paiements Stripe fonctionnent sur le nouveau domaine.

Félicitations pour ce lancement ! 🚀
