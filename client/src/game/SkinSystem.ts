/**
 * FAIL FRENZY PREMIUM — SKIN SYSTEM
 * 
 * 5 skins gratuits (déblocage par score/temps/parties)
 * 5 skins premium (0.99€ – 2.99€, statut visuel uniquement)
 * Aucun bonus gameplay — jamais P2W.
 * 
 * Chaque skin définit : core color, glow color, trail color, 
 * trail style, special effects, et une fonction de rendu canvas.
 */

// ============================================================
// TYPES
// ============================================================

export type SkinTier = 'free' | 'premium';

export interface SkinUnlockCondition {
  type: 'default' | 'score' | 'time' | 'games' | 'purchase';
  value: number; // score threshold, seconds survived, games played, or price in cents
  label: string; // human-readable condition
}

export interface SkinDefinition {
  id: string;
  name: string;
  tier: SkinTier;
  price?: number; // cents, only for premium
  unlock: SkinUnlockCondition;
  core: {
    color: string;
    secondaryColor: string;
    glowColor: string;
    glowIntensity: number; // 0-1
  };
  trail: {
    color: string;
    secondaryColor?: string;
    length: number;
    width: number;
    style: 'solid' | 'fade' | 'fire' | 'particles' | 'glitch' | 'hologram';
  };
  effects: {
    breathing: boolean;
    breathingSpeed: number;
    pulse: boolean;
    distortion: boolean;
    scanlines: boolean;
    particles: boolean;
    particleColor?: string;
    gameOverAnimation?: 'none' | 'explode' | 'dissolve' | 'ascend' | 'glitch' | 'legendary';
  };
}

// ============================================================
// SKIN DEFINITIONS — 5 FREE + 5 PREMIUM
// ============================================================

