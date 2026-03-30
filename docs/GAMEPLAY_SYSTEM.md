# ⚙️ Fail Frenzy : Échos du Vide - Système de Gameplay

Ce document définit en détail toutes les mécaniques de gameplay, les éléments interactifs et les systèmes de progression qui transforment Fail Frenzy en une véritable expérience spatiale narrative. Il est destiné à l'équipe de développement pour l'implémentation.

---

## 🚀 Le Vaisseau-Écho (Le Joueur)

Le losange bleu actuel est remplacé par un **mini-vaisseau spatial**, le Vaisseau-Écho. Sa forme de base reste angulaire et compacte pour conserver la lisibilité du gameplay, mais il est désormais reconnaissable comme un engin spatial.

### Comportement Visuel du Vaisseau

Le vaisseau possède une **jauge d'énergie** visible directement sur lui, sous la forme d'une aura lumineuse qui l'entoure. Quand le joueur collecte des Échos de Lumière (les étoiles), l'aura s'intensifie et change de couleur, passant du bleu pâle (énergie faible) au blanc éclatant (énergie maximale). Quand le joueur ne collecte rien pendant un moment, l'aura faiblit progressivement, donnant un sentiment d'urgence constant.

Le vaisseau laisse derrière lui une **traînée lumineuse** dont la couleur et l'intensité dépendent du skin équipé et du niveau d'énergie actuel. À haute énergie, la traînée est longue et vibrante. À basse énergie, elle est courte et vacillante.

---

## ✨ Les Échos de Lumière Stellaire (Les Étoiles)

Les étoiles actuelles deviennent des **Échos de Lumière Stellaire**, des particules d'énergie résiduelle laissées par les étoiles mortes. Elles ne sont pas statiques : elles pulsent doucement, comme un battement de coeur cosmique, attirant le regard du joueur.

### Types d'Échos

| Écho | Apparence | Points | Effet Spécial | Fréquence |
|---|---|---|---|---|
| **Écho Blanc** | Petite étoile blanche pulsante | +10 | Recharge légère de l'aura du vaisseau | Très fréquent |
| **Écho Doré** | Étoile dorée plus grande, scintillante | +50 | Recharge moyenne + léger boost de vitesse (0.5s) | Fréquent |
| **Écho Prismatique** | Étoile arc-en-ciel avec halo rotatif | +200 | Recharge complète de l'aura + bouclier temporaire (2s) | Rare |
| **Écho de Nova** | Explosion miniature orange/rouge | +500 | Détruit tous les débris à l'écran + onde de choc visuelle | Très rare |

### Mécanique de Collecte

Quand le vaisseau touche un Écho, celui-ci est "absorbé" avec une animation de particules qui convergent vers le vaisseau. Un son cristallin accompagne chaque collecte, avec une tonalité qui monte à chaque collecte successive pour renforcer la sensation de combo.

---

## 🪨 Les Débris Cosmiques (Les Obstacles Ronds)

Les ronds actuels deviennent des **Débris Cosmiques**, des fragments de planètes et de stations spatiales détruites par le Grand Silence. Ils ne sont pas tous identiques : certains sont petits et rapides, d'autres sont gros et lents, créant une variété de patterns à esquiver.

### Types de Débris

| Débris | Taille | Vitesse | Comportement |
|---|---|---|---|
| **Fragment Rocheux** | Petit | Rapide | Se déplace en ligne droite, le plus courant |
| **Carcasse de Station** | Grand | Lent | Occupe beaucoup d'espace, force le joueur à trouver un passage |
| **Astéroïde Errant** | Moyen | Moyen | Tourne sur lui-même, trajectoire légèrement courbe |
| **Mine Stellaire** | Petit | Statique | Flotte sur place, explose en zone de dégâts si le joueur passe trop près |

### Comportement Visuel

