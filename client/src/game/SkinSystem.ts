/**
 * FAIL FRENZY — SYSTÈME DE SKINS v3.0 (ROBUST)
 */

export interface SkinModifiers {
  speedMultiplier: number;
  scoreMultiplier: number;
  shieldMultiplier: number;
  comboMultiplier: number;
  xylosEchoMultiplier: number;
  hitboxMultiplier: number;
  powerUpDurationMultiplier: number;
  visionMultiplier: number;
}

export interface SkinDefinition {
  id: string;
  name: string;
  tagline: string;
  lore: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tier: 'free' | 'premium' | 'token';
  price?: number; // en EUR
  tokens?: number; // en tokens
  imagePath: string;
  core: {
    color: string;
    glowColor: string;
  };
  trail: {
    color: string;
    style: 'neon' | 'particles' | 'ghost' | 'fire';
  };
  effects: {
    pulse: boolean;
    particles: boolean;
    distortion?: boolean;
    scanlines?: boolean;
  };
  modifiers: SkinModifiers;
  bonuses: { icon: string; label: string }[];
  maluses: { icon: string; label: string }[];
  unlock: { type: string; label: string };
  specialEffect?: {
    name: string;
    description: string;
    trigger: 'passive' | 'on_dodge' | 'on_hit' | 'on_combo' | 'timed';
    cooldown?: number;
  };
}

const DEFAULT_MODIFIERS: SkinModifiers = {
  speedMultiplier: 1.0,
  scoreMultiplier: 1.0,
  shieldMultiplier: 1.0,
  comboMultiplier: 1.0,
  xylosEchoMultiplier: 1.0,
  hitboxMultiplier: 1.0,
  powerUpDurationMultiplier: 1.0,
  visionMultiplier: 1.0,
};

