# 🖥️ Fail Frenzy : Échos du Vide - Expérience Utilisateur Complète

Ce document décrit l'expérience utilisateur de bout en bout, depuis l'ouverture du site jusqu'au retour après une session de jeu. Chaque écran, chaque transition et chaque interaction est pensée pour immerger le joueur dans l'univers des Écho-Pilotes.

---

## 🌐 1. Écran d'Accueil (Home)

### Ambiance

L'écran d'accueil est la porte d'entrée dans l'univers. L'arrière-plan est un **champ d'étoiles animé en parallaxe**, avec la planète Xylos visible au loin, entourée de son bouclier lumineux. Des débris cosmiques dérivent lentement au premier plan, créant de la profondeur. Le logo "Fail Frenzy" apparaît en grand au centre avec un effet de néon pulsant, accompagné du sous-titre "Échos du Vide" en dessous, plus discret.

### Éléments Clés

Le bouton principal **"LANCER LA MISSION"** remplace le classique "Play". Il est grand, lumineux, et pulse doucement pour attirer l'attention. En dessous, un texte narratif défile lentement, comme un terminal de communication : *"Alerte Xylos : Niveau de bouclier critique. Tous les Écho-Pilotes sont appelés au hangar."*

La barre de navigation en haut donne accès aux sections principales : **Hangar** (Shop/Skins), **Panthéon** (Leaderboard), **Cockpit** (Dashboard/Profil), **Premium** (Abonnement). Chaque lien de navigation est accompagné d'une petite icône stylisée.

### Transition vers le Jeu

Quand le joueur clique sur "LANCER LA MISSION", l'écran ne change pas brutalement. Une animation de **"saut en hyperespace"** se déclenche : les étoiles de l'arrière-plan s'étirent en lignes de lumière, un son de propulsion monte en puissance, et l'écran se fond dans la zone de jeu. Cette transition dure environ 1.5 seconde et crée une montée d'adrénaline avant même le début de la partie.

---

## 🎮 2. Écran de Jeu

### Mise en Scène

Le jeu commence avec le vaisseau qui émerge du saut en hyperespace, au centre-gauche de l'écran. Un bref texte apparaît en fondu : *"Galaxie : Voie d'Orion — Bonne chance, Pilote."* puis disparaît après 2 secondes. Le HUD du cockpit s'active progressivement, élément par élément, comme un système qui s'initialise.

### Progression de la Difficulté

La difficulté ne doit pas augmenter de manière linéaire et prévisible. Elle doit suivre un rythme en **vagues**, avec des moments de calme relatif (peu de débris, beaucoup d'Échos) suivis de pics d'intensité (débris denses, Mangeurs de Vide). Ce rythme crée une tension narrative : les moments calmes sont des "respirations" avant la tempête.

### Événements Narratifs en Jeu

À certains paliers de score, de brefs messages radio apparaissent en bas de l'écran, comme des communications de Xylos. Ces messages renforcent l'immersion sans interrompre le gameplay.

| Palier de Score | Message Radio |
|---|---|
| 500 | *"Xylos : Échos reçus. Le bouclier se stabilise. Continuez, Pilote."* |
| 2 000 | *"Xylos : Attention, densité de débris en augmentation dans votre secteur."* |
| 5 000 | *"Xylos : Vous entrez en zone non cartographiée. Soyez vigilant."* |
| 10 000 | *"Xylos : Incroyable, Pilote. Vous êtes une légende vivante."* |
| 25 000 | *"Xylos : ... Le Grand Silence recule. Nous pouvons le sentir."* |

---

## 💀 3. Écran de Fin de Partie (Game Over)

### Mise en Scène

Après la destruction du vaisseau et l'animation de "Transfert de Conscience", l'écran de fin de partie apparaît. Il ne doit pas être déprimant. Il doit être **motivant et informatif**.

### Contenu de l'Écran

L'écran affiche un **rapport de mission** stylisé, comme un document officiel de Xylos.

> **RAPPORT DE MISSION — ÉCHO-PILOTE [Nom du Joueur]**

Le rapport contient les informations suivantes, présentées de manière claire et visuelle.

**Statistiques de la Course** : Lumière Collectée (score), Surcharge Max (combo max), Galaxies Traversées, Temps de Vol, Échos Collectés (nombre total).

**Récompenses** : Tokens gagnés pendant la course (basés sur le score), Progression du Bouclier de Xylos (contribution du joueur).

**Comparaison** : Un petit graphique montre la performance du joueur par rapport à sa meilleure course précédente. Si le joueur a battu son record, une animation spéciale se déclenche avec le texte **"NOUVEAU RECORD PERSONNEL"** en lettres dorées.

**Boutons d'Action** : **"RELANCER LA MISSION"** (gros bouton lumineux) et **"Retour au Hangar"** (bouton secondaire). Le bouton de relance est mis en avant pour encourager la boucle de jeu rapide.

---

## 🏠 4. Le Hangar (Shop / Boutique de Skins)

### Ambiance

Le Hangar est l'endroit où le joueur peut voir, essayer et acquérir de nouveaux Vaisseaux-Écho. L'arrière-plan représente un **hangar spatial** immense et faiblement éclairé, avec des néons qui dessinent les contours des structures métalliques. Des vaisseaux sont "garés" en arrière-plan, ajoutant de la profondeur.

### Présentation des Vaisseaux

Chaque skin est présenté sur une **carte de vaisseau** individuelle. La carte affiche le vaisseau en rotation lente sur un piédestal lumineux, accompagné de son nom, sa rareté (indiquée par la couleur de la bordure de la carte), son prix en Tokens, et un court texte narratif décrivant son origine.

Les cartes sont triées par rareté par défaut, avec les Légendaires en premier pour créer l'envie. Un filtre permet de trier par rareté, par prix ou par nouveauté.

### Expérience d'Achat

Quand le joueur clique sur une carte, une **vue détaillée** s'ouvre. Le vaisseau est affiché en plus grand, avec ses effets visuels (traînée, aura) visibles. Le texte narratif complet est affiché. Un bouton **"Réquisitionner ce Prototype"** (au lieu d'un simple "Acheter") lance l'achat. Si le joueur n'a pas assez de Tokens, le bouton affiche **"Tokens insuffisants"** et un lien discret propose d'en acheter.