Les débris ont une apparence rocheuse et sombre, contrastant avec la luminosité des Échos. Ils projettent de légères ombres et certains ont des bords qui rougeoient faiblement, comme de la lave refroidissante, rappelant qu'ils étaient autrefois des mondes vivants.

---

## 🕳️ Les Mangeurs de Vide (Les Trous Noirs)

Les trous noirs sont l'élément le plus spectaculaire et stratégique du jeu. Ce sont des **Mangeurs de Vide**, des anomalies gravitationnelles qui déforment l'espace autour d'elles.

### Apparence

Le Mangeur de Vide est un cercle noir profond entouré d'un **disque d'accrétion** lumineux et tourbillonnant, dans des teintes de violet et de rouge. L'espace autour de lui est visuellement déformé, comme une lentille gravitationnelle. Les débris et les Échos proches sont lentement attirés vers lui.

### Mécanique : Le Saut de Galaxie

Toucher un Mangeur de Vide ne tue **pas** le joueur. Au lieu de cela, il déclenche un **Saut de Galaxie**. L'écran se déforme violemment, un flash de lumière aveuglant se produit, et le joueur est propulsé dans une **Galaxie Brisée**, une zone de jeu alternative.

La Galaxie Brisée est un environnement visuellement distinct : les couleurs sont inversées ou décalées, l'arrière-plan est plus chaotique, la musique change de tonalité. La vitesse du jeu augmente de 20 à 30%, les débris sont plus nombreux, mais les Échos de Lumière y sont aussi beaucoup plus concentrés. C'est un risque/récompense pur.

Le joueur reste dans la Galaxie Brisée pendant **10 secondes** avant d'être automatiquement ramené dans la galaxie normale. Un compte à rebours visuel en forme de fissure lumineuse sur l'écran indique le temps restant.

### Progression des Galaxies

| Galaxie | Nom | Ambiance Visuelle | Difficulté | Multiplicateur de Points |
|---|---|---|---|---|
| **Galaxie 1** | Voie d'Orion | Bleu profond, étoiles lointaines, calme | Normale | x1 |
| **Galaxie Brisée 1** | Nébuleuse Fracturée | Violet/rouge, distorsions, rapide | Élevée | x2 |
| **Galaxie 2** | Bras de Persée | Vert émeraude, nébuleuses gazeuses | Moyenne+ | x1.5 |
| **Galaxie Brisée 2** | Rift Temporel | Couleurs inversées, glitch visuel | Très élevée | x3 |
| **Galaxie 3** | Coeur de Xylos | Or et blanc, proximité de la planète | Difficile | x2 |
| **Galaxie Brisée 3** | L'Oeil du Silence | Noir total sauf les Échos, terrifiante | Extrême | x5 |

---

## 🛡️ Xylos : La Planète à Alimenter

Xylos est le coeur narratif du jeu. Elle est visible en permanence dans l'interface, pas comme un simple compteur, mais comme un **élément vivant**.

### Barre de Bouclier de Xylos

En haut de l'écran de jeu, une barre horizontale représente le **Bouclier de Xylos**. Elle se remplit à chaque Écho collecté par le joueur. Quand elle atteint 100%, une animation spectaculaire se déclenche : le bouclier de Xylos pulse, une onde d'énergie se propage, et le joueur reçoit un bonus massif de points. La barre se réinitialise ensuite, mais le niveau de difficulté augmente légèrement, symbolisant le fait que le vaisseau s'enfonce plus profondément dans le vide pour trouver de nouveaux Échos.

### Xylos sur l'Écran d'Accueil

Sur la page d'accueil du jeu, Xylos est visible en arrière-plan, une sphère lumineuse protégée par un bouclier translucide. L'état du bouclier reflète les efforts collectifs de tous les joueurs (ou du joueur individuel). Plus les joueurs jouent et collectent des Échos, plus Xylos brille. C'est un élément de motivation communautaire puissant.

---

## 📊 Interface en Jeu (HUD du Cockpit)

