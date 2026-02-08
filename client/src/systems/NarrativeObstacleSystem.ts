/**
 * FAIL FRENZY — NARRATIVE OBSTACLE SYSTEM
 * 
 * Nouveaux obstacles avec comportements narratifs:
 * - Vortex instable (attraction douce)
 * - Fissures de flux (distorsion trajectoire)
 * - Mini trous noirs narratifs
 * 
 * Messages dynamiques à l'approche
 */

import { Entity } from '../engine/GameEngine';

// ============================================================
// TYPES
// ============================================================

export type NarrativeObstacleType = 'vortex' | 'fissure' | 'mini_black_hole';

export interface NarrativeObstacle extends Entity {
  obstacleType: NarrativeObstacleType;
  warningRadius: number;      // Distance pour déclencher warning
  effectRadius: number;       // Distance pour effet gameplay
  warningShown: boolean;
  rotation: number;
  pulsePhase: number;
  intensity: number;          // 0-1
}

// ============================================================
// OBSTACLE DEFINITIONS
// ============================================================

export const NARRATIVE_OBSTACLE_CONFIG = {
  vortex: {
    color: '#9400d3',
    glowColor: '#ff00ff',
    warningRadius: 120,
    effectRadius: 80,
    pullStrength: 0.3,        // Force d'attraction (0-1)
    rotationSpeed: 2.0,       // rad/s
    messages: [
      'BAD IDEA',
      'TURN BACK',
      'UNSTABLE VORTEX',
    ],
  },
  fissure: {
    color: '#00ffff',
    glowColor: '#00aaff',
    warningRadius: 100,
    effectRadius: 60,
    distortionStrength: 0.5,  // Force de distorsion
    flickerSpeed: 5.0,
    messages: [
      'YOU LOOK LOST',
      'FLUX UNSTABLE',
      'REALITY FRACTURE',
    ],
  },
  mini_black_hole: {
    color: '#000000',
    glowColor: '#8844ff',
    warningRadius: 150,
    effectRadius: 100,
    pullStrength: 0.6,
    eventHorizon: 30,         // Rayon de mort instantanée
    messages: [
      'TOO CURIOUS',
      'NO ESCAPE',
      'SINGULARITY AHEAD',
    ],
  },
};

// ============================================================
// OBSTACLE FACTORY
// ============================================================

export function createNarrativeObstacle(
  type: NarrativeObstacleType,
  x: number,
  y: number,
  vx: number = 0,
  vy: number = 0
): NarrativeObstacle {
  const config = NARRATIVE_OBSTACLE_CONFIG[type];
  
  let width = 40;
  let height = 40;
  
  if (type === 'fissure') {
    width = 60;
    height = 20;
  } else if (type === 'mini_black_hole') {
    width = 50;
    height = 50;
  }

  return {
    x,
    y,
    vx,
    vy,
    width,
    height,
    obstacleType: type,
    warningRadius: config.warningRadius,
    effectRadius: config.effectRadius,
    warningShown: false,
    rotation: 0,
    pulsePhase: Math.random() * Math.PI * 2,
    intensity: 1.0,
  };
}

// ============================================================
// OBSTACLE BEHAVIOR
// ============================================================

export class NarrativeObstacleSystem {
  private obstacles: NarrativeObstacle[] = [];

  constructor() {}

  /**
   * Ajouter un obstacle
   */
  add(obstacle: NarrativeObstacle): void {
    this.obstacles.push(obstacle);
  }

  /**
   * Retirer un obstacle
   */
  remove(obstacle: NarrativeObstacle): void {
    const index = this.obstacles.indexOf(obstacle);
    if (index !== -1) {
      this.obstacles.splice(index, 1);
    }
  }

