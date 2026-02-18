/**
 * CONFIG - Paramètres globaux du jeu
 */
export interface GameConfig {
  particleLimit: number;
  showHitboxes: boolean;
  vfxIntensity: number;
}

let currentConfig: GameConfig = {
  particleLimit: 500,
  showHitboxes: false,
  vfxIntensity: 1.0
};

export function getConfig() {
  return currentConfig;
}

export function applyDeviceOptimizedConfig() {
  // Détection de device simple
  if (window.innerWidth < 768) {
    currentConfig.particleLimit = 200;
    currentConfig.vfxIntensity = 0.5;
  }
}

export function pickObstacleType() {
  const types = ['dasher', 'orbiter', 'shaker'];
  return types[Math.floor(Math.random() * types.length)];
}
