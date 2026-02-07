/**
 * FAIL FRENZY PREMIUM v5.0 — VISUAL IDENTITY ENGINE
 * 
 * Player Identity: losange/diamond shape, parameterized trail, breathing glow
 * Obstacle Variety: Dasher (yellow), Orbiter (purple), Shaker (cyan)
 * Collision Feedback: particle burst, screen shake, chromatic aberration
 * Config System: JSON toggles via CONFIG.ts
 * Debug Mode: hitboxes, FPS, entity count, obstacle types
 * Particle Pooling: zero GC spikes, 60 FPS mobile
 * 
 * CONSTRAINT: Core collision system UNCHANGED (simpleCollision)
 * CONSTRAINT: Hitbox sizes UNCHANGED (game balance preserved)
 */

import { GameEngine, Entity, GameState } from '../engine/GameEngine';
import { NeonRenderer } from '../engine/NeonRenderer';
import { PhysicsSystem } from '../engine/PhysicsSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { PowerUpSystem, PowerUp } from '../systems/PowerUpSystem';
import { AssetLoader } from './AssetLoader';
import { getConfig, pickObstacleType, type GameConfig } from './CONFIG';
import { getSelectedSkin, type SkinDefinition } from './SkinSystem';

// ============================================================
// TYPES
// ============================================================

export interface GameMode {
  name: string;
  description: string;
  duration?: number;
  seed?: number;
  difficulty: number;
}

type ObstacleKind = 'dasher' | 'orbiter' | 'shaker';

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
  color: string;
}

interface HitEffect {
  x: number;
  y: number;
  alpha: number;
  scale: number;
  rotation: number;
}

interface AfterImage {
  x: number;
  y: number;
  alpha: number;
  width: number;
  height: number;
  color: string;
  kind: ObstacleKind;
}

interface ChromaticFlash {
  intensity: number;
  duration: number;
  elapsed: number;
}

// ============================================================
// OBSTACLE COLORS & SHAPES
// ============================================================

const OBSTACLE_PALETTE: Record<ObstacleKind, { primary: string; secondary: string; glow: string }> = {
  dasher:  { primary: '#ffdd00', secondary: '#ff8800', glow: '#ffdd00' },
  orbiter: { primary: '#9400d3', secondary: '#ff00ff', glow: '#bb44ff' },
  shaker:  { primary: '#00ffff', secondary: '#00aaff', glow: '#00ffff' },
};

// ============================================================
// PARTICLE POOL — Pre-allocated, zero GC
// ============================================================

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  gravity: number;
}

class ParticlePool {
  private pool: PooledParticle[];
  private capacity: number;

  constructor(capacity: number = 600) {
    this.capacity = capacity;
    this.pool = [];
    for (let i = 0; i < capacity; i++) {
      this.pool.push(this.createEmpty());
    }
  }

  private createEmpty(): PooledParticle {
    return { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 3, color: '#fff', alpha: 1, gravity: 0 };
  }

  emit(x: number, y: number, count: number, color: string, speedMin: number, speedMax: number, sizeMin: number, sizeMax: number, lifeMin: number, lifeMax: number, gravity: number = 0): void {
    let spawned = 0;
    for (let i = 0; i < this.capacity && spawned < count; i++) {
      const p = this.pool[i];
      if (!p.active) {
        const angle = Math.random() * Math.PI * 2;
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = lifeMin + Math.random() * (lifeMax - lifeMin);
        p.maxLife = p.life;
        p.size = sizeMin + Math.random() * (sizeMax - sizeMin);
        p.color = color;
        p.alpha = 1;
        p.gravity = gravity;
        spawned++;
      }
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.capacity; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      p.vy += p.gravity * dt * 400;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) p.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.capacity; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  getActiveCount(): number {
    let c = 0;
    for (let i = 0; i < this.capacity; i++) {
      if (this.pool[i].active) c++;
    }
    return c;
  }

  clear(): void {
    for (let i = 0; i < this.capacity; i++) {
      this.pool[i].active = false;
    }
  }
}

// ============================================================
// MAIN GAME CLASS
// ============================================================

export class FailFrenzyGame {
  private engine: GameEngine;
  private renderer: NeonRenderer;
  private physics: PhysicsSystem;

  // Premium systems
  private audio: AudioSystem;
  private combo: ComboSystem;
  private difficulty: DifficultySystem;
  private particles: ParticleSystem;
  private powerups: PowerUpSystem;

  // Pooled particles for collision VFX (zero GC)
  private vfxPool: ParticlePool;

  // Asset loader
  private assets: AssetLoader;

  // Config reference
  private cfg: GameConfig;

  private player: Entity | null;
  private obstacles: Entity[];
  private collectibles: Entity[];
  private activePowerUps: PowerUp[];

  private mode: GameMode;
  private spawnTimer: number;
  private powerUpSpawnTimer: number;
  private nearMissDistance: number = 50;

  // Player trail (pooled ring buffer)
  private playerTrail: TrailPoint[] = [];

  // Visual state
  private screenFlash: { color: string; alpha: number } | null = null;
  private backgroundPulse: number = 0;
  private difficultyLabel: string = 'EASY';
  private showDifficultyLabel: number = 0;

  // Hit effects
  private hitEffects: HitEffect[] = [];

  // After-image pool for Shaker
  private afterImages: AfterImage[] = [];

  // Chromatic aberration flash
  private chromaFlash: ChromaticFlash | null = null;

  // Screen shake state (separate from engine shake for fine control)
  private shakeOffset: { x: number; y: number } = { x: 0, y: 0 };
  private shakeTimer: number = 0;

  // Orbiter anchor points
  private orbiterAnchors: Map<string, { cx: number; cy: number; angle: number; radius: number }> = new Map();

  // Dasher dash state
  private dasherTimers: Map<string, { timer: number; dashing: boolean; dashTimer: number }> = new Map();

  // Active skin
  private activeSkin: SkinDefinition;

  // FPS tracking for debug
  private fpsHistory: number[] = [];
  private lastFrameTime: number = 0;

  // localStorage
  private highScores: Map<string, number> = new Map();

