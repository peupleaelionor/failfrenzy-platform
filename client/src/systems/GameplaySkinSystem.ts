/**
 * FAIL FRENZY — GAMEPLAY SKIN SYSTEM
 * 
 * Skins avec bonus/malus clairs, PAS de pay-to-win
 * Chaque skin modifie la manière de jouer, pas la puissance brute
 * 
 * RÈGLE: Tous les skins ont bonus + malus
 */

import { getXylosSystem } from './XylosSystem';

// ============================================================
// TYPES
// ============================================================

export interface SkinModifiers {
  // Score & Progression
  scoreMultiplier: number;        // 1.0 = normal
  xylosEchoMultiplier: number;    // 1.0 = normal
  
  // Movement & Speed
  speedMultiplier: number;        // 1.0 = normal, 1.2 = faster
  
  // Combat & Défense
  shieldStrength: number;         // 1.0 = normal, 0.5 = fragile
  damageMultiplier: number;       // 1.0 = normal, 1.5 = plus sévère
  
  // Combo & Timing
  comboSpeedMultiplier: number;   // 1.0 = normal, 1.3 = plus rapide
  comboDecayRate: number;         // 1.0 = normal, 0.8 = plus lent
  
  // Power-ups & Collectibles
  powerUpSpawnRate: number;       // 1.0 = normal, 0.7 = moins
  powerUpDuration: number;        // 1.0 = normal
  collectibleMultiplier: number;  // 1.0 = normal, multiplier for collectibles
  
  // Visibilité & Perception
  obstacleVisibility: number;     // 1.0 = normal, 1.2 = plus visible
  feedbackIntensity: number;      // 1.0 = normal, 0.5 = réduit
  
  // Gameplay spécial
  chaosResistance: number;        // 0-1, résistance aux zones chaotiques
  criticalTimeBonus: number;      // Bonus en fin de run
  proximityBonus: boolean;        // Bonus quand proche du danger
  
  // Messages
  customMessages: string[];       // Messages spécifiques au skin
}

export interface GameplaySkin {
  id: string;
  name: string;
  description: string;
  philosophy: string;
  
  // Unlock condition
  unlock: {
    type: 'default' | 'runs' | 'combo' | 'survival' | 'fails' | 'xylos_state' | 'challenge';
    value: number | string;
    label: string;
  };
  
  // Visual (référence au skin visuel existant)
  visualSkinId?: string;
  
  // Gameplay modifiers
  modifiers: SkinModifiers;
  
  // Display
  bonusText: string;
  malusText: string;
  keyMessage: string;
}

// ============================================================
// DEFAULT MODIFIERS
// ============================================================

const DEFAULT_MODIFIERS: SkinModifiers = {
  scoreMultiplier: 1.0,
  xylosEchoMultiplier: 1.0,
  speedMultiplier: 1.0,
  shieldStrength: 1.0,
  damageMultiplier: 1.0,
  comboSpeedMultiplier: 1.0,
  comboDecayRate: 1.0,
  powerUpSpawnRate: 1.0,
  powerUpDuration: 1.0,
  collectibleMultiplier: 1.0,
  obstacleVisibility: 1.0,
  feedbackIntensity: 1.0,
  chaosResistance: 0,
  criticalTimeBonus: 0,
  proximityBonus: false,
  customMessages: [],
};

// ============================================================
// SKIN DEFINITIONS
// ============================================================