export const SKINS: SkinDefinition[] = [
  {
    id: 'cyan',
    name: 'Vaisseau Cyan',
    tagline: 'L\'original. Équilibré.',
    lore: 'Le premier prototype conçu pour explorer la Zone Glitch.',
    rarity: 'common',
    tier: 'free',
    imagePath: '/skins/cyan.png',
    unlock: { type: 'free', label: 'DÉBLOQUÉ' },
    core: { color: '#00f0ff', glowColor: 'rgba(0,240,255,0.5)' },
    trail: { color: '#00f0ff', style: 'neon' },
    effects: { pulse: false, particles: false },
    modifiers: { ...DEFAULT_MODIFIERS },
    bonuses: [{ icon: '⚖️', label: 'Équilibré' }],
    maluses: [],
  },
  {
    id: 'magenta',
    name: 'Vaisseau Magenta',
    tagline: 'La pulsation du danger.',
    lore: 'Équipé de capteurs de résonance, il vibre à chaque point marqué.',
    rarity: 'common',
    tier: 'token',
    tokens: 99,
    imagePath: '/skins/magenta.png',
    unlock: { type: 'tokens', label: '99 TOKENS' },
    core: { color: '#ff00ff', glowColor: 'rgba(255,0,255,0.5)' },
    trail: { color: '#ff00ff', style: 'neon' },
    effects: { pulse: true, particles: false },
    modifiers: { ...DEFAULT_MODIFIERS, comboMultiplier: 1.2, shieldMultiplier: 0.9 },
    bonuses: [{ icon: '⚡', label: '+20% vitesse combo' }],
    maluses: [{ icon: '🛡️', label: '-10% bouclier' }],
    specialEffect: { name: 'Pulse Magnétique', description: 'Repousse les obstacles.', trigger: 'passive' },
  },
  {
    id: 'vaporwave',
    name: 'Vaisseau Vaporwave',
    tagline: 'Nostalgie du futur.',
    lore: 'Une relique d\'un âge d\'or numérique oublié.',
    rarity: 'rare',
    tier: 'token',
    tokens: 199,
    imagePath: '/skins/vaporwave.png',
    unlock: { type: 'tokens', label: '199 TOKENS' },
    core: { color: '#ff71ce', glowColor: 'rgba(255,113,206,0.5)' },
    trail: { color: '#b967ff', style: 'ghost' },
    effects: { pulse: true, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, powerUpDurationMultiplier: 1.15, visionMultiplier: 1.1, speedMultiplier: 0.9 },
    bonuses: [{ icon: '⏱️', label: '+15% durée power-ups' }],
    maluses: [{ icon: '🐌', label: '-10% vitesse' }],
  },
  {
    id: 'cyberpunk',
    name: 'Vaisseau Cyberpunk',
    tagline: 'High tech, low life.',
    rarity: 'rare',
    tier: 'token',
    tokens: 199,
    imagePath: '/skins/cyberpunk.png',
    unlock: { type: 'tokens', label: '199 TOKENS' },
    core: { color: '#00ff9f', glowColor: 'rgba(0,255,159,0.5)' },
    trail: { color: '#f5ed00', style: 'neon' },
    effects: { pulse: false, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, scoreMultiplier: 1.25, speedMultiplier: 1.1 },
    bonuses: [{ icon: '📈', label: '+25% score' }],
    maluses: [{ icon: '💔', label: '-25% bouclier' }],
  },
  {
    id: 'steampunk',
    name: 'Vaisseau Steampunk',
    tagline: 'La mécanique du chaos.',
    rarity: 'rare',
    tier: 'token',
    tokens: 199,
    imagePath: '/skins/steampunk.png',
    unlock: { type: 'tokens', label: '199 TOKENS' },
    core: { color: '#ffaa00', glowColor: 'rgba(255,170,0,0.5)' },
    trail: { color: '#ff6600', style: 'fire' },
    effects: { pulse: false, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, shieldMultiplier: 1.3, speedMultiplier: 0.85 },
    bonuses: [{ icon: '🛡️', label: '+30% bouclier' }],
    maluses: [{ icon: '🐌', label: '-15% vitesse' }],
  },
  {
    id: 'cyber_ninja',
    name: 'Cyber Ninja',
    tagline: 'Frappe vite. Disparais.',
    rarity: 'epic',
    tier: 'token',
    tokens: 299,
    imagePath: '/skins/cyber_ninja.png',
    unlock: { type: 'tokens', label: '299 TOKENS' },
    core: { color: '#0066ff', glowColor: 'rgba(0,102,255,0.6)' },
    trail: { color: '#00ffff', style: 'ghost' },
    effects: { pulse: true, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, speedMultiplier: 1.3, comboMultiplier: 1.2 },
    bonuses: [{ icon: '⚡', label: '+30% vitesse' }],
    maluses: [{ icon: '💀', label: '-40% bouclier' }],
  },
  {
    id: 'pirate_spatial',
    name: 'Pirate Spatial',
    tagline: 'Le butin avant tout.',
    rarity: 'epic',
    tier: 'premium',
    price: 1.99,
    imagePath: '/skins/pirate_spatial.png',
    unlock: { type: 'premium', label: '1.99€' },
    core: { color: '#ffcc00', glowColor: 'rgba(255,204,0,0.6)' },
    trail: { color: '#ff3300', style: 'fire' },
    effects: { pulse: false, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, xylosEchoMultiplier: 1.4, scoreMultiplier: 1.15 },
    bonuses: [{ icon: '💰', label: '+40% loot' }],
    maluses: [{ icon: '🐌', label: '-20% vitesse' }],
  },
  {
    id: 'vaisseau_fantome',
    name: 'Vaisseau Fantôme',
    tagline: 'Entre les dimensions.',
    rarity: 'epic',
    tier: 'premium',
    price: 1.99,
    imagePath: '/skins/vaisseau_fantome.png',
    unlock: { type: 'premium', label: '1.99€' },
    core: { color: '#aaffff', glowColor: 'rgba(170,255,255,0.6)' },
    trail: { color: '#ffffff', style: 'ghost' },
    effects: { pulse: true, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, hitboxMultiplier: 0.8 },
    bonuses: [{ icon: '👻', label: 'Phase spectrale' }],
    maluses: [{ icon: '📉', label: '-15% score' }],
  },
  {
    id: 'entite_cosmique',
    name: 'Entité Cosmique',
    tagline: 'Au-delà de la compréhension.',
    rarity: 'legendary',
    tier: 'premium',
    price: 2.49,
    imagePath: '/skins/entite_cosmique.png',
    unlock: { type: 'premium', label: '2.49€' },
    core: { color: '#ffffff', glowColor: 'rgba(255,255,255,0.8)' },
    trail: { color: '#00f0ff', style: 'ghost' },
    effects: { pulse: true, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, visionMultiplier: 1.35, scoreMultiplier: 1.2 },
    bonuses: [{ icon: '🌌', label: '+35% vision' }],
    maluses: [{ icon: '🐌', label: '-20% vitesse' }],
  },
  {
    id: 'ange_dechu',
    name: 'Ange Déchu',
    tagline: 'La rédemption par le score.',
    rarity: 'legendary',
    tier: 'premium',
    price: 2.49,
    imagePath: '/skins/ange_dechu.png',
    unlock: { type: 'premium', label: '2.49€' },
    core: { color: '#ff0055', glowColor: 'rgba(255,0,85,0.8)' },
    trail: { color: '#ff00ff', style: 'neon' },
    effects: { pulse: true, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, comboMultiplier: 1.25, hitboxMultiplier: 1.15 },
    bonuses: [{ icon: '👼', label: 'Résurrection divine' }],
    maluses: [{ icon: '⚠️', label: 'Hitbox +15%' }],
  },
  {
    id: 'golem_lave',
    name: 'Golem de Lave',
    tagline: 'Indestructible. Implacable.',
    rarity: 'legendary',
    tier: 'premium',
    price: 2.49,
    imagePath: '/skins/golem_lave.png',
    unlock: { type: 'premium', label: '2.49€' },
    core: { color: '#ff4400', glowColor: 'rgba(255,68,0,0.8)' },
    trail: { color: '#ffcc00', style: 'fire' },
    effects: { pulse: true, particles: true },
    modifiers: { ...DEFAULT_MODIFIERS, shieldMultiplier: 1.6, scoreMultiplier: 1.3 },
    bonuses: [{ icon: '🔥', label: '+60% bouclier' }],
    maluses: [{ icon: '🦍', label: '-30% vitesse' }],
  },
];

