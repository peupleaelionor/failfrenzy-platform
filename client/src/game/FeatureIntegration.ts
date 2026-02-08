/**
 * FAIL FRENZY — FEATURE INTEGRATION
 * 
 * Intégration des nouveaux systèmes dans le jeu principal:
 * - XYLOS System
 * - Dynamic Messages
 * - Gameplay Skins
 * - Narrative Obstacles
 * 
 * Feature flags pour activation/désactivation
 */

import { getXylosSystem, XylosSystem } from '../systems/XylosSystem';
import { DynamicMessageSystem } from '../systems/DynamicMessageSystem';
import { getSelectedSkin, GameplaySkin, SkinModifiers } from '../systems/GameplaySkinSystem';
import { NarrativeObstacleSystem, createNarrativeObstacle, NarrativeObstacleType } from '../systems/NarrativeObstacleSystem';

// ============================================================
// FEATURE FLAGS
// ============================================================

export interface FeatureFlags {
  xylos: boolean;
  dynamicMessages: boolean;
  gameplaySkins: boolean;
  narrativeObstacles: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  xylos: true,
  dynamicMessages: true,
  gameplaySkins: true,
  narrativeObstacles: true,
};

let _featureFlags: FeatureFlags = { ...DEFAULT_FLAGS };

export function getFeatureFlags(): FeatureFlags {
  return _featureFlags;
}

export function setFeatureFlag(flag: keyof FeatureFlags, value: boolean): void {
  _featureFlags[flag] = value;
}

export function resetFeatureFlags(): void {
  _featureFlags = { ...DEFAULT_FLAGS };
}

// Expose sur window pour debug
if (typeof window !== 'undefined') {
  (window as any).__FF_FEATURES = _featureFlags;
  (window as any).__FF_TOGGLE_FEATURE = setFeatureFlag;
}

// ============================================================
// INTEGRATED GAME MANAGER
// ============================================================

export class IntegratedGameManager {
  private xylos: XylosSystem;
  private messages: DynamicMessageSystem;
  private narrativeObstacles: NarrativeObstacleSystem;
  private currentSkin: GameplaySkin;
  private flags: FeatureFlags;

  // Stats tracking
  private runStats = {
    fails: 0,
    nearMisses: 0,
    skillMoments: 0,
  };

  constructor() {
    this.xylos = getXylosSystem();
    this.messages = new DynamicMessageSystem();
    this.narrativeObstacles = new NarrativeObstacleSystem();
    this.currentSkin = getSelectedSkin();
    this.flags = getFeatureFlags();
  }

  /**
   * Initialiser une nouvelle run
   */
  startRun(): void {
    this.currentSkin = getSelectedSkin();
    this.runStats = { fails: 0, nearMisses: 0, skillMoments: 0 };
    this.messages.clear();
    this.narrativeObstacles.clear();
  }

  /**
   * Update tous les systèmes
   */
  update(dt: number, playerX: number, playerY: number): void {
    // Update Xylos
    if (this.flags.xylos) {
      this.xylos.update(dt);
    }

    // Update messages
    if (this.flags.dynamicMessages) {
      this.messages.update(dt);
    }

    // Update narrative obstacles
    if (this.flags.narrativeObstacles) {
      const { warnings, effects } = this.narrativeObstacles.update(dt, playerX, playerY);
      
      // Afficher warnings
      if (this.flags.dynamicMessages) {
        warnings.forEach(w => {
          this.messages.show('obstacle_warn', w.message);
        });
      }

      // Retourner les effets pour application dans le jeu principal
      return effects;
    }
  }

  /**
   * Render tous les systèmes visuels
   */
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Render narrative obstacles
    if (this.flags.narrativeObstacles) {
      this.narrativeObstacles.render(ctx);
    }

    // Render dynamic messages
    if (this.flags.dynamicMessages) {
      this.messages.render(ctx, width, height);
    }