  constructor(canvasId: string, mode: GameMode, assets: AssetLoader) {
    this.assets = assets;
    this.cfg = getConfig();

    this.engine = new GameEngine(canvasId, {
      width: 800,
      height: 600,
      fps: 60,
      backgroundColor: '#050818',
      debug: false,
    });

    this.renderer = new NeonRenderer(
      this.engine['ctx'],
      this.engine['config'].width,
      this.engine['config'].height
    );

    this.physics = new PhysicsSystem({ x: 0, y: 0 }, 0.98);

    // Initialize premium systems
    this.audio = new AudioSystem();
    this.audio.init();
    this.combo = new ComboSystem();
    this.difficulty = new DifficultySystem({
      baseSpeed: 200,
      maxSpeed: 550,
      baseSpawnRate: 2.0,
      minSpawnRate: 0.4,
    });
    this.particles = new ParticleSystem(800);
    this.powerups = new PowerUpSystem();
    this.vfxPool = new ParticlePool(600);

    this.player = null;
    this.obstacles = [];
    this.collectibles = [];
    this.activePowerUps = [];

    this.mode = mode;
    this.spawnTimer = 0;
    this.powerUpSpawnTimer = 0;

    this.activeSkin = getSelectedSkin();
    this.loadHighScores();
    this.init();
  }

  private init(): void {
    this.createPlayer();
    this.engine.addSystem(this.updateGameLogic.bind(this));
    this.engine.addSystem(this.renderGame.bind(this));
    this.setupInputHandlers();

    if (this.mode.seed !== undefined) {
      this.seedRandom(this.mode.seed);
    }

    this.engine.setState({
      mode: this.getModeType(),
      seed: this.mode.seed,
    });

    // Setup combo callbacks
    this.combo.onCombo((level, count) => {
      if (count > 0 && count % 10 === 0) {
        this.screenFlash = { color: this.combo.getLevelColor(), alpha: 0.3 };
        this.audio.playCombo(count);
      }
    });
  }

  private getModeType(): 'classic' | 'time-trial' | 'infinite' | 'seed' {
    const name = this.mode.name.toLowerCase();
    if (name.includes('time')) return 'time-trial';
    if (name.includes('infinite')) return 'infinite';
    if (name.includes('seed')) return 'seed';
    return 'classic';
  }

  private createPlayer(): void {
    this.player = {
      id: 'player',
      type: 'player',
      x: 120,
      y: 300,
      width: 48,
      height: 48,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.CYAN,
      components: new Map<string, any>([
        ['maxSpeed', 500],
        ['collisionShape', 'circle'],
        ['mass', 1],
        ['invincible', false],
        ['ghost', false],
      ]),
    };
    this.engine.addEntity(this.player);
  }

  // ==================== INPUT ====================

  private setupInputHandlers(): void {
    let isPressed = false;
    let targetY = 300;
    let targetX = 120;

    this.engine.on('input', (data: any) => {
      if (!this.player || this.engine.getState().isGameOver) return;

      if (data.type === 'touchstart' || data.type === 'mousedown') {
        isPressed = true;
        targetY = data.y;
        targetX = data.x;
      } else if (data.type === 'touchmove' || data.type === 'mousemove') {
        if (isPressed) {
          targetY = data.y;
          targetX = data.x;
        }
      } else if (data.type === 'touchend' || data.type === 'mouseup') {
        isPressed = false;
      }

      if (isPressed && this.player) {
        this.player.y += (targetY - this.player.y) * 0.15;
        this.player.x += (targetX - this.player.x) * 0.08;
      }
    });

    this.engine.on('keyboard', (data: any) => {
      if (!this.player) return;

      const speed = 12;
      if (data.type === 'keydown') {
        switch (data.key) {
          case 'ArrowUp': case 'w': case 'z':
            this.player.velocity.y = -speed;
            break;
          case 'ArrowDown': case 's':
            this.player.velocity.y = speed;
            break;
          case 'ArrowLeft': case 'a': case 'q':
            this.player.velocity.x = -speed;
            break;
          case 'ArrowRight': case 'd':
            this.player.velocity.x = speed;
            break;
          case ' ':
            if (this.engine.getState().isGameOver) {
              this.restart();
            }
            break;
          case 'Escape':
            if (this.engine.getState().isPaused) {
              this.engine.resume();
            } else {
              this.engine.pause();
            }
            break;
        }
      }
    });
  }

  // ==================== GAME LOGIC ====================

  private updateGameLogic(dt: number): void {
    const state = this.engine.getState();
    if (state.isGameOver) return;

    // Refresh config reference (allows hot-reload from console)
    this.cfg = getConfig();

    // Time trial check
    if (this.mode.duration && state.time >= this.mode.duration) {
      this.gameOver(true);
      return;
    }

    // Update all systems
    this.difficulty.progressTime(dt);
    this.combo.update(dt);
    this.particles.update(dt);
    this.powerups.update(dt);
    this.vfxPool.update(dt);

    // Check difficulty label change
    const newLabel = this.difficulty.getDifficultyLabel();
    if (newLabel !== this.difficultyLabel) {
      this.difficultyLabel = newLabel;
      this.showDifficultyLabel = 2.0;
      this.screenFlash = { color: this.difficulty.getDifficultyColor(), alpha: 0.2 };
    }
    if (this.showDifficultyLabel > 0) this.showDifficultyLabel -= dt;

    // Update screen flash
    if (this.screenFlash) {
      this.screenFlash.alpha -= dt * 2;
      if (this.screenFlash.alpha <= 0) this.screenFlash = null;
    }

    // Update hit effects
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      const fx = this.hitEffects[i];
      fx.alpha -= dt * 3;
      fx.scale += dt * 4;
      fx.rotation += dt * 5;
      if (fx.alpha <= 0) this.hitEffects.splice(i, 1);
    }

    // Update after-images (Shaker VFX)
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      this.afterImages[i].alpha -= dt * 4;
      if (this.afterImages[i].alpha <= 0) this.afterImages.splice(i, 1);
    }

    // Update chromatic aberration flash
    if (this.chromaFlash) {
      this.chromaFlash.elapsed += dt;
      if (this.chromaFlash.elapsed >= this.chromaFlash.duration) {
        this.chromaFlash = null;
      }
    }