Après l'achat, une animation de **"déverrouillage"** se joue : le vaisseau s'illumine, des particules d'énergie l'entourent, et le texte **"Nouveau Prototype Activé"** apparaît. C'est un moment de fierté et de satisfaction.

---

## 🏆 5. Le Panthéon (Leaderboard / Classement)

### Ambiance

Le Panthéon est un lieu de gloire. L'arrière-plan est un **temple spatial** avec des colonnes de lumière et des hologrammes flottants. L'atmosphère est solennelle et impressionnante.

### Présentation du Classement

Le classement est présenté comme un **tableau d'honneur holographique**. Chaque entrée du classement affiche le rang du joueur, son nom, son avatar (le skin de vaisseau qu'il utilise), son meilleur score et un badge de rang.

| Rang | Badge | Titre | Couleur |
|---|---|---|---|
| 1 | Couronne dorée | Commandeur Suprême | Or |
| 2-3 | Étoile argentée | Amiral de Flotte | Argent |
| 4-10 | Étoile de bronze | Capitaine d'Élite | Bronze |
| 11-50 | Ailes | Écho-Pilote Vétéran | Bleu |
| 51-100 | Écusson | Écho-Pilote Confirmé | Vert |
| 101+ | Aucun | Écho-Pilote Recrue | Gris |

Les trois premiers du classement sont mis en avant avec des cartes plus grandes et des effets visuels spéciaux (particules dorées pour le premier, argentées pour le deuxième, etc.).

### Filtres