export const SKINS: SkinDefinition[] = [
  // ─────────── FREE SKINS ───────────
  {
    id: 'core-classic',
    name: 'Core Classic',
    tier: 'free',
    unlock: { type: 'default', value: 0, label: 'Skin par défaut' },
    core: {
      color: '#00f0ff',
      secondaryColor: '#0080ff',
      glowColor: '#00f0ff',
      glowIntensity: 0.5,
    },
    trail: {
      color: '#00f0ff',
      length: 14,
      width: 3,
      style: 'fade',
    },
    effects: {
      breathing: true,
      breathingSpeed: 1.0,
      pulse: false,
      distortion: false,
      scanlines: false,
      particles: false,
      gameOverAnimation: 'none',
    },
  },
  {
    id: 'pulse-core',
    name: 'Pulse Core',
    tier: 'free',
    unlock: { type: 'score', value: 100, label: 'Score 100+' },
    core: {
      color: '#00ff88',
      secondaryColor: '#00cc66',
      glowColor: '#00ff88',
      glowIntensity: 0.7,
    },
    trail: {
      color: '#00ff88',
      length: 18,
      width: 4,
      style: 'solid',
    },
    effects: {
      breathing: true,
      breathingSpeed: 0.6,
      pulse: true,
      distortion: false,
      scanlines: false,
      particles: false,
      gameOverAnimation: 'dissolve',
    },
  },
  {
    id: 'shadow-core',
    name: 'Shadow Core',
    tier: 'free',
    unlock: { type: 'games', value: 10, label: '10 parties jouées' },
    core: {
      color: '#1a1a2e',
      secondaryColor: '#0f0f23',
      glowColor: '#ff00ff',
      glowIntensity: 0.8,
    },
    trail: {
      color: '#ff00ff',
      secondaryColor: '#8800aa',
      length: 12,
      width: 2,
      style: 'fade',
    },
    effects: {
      breathing: true,
      breathingSpeed: 1.2,
      pulse: false,
      distortion: false,
      scanlines: false,
      particles: false,
      gameOverAnimation: 'dissolve',
    },
  },
  {
    id: 'split-core',
    name: 'Split Core',
    tier: 'free',
    unlock: { type: 'score', value: 250, label: 'Score 250+' },
    core: {
      color: '#00f0ff',
      secondaryColor: '#9400d3',
      glowColor: '#7744ff',
      glowIntensity: 0.6,
    },
    trail: {
      color: '#00f0ff',
      secondaryColor: '#9400d3',
      length: 16,
      width: 3,
      style: 'solid',
    },
    effects: {
      breathing: true,
      breathingSpeed: 0.8,
      pulse: false,
      distortion: false,
      scanlines: false,
      particles: false,
      gameOverAnimation: 'explode',
    },
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    tier: 'free',
    unlock: { type: 'time', value: 120, label: '2 min survécues' },
    core: {
      color: '#ffffff',
      secondaryColor: '#cccccc',
      glowColor: '#ffffff',
      glowIntensity: 0.4,
    },
    trail: {
      color: '#ffffff',
      length: 10,
      width: 2,
      style: 'fade',
    },
    effects: {
      breathing: false,
      breathingSpeed: 1.0,
      pulse: false,
      distortion: false,
      scanlines: false,
      particles: false,
      gameOverAnimation: 'none',
    },
  },

  // ─────────── PREMIUM SKINS ───────────
  {
    id: 'gold-reactor',
    name: 'Gold Reactor',
    tier: 'premium',
    price: 99, // 0.99€
    unlock: { type: 'purchase', value: 99, label: '0.99€' },
    core: {
      color: '#ffd700',
      secondaryColor: '#ff8c00',
      glowColor: '#ffd700',
      glowIntensity: 0.9,
    },
    trail: {
      color: '#ffd700',
      secondaryColor: '#ff6600',
      length: 20,
      width: 4,
      style: 'particles',
    },
    effects: {
      breathing: true,
      breathingSpeed: 0.7,
      pulse: true,
      distortion: false,
      scanlines: false,
      particles: true,
      particleColor: '#ffd700',
      gameOverAnimation: 'explode',
    },
  },
  {
    id: 'neon-inferno',
    name: 'Neon Inferno',
    tier: 'premium',
    price: 199, // 1.99€
    unlock: { type: 'purchase', value: 199, label: '1.99€' },
    core: {
      color: '#ff4400',
      secondaryColor: '#ff0000',
      glowColor: '#ff6600',
      glowIntensity: 0.85,
    },
    trail: {
      color: '#ff4400',
      secondaryColor: '#ff8800',
      length: 22,
      width: 5,
      style: 'fire',
    },
    effects: {
      breathing: true,
      breathingSpeed: 1.5,
      pulse: true,
      distortion: false,
      scanlines: false,
      particles: true,
      particleColor: '#ff6600',
      gameOverAnimation: 'explode',
    },
  },
  {
    id: 'void-core',
    name: 'Void Core',
    tier: 'premium',
    price: 199, // 1.99€
    unlock: { type: 'purchase', value: 199, label: '1.99€' },
    core: {
      color: '#4400aa',
      secondaryColor: '#220066',
      glowColor: '#8844ff',
      glowIntensity: 0.75,
    },
    trail: {
      color: '#8844ff',
      secondaryColor: '#4400aa',
      length: 18,
      width: 4,
      style: 'fade',
    },
    effects: {
      breathing: true,
      breathingSpeed: 0.5,
      pulse: false,
      distortion: true,
      scanlines: false,
      particles: false,
      gameOverAnimation: 'dissolve',
    },
  },
  {
    id: 'hologram',
    name: 'Hologram',
    tier: 'premium',
    price: 249, // 2.49€
    unlock: { type: 'purchase', value: 249, label: '2.49€' },
    core: {
      color: '#00ffcc',
      secondaryColor: '#00aaff',
      glowColor: '#00ffcc',
      glowIntensity: 0.6,
    },
    trail: {
      color: '#00ffcc',
      secondaryColor: '#00aaff',
      length: 16,
      width: 3,
      style: 'hologram',
    },
    effects: {
      breathing: true,
      breathingSpeed: 0.9,
      pulse: false,
      distortion: false,
      scanlines: true,
      particles: false,
      gameOverAnimation: 'glitch',
    },
  },
  {
    id: 'legend-skin',
    name: 'Legend',
    tier: 'premium',
    price: 299, // 2.99€
    unlock: { type: 'purchase', value: 299, label: '2.99€' },
    core: {
      color: '#ff00ff',
      secondaryColor: '#00f0ff',
      glowColor: '#ff44ff',
      glowIntensity: 1.0,
    },
    trail: {
      color: '#ff00ff',
      secondaryColor: '#00f0ff',
      length: 24,
      width: 5,
      style: 'particles',
    },
    effects: {
      breathing: true,
      breathingSpeed: 1.0,
      pulse: true,
      distortion: true,
      scanlines: true,
      particles: true,
      particleColor: '#ff00ff',
      gameOverAnimation: 'legendary',
    },
  },
];

// ============================================================
// SKIN MANAGER — Persistence & Unlock Logic
// ============================================================

const STORAGE_KEY = 'failfrenzy_skins';
const SELECTED_KEY = 'failfrenzy_selected_skin';
const STATS_KEY = 'failfrenzy_player_stats';

interface PlayerStats {
  highScore: number;
  totalGames: number;
  longestSurvival: number; // seconds
  totalScore: number;
}

interface SkinStorage {
  unlocked: string[];
  purchased: string[];
}

function getPlayerStats(): PlayerStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { highScore: 0, totalGames: 0, longestSurvival: 0, totalScore: 0 };
}

export function updatePlayerStats(score: number, time: number): void {
  const stats = getPlayerStats();
  stats.totalGames++;
  stats.totalScore += score;
  if (score > stats.highScore) stats.highScore = score;
  if (time > stats.longestSurvival) stats.longestSurvival = time;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  
  // Check for newly unlocked skins
  checkUnlocks();
}

function getSkinStorage(): SkinStorage {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { unlocked: ['core-classic'], purchased: [] };
}