  /**
   * Update obstacles
   */
  update(dt: number, playerX: number, playerY: number): {
    warnings: Array<{ type: NarrativeObstacleType; message: string }>;
    effects: Array<{ type: NarrativeObstacleType; force: { x: number; y: number } }>;
  } {
    const warnings: Array<{ type: NarrativeObstacleType; message: string }> = [];
    const effects: Array<{ type: NarrativeObstacleType; force: { x: number; y: number } }> = [];

    // Clean up off-screen obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      if (this.obstacles[i].x < -200 || this.obstacles[i].x > 1200) {
        this.obstacles.splice(i, 1);
      }
    }

    for (const obs of this.obstacles) {
      // Update position
      obs.x += obs.vx * dt;
      obs.y += obs.vy * dt;

      // Update animation
      const config = NARRATIVE_OBSTACLE_CONFIG[obs.obstacleType];
      obs.pulsePhase += dt * 3.0;
      
      if (obs.obstacleType === 'vortex') {
        obs.rotation += dt * config.rotationSpeed;
      } else if (obs.obstacleType === 'fissure') {
        obs.intensity = 0.5 + Math.sin(obs.pulsePhase * config.flickerSpeed) * 0.5;
      }

      // Check distance to player
      const dx = playerX - obs.x;
      const dy = playerY - obs.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Warning message
      if (distance < obs.warningRadius && !obs.warningShown) {
        obs.warningShown = true;
        const messages = config.messages;
        const message = messages[Math.floor(Math.random() * messages.length)];
        warnings.push({ type: obs.obstacleType, message });
      }

      // Reset warning when far
      if (distance > obs.warningRadius * 1.5) {
        obs.warningShown = false;
      }

      // Apply effects
      if (distance < obs.effectRadius) {
        const force = this.calculateEffect(obs, dx, dy, distance);
        if (force) {
          effects.push({ type: obs.obstacleType, force });
        }
      }
    }

    return { warnings, effects };
  }

  /**
   * Calculer l'effet de l'obstacle sur le joueur
   */
  private calculateEffect(
    obs: NarrativeObstacle,
    dx: number,
    dy: number,
    distance: number
  ): { x: number; y: number } | null {
    const config = NARRATIVE_OBSTACLE_CONFIG[obs.obstacleType];

    if (obs.obstacleType === 'vortex') {
      // Attraction vers le centre
      const strength = config.pullStrength * (1 - distance / obs.effectRadius);
      const angle = Math.atan2(dy, dx);
      return {
        x: -Math.cos(angle) * strength,
        y: -Math.sin(angle) * strength,
      };
    }

    if (obs.obstacleType === 'mini_black_hole') {
      // Attraction forte
      const strength = config.pullStrength * (1 - distance / obs.effectRadius);
      const angle = Math.atan2(dy, dx);
      return {
        x: -Math.cos(angle) * strength * 2,
        y: -Math.sin(angle) * strength * 2,
      };
    }

    if (obs.obstacleType === 'fissure') {
      // Distorsion perpendiculaire
      const strength = config.distortionStrength * (1 - distance / obs.effectRadius);
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      return {
        x: Math.cos(angle) * strength * Math.sin(obs.pulsePhase),
        y: Math.sin(angle) * strength * Math.sin(obs.pulsePhase),
      };
    }

    return null;
  }

  /**
   * Render obstacles
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const obs of this.obstacles) {
      this.renderObstacle(ctx, obs);
    }
  }

  /**
   * Render un obstacle spécifique
   */
  private renderObstacle(ctx: CanvasRenderingContext2D, obs: NarrativeObstacle): void {
    const config = NARRATIVE_OBSTACLE_CONFIG[obs.obstacleType];

    ctx.save();
    ctx.translate(obs.x, obs.y);

    if (obs.obstacleType === 'vortex') {
      this.renderVortex(ctx, obs, config);
    } else if (obs.obstacleType === 'fissure') {
      this.renderFissure(ctx, obs, config);
    } else if (obs.obstacleType === 'mini_black_hole') {
      this.renderBlackHole(ctx, obs, config);
    }

    ctx.restore();
  }

  private renderVortex(ctx: CanvasRenderingContext2D, obs: NarrativeObstacle, config: any): void {
    ctx.rotate(obs.rotation);

    // Spirale
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = config.glowColor;

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const spiralAngle = (i / 3) * Math.PI * 2;
      for (let r = 0; r < obs.width; r += 2) {
        const angle = spiralAngle + (r / obs.width) * Math.PI * 4;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (r === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Centre pulsant
    const pulse = 0.7 + Math.sin(obs.pulsePhase) * 0.3;
    ctx.fillStyle = config.glowColor;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderFissure(ctx: CanvasRenderingContext2D, obs: NarrativeObstacle, config: any): void {
    ctx.globalAlpha = obs.intensity;

    // Ligne centrale
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = config.glowColor;

    ctx.beginPath();
    ctx.moveTo(-obs.width / 2, 0);
    
    // Ligne ondulée
    for (let x = -obs.width / 2; x < obs.width / 2; x += 5) {
      const y = Math.sin(x * 0.2 + obs.pulsePhase) * 5;
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Particules autour
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * obs.width;
      const y = (Math.random() - 0.5) * obs.height;
      ctx.fillStyle = config.glowColor;
      ctx.globalAlpha = Math.random() * obs.intensity;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderBlackHole(ctx: CanvasRenderingContext2D, obs: NarrativeObstacle, config: any): void {
    // Event horizon (noir absolu)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, config.eventHorizon, 0, Math.PI * 2);
    ctx.fill();

    // Accretion disk
    const rings = 5;
    for (let i = 0; i < rings; i++) {
      const radius = config.eventHorizon + (i + 1) * 8;
      const alpha = 1 - (i / rings);
      
      ctx.strokeStyle = config.glowColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha * (0.5 + Math.sin(obs.pulsePhase + i) * 0.5);
      ctx.shadowBlur = 10;
      ctx.shadowColor = config.glowColor;
      
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Particules en orbite
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + obs.pulsePhase;
      const radius = config.eventHorizon + 20 + Math.sin(obs.pulsePhase * 2 + i) * 10;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      ctx.fillStyle = config.glowColor;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Obtenir tous les obstacles
   */
  getObstacles(): NarrativeObstacle[] {
    return this.obstacles;
  }

  /**
   * Clear tous les obstacles
   */
  clear(): void {
    this.obstacles = [];
  }

  /**
   * Vérifier collision avec event horizon (mini black hole)
   */
  checkEventHorizonCollision(playerX: number, playerY: number): boolean {
    for (const obs of this.obstacles) {
      if (obs.obstacleType === 'mini_black_hole') {
        const config = NARRATIVE_OBSTACLE_CONFIG.mini_black_hole;
        const dx = playerX - obs.x;
        const dy = playerY - obs.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < config.eventHorizon) {
          return true; // Mort instantanée
        }
      }
    }
    return false;
  }
}