Le joueur peut filtrer le classement par mode de jeu (Classic, Time Trial, Infinite, Seeds), par période (Aujourd'hui, Cette Semaine, Ce Mois, Tous les Temps) et par portée (Global, Amis).

---

## 👤 6. Le Cockpit (Dashboard / Profil)

### Ambiance

Le Cockpit est l'espace personnel du joueur. L'arrière-plan représente l'intérieur d'un cockpit de vaisseau, avec des écrans holographiques affichant les données du pilote.

### Contenu

**Carte du Pilote** : En haut, une carte d'identité stylisée affiche le nom du joueur, son avatar (vaisseau actuel), son titre de rang (basé sur le classement), sa date d'enrôlement (date d'inscription) et son statut (Free Pilot / Premium Pilot).

**Statistiques Globales** : Un tableau de bord visuel avec des graphiques et des compteurs animés. Parties jouées, Score total cumulé, Meilleur score, Temps de vol total, Échos collectés au total, Galaxies Brisées visitées.

**Historique des Missions** : Une liste des dernières courses, avec le score, le mode et la date de chaque mission.

**Succès (Achievements)** : Une grille de badges à débloquer. Chaque badge a un nom narratif, une description et une récompense en Tokens. Les badges non débloqués sont affichés en silhouette, créant l'envie de les compléter.

| Succès | Condition | Récompense | Nom Narratif |
|---|---|---|---|
| Première Lumière | Terminer sa première partie | 10 Tokens | "L'Éveil du Pilote" |
| Chasseur d'Échos | Collecter 1 000 Échos au total | 50 Tokens | "Le Collecteur" |
| Survivant du Vide | Atteindre 5 000 points en une partie | 100 Tokens | "Insubmersible" |
| Maître de la Surcharge | Atteindre un combo x10 | 200 Tokens | "Nova Vivante" |
| Explorateur de l'Abîme | Entrer dans 10 Galaxies Brisées | 150 Tokens | "Marcheur de Rift" |
| Légende de Xylos | Atteindre le Top 10 du classement global | 500 Tokens | "Le Spectre Éternel" |

---

## 💎 7. Page Premium

### Ambiance

La page Premium doit donner envie. L'arrière-plan est un **vaisseau de classe supérieure** en orbite autour de Xylos, avec des effets visuels luxueux (particules dorées, reflets).

### Présentation

La page est structurée comme une **comparaison claire** entre le statut "Free Pilot" et "Premium Pilot". Les avantages Premium sont présentés de manière visuelle, avec des icônes et des animations.

**Avantages Premium** présentés comme des "Privilèges de Commandeur" :

Le texte ne dit pas "Pas de publicités" mais **"Espace de vol dégagé"** (pas de pubs). Il ne dit pas "Tous les modes" mais **"Accès à toutes les zones de la galaxie"** (tous les modes). Il ne dit pas "Skins exclusifs" mais **"Prototypes classifiés déverrouillés"** (skins premium). Chaque avantage est accompagné d'une courte animation ou illustration.

### Boutons d'Achat

Les boutons d'achat Stripe sont intégrés de manière fluide. Le plan mensuel est présenté comme **"Engagement Tactique — 4,99 EUR/mois"** et le plan annuel comme **"Engagement Stratégique — 39,99 EUR/an (Économisez 33%)"**. Le plan annuel est visuellement mis en avant avec un badge **"Recommandé par le Haut Commandement"**.

---

## 🔔 8. Système de Notifications

Les notifications en jeu et sur le site utilisent le vocabulaire narratif.

| Type | Exemple Classique | Version Narrative |
|---|---|---|
| Succès débloqué | "Achievement unlocked!" | "Distinction accordée : L'Éveil du Pilote" |
| Achat réussi | "Purchase successful" | "Prototype réquisitionné avec succès. Rendez-vous au Hangar." |
| Nouveau record | "New high score!" | "Record de Lumière battu ! Xylos vous salue, Pilote." |
| Bienvenue | "Welcome back!" | "Bon retour au poste, Écho-Pilote. Xylos a besoin de vous." |
| Premium activé | "Premium activated" | "Statut de Commandeur activé. Tous les systèmes sont déverrouillés." |

---

## 🎨 9. Transitions et Animations Clés

Chaque transition entre les pages doit renforcer l'immersion. Voici les animations recommandées.

**Home vers Jeu** : Saut en hyperespace (étoiles qui s'étirent en lignes de lumière).

**Jeu vers Game Over** : Explosion du vaisseau, freeze frame, fondu vers le rapport de mission.

**Game Over vers Jeu** : Flash de lumière rapide, le vaisseau réapparaît (transfert de conscience).

**Navigation entre pages** : Effet de "scanline" horizontal rapide, comme un changement de fréquence radio sur un terminal de communication.

**Ouverture du Hangar** : Portes de hangar qui s'ouvrent avec un son métallique.

**Déverrouillage de skin** : Le vaisseau s'illumine progressivement, des particules convergent, flash final.

---

Ce document couvre l'intégralité de l'expérience utilisateur. Chaque détail est conçu pour que le joueur ne quitte jamais l'univers des Écho-Pilotes, depuis le premier clic jusqu'à la centième partie. L'objectif est de créer une expérience si cohérente et immersive que le joueur se sente véritablement comme un pilote en mission pour sauver Xylos.