    // Render Xylos indicator (optionnel, petit indicateur en haut)
    if (this.flags.xylos) {
      this.renderXylosIndicator(ctx, width, height);
    }
  }

  /**
   * Render indicateur Xylos (petit, non intrusif)
   */
  private renderXylosIndicator(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const data = this.xylos.getData();
    const msg = this.xylos.getCurrentMessage();

    if (msg) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = this.xylos.getStateColor();
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.xylos.getStateColor();
      ctx.fillText(msg, width / 2, 30);
      ctx.restore();
    }
  }

  /**
   * Événement: Near miss
   */
  onNearMiss(distance: number): void {
    this.runStats.nearMisses++;
    
    if (this.flags.dynamicMessages && Math.random() < 0.3) {
      this.messages.show('near_miss');
    }
  }

  /**
   * Événement: Fail / Collision
   */
  onFail(): void {
    this.runStats.fails++;
    
    // Xylos: ajouter échos
    if (this.flags.xylos) {
      const multiplier = this.flags.gameplaySkins ? this.currentSkin.modifiers.xylosEchoMultiplier : 1.0;
      this.xylos.addEchoes(Math.floor(1 * multiplier));
    }

    // Message
    if (this.flags.dynamicMessages) {
      this.messages.show('fail');
    }
  }

  /**
   * Événement: Skill moment (combo, performance)
   */
  onSkillMoment(combo: number): void {
    this.runStats.skillMoments++;
    
    if (this.flags.dynamicMessages && combo >= 5 && combo % 5 === 0) {
      this.messages.show('skill');
    }
  }

  /**
   * Événement: Score gagné
   */
  onScoreGained(amount: number): void {
    if (this.flags.xylos) {
      const multiplier = this.flags.gameplaySkins ? this.currentSkin.modifiers.scoreMultiplier : 1.0;
      this.xylos.addLight(amount * multiplier);
    }
  }

  /**
   * Spawn un obstacle narratif
   */
  spawnNarrativeObstacle(type: NarrativeObstacleType, x: number, y: number): void {
    if (!this.flags.narrativeObstacles) return;
    
    const obstacle = createNarrativeObstacle(type, x, y, -100, 0);
    this.narrativeObstacles.add(obstacle);
  }

  /**
   * Obtenir les modificateurs du skin actuel
   */
  getSkinModifiers(): SkinModifiers {
    if (!this.flags.gameplaySkins) {
      return this.currentSkin.modifiers; // Retourne modifiers par défaut
    }
    return this.currentSkin.modifiers;
  }

  /**
   * Obtenir le skin actuel
   */
  getCurrentSkin(): GameplaySkin {
    return this.currentSkin;
  }

  /**
   * Obtenir les stats de la run
   */
  getRunStats() {
    return { ...this.runStats };
  }

  /**
   * Obtenir le système Xylos
   */
  getXylosSystem(): XylosSystem {
    return this.xylos;
  }

  /**
   * Obtenir le système de messages
   */
  getMessageSystem(): DynamicMessageSystem {
    return this.messages;
  }

  /**
   * Obtenir le système d'obstacles narratifs
   */
  getNarrativeObstacleSystem(): NarrativeObstacleSystem {
    return this.narrativeObstacles;
  }

  /**
   * Vérifier collision avec event horizon
   */
  checkEventHorizonCollision(playerX: number, playerY: number): boolean {
    if (!this.flags.narrativeObstacles) return false;
    return this.narrativeObstacles.checkEventHorizonCollision(playerX, playerY);
  }
}

// ============================================================
// SINGLETON
// ============================================================

let _managerInstance: IntegratedGameManager | null = null;

export function getIntegratedGameManager(): IntegratedGameManager {
  if (!_managerInstance) {
    _managerInstance = new IntegratedGameManager();
  }
  return _managerInstance;
}

export function resetIntegratedGameManager(): void {
  _managerInstance = new IntegratedGameManager();
}