function saveSkinStorage(storage: SkinStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

function checkUnlocks(): void {
  const stats = getPlayerStats();
  const storage = getSkinStorage();
  let changed = false;

  for (const skin of SKINS) {
    if (storage.unlocked.includes(skin.id)) continue;
    if (skin.tier === 'premium') continue;

    let unlocked = false;
    switch (skin.unlock.type) {
      case 'default':
        unlocked = true;
        break;
      case 'score':
        unlocked = stats.highScore >= skin.unlock.value;
        break;
      case 'time':
        unlocked = stats.longestSurvival >= skin.unlock.value;
        break;
      case 'games':
        unlocked = stats.totalGames >= skin.unlock.value;
        break;
    }

    if (unlocked) {
      storage.unlocked.push(skin.id);
      changed = true;
    }
  }

  if (changed) saveSkinStorage(storage);
}

export function isSkinUnlocked(skinId: string): boolean {
  const storage = getSkinStorage();
  return storage.unlocked.includes(skinId);
}

export function purchaseSkin(skinId: string): boolean {
  const skin = SKINS.find(s => s.id === skinId);
  if (!skin || skin.tier !== 'premium') return false;
  
  const storage = getSkinStorage();
  if (!storage.purchased.includes(skinId)) {
    storage.purchased.push(skinId);
  }
  if (!storage.unlocked.includes(skinId)) {
    storage.unlocked.push(skinId);
  }
  saveSkinStorage(storage);
  return true;
}

export function getSelectedSkinId(): string {
  try {
    const id = localStorage.getItem(SELECTED_KEY);
    if (id && SKINS.find(s => s.id === id)) return id;
  } catch {}
  return 'core-classic';
}

export function setSelectedSkin(skinId: string): void {
  localStorage.setItem(SELECTED_KEY, JSON.stringify(skinId).replace(/"/g, ''));
}

export function getSelectedSkin(): SkinDefinition {
  const id = getSelectedSkinId();
  return SKINS.find(s => s.id === id) || SKINS[0];
}

export function getUnlockedSkins(): SkinDefinition[] {
  const storage = getSkinStorage();
  return SKINS.filter(s => storage.unlocked.includes(s.id));
}

export function getAllSkins(): SkinDefinition[] {
  return SKINS;
}

// ============================================================
// SKIN PREVIEW RENDERER — Canvas mini-preview
// ============================================================

/**
 * Dessine un aperçu du skin sur un canvas 2D (pour le Game Over et le sélecteur)
 * Taille recommandée : 80x80 ou 120x120
 */
export function renderSkinPreview(
  ctx: CanvasRenderingContext2D,
  skin: SkinDefinition,
  cx: number,
  cy: number,
  size: number,
  time: number = 0,
): void {
  const half = size / 2;
  
  ctx.save();
  ctx.translate(cx, cy);

  // Breathing scale
  let scale = 1;
  if (skin.effects.breathing) {
    scale = 0.95 + 0.1 * Math.sin(time * skin.effects.breathingSpeed * Math.PI * 2);
  }
  ctx.scale(scale, scale);

  // Glow
  if (skin.core.glowIntensity > 0) {
    ctx.shadowColor = skin.core.glowColor;
    ctx.shadowBlur = 12 * skin.core.glowIntensity;
  }

  // Trail preview (3 after-images)
  for (let i = 3; i >= 1; i--) {
    const trailAlpha = 0.15 * (4 - i) / 3;
    const offsetY = i * size * 0.25;
    ctx.globalAlpha = trailAlpha;
    ctx.fillStyle = skin.trail.color;
    drawDiamond(ctx, 0, offsetY, half * 0.6 * (1 - i * 0.1));
  }

  ctx.globalAlpha = 1;

  // Core diamond
  const grad = ctx.createLinearGradient(-half, -half, half, half);
  grad.addColorStop(0, skin.core.color);
  grad.addColorStop(1, skin.core.secondaryColor);
  ctx.fillStyle = grad;
  drawDiamond(ctx, 0, 0, half * 0.7);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  drawDiamond(ctx, 0, -half * 0.1, half * 0.25);
  ctx.fill();

  // Outline glow
  ctx.strokeStyle = skin.core.glowColor;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 8 * skin.core.glowIntensity;
  drawDiamond(ctx, 0, 0, half * 0.7);
  ctx.stroke();

  // Scanlines effect
  if (skin.effects.scanlines) {
    ctx.globalAlpha = 0.15;
    for (let y = -half; y < half; y += 4) {
      ctx.fillStyle = '#000';
      ctx.fillRect(-half, y, size, 1);
    }
  }

  // Particle dots for premium
  if (skin.effects.particles && skin.effects.particleColor) {
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) {
      const angle = (time * 2 + i * 1.256) % (Math.PI * 2);
      const dist = half * 0.5 + Math.sin(time * 3 + i) * half * 0.15;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      ctx.fillStyle = skin.effects.particleColor;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.7, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.7, cy);
  ctx.closePath();
}
