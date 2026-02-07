/**
 * FAIL FRENZY - ULTIMATE Power-Up System
 * Dynamic power-ups, special abilities, and gameplay modifiers
 */

import { Entity } from '../engine/GameEngine';
import { NeonRenderer } from '../engine/NeonRenderer';

export type PowerUpType = 
  | 'shield'        // Temporary invincibility
  | 'slowmo'        // Slow motion effect
  | 'magnet'        // Attract collectibles
  | 'multiplier'    // Score multiplier
  | 'shrink'        // Smaller hitbox
  | 'ghost'         // Phase through obstacles
  | 'bomb'          // Clear screen
  | 'frenzy'        // Double speed + double points
  | 'reverse'       // Obstacles move backward (chaos mode)
  | 'rainbow';      // All effects combined briefly

export interface PowerUp {
  type: PowerUpType;
  duration: number;
  remaining: number;
  active: boolean;
  stackable: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  icon: string;
  effect: () => void;
  onEnd: () => void;
}

export interface PowerUpConfig {
  spawnChance: number;
  maxActive: number;
  baseDuration: number;
  rarityWeights: { [key: string]: number };
}

export class PowerUpSystem {
  private activePowerUps: Map<PowerUpType, PowerUp> = new Map();
  private config: PowerUpConfig;
  private onEffectCallback: ((type: PowerUpType, active: boolean) => void) | null = null;
  
  // Power-up definitions
  private static POWER_UP_DEFS: { [key in PowerUpType]: Omit<PowerUp, 'remaining' | 'active' | 'effect' | 'onEnd'> } = {
    shield: {
      type: 'shield',
      duration: 5,
      stackable: false,
      rarity: 'common',
      color: NeonRenderer.COLORS.CYAN,
      icon: '🛡️',
    },
    slowmo: {
      type: 'slowmo',
      duration: 4,
      stackable: false,
      rarity: 'common',
      color: NeonRenderer.COLORS.BLUE,
      icon: '⏱️',
    },
    magnet: {
      type: 'magnet',
      duration: 8,
      stackable: false,
      rarity: 'common',
      color: NeonRenderer.COLORS.MAGENTA,
      icon: '🧲',
    },
    multiplier: {
      type: 'multiplier',
      duration: 10,
      stackable: true,
      rarity: 'rare',
      color: NeonRenderer.COLORS.YELLOW,
      icon: '✖️',
    },
    shrink: {
      type: 'shrink',
      duration: 6,
      stackable: false,
      rarity: 'rare',
      color: NeonRenderer.COLORS.GREEN,
      icon: '🔹',
    },
    ghost: {
      type: 'ghost',
      duration: 3,
      stackable: false,
      rarity: 'epic',
      color: NeonRenderer.COLORS.WHITE,
      icon: '👻',
    },
    bomb: {
      type: 'bomb',
      duration: 0.5,
      stackable: false,
      rarity: 'epic',
      color: NeonRenderer.COLORS.RED,
      icon: '💥',
    },
    frenzy: {
      type: 'frenzy',
      duration: 5,
      stackable: false,
      rarity: 'epic',
      color: NeonRenderer.COLORS.ORANGE,
      icon: '🔥',
    },
    reverse: {
      type: 'reverse',
      duration: 4,
      stackable: false,
      rarity: 'legendary',
      color: NeonRenderer.COLORS.PURPLE,
      icon: '🔄',
    },
    rainbow: {
      type: 'rainbow',
      duration: 3,
      stackable: false,
      rarity: 'legendary',
      color: '#ffffff',
      icon: '🌈',
    },
  };
  
  // Rarity spawn weights
  private static RARITY_WEIGHTS = {
    common: 50,
    rare: 30,
    epic: 15,
    legendary: 5,
  };
  
  constructor(config: Partial<PowerUpConfig> = {}) {
    this.config = {
      spawnChance: 0.15,
      maxActive: 3,
      baseDuration: 1,
      rarityWeights: PowerUpSystem.RARITY_WEIGHTS,
      ...config,
    };
  }
  
  // Set callback for effect changes
  public onEffect(callback: (type: PowerUpType, active: boolean) => void): void {
    this.onEffectCallback = callback;
  }
  