L'interface en jeu doit ressembler à l'intérieur d'un cockpit de vaisseau spatial, sans être envahissante. Tous les éléments sont semi-transparents et stylisés avec l'esthétique néon/glitch du jeu.

### Éléments du HUD

| Élément | Position | Description Narrative |
|---|---|---|
| **Lumière Collectée** (Score) | Haut-gauche | Affiche le nombre d'Échos collectés, avec une icône d'étoile pulsante |
| **Bouclier de Xylos** | Haut-centre | Barre de progression horizontale, se remplit à chaque collecte |
| **Multiplicateur de Surcharge** (Combo) | Haut-droite | Affiche le multiplicateur actuel (x1, x2, x3...) avec un effet de flamme croissant |
| **Jauge d'Énergie du Vaisseau** | Bas-gauche | Représente la "vie" ou l'énergie du vaisseau, diminue avec le temps, rechargée par les Échos |
| **Indicateur de Galaxie** | Bas-droite | Nom de la galaxie actuelle avec une mini-carte stylisée |
| **Alerte Mangeur de Vide** | Centre (temporaire) | Un avertissement visuel quand un trou noir approche |

---

## 🔄 Système de Combo : La Surcharge Énergétique

Le système de combo est rebaptisé **Surcharge Énergétique**. Il fonctionne de la manière suivante.

Chaque Écho collecté dans un intervalle de 2 secondes après le précédent augmente le multiplicateur de Surcharge. Le multiplicateur commence à x1 et peut monter jusqu'à x10. Si le joueur ne collecte aucun Écho pendant plus de 2 secondes, le multiplicateur redescend progressivement (x10 vers x8 vers x5 vers x3 vers x1), et non pas instantanément à x1, ce qui est plus gratifiant et moins frustrant.

À chaque palier de multiplicateur, l'apparence du vaisseau change subtilement : l'aura s'intensifie, la traînée s'allonge, et à x10, le vaisseau entre en **"Mode Nova"** pendant lequel il est légèrement plus rapide et les Échos proches sont attirés magnétiquement vers lui pendant 3 secondes.

---

## 💀 La Mort : Le Transfert de Conscience

Quand le vaisseau touche un Débris Cosmique, il est détruit. Mais la mort n'est pas brutale et frustrante : elle est **spectaculaire et narrative**.

Le vaisseau explose en une gerbe de particules lumineuses. L'écran se fige pendant une fraction de seconde (un "freeze frame" dramatique). Puis, un texte stylisé apparaît brièvement : **"Transfert de Conscience..."** suivi de **"Nouveau Clone Activé"**. Le joueur réapparaît instantanément, prêt à retenter sa chance.

Ce cycle rapide de mort et de renaissance est le coeur de "Fail Frenzy" : la frénésie de l'échec. Chaque mort est une donnée, chaque renaissance est une chance de faire mieux.

---

## 🎵 Design Sonore (Directives)

Le son est un pilier de l'immersion. Voici les directives pour l'équipe audio.

L'ambiance sonore de fond doit être un **synthwave spatial** : des nappes de synthétiseur profondes et enveloppantes, avec des basses lourdes et des mélodies éthérées. Le tempo doit s'accélérer subtilement avec la vitesse du jeu.

Les effets sonores de collecte d'Échos doivent être des sons cristallins et satisfaisants, avec une tonalité qui monte à chaque collecte successive dans un combo. Le son de destruction du vaisseau doit être un "boom" sourd et réverbérant, suivi d'un silence bref avant le son de renaissance (un "whoosh" ascendant). Le son d'entrée dans un Mangeur de Vide doit être un grondement grave et déformé, comme si l'espace-temps se déchirait.

---

Ce document constitue la base complète du système de gameplay. Chaque mécanique est conçue pour renforcer la narration, récompenser le joueur et créer une boucle de jeu addictive et satisfaisante.