export const GAMEPLAY_SKINS: GameplaySkin[] = [
  // ─────────── SKIN DE BASE ───────────
  {
    id: 'standard',
    name: 'Standard',
    description: 'Équilibré, pas de modificateurs',
    philosophy: 'Le jeu dans sa forme pure',
    unlock: { type: 'default', value: 0, label: 'Disponible par défaut' },
    modifiers: { ...DEFAULT_MODIFIERS },
    bonusText: 'Aucun',
    malusText: 'Aucun',
    keyMessage: 'PURE GAMEPLAY',
  },

  // ─────────── 1. ECHO RUNNER ───────────
  {
    id: 'echo-runner',
    name: 'Echo Runner',
    description: 'Contribuer à Xylos avant tout',
    philosophy: 'Les fails nourrissent le cœur',
    unlock: { type: 'runs', value: 10, label: '10 runs terminés' },
    visualSkinId: 'core-classic',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      xylosEchoMultiplier: 1.25,  // ✅ +25% échos Xylos
      scoreMultiplier: 0.85,       // ❌ Score réduit
      customMessages: ['FAILS FEED THE CORE', 'ECHO RUNNER ACTIVE'],
    },
    bonusText: '+25% échos Xylos',
    malusText: '-15% score',
    keyMessage: 'FAILS FEED THE CORE',
  },

  // ─────────── 2. GLASS PILOT ───────────
  {
    id: 'glass-pilot',
    name: 'Glass Pilot',
    description: 'Précision extrême, risque maximum',
    philosophy: 'Parfait ou rien',
    unlock: { type: 'combo', value: 10, label: 'Combo x10 atteint' },
    visualSkinId: 'pulse-core',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      comboSpeedMultiplier: 1.3,   // ✅ Combo monte plus vite
      shieldStrength: 0.6,          // ❌ Bouclier fragile
      customMessages: ['NO ROOM FOR ERROR', 'PERFECT OR NOTHING'],
    },
    bonusText: '+30% vitesse combo',
    malusText: '-40% résistance bouclier',
    keyMessage: 'NO ROOM FOR ERROR',
  },

  // ─────────── 3. ARCHIVIST ───────────
  {
    id: 'archivist',
    name: 'Archivist',
    description: 'Comprendre le chaos',
    philosophy: 'Analyser pour survivre',
    unlock: { type: 'fails', value: 20, label: '20 fails propres' },
    visualSkinId: 'shadow-core',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      obstacleVisibility: 1.2,      // ✅ Obstacles plus visibles
      powerUpSpawnRate: 0.7,        // ❌ Moins de power-ups
      customMessages: ['PATTERN LOGGED', 'DATA ANALYZED'],
    },
    bonusText: '+20% visibilité obstacles',
    malusText: '-30% spawn power-ups',
    keyMessage: 'PATTERN LOGGED',
  },

  // ─────────── 4. VOID DRIFTER ───────────
  {
    id: 'void-drifter',
    name: 'Void Drifter',
    description: 'Surfer sur l\'instabilité',
    philosophy: 'Le chaos est un allié',
    unlock: { type: 'survival', value: 90, label: '90 secondes survécues' },
    visualSkinId: 'void-core',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      chaosResistance: 0.5,         // ✅ Résistance zones chaotiques
      scoreMultiplier: 0.95,        // ❌ Score légèrement réduit
      customMessages: ['THE VOID ACCEPTS YOU', 'DRIFTING...'],
    },
    bonusText: '+50% résistance chaos',
    malusText: '-5% score (vitesse instable)',
    keyMessage: 'THE VOID ACCEPTS YOU',
  },

  // ─────────── 5. OVERCLOCKED CORE ───────────
  {
    id: 'overclocked',
    name: 'Overclocked Core',
    description: 'Pousser le système à bout',
    philosophy: 'Risque = récompense',
    unlock: { type: 'survival', value: 10, label: 'Survivre avec <10s restantes' },
    visualSkinId: 'neon-inferno',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      criticalTimeBonus: 1.5,       // ✅ +50% score en fin de run
      damageMultiplier: 1.3,        // ❌ Erreurs plus sévères
      customMessages: ['SYSTEM STRAIN', 'CORE OVERLOAD'],
    },
    bonusText: '+50% score en temps critique',
    malusText: '+30% dégâts reçus',
    keyMessage: 'SYSTEM STRAIN',
  },

  // ─────────── 6. FRACTAL PILOT ───────────
  {
    id: 'fractal-pilot',
    name: 'Fractal Pilot',
    description: 'Perception trompeuse',
    philosophy: 'La réalité ment',
    unlock: { type: 'challenge', value: 5, label: 'Éviter 5 faux bonus' },
    visualSkinId: 'hologram',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      feedbackIntensity: 0.7,       // ❌ Feedback visuel réduit
      scoreMultiplier: 1.1,         // ✅ +10% score (si maîtrisé)
      customMessages: ['REALITY IS LYING', 'DON\'T TRUST SHAPES'],
    },
    bonusText: '+10% score (fausses cibles = points)',
    malusText: '-30% feedback visuel',
    keyMessage: 'REALITY IS LYING',
  },

  // ─────────── 7. XYLOS EMISSARY ───────────
  {
    id: 'xylos-emissary',
    name: 'Xylos Emissary',
    description: 'Lien direct avec Xylos',
    philosophy: 'Servir le cœur',
    unlock: { type: 'xylos_state', value: 'flux_stable', label: 'Atteindre Flux Stable' },
    visualSkinId: 'legend-skin',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      xylosEchoMultiplier: 2.0,     // ✅ Double contribution Xylos
      scoreMultiplier: 0.5,         // ❌ Aucun bonus score direct
      customMessages: ['XYLOS RESPONDS', 'ECHO SYNCHRONIZED'],
    },
    bonusText: 'x2 contribution Xylos',
    malusText: '-50% score personnel',
    keyMessage: 'XYLOS RESPONDS',
  },

  // ─────────── 8. BROKEN SHELL ───────────
  {
    id: 'broken-shell',
    name: 'Broken Shell',
    description: 'Accepter la fragilité',
    philosophy: 'Pas de bouclier, que du skill',
    unlock: { type: 'challenge', value: 1, label: 'Mode défi' },
    visualSkinId: 'minimal-white',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      proximityBonus: true,         // ✅ Bonus près du danger
      shieldStrength: 0,            // ❌ Aucun bouclier
      customMessages: ['YOU CHOSE THIS', 'STAY CLOSE'],
    },
    bonusText: 'Bonus de proximité',
    malusText: 'Aucun bouclier',
    keyMessage: 'YOU CHOSE THIS',
  },

  // ─────────── 9. GHOST PROTOCOL ───────────
  {
    id: 'ghost-protocol',
    name: 'Ghost Protocol',
    description: 'Disparition tactique',
    philosophy: 'Invisible, intouchable',
    unlock: { type: 'runs', value: 3, label: '3 runs sans power-ups' },
    visualSkinId: 'shadow-core',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      chaosResistance: 0.3,         // ✅ Détection retardée
      feedbackIntensity: 0.5,       // ❌ Feedback réduit
      customMessages: ['UNSEEN', 'NO TRACE'],
    },
    bonusText: 'Détection ennemie retardée',
    malusText: '-50% feedback visuel',
    keyMessage: 'UNSEEN',
  },

  // ─────────── 10. CHAOS WITNESS ───────────
  {
    id: 'chaos-witness',
    name: 'Chaos Witness',
    description: 'Observer, pas dominer',
    philosophy: 'Comprendre le chaos',
    unlock: { type: 'xylos_state', value: 'eveil_partiel', label: 'Contribution communautaire' },
    visualSkinId: 'core-classic',
    modifiers: {
      ...DEFAULT_MODIFIERS,
      customMessages: ['YOU UNDERSTAND NOW', 'CHAOS ACKNOWLEDGED'],
      // Aucun avantage mécanique, que des messages
    },
    bonusText: 'Messages enrichis',
    malusText: 'Aucun avantage mécanique',
    keyMessage: 'YOU UNDERSTAND NOW',
  },
];