  // Get random power-up type based on rarity
  public getRandomPowerUpType(): PowerUpType {
    const rarities = Object.entries(this.config.rarityWeights);
    const totalWeight = rarities.reduce((sum, [, weight]) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRarity = 'common';
    for (const [rarity, weight] of rarities) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Get all power-ups of selected rarity
    const availableTypes = (Object.entries(PowerUpSystem.POWER_UP_DEFS) as [PowerUpType, any][])
      .filter(([, def]) => def.rarity === selectedRarity)
      .map(([type]) => type);
    
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }
  
  // Should spawn power-up?
  public shouldSpawn(): boolean {
    return Math.random() < this.config.spawnChance;
  }
  
  // Create power-up entity
  public createPowerUpEntity(type: PowerUpType, x: number, y: number): Entity {
    const def = PowerUpSystem.POWER_UP_DEFS[type];
    
    return {
      id: `powerup-${type}-${Date.now()}`,
      type: 'powerup',
      x,
      y,
      width: 25,
      height: 25,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: def.color,
      components: new Map([
        ['powerUpType', type],
        ['rarity', def.rarity],
        ['icon', def.icon],
        ['collisionShape', 'circle'],
      ]),
    };
  }
  
  // Activate power-up
  public activate(type: PowerUpType): void {
    const def = PowerUpSystem.POWER_UP_DEFS[type];
    
    // Check if already active and not stackable
    if (this.activePowerUps.has(type) && !def.stackable) {
      // Refresh duration
      const existing = this.activePowerUps.get(type)!;
      existing.remaining = def.duration * this.config.baseDuration;
      return;
    }
    
    // Check max active limit
    if (this.activePowerUps.size >= this.config.maxActive && !this.activePowerUps.has(type)) {
      // Remove oldest
      const oldest = this.activePowerUps.keys().next().value;
      if (oldest) this.deactivate(oldest);
    }
    
    const powerUp: PowerUp = {
      ...def,
      remaining: def.duration * this.config.baseDuration,
      active: true,
      effect: () => {},
      onEnd: () => {},
    };
    
    this.activePowerUps.set(type, powerUp);
    
    if (this.onEffectCallback) {
      this.onEffectCallback(type, true);
    }
  }
  
  // Deactivate power-up
  public deactivate(type: PowerUpType): void {
    const powerUp = this.activePowerUps.get(type);
    if (powerUp) {
      powerUp.active = false;
      this.activePowerUps.delete(type);
      
      if (this.onEffectCallback) {
        this.onEffectCallback(type, false);
      }
    }
  }
  
  // Update all active power-ups
  public update(dt: number): void {
    for (const [type, powerUp] of Array.from(this.activePowerUps)) {
      powerUp.remaining -= dt;
      
      if (powerUp.remaining <= 0) {
        this.deactivate(type);
      }
    }
  }
  
  // Check if power-up is active
  public isActive(type: PowerUpType): boolean {
    return this.activePowerUps.has(type) && this.activePowerUps.get(type)!.active;
  }
  
  // Get remaining time for power-up
  public getRemaining(type: PowerUpType): number {
    const powerUp = this.activePowerUps.get(type);
    return powerUp ? powerUp.remaining : 0;
  }
  
  // Get all active power-ups
  public getActivePowerUps(): PowerUp[] {
    return Array.from(this.activePowerUps.values());
  }
  
  // Get power-up definition
  public static getDefinition(type: PowerUpType): typeof PowerUpSystem.POWER_UP_DEFS[PowerUpType] {
    return PowerUpSystem.POWER_UP_DEFS[type];
  }
  
  // Calculate score multiplier from active power-ups
  public getScoreMultiplier(): number {
    let multiplier = 1;
    
    if (this.isActive('multiplier')) {
      multiplier *= 2;
    }
    
    if (this.isActive('frenzy')) {
      multiplier *= 2;
    }
    
    if (this.isActive('rainbow')) {
      multiplier *= 3;
    }
    
    return multiplier;
  }
  
  // Get speed modifier from active power-ups
  public getSpeedModifier(): number {
    let modifier = 1;
    
    if (this.isActive('slowmo')) {
      modifier *= 0.5;
    }
    
    if (this.isActive('frenzy')) {
      modifier *= 1.5;
    }
    
    if (this.isActive('reverse')) {
      modifier *= -0.8;
    }
    
    return modifier;
  }
  
  // Get player scale modifier
  public getPlayerScaleModifier(): number {
    if (this.isActive('shrink')) {
      return 0.5;
    }
    return 1;
  }
  
  // Check if player is invincible
  public isInvincible(): boolean {
    return this.isActive('shield') || this.isActive('ghost') || this.isActive('rainbow');
  }
  
  // Check if should attract collectibles
  public hasMagnet(): boolean {
    return this.isActive('magnet') || this.isActive('rainbow');
  }
  
  // Check if bomb should clear screen
  public shouldClearScreen(): boolean {
    return this.isActive('bomb');
  }
  
  // Clear all power-ups
  public clearAll(): void {
    for (const type of Array.from(this.activePowerUps.keys())) {
      this.deactivate(type);
    }
  }
  
  // Get visual effect color (for rainbow cycling)
  public getRainbowColor(time: number): string {
    if (!this.isActive('rainbow')) return '#ffffff';
    
    const colors = Object.values(NeonRenderer.COLORS);
    const index = Math.floor((time * 5) % colors.length);
    return colors[index];
  }
}

// Singleton
let powerUpInstance: PowerUpSystem | null = null;

export function getPowerUpSystem(): PowerUpSystem {
  if (!powerUpInstance) {
    powerUpInstance = new PowerUpSystem();
  }
  return powerUpInstance;
}