export function getUnlockedSkins(): string[] {
  try { return JSON.parse(localStorage.getItem('failfrenzy_unlocked_skins') || '["cyan"]'); } catch { return ['cyan']; }
}

export function isSkinUnlocked(id: string): boolean {
  return getUnlockedSkins().includes(id);
}

export function purchaseSkin(id: string): boolean {
  const unlocked = getUnlockedSkins();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem('failfrenzy_unlocked_skins', JSON.stringify(unlocked));
    return true;
  }
  return false;
}

export function getSelectedSkinId(): string {
  return localStorage.getItem('failfrenzy_selected_skin') || 'cyan';
}

export function setSelectedSkin(id: string): void {
  localStorage.setItem('failfrenzy_selected_skin', id);
}

export function getSelectedSkin(): SkinDefinition {
  const id = getSelectedSkinId();
  return SKINS.find(s => s.id === id) || SKINS[0];
}

export function getAllSkins(): SkinDefinition[] {
  return SKINS;
}

export function updatePlayerStats(score: number, time: number): void {
  try {
    const key = 'failfrenzy_player_stats';
    const stats = JSON.parse(localStorage.getItem(key) || '{"highScore":0,"totalGames":0,"totalTime":0}');
    stats.highScore = Math.max(stats.highScore, score);
    stats.totalGames += 1;
    stats.totalTime += time;
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to update player stats', e);
  }
}

export function renderSkinPreview(
  ctx: CanvasRenderingContext2D,
  skin: SkinDefinition,
  x: number,
  y: number,
  size: number,
  t: number
): void {
  ctx.save();
  ctx.translate(x, y);
  const floatY = Math.sin(t * 2) * (size * 0.05);
  ctx.translate(0, floatY);
  ctx.shadowBlur = 15 + Math.sin(t * 3) * 5;
  ctx.shadowColor = skin.core.glowColor;

  const img = new Image();
  img.src = skin.imagePath;
  if (img.complete) {
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  } else {
    ctx.fillStyle = skin.core.color;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(-size / 2, -size / 2);
    ctx.lineTo(-size / 2, size / 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