    // Update screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt * 1000;
      const amp = this.cfg.vfx.screenShakeAmplitude;
      this.shakeOffset.x = (Math.random() - 0.5) * amp * 2;
      this.shakeOffset.y = (Math.random() - 0.5) * amp * 2;
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }

    // Background pulse
    this.backgroundPulse = Math.sin(state.time * 2) * 0.03;

    // Spawn obstacles
    this.spawnTimer += dt;
    const spawnInterval = this.difficulty.getSpawnInterval();
    if (this.spawnTimer >= spawnInterval) {
      this.spawnObstacle();
      this.spawnTimer = 0;
    }

    // Spawn power-ups
    this.powerUpSpawnTimer += dt;
    if (this.powerUpSpawnTimer >= 8 + Math.random() * 7) {
      this.spawnPowerUp();
      this.powerUpSpawnTimer = 0;
    }

    // Update entities
    if (this.player) this.updatePlayer(dt);
    this.updateObstacles(dt);
    this.updateCollectibles(dt);
    this.checkCollisions();
    this.constrainPlayer();

    // Sync score
    this.engine.setState({ score: this.combo.getScore() });
  }

  // ==================== PLAYER UPDATE ====================

  private updatePlayer(dt: number): void {
    if (!this.player) return;

    this.player.velocity.x *= 0.88;
    this.player.velocity.y *= 0.88;

    // Breathing glow effect (scale 0.95-1.05, 1s loop)
    if (this.cfg.player.breathingGlow) {
      const t = this.engine.getState().time * Math.PI * 2 * this.cfg.player.breathingSpeed;
      const comboState = this.combo.getState();
      const comboBoost = comboState.current * 0.002;
      const breathMin = this.cfg.player.breathingMin;
      const breathMax = this.cfg.player.breathingMax;
      const mid = (breathMin + breathMax) / 2;
      const amp = (breathMax - breathMin) / 2 + comboBoost;
      this.player.scale = mid + Math.sin(t) * amp;
    }

    // Player trail
    if (this.cfg.player.trailEnabled) {
      const moving = Math.abs(this.player.velocity.x) > 0.5 || Math.abs(this.player.velocity.y) > 0.5;
      // Always emit trail but slower when stationary
      if (moving || Math.random() < 0.3) {
        this.playerTrail.push({
          x: this.player.x,
          y: this.player.y,
          alpha: 1.0,
          size: this.player.width * 0.4,
          color: this.cfg.player.trailColor,
        });
      }

      // Update trail
      for (let i = this.playerTrail.length - 1; i >= 0; i--) {
        this.playerTrail[i].alpha -= this.cfg.player.trailFade;
        if (this.playerTrail[i].alpha <= 0) {
          this.playerTrail.splice(i, 1);
        }
      }

      // Cap trail length
      while (this.playerTrail.length > this.cfg.player.trailLength) {
        this.playerTrail.shift();
      }
    }

    // Legacy particle trail (for combo visual feedback)
    if (Math.abs(this.player.velocity.x) > 1 || Math.abs(this.player.velocity.y) > 1) {
      this.particles.trail(this.player.x, this.player.y, this.player.color);
    }
  }

  // ==================== OBSTACLE SPAWNING ====================

  private spawnObstacle(): void {
    const kind = pickObstacleType();
    const palette = OBSTACLE_PALETTE[kind];
    const size = 36 + Math.random() * 20;
    const y = 40 + Math.random() * 520;

    const obstacle: Entity = {
      id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'obstacle',
      x: 850,
      y,
      width: size,
      height: size,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI,
      scale: 1,
      alive: true,
      color: palette.primary,
      components: new Map<string, any>([
        ['collisionShape', 'circle'],
        ['obstacleKind', kind],
        ['moveType', kind === 'shaker' ? 'sine' : 'linear'],
      ]),
    };

    this.engine.addEntity(obstacle);
    this.obstacles.push(obstacle);

    // Initialize kind-specific state
    if (kind === 'orbiter') {
      this.orbiterAnchors.set(obstacle.id, {
        cx: obstacle.x,
        cy: obstacle.y,
        angle: Math.random() * Math.PI * 2,
        radius: 40 + Math.random() * 30,
      });
    }

    if (kind === 'dasher') {
      this.dasherTimers.set(obstacle.id, {
        timer: 0,
        dashing: false,
        dashTimer: 0,
      });
    }

    // Collectible chance
    if (Math.random() < 0.2) {
      this.spawnCollectible(y);
    }
  }

  private spawnCollectible(avoidY: number): void {
    let y = 50 + Math.random() * 500;
    while (Math.abs(y - avoidY) < 80) {
      y = 50 + Math.random() * 500;
    }

    const collectible: Entity = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'collectible',
      x: 850,
      y,
      width: 24,
      height: 24,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.YELLOW,
      components: new Map<string, any>([['collisionShape', 'circle']]),
    };

    this.engine.addEntity(collectible);
    this.collectibles.push(collectible);
  }

  private spawnPowerUp(): void {
    const y = 60 + Math.random() * 480;
    const powerUp: Entity = {
      id: `pw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'powerup',
      x: 850,
      y,
      width: 36,
      height: 36,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.GREEN,
      components: new Map<string, any>([
        ['collisionShape', 'circle'],
        ['powerType', ['shield', 'slowmo', 'multiplier', 'shrink'][Math.floor(Math.random() * 4)]],
      ]),
    };

    this.engine.addEntity(powerUp);
    this.collectibles.push(powerUp);
  }

  // ==================== OBSTACLE UPDATE (BEHAVIORS) ====================

  private updateObstacles(dt: number): void {
    const baseSpeed = this.difficulty.getObstacleSpeed();
    const time = this.engine.getState().time;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      const kind: ObstacleKind = obstacle.components.get('obstacleKind') || 'dasher';

      // === DASHER: moves left, accelerates x1.5 for 0.3s every 2s ===
      if (kind === 'dasher') {
        let state = this.dasherTimers.get(obstacle.id);
        if (!state) {
          state = { timer: 0, dashing: false, dashTimer: 0 };
          this.dasherTimers.set(obstacle.id, state);
        }

        state.timer += dt;
        if (!state.dashing && state.timer >= 2.0) {
          state.dashing = true;
          state.dashTimer = 0;
          state.timer = 0;
        }
        if (state.dashing) {
          state.dashTimer += dt;
          if (state.dashTimer >= 0.3) {
            state.dashing = false;
          }
        }

        const speedMult = state.dashing ? 1.5 : 1.0;
        obstacle.x -= baseSpeed * speedMult * dt;
        obstacle.rotation += dt * 3;

        // Motion blur trail VFX for Dasher
        if (state.dashing && this.cfg.vfx.motionBlurTrail) {
          this.afterImages.push({
            x: obstacle.x + 15,
            y: obstacle.y,
            alpha: 0.5,
            width: obstacle.width,
            height: obstacle.height,
            color: OBSTACLE_PALETTE.dasher.primary,
            kind: 'dasher',
          });
        }
      }

      // === ORBITER: rotates around a fixed point that moves left ===
      else if (kind === 'orbiter') {
        let anchor = this.orbiterAnchors.get(obstacle.id);
        if (!anchor) {
          anchor = { cx: obstacle.x, cy: obstacle.y, angle: 0, radius: 50 };
          this.orbiterAnchors.set(obstacle.id, anchor);
        }

        // Anchor moves left
        anchor.cx -= baseSpeed * dt;
        anchor.angle += dt * 2.5;

        // Orbit around anchor
        obstacle.x = anchor.cx + Math.cos(anchor.angle) * anchor.radius;
        obstacle.y = anchor.cy + Math.sin(anchor.angle) * anchor.radius;
        obstacle.rotation += dt * 2;
      }

      // === SHAKER: moves left with rapid sine oscillation (+-10px) ===
      else if (kind === 'shaker') {
        obstacle.x -= baseSpeed * dt;
        obstacle.y += Math.sin(time * 12 + i * 3) * 10 * dt * 8;
        obstacle.rotation += dt * 1.5;

        // After-image effect for Shaker
        if (this.cfg.vfx.afterImageEffect && Math.random() < 0.4) {
          this.afterImages.push({
            x: obstacle.x,
            y: obstacle.y,
            alpha: 0.35,
            width: obstacle.width,
            height: obstacle.height,
            color: OBSTACLE_PALETTE.shaker.primary,
            kind: 'shaker',
          });
        }
      }

      // Remove off-screen
      if (obstacle.x < -100 || (kind === 'orbiter' && (this.orbiterAnchors.get(obstacle.id)?.cx ?? 0) < -150)) {
        this.engine.removeEntity(obstacle.id);
        this.obstacles.splice(i, 1);
        this.orbiterAnchors.delete(obstacle.id);
        this.dasherTimers.delete(obstacle.id);

        // Near miss / dodge scoring
        if (this.player) {
          const dist = Math.abs(this.player.y - obstacle.y);
          if (dist < this.nearMissDistance) {
            this.combo.addScore('nearMiss', this.player.x + 40, this.player.y);
            this.difficulty.recordDodge();
            this.audio.playDodge();
          } else {
            this.combo.addScore('dodge', this.player.x + 40, this.player.y);
            this.difficulty.recordDodge();
            this.audio.playDodge();
          }
        }
      }
    }
  }

  private updateCollectibles(dt: number): void {
    const speed = this.difficulty.getObstacleSpeed();

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      collectible.x -= speed * dt;
      collectible.y += Math.sin(this.engine.getState().time * 3 + i) * 1.5;
      collectible.rotation += dt * 3;

      if (collectible.x < -100) {
        this.engine.removeEntity(collectible.id);
        this.collectibles.splice(i, 1);
      }
    }
  }

  // ==================== COLLISION (UNCHANGED CORE) ====================

  private checkCollisions(): void {
    if (!this.player) return;

    const isInvincible = this.player.components.get('invincible');
    const isGhost = this.player.components.get('ghost');

    // Obstacle collisions
    for (const obstacle of this.obstacles) {
      if (this.simpleCollision(this.player, obstacle)) {
        if (!isInvincible && !isGhost) {
          const kind: ObstacleKind = obstacle.components.get('obstacleKind') || 'dasher';
          this.spawnCollisionFeedback(
            (this.player.x + obstacle.x) / 2,
            (this.player.y + obstacle.y) / 2,
            kind
          );
          this.onFail();
          return;
        } else {
          this.spawnHitEffect(obstacle.x, obstacle.y);
          this.particles.explosion(obstacle.x, obstacle.y, obstacle.color);
          this.audio.playFail();
          obstacle.alive = false;
        }
      }
    }

    // Collectible collisions
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      if (this.simpleCollision(this.player, col)) {
        if (col.type === 'powerup') {
          this.activatePowerUp(col);
        } else {
          this.collectItem(col);
        }
        this.collectibles.splice(i, 1);
        this.engine.removeEntity(col.id);
      }
    }

    // Clean dead obstacles
    this.obstacles = this.obstacles.filter(o => o.alive);
  }

  /** Core collision — UNCHANGED, hitbox sizes preserved */
  private simpleCollision(a: Entity, b: Entity): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (a.width / 2 + b.width / 2) * 0.75;
  }

  // ==================== COLLISION FEEDBACK ====================

  private spawnCollisionFeedback(x: number, y: number, kind: ObstacleKind): void {
    const palette = OBSTACLE_PALETTE[kind];

    // 1. Particle burst (10-15 particles, obstacle color)
    if (this.cfg.vfx.collisionParticles) {
      const count = this.cfg.vfx.collisionParticleCount;
      this.vfxPool.emit(x, y, count, palette.primary, 100, 350, 2, 8, 0.3, 0.8, 0.3);
      this.vfxPool.emit(x, y, Math.floor(count / 2), palette.secondary, 80, 250, 1, 5, 0.2, 0.5, 0.2);
    }

    // 2. Screen shake (amplitude 5px, duration 100ms)
    if (this.cfg.vfx.screenShake) {
      this.shakeTimer = this.cfg.vfx.screenShakeDuration;
    }

    // 3. Chromatic aberration flash
    if (this.cfg.vfx.chromaticAberration) {
      this.chromaFlash = {
        intensity: this.cfg.vfx.chromaticAberrationIntensity,
        duration: 0.15,
        elapsed: 0,
      };
    }

    // 4. Hit effect sprite
    this.spawnHitEffect(x, y);
  }

  private spawnHitEffect(x: number, y: number): void {
    this.hitEffects.push({
      x,
      y,
      alpha: 1.0,
      scale: 0.5,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  private collectItem(collectible: Entity): void {
    this.combo.addScore('collect', collectible.x, collectible.y);
    this.particles.sparkle(collectible.x, collectible.y, NeonRenderer.COLORS.YELLOW);
    this.audio.playCollect();
  }

  private activatePowerUp(powerUp: Entity): void {
    const type = powerUp.components.get('powerType') || 'shield';
    this.combo.addScore('powerup', powerUp.x, powerUp.y);
    this.particles.explosion(powerUp.x, powerUp.y, NeonRenderer.COLORS.GREEN);
    this.audio.playPowerUp();
    this.screenFlash = { color: NeonRenderer.COLORS.GREEN, alpha: 0.25 };

    if (type === 'shield' && this.player) {
      this.player.components.set('invincible', true);
      this.player.color = NeonRenderer.COLORS.GREEN;
      setTimeout(() => {
        if (this.player) {
          this.player.components.set('invincible', false);
          this.player.color = NeonRenderer.COLORS.CYAN;
        }
      }, 5000);
    } else if (type === 'slowmo') {
      this.difficulty.setLevel(Math.max(0.1, this.difficulty.getState().level - 0.3));
    } else if (type === 'shrink' && this.player) {
      const origW = this.player.width;
      const origH = this.player.height;
      this.player.width *= 0.6;
      this.player.height *= 0.6;
      setTimeout(() => {
        if (this.player) {
          this.player.width = origW;
          this.player.height = origH;
        }
      }, 6000);
    }
  }

  private onFail(): void {
    if (!this.player) return;
    const state = this.engine.getState();

    this.engine.setState({ fails: state.fails + 1 });
    this.combo.breakCombo();
    this.difficulty.recordFail();

    // Effects
    this.engine.shake(25);
    this.particles.explosion(this.player.x, this.player.y, NeonRenderer.COLORS.RED);
    this.renderer.spawnShockwave(this.player.x, this.player.y, NeonRenderer.COLORS.RED);
    this.audio.playFail();
    this.screenFlash = { color: '#ff0033', alpha: 0.4 };

    // Game over check
    const modeType = this.getModeType();
    if (modeType === 'classic' && state.fails >= 2) {
      this.gameOver(false);
    } else if (modeType === 'infinite') {
      this.player.x = 120;
      this.player.y = 300;
    }
  }

  private constrainPlayer(): void {
    if (!this.player) return;
    const pad = this.player.width / 2;
    const w = this.engine['config'].width;
    const h = this.engine['config'].height;

    this.player.x = Math.max(pad, Math.min(w - pad, this.player.x));
    this.player.y = Math.max(pad, Math.min(h - pad, this.player.y));
  }

  // ==================== PREMIUM RENDERING ====================

  private renderGame(): void {
    const ctx = this.engine['ctx'];
    const state = this.engine.getState();
    const w = this.engine['config'].width;
    const h = this.engine['config'].height;

    // FPS tracking
    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const fps = 1000 / (now - this.lastFrameTime);
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) this.fpsHistory.shift();
    }
    this.lastFrameTime = now;

    // Apply screen shake offset
    ctx.save();
    ctx.translate(this.shakeOffset.x, this.shakeOffset.y);

    // Dynamic background
    this.renderer.update(1 / 60);

    // Draw animated grid background
    if (this.cfg.vfx.backgroundGrid) {
      this.renderBackground(ctx, w, h, state.time);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#050818');
      bgGrad.addColorStop(0.5, '#0a0e27');
      bgGrad.addColorStop(1, '#050818');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Screen flash
    if (this.screenFlash) {
      ctx.save();
      ctx.globalAlpha = this.screenFlash.alpha;
      ctx.fillStyle = this.screenFlash.color;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // After-images (behind obstacles)
    this.renderAfterImages(ctx);

    // Render obstacles
    this.renderObstacles(ctx, state.time);

    // Render collectibles
    this.renderCollectibles(ctx, state.time);

    // Render player trail
    this.renderPlayerTrail(ctx);

    // Render player
    this.renderPlayer(ctx, state.time);

    // Render hit effects (spark sprites)
    this.renderHitEffects(ctx);

    // Render pooled VFX particles
    this.vfxPool.render(ctx);

    // Render legacy particles
    this.particles.render(ctx, this.renderer);

    // Render shockwaves
    this.renderer.drawShockwaves();

    // Render combo floating texts
    this.combo.render(ctx);

    // Chromatic aberration overlay
    if (this.chromaFlash && this.cfg.vfx.chromaticAberration) {
      this.renderChromaticAberration(ctx, w, h);
    }

    // Scanlines overlay
    if (this.cfg.vfx.scanlines) {
      this.renderScanlines(ctx, w, h);
    }

    // Render UI
    this.renderUI(ctx, state, w, h);

    // Debug overlay
    if (this.cfg.debug.showHitboxes || this.cfg.debug.showFPS || this.cfg.debug.showEntityCount || this.cfg.debug.showParticleCount) {
      this.renderDebug(ctx, w, h);
    }

    ctx.restore(); // pop screen shake
  }

  // ==================== BACKGROUND ====================

  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#050818');
    bgGrad.addColorStop(0.5, '#0a0e27');
    bgGrad.addColorStop(1, '#050818');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Animated grid
    ctx.save();
    ctx.globalAlpha = 0.06 + this.backgroundPulse;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 0.5;

    const gridSize = 50;
    const offsetX = (time * 20) % gridSize;

    for (let x = -offsetX; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // Horizon glow
    ctx.save();
    const horizonGrad = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.8);
    horizonGrad.addColorStop(0, 'rgba(0,240,255,0.04)');
    horizonGrad.addColorStop(0.5, 'rgba(255,0,255,0.02)');
    horizonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // ==================== PLAYER TRAIL RENDERING ====================

  private renderPlayerTrail(ctx: CanvasRenderingContext2D): void {
    if (!this.cfg.player.trailEnabled || this.playerTrail.length === 0) return;

    for (let i = 0; i < this.playerTrail.length; i++) {
      const pt = this.playerTrail[i];
      const progress = i / this.playerTrail.length;

      ctx.save();
      ctx.globalAlpha = pt.alpha * progress * 0.6;
      ctx.translate(pt.x, pt.y);

      // Draw diamond trail point with skin colors
      const skin = this.activeSkin;
      const trailColor = skin.trail.color;
      if (this.cfg.player.shape === 'diamond') {
        const s = pt.size * progress;
        ctx.shadowBlur = 12;
        ctx.shadowColor = trailColor;
        ctx.fillStyle = trailColor;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.7, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        const s = pt.size * progress;
        ctx.shadowBlur = 10;
        ctx.shadowColor = trailColor;
        ctx.fillStyle = trailColor;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==================== PLAYER RENDERING ====================

  private renderPlayer(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.player) return;

    // Refresh skin (may change from Game Over screen)
    this.activeSkin = getSelectedSkin();
    const skin = this.activeSkin;

    const isInvincible = this.player.components.get('invincible');
    const img = this.assets.get('player');

    ctx.save();
    ctx.translate(this.player.x, this.player.y);

    // Breathing scale from skin
    let breathScale = this.player.scale;
    if (skin.effects.breathing) {
      breathScale *= 0.95 + 0.1 * Math.sin(time * skin.effects.breathingSpeed * Math.PI * 2);
    }
    ctx.scale(breathScale, breathScale);

    // Energy aura (glow from skin)
    if (this.cfg.player.glowEnabled && skin.core.glowIntensity > 0) {
      const auraSize = this.player.width * (1.8 + Math.sin(time * 4) * 0.15);
      const glowColor = skin.core.glowColor;
      const auraGrad = ctx.createRadialGradient(0, 0, this.player.width * 0.15, 0, 0, auraSize / 2);
      auraGrad.addColorStop(0, glowColor + '40');
      auraGrad.addColorStop(0.6, glowColor + '15');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(-auraSize / 2, -auraSize / 2, auraSize, auraSize);
    }

    // Shield ring when invincible
    if (isInvincible) {
      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(time * 8) * 0.3;
      ctx.strokeStyle = NeonRenderer.COLORS.GREEN;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = NeonRenderer.COLORS.GREEN;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.width * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw player shape based on config
    if (this.cfg.player.shape === 'diamond') {
      this.drawDiamondPlayer(ctx, time);
    } else if (this.cfg.player.shape === 'triangle') {
      this.drawTrianglePlayer(ctx, time);
    } else {
      // Circle fallback with sprite
      if (img) {
        const drawSize = this.player.width * 2.2;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.player.color;
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      } else {
        this.drawDiamondPlayer(ctx, time);
      }
    }

    ctx.restore();
  }

  /** Diamond/losange shape — uses active skin colors */
  private drawDiamondPlayer(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.player) return;
    const s = this.player.width / 2;
    const skin = this.activeSkin;
    const coreColor = skin.core.color;
    const secColor = skin.core.secondaryColor;
    const glowColor = skin.core.glowColor;
    const glowI = skin.core.glowIntensity;

    // Outer glow layer
    ctx.save();
    ctx.globalAlpha = 0.3 * glowI;
    ctx.shadowBlur = 25 * glowI;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.3);
    ctx.lineTo(s * 0.9, 0);
    ctx.lineTo(0, s * 1.3);
    ctx.lineTo(-s * 0.9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Inner gradient layer
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.shadowBlur = 15 * glowI;
    ctx.shadowColor = glowColor;
    const grad = ctx.createLinearGradient(-s, -s, s, s);
    grad.addColorStop(0, coreColor);
    grad.addColorStop(1, secColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.lineTo(s * 0.75, 0);
    ctx.lineTo(0, s * 1.1);
    ctx.lineTo(-s * 0.75, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Core highlight
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(s * 0.48, 0);
    ctx.lineTo(0, s * 0.7);
    ctx.lineTo(-s * 0.48, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Neon border
    ctx.save();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12 * glowI;
    ctx.shadowColor = glowColor;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.15);
    ctx.lineTo(s * 0.78, 0);
    ctx.lineTo(0, s * 1.15);
    ctx.lineTo(-s * 0.78, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Scanlines effect (Hologram skin)
    if (skin.effects.scanlines) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      for (let y = -s * 1.3; y < s * 1.3; y += 4) {
        ctx.fillStyle = '#000';
        ctx.fillRect(-s, y, s * 2, 1);
      }
      ctx.restore();
    }

    // Particle orbits (Gold Reactor, Legend, Neon Inferno)
    if (skin.effects.particles && skin.effects.particleColor) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 6; i++) {
        const angle = (time * 2.5 + i * 1.047) % (Math.PI * 2);
        const dist = s * 1.2 + Math.sin(time * 3 + i) * s * 0.2;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        ctx.fillStyle = skin.effects.particleColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = skin.effects.particleColor;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Distortion effect (Void Core)
    if (skin.effects.distortion) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1;
      const distort = Math.sin(time * 2) * 3;
      ctx.beginPath();
      ctx.moveTo(distort, -s * 1.3);
      ctx.lineTo(s * 0.9 + distort, distort);
      ctx.lineTo(distort, s * 1.3);
      ctx.lineTo(-s * 0.9 + distort, distort);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  /** Triangle shape — alternative player identity */
  private drawTrianglePlayer(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.player) return;
    const s = this.player.width / 2;
    const color = this.player.color;

    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(s * 1.2, 0);
    ctx.lineTo(-s * 0.8, -s * 0.9);
    ctx.lineTo(-s * 0.8, s * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // White core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(s * 0.7, 0);
    ctx.lineTo(-s * 0.4, -s * 0.5);
    ctx.lineTo(-s * 0.4, s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ==================== OBSTACLE RENDERING ====================

  private renderObstacles(ctx: CanvasRenderingContext2D, time: number): void {
    for (const obstacle of this.obstacles) {
      const kind: ObstacleKind = obstacle.components.get('obstacleKind') || 'dasher';
      const palette = OBSTACLE_PALETTE[kind];

      ctx.save();
      ctx.translate(obstacle.x, obstacle.y);
      ctx.rotate(obstacle.rotation);

      const s = obstacle.width / 2;
      const pulse = 1 + Math.sin(time * 3 + obstacle.x * 0.01) * 0.08;

      // Try sprite first
      const spriteKey = kind === 'dasher' ? 'obstacle_fire' : kind === 'orbiter' ? 'obstacle_classic' : 'powerup_neon';
      const img = this.assets.get(spriteKey);

      if (img) {
        const drawSize = obstacle.width * 1.8 * pulse;
        // Glow aura
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(time * 4) * 0.1;
        ctx.shadowBlur = 25;
        ctx.shadowColor = palette.glow;
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();
        // Main sprite
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();
      } else {
        // Procedural shapes based on kind
        if (kind === 'dasher') {
          this.drawDasherShape(ctx, s * pulse, palette, time);
        } else if (kind === 'orbiter') {
          this.drawOrbiterShape(ctx, s * pulse, palette, time);
        } else if (kind === 'shaker') {
          this.drawShakerShape(ctx, s * pulse, palette, time);
        }
      }

      // Neon ring glow for Orbiter
      if (kind === 'orbiter' && this.cfg.vfx.neonRingGlow) {
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(time * 5) * 0.2;
        ctx.strokeStyle = palette.glow;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = palette.glow;
        ctx.beginPath();
        ctx.arc(0, 0, s * 1.4 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        // Second ring
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(0, 0, s * 1.8 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  /** Dasher: pointed triangle shape (yellow) */
  private drawDasherShape(ctx: CanvasRenderingContext2D, s: number, palette: typeof OBSTACLE_PALETTE.dasher, time: number): void {
    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = palette.glow;
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.moveTo(s * 1.4, 0);
    ctx.lineTo(-s * 0.8, -s * 1.0);
    ctx.lineTo(-s * 0.5, 0);
    ctx.lineTo(-s * 0.8, s * 1.0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Main body
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.shadowBlur = 12;
    ctx.shadowColor = palette.glow;
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.moveTo(s * 1.2, 0);
    ctx.lineTo(-s * 0.6, -s * 0.8);
    ctx.lineTo(-s * 0.3, 0);
    ctx.lineTo(-s * 0.6, s * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(s * 0.6, 0);
    ctx.lineTo(-s * 0.2, -s * 0.35);
    ctx.lineTo(-s * 0.2, s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** Orbiter: circle shape (purple) with neon ring */
  private drawOrbiterShape(ctx: CanvasRenderingContext2D, s: number, palette: typeof OBSTACLE_PALETTE.orbiter, time: number): void {
    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.shadowBlur = 25;
    ctx.shadowColor = palette.glow;
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main body
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.shadowBlur = 15;
    ctx.shadowColor = palette.glow;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
    grad.addColorStop(0, palette.secondary);
    grad.addColorStop(0.7, palette.primary);
    grad.addColorStop(1, palette.primary + '80');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // White core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Shaker: hexagon shape (cyan) */
  private drawShakerShape(ctx: CanvasRenderingContext2D, s: number, palette: typeof OBSTACLE_PALETTE.shaker, time: number): void {
    const drawHex = (radius: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = palette.glow;
    ctx.fillStyle = palette.primary;
    drawHex(s * 1.15);
    ctx.fill();
    ctx.restore();

    // Main body
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.shadowBlur = 12;
    ctx.shadowColor = palette.glow;
    ctx.fillStyle = palette.primary;
    drawHex(s);
    ctx.fill();
    ctx.restore();

    // Neon border
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    drawHex(s);
    ctx.stroke();
    ctx.restore();

    // Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    drawHex(s * 0.4);
    ctx.fill();
    ctx.restore();
  }

  // ==================== AFTER-IMAGES ====================

  private renderAfterImages(ctx: CanvasRenderingContext2D): void {
    for (const ai of this.afterImages) {
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.4;
      ctx.translate(ai.x, ai.y);

      const s = ai.width / 2;
      ctx.fillStyle = ai.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ai.color;

      if (ai.kind === 'dasher') {
        ctx.beginPath();
        ctx.moveTo(s * 1.2, 0);
        ctx.lineTo(-s * 0.6, -s * 0.8);
        ctx.lineTo(-s * 0.3, 0);
        ctx.lineTo(-s * 0.6, s * 0.8);
        ctx.closePath();
        ctx.fill();
      } else if (ai.kind === 'shaker') {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = s * Math.cos(angle);
          const y = s * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==================== COLLECTIBLES ====================

  private renderCollectibles(ctx: CanvasRenderingContext2D, time: number): void {
    for (const col of this.collectibles) {
      ctx.save();
      ctx.translate(col.x, col.y);
      ctx.rotate(col.rotation);
      ctx.scale(col.scale, col.scale);

      if (col.type === 'powerup') {
        const img = this.assets.get('powerup_neon');
        const drawSize = col.width * 2.0;
        const pulse = 1 + Math.sin(time * 5) * 0.15;
        const finalSize = drawSize * pulse;

        if (img) {
          ctx.save();
          ctx.globalAlpha = 0.4 + Math.sin(time * 3) * 0.15;
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#ff00ff';
          ctx.drawImage(img, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
          ctx.restore();
          ctx.drawImage(img, -finalSize / 2, -finalSize / 2, finalSize, finalSize);

          const pType = col.components.get('powerType') || '';
          const icon = pType === 'shield' ? 'S' : pType === 'slowmo' ? 'T' : pType === 'multiplier' ? 'X' : '-';
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fff';
          ctx.fillText(icon, 0, 0);
          ctx.shadowBlur = 0;
        } else {
          ctx.shadowBlur = 20;
          ctx.shadowColor = NeonRenderer.COLORS.GREEN;
          ctx.fillStyle = NeonRenderer.COLORS.GREEN;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = (col.width / 2) * Math.cos(angle);
            const y = (col.width / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else {
        // Collectible: glowing star
        const pulse = 1 + Math.sin(time * 6 + col.x * 0.1) * 0.2;
        const size = col.width * pulse;

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = NeonRenderer.COLORS.YELLOW;
        ctx.fillStyle = NeonRenderer.COLORS.YELLOW;

        const spikes = 5;
        const outerR = size / 2;
        const innerR = size / 4;
        let rot = -Math.PI / 2;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
          rot += step;
          ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
          rot += step;
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // ==================== HIT EFFECTS ====================

  private renderHitEffects(ctx: CanvasRenderingContext2D): void {
    const img = this.assets.get('hit_spark');

    for (const fx of this.hitEffects) {
      ctx.save();
      ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.rotation);
      ctx.globalAlpha = fx.alpha;

      const size = 80 * fx.scale;

      if (img) {
        ctx.save();
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#00f0ff';
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      } else {
        // Procedural spark
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00f0ff';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * size * 0.5, Math.sin(angle) * size * 0.5);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  // ==================== CHROMATIC ABERRATION ====================

  private renderChromaticAberration(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (!this.chromaFlash) return;

    const progress = this.chromaFlash.elapsed / this.chromaFlash.duration;
    const intensity = this.chromaFlash.intensity * (1 - progress);

    if (intensity < 0.5) return;

    // Red channel offset
    ctx.save();
    ctx.globalAlpha = 0.08 * (1 - progress);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(intensity, 0, w, h);
    ctx.restore();

    // Blue channel offset
    ctx.save();
    ctx.globalAlpha = 0.08 * (1 - progress);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(-intensity, 0, w, h);
    ctx.restore();
  }

  // ==================== SCANLINES ====================

  private renderScanlines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  }

  // ==================== UI ====================

  private renderUI(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number): void {
    // Score (top center)
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = NeonRenderer.COLORS.CYAN;
    ctx.font = 'bold 22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = NeonRenderer.COLORS.CYAN;
    ctx.fillText(`${state.score}`, w / 2, 35);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ffffff88';
    ctx.fillText('SCORE', w / 2, 52);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Fails / Lives (top left)
    const modeType = this.getModeType();
    if (modeType === 'classic') {
      const maxFails = 3;
      ctx.save();
      ctx.font = '12px monospace';
      ctx.fillStyle = '#ffffff88';
      ctx.fillText('LIVES', 20, 25);
      for (let i = 0; i < maxFails; i++) {
        const alive = i >= state.fails;
        ctx.fillStyle = alive ? NeonRenderer.COLORS.RED : '#333';
        ctx.shadowBlur = alive ? 8 : 0;
        ctx.shadowColor = NeonRenderer.COLORS.RED;
        ctx.beginPath();
        ctx.arc(30 + i * 25, 42, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Combo meter (top right)
    const comboState = this.combo.getState();
    if (comboState.current > 0) {
      this.combo.renderComboMeter(ctx, w - 180, 15, 160, 20);

      ctx.save();
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = this.combo.getLevelColor();
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.combo.getLevelColor();
      ctx.fillText(this.combo.getLevelName(), w - 20, 55);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Difficulty label (center, fading)
    if (this.showDifficultyLabel > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.showDifficultyLabel);
      ctx.font = 'bold 28px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.difficulty.getDifficultyColor();
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.difficulty.getDifficultyColor();
      ctx.fillText(this.difficultyLabel, w / 2, h / 2 - 40);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Time (Time Trial)
    if (this.mode.duration) {
      const remaining = Math.max(0, this.mode.duration - state.time);
      ctx.save();
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = remaining < 10 ? NeonRenderer.COLORS.RED : NeonRenderer.COLORS.GREEN;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillText(`${remaining.toFixed(1)}s`, w - 20, h - 20);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Game Over
    if (state.isGameOver) {
      this.renderGameOver(ctx, state, w, h);
    }
  }

  // ==================== GAME OVER ====================

  private renderGameOver(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number): void {
    // Dark overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    // Skull logo
    const skullImg = this.assets.get('skull_icon');
    if (skullImg) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      const skullSize = 120;
      const skullH = skullSize * (skullImg.height / skullImg.width);
      ctx.drawImage(skullImg, (w - skullSize) / 2, h / 2 - 130 - skullH / 2, skullSize, skullH);
      ctx.restore();
    }

    // GAME OVER text
    ctx.shadowBlur = 30;
    ctx.shadowColor = NeonRenderer.COLORS.RED;
    ctx.font = 'bold 40px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = NeonRenderer.COLORS.RED;
    ctx.fillText('GAME OVER', w / 2, h / 2 - 30);

    // Stats
    ctx.shadowBlur = 10;
    ctx.shadowColor = NeonRenderer.COLORS.CYAN;
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = NeonRenderer.COLORS.CYAN;
    ctx.fillText(`SCORE: ${state.score}`, w / 2, h / 2 + 15);

    const stats = this.combo.getStats();
    ctx.font = '14px monospace';
    ctx.fillStyle = NeonRenderer.COLORS.YELLOW;
    ctx.fillText(`MAX COMBO: ${stats.maxCombo}x`, w / 2, h / 2 + 45);
    ctx.fillStyle = NeonRenderer.COLORS.MAGENTA;
    ctx.fillText(`NEAR MISSES: ${stats.nearMisses}`, w / 2, h / 2 + 70);

    // High score
    const highScore = this.highScores.get(this.mode.name) || 0;
    if (state.score > highScore) {
      ctx.fillStyle = NeonRenderer.COLORS.GOLD || '#ffd700';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('NEW HIGH SCORE!', w / 2, h / 2 + 100);
    }

    // Restart prompt
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffffff';
    const blink = Math.sin(Date.now() / 300) > 0;
    if (blink) {
      ctx.fillText('PRESS SPACE OR TAP TO RESTART', w / 2, h / 2 + 135);
    }

    ctx.restore();
  }

  // ==================== DEBUG MODE ====================

  private renderDebug(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const cfg = this.cfg.debug;
    let y = 80;

    ctx.save();
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    // FPS counter
    if (cfg.showFPS) {
      const avgFps = this.fpsHistory.length > 0
        ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
        : 0;
      const color = avgFps >= 55 ? '#00ff00' : avgFps >= 30 ? '#ffff00' : '#ff0000';
      ctx.fillStyle = color;
      ctx.fillText(`FPS: ${avgFps}`, 10, y);
      y += 15;
    }

    // Entity count
    if (cfg.showEntityCount) {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`Obstacles: ${this.obstacles.length}`, 10, y);
      y += 15;
      ctx.fillText(`Collectibles: ${this.collectibles.length}`, 10, y);
      y += 15;
    }

    // Particle count
    if (cfg.showParticleCount) {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`VFX Pool: ${this.vfxPool.getActiveCount()}`, 10, y);
      y += 15;
      ctx.fillText(`Trail: ${this.playerTrail.length}`, 10, y);
      y += 15;
    }

    // Obstacle type labels
    if (cfg.showObstacleType) {
      for (const obs of this.obstacles) {
        const kind = obs.components.get('obstacleKind') || '?';
        ctx.fillStyle = OBSTACLE_PALETTE[kind as ObstacleKind]?.primary || '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(kind.toUpperCase(), obs.x, obs.y - obs.width);
      }
    }

    // Hitboxes
    if (cfg.showHitboxes) {
      ctx.strokeStyle = '#00ff0088';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Player hitbox
      if (this.player) {
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, (this.player.width / 2) * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Obstacle hitboxes
      for (const obs of this.obstacles) {
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, (obs.width / 2) * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Collectible hitboxes
      ctx.strokeStyle = '#ffff0088';
      for (const col of this.collectibles) {
        ctx.beginPath();
        ctx.arc(col.x, col.y, (col.width / 2) * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  // ==================== GAME STATE ====================

  private gameOver(success: boolean): void {
    this.engine.setState({ isGameOver: true });

    if (success) {
      this.audio.playSuccess();
      if (this.player) this.particles.confetti(this.player.x, this.player.y);
    } else {
      this.audio.playGameOver();
    }

    // Save high score
    const score = this.combo.getScore();
    const current = this.highScores.get(this.mode.name) || 0;
    if (score > current) {
      this.highScores.set(this.mode.name, score);
      this.saveHighScores();
    }
  }

  private loadHighScores(): void {
    try {
      const data = localStorage.getItem('failfrenzy_highscores');
      if (data) {
        const parsed = JSON.parse(data);
        this.highScores = new Map(Object.entries(parsed));
      }
    } catch (e) { /* ignore */ }
  }

  private saveHighScores(): void {
    try {
      const obj: Record<string, number> = {};
      this.highScores.forEach((v, k) => obj[k] = v);
      localStorage.setItem('failfrenzy_highscores', JSON.stringify(obj));
    } catch (e) { /* ignore */ }
  }

  private seedRandom(seed: number): void {
    let s = seed;
    Math.random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  // ==================== PUBLIC API ====================

  public start(): void {
    this.engine.start();
    const startAudio = () => {
      this.audio.init().then(() => this.audio.startMusic());
      document.removeEventListener('click', startAudio);
      document.removeEventListener('touchstart', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
  }

  public stop(): void { this.engine.stop(); this.audio.stopMusic(); }
  public pause(): void { this.engine.pause(); }
  public resume(): void { this.engine.resume(); }

  public restart(): void {
    this.engine.reset();
    this.obstacles = [];
    this.collectibles = [];
    this.activePowerUps = [];
    this.hitEffects = [];
    this.afterImages = [];
    this.playerTrail = [];
    this.orbiterAnchors.clear();
    this.dasherTimers.clear();
    this.chromaFlash = null;
    this.shakeTimer = 0;
    this.shakeOffset = { x: 0, y: 0 };
    this.spawnTimer = 0;
    this.powerUpSpawnTimer = 0;
    this.combo.reset();
    this.difficulty.reset();
    this.particles.clear();
    this.vfxPool.clear();
    this.screenFlash = null;
    this.difficultyLabel = 'EASY';
    this.showDifficultyLabel = 0;
    this.createPlayer();
  }

  public getState(): GameState { return this.engine.getState(); }
  public getHighScore(): number { return this.highScores.get(this.mode.name) || 0; }

  public destroy(): void {
    this.engine.destroy();
    this.audio.stopMusic();
  }
}
