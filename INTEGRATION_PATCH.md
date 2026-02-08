# PATCH D'INTÉGRATION — XYLOS + SKINS + OBSTACLES

## 📋 MODIFICATIONS À APPLIQUER

Voici les modifications exactes à copier-coller dans `client/src/game/FailFrenzyGame.ts`

---

## 1️⃣ IMPORTS (en haut du fichier, après les imports existants)

```typescript
// Ajouter ces imports après la ligne 25 environ
import { getIntegratedGameManager, IntegratedGameManager } from './FeatureIntegration';
```

---

## 2️⃣ PROPRIÉTÉ DANS LA CLASSE (ligne ~320, dans le constructor)

```typescript
// Dans la classe FailFrenzyGame, ajouter cette propriété après la ligne 285 environ
// Après: private activeSkin: SkinDefinition;

// Feature integration manager
private featureManager: IntegratedGameManager;
```

---

## 3️⃣ INITIALISATION DANS LE CONSTRUCTOR (ligne ~370, dans constructor)

```typescript
// Dans le constructor, après la ligne this.activeSkin = getSelectedSkin(); (ligne ~365)

// Initialize feature manager
this.featureManager = getIntegratedGameManager();
this.featureManager.startRun();
```

---

## 4️⃣ UPDATE DANS updateGameLogic (ligne ~520, dans la méthode updateGameLogic)

```typescript
// Dans updateGameLogic(), après this.vfxPool.update(dt); (ligne ~523)

// Update feature manager
if (this.player) {
  this.featureManager.update(dt, this.player.x, this.player.y);
}
```

---

## 5️⃣ RENDER DANS LA BOUCLE DE RENDU (chercher la méthode render principale)

Trouver la méthode qui fait le rendu final (probablement vers la ligne 1500-2000), et ajouter **avant la fin du rendu** :

```typescript
// Render feature manager overlays (messages, Xylos indicator)
this.featureManager.render(ctx, width, height);
```

---

## 6️⃣ ÉVÉNEMENTS DE JEU

### A) Dans la méthode de collision (chercher "collision" ou "checkCollisions")

```typescript
// Quand le joueur touche un obstacle, ajouter:
this.featureManager.onFail();
```

### B) Dans la méthode de score/combo (chercher "combo" ou "addScore")

```typescript
// Quand le score augmente, ajouter:
this.featureManager.onScoreGained(points);

// Quand le combo augmente, ajouter:
if (this.combo.getState().current >= 5) {
  this.featureManager.onSkillMoment(this.combo.getState().current);
}
```

### C) Dans la méthode de near miss (si elle existe, sinon créer la logique)

```typescript
// Quand le joueur frôle un obstacle (distance < 50px), ajouter:
this.featureManager.onNearMiss(distance);
```

---

## 7️⃣ SPAWN D'OBSTACLES NARRATIFS (optionnel, dans spawnObstacle)

Dans la méthode `spawnObstacle()` (ligne ~700), ajouter après le spawn normal :

```typescript
// Spawn narrative obstacles occasionally (10% chance)
if (Math.random() < 0.1) {
  const types = ['vortex', 'fissure', 'mini_black_hole'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  const y = 80 + Math.random() * 440;
  this.featureManager.spawnNarrativeObstacle(type, 850, y);
}
```

---

## 8️⃣ APPLIQUER LES MODIFICATEURS DE SKIN

Dans la méthode `updatePlayer()` ou au début de `updateGameLogic()`, récupérer les modificateurs :

```typescript
// Get skin modifiers
const modifiers = this.featureManager.getSkinModifiers();

// Appliquer les modificateurs selon le besoin, par exemple:
// - scoreMultiplier sur le calcul de score
// - shieldStrength sur les dégâts
// - comboSpeedMultiplier sur le combo
```

---

## 9️⃣ VÉRIFIER COLLISION EVENT HORIZON

Dans `checkCollisions()`, ajouter **avant** les autres collisions :

```typescript
// Check event horizon collision (instant death)
if (this.player && this.featureManager.checkEventHorizonCollision(this.player.x, this.player.y)) {
  this.gameOver(false);
  return;
}
```

---

## 🔟 REMPLACER L'ÉCRAN GAME OVER

Dans le fichier où l'écran Game Over est affiché (probablement `client/src/pages/Game.tsx`), remplacer l'ancien composant par :

```typescript
import { EnhancedGameOver } from '../components/EnhancedGameOver';

// Dans le JSX, remplacer l'ancien Game Over par:
{gameState.isGameOver && (
  <EnhancedGameOver
    score={gameState.score}
    time={gameState.time}
    fails={runStats.fails}
    combo={highestCombo}
    onRestart={handleRestart}
    onMenu={handleMenu}
  />
)}
```

---

## ✅ VÉRIFICATION

Après avoir appliqué ces modifications :

1. **Build** : `npm run build` (doit compiler sans erreur)
2. **Test local** : `npm run dev`
3. **Vérifier** :
   - Messages dynamiques apparaissent in-game
   - Écran Game Over montre contribution Xylos
   - Obstacles narratifs spawnnent
   - Console : `window.__FF_FEATURES` pour voir les flags

---

## 🎮 DÉSACTIVER UNE FEATURE

Dans la console du navigateur :

```javascript
window.__FF_TOGGLE_FEATURE('xylos', false)           // Désactiver Xylos
window.__FF_TOGGLE_FEATURE('dynamicMessages', false) // Désactiver messages
window.__FF_TOGGLE_FEATURE('narrativeObstacles', false) // Désactiver obstacles
```

---

## 📝 NOTES

- Tous les systèmes sont **opt-in** via feature flags
- Pas de breaking changes sur le gameplay existant
- LocalStorage utilisé pour persistance
- Performance optimisée (pas de GC spikes)

---

## 🚀 COMMIT FINAL

Après intégration :

```bash
git add .
git commit -m "feat: integrate XYLOS, skins, and narrative obstacles into main game loop"
git push origin main
```

Vercel déploiera automatiquement ! 🎉