// ============================================================
// SKIN MANAGER
// ============================================================

const STORAGE_KEY = 'failfrenzy_gameplay_skins';
const SELECTED_KEY = 'failfrenzy_selected_gameplay_skin';

interface SkinStorage {
  unlocked: string[];
}

function getSkinStorage(): SkinStorage {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { unlocked: ['standard'] };
}

function saveSkinStorage(storage: SkinStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function isSkinUnlocked(skinId: string): boolean {
  const storage = getSkinStorage();
  return storage.unlocked.includes(skinId);
}

export function unlockSkin(skinId: string): void {
  const storage = getSkinStorage();
  if (!storage.unlocked.includes(skinId)) {
    storage.unlocked.push(skinId);
    saveSkinStorage(storage);
  }
}

export function checkUnlocks(stats: {
  totalRuns: number;
  highestCombo: number;
  longestSurvival: number;
  totalFails: number;
}): string[] {
  const storage = getSkinStorage();
  const newUnlocks: string[] = [];
  const xylos = getXylosSystem();
  const xylosState = xylos.getData().currentState;

  for (const skin of GAMEPLAY_SKINS) {
    if (storage.unlocked.includes(skin.id)) continue;

    let unlocked = false;
    switch (skin.unlock.type) {
      case 'default':
        unlocked = true;
        break;
      case 'runs':
        unlocked = stats.totalRuns >= (skin.unlock.value as number);
        break;
      case 'combo':
        unlocked = stats.highestCombo >= (skin.unlock.value as number);
        break;
      case 'survival':
        unlocked = stats.longestSurvival >= (skin.unlock.value as number);
        break;
      case 'fails':
        unlocked = stats.totalFails >= (skin.unlock.value as number);
        break;
      case 'xylos_state':
        const requiredState = skin.unlock.value as string;
        const states = ['dormant', 'premiers_echos', 'resonance', 'flux_stable', 'eveil_partiel'];
        const currentIndex = states.indexOf(xylosState);
        const requiredIndex = states.indexOf(requiredState);
        unlocked = currentIndex >= requiredIndex;
        break;
      case 'challenge':
        // Unlock manuel via événement spécial
        break;
    }

    if (unlocked) {
      storage.unlocked.push(skin.id);
      newUnlocks.push(skin.id);
    }
  }

  if (newUnlocks.length > 0) {
    saveSkinStorage(storage);
  }

  return newUnlocks;
}

export function getSelectedSkinId(): string {
  try {
    const id = localStorage.getItem(SELECTED_KEY);
    if (id && GAMEPLAY_SKINS.find(s => s.id === id)) return id;
  } catch {}
  return 'standard';
}

export function setSelectedSkin(skinId: string): void {
  localStorage.setItem(SELECTED_KEY, skinId);
}

export function getSelectedSkin(): GameplaySkin {
  const id = getSelectedSkinId();
  return GAMEPLAY_SKINS.find(s => s.id === id) || GAMEPLAY_SKINS[0];
}

export function getUnlockedSkins(): GameplaySkin[] {
  const storage = getSkinStorage();
  return GAMEPLAY_SKINS.filter(s => storage.unlocked.includes(s.id));
}

export function getAllSkins(): GameplaySkin[] {
  return GAMEPLAY_SKINS;
}
