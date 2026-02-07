/**
 * FAIL FRENZY PREMIUM — CONFIG SYSTEM
 * Structure JSON pour toggle rapide de chaque feature visuelle et gameplay.
 * Aucun changement du core collision system.
 * Modifiable à chaud via la console : window.__FF_CONFIG
 */

export interface ObstacleTypeConfig {
  enabled: boolean;
  spawnWeight: number;
}

export interface PlayerConfig {
  shape: 'diamond' | 'triangle' | 'circle';
  trailEnabled: boolean;
  trailColor: string;
  trailLength: number;
  trailFade: number;
  glowEnabled: boolean;
  breathingGlow: boolean;
  breathingSpeed: number;
  breathingMin: number;
  breathingMax: number;
}

export interface ObstaclesConfig {
  dasher: ObstacleTypeConfig;
  orbiter: ObstacleTypeConfig;
  shaker: ObstacleTypeConfig;
}

export interface VFXConfig {
  collisionParticles: boolean;
  collisionParticleCount: number;
  screenShake: boolean;
  screenShakeAmplitude: number;
  screenShakeDuration: number;
  chromaticAberration: boolean;
  chromaticAberrationIntensity: number;
  motionBlurTrail: boolean;
  neonRingGlow: boolean;
  afterImageEffect: boolean;
  scanlines: boolean;
  backgroundGrid: boolean;
}

export interface DebugConfig {
  showHitboxes: boolean;
  showFPS: boolean;
  showEntityCount: boolean;
  showObstacleType: boolean;
  showParticleCount: boolean;
}

export interface GameConfig {
  player: PlayerConfig;
  obstacles: ObstaclesConfig;
  vfx: VFXConfig;
  debug: DebugConfig;
}

/**
 * Configuration par défaut — production quality, tous effets activés
 */
export const DEFAULT_CONFIG: GameConfig = {
  player: {
    shape: 'diamond',
    trailEnabled: true,
    trailColor: '#00ffff',
    trailLength: 18,
    trailFade: 0.06,
    glowEnabled: true,
    breathingGlow: true,
    breathingSpeed: 1.0,
    breathingMin: 0.95,
    breathingMax: 1.05,
  },

  obstacles: {
    dasher: { enabled: true, spawnWeight: 1.0 },
    orbiter: { enabled: true, spawnWeight: 0.8 },
    shaker: { enabled: true, spawnWeight: 0.7 },
  },

  vfx: {
    collisionParticles: true,
    collisionParticleCount: 12,
    screenShake: true,
    screenShakeAmplitude: 5,
    screenShakeDuration: 100,
    chromaticAberration: true,
    chromaticAberrationIntensity: 3,
    motionBlurTrail: true,
    neonRingGlow: true,
    afterImageEffect: true,
    scanlines: true,
    backgroundGrid: true,
  },

  debug: {
    showHitboxes: false,
    showFPS: false,
    showEntityCount: false,
    showObstacleType: false,
    showParticleCount: false,
  },
};

/**
 * Config runtime — mutable, accessible globalement
 */
let _config: GameConfig = structuredClone(DEFAULT_CONFIG);

export function getConfig(): GameConfig {
  return _config;
}

export function setConfig(partial: Partial<GameConfig>): void {
  if (partial.player) _config.player = { ..._config.player, ...partial.player };
  if (partial.obstacles) _config.obstacles = { ..._config.obstacles, ...partial.obstacles };
  if (partial.vfx) _config.vfx = { ..._config.vfx, ...partial.vfx };
  if (partial.debug) _config.debug = { ..._config.debug, ...partial.debug };
}

export function resetConfig(): void {
  _config = structuredClone(DEFAULT_CONFIG);
}

/**
 * Expose sur window pour debug console
 * Usage: window.__FF_CONFIG.debug.showHitboxes = true
 */
if (typeof window !== 'undefined') {
  (window as any).__FF_CONFIG = _config;
  (window as any).__FF_RESET_CONFIG = resetConfig;
}

/**
 * Weighted random pick parmi les obstacle types activés
 */
export function pickObstacleType(): 'dasher' | 'orbiter' | 'shaker' {
  const cfg = _config.obstacles;
  const pool: Array<{ type: 'dasher' | 'orbiter' | 'shaker'; weight: number }> = [];

  if (cfg.dasher.enabled) pool.push({ type: 'dasher', weight: cfg.dasher.spawnWeight });
  if (cfg.orbiter.enabled) pool.push({ type: 'orbiter', weight: cfg.orbiter.spawnWeight });
  if (cfg.shaker.enabled) pool.push({ type: 'shaker', weight: cfg.shaker.spawnWeight });

  if (pool.length === 0) return 'dasher'; // fallback

  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }

  return pool[pool.length - 1].type;
}
