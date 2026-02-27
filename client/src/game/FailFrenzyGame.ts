/**
 * FAIL FRENZY PREMIUM v5.1 — SOLIDITY & ALIGNMENT UPDATE
 * 
 * - Fixed: Obstacle alignment (perfectly straight spawn and movement)
 * - Fixed: Ship rendering (no black squares, robust fallback)
 * - Fixed: Gameplay fluidity (framerate independent physics)
 * - Fixed: Logo transparency (using ultra-precise cropped asset)
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
import { getIntegratedGameManager, IntegratedGameManager } from './FeatureIntegration';

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
// GALAXY & NARRATIVE SYSTEM
// ============================================================

interface Galaxy {
  name: string;
  color: string;
  bgGradient: [string, string, string];
  gridColor: string;
  starDensity: number;
}

const GALAXIES: Galaxy[] = [
  { name: 'NÉBULEUSE ALPHA', color: '#00f0ff', bgGradient: ['#050818', '#0a0e27', '#050818'], gridColor: '#00f0ff', starDensity: 30 },
  { name: 'SECTEUR VERMILLON', color: '#ff4444', bgGradient: ['#180505', '#270a0e', '#180505'], gridColor: '#ff4444', starDensity: 40 },
  { name: 'VORTEX ÉMERAUDE', color: '#00ff88', bgGradient: ['#051808', '#0a270e', '#051808'], gridColor: '#00ff88', starDensity: 50 },
  { name: 'RIFT DORÉ', color: '#ffd700', bgGradient: ['#181205', '#27200a', '#181205'], gridColor: '#ffd700', starDensity: 60 },
  { name: 'ABÎME VIOLET', color: '#bb44ff', bgGradient: ['#0d0518', '#150a27', '#0d0518'], gridColor: '#bb44ff', starDensity: 70 },
  { name: 'CŒUR DE XYLOS', color: '#ff00ff', bgGradient: ['#180518', '#270a27', '#180518'], gridColor: '#ff00ff', starDensity: 80 },
];

interface BlackHole {
  entity: Entity;
  pullRadius: number;
  rotationSpeed: number;
  warningTimer: number;
  active: boolean;
}

interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
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
    ctx.save();
    for (let i = 0; i < this.capacity; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
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

  // Screen shake state
  private shakeOffset: { x: number; y: number } = { x: 0, y: 0 };
  private shakeTimer: number = 0;

  public shake(durationMs: number): void {
    this.shakeTimer = Math.max(this.shakeTimer, durationMs);
  }

  // Orbiter anchor points
  private orbiterAnchors: Map<string, { cx: number; cy: number; angle: number; radius: number }> = new Map();

  // Dasher dash state
  private dasherTimers: Map<string, { timer: number; dashing: boolean; dashTimer: number }> = new Map();

  // Active skin
  private activeSkin: SkinDefinition;

  // Feature integration manager
  private featureManager: IntegratedGameManager;

  // FPS tracking
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];

  // Galaxy state
  private currentGalaxy: number = 0;
  private galaxyTransition: { active: boolean; timer: number; from: number; to: number } = { active: false, timer: 0, from: 0, to: 0 };
  private showGalaxyLabel: number = 0;
  private backgroundStars: BackgroundStar[] = [];

  // Xylos state
  private xylosEnergy: number = 0;
  private xylosMaxEnergy: number = 100;
  private xylosGaugeFlash: number = 0;

  // Shield state
  private shieldHP: number = 3;
  private maxShieldHP: number = 3;
  private shieldRegenTimer: number = 0;
  private shieldFlash: number = 0;

  // Black holes
  private blackHoles: BlackHole[] = [];
  private blackHoleSpawnTimer: number = 0;

  constructor(canvasId: string, mode: GameMode, assets: AssetLoader) {
    this.engine = new GameEngine(canvasId);
    this.mode = mode;
    this.assets = assets;
    this.cfg = getConfig();
    this.activeSkin = getSelectedSkin();

    // Initialize systems
    const engineConfig = this.engine['config'];
    this.renderer = new NeonRenderer(this.engine['ctx'], engineConfig.width, engineConfig.height);
    this.physics = new PhysicsSystem();
    this.audio = new AudioSystem();
    this.combo = new ComboSystem();
    this.difficulty = new DifficultySystem();
    this.particles = new ParticleSystem();
    this.powerups = new PowerUpSystem();
    this.vfxPool = new ParticlePool(600);
    this.featureManager = getIntegratedGameManager();

    this.player = null;
    this.obstacles = [];
    this.collectibles = [];
    this.activePowerUps = [];
    this.spawnTimer = 0;
    this.powerUpSpawnTimer = 0;

    // Set initial difficulty from mode
    if (mode.difficulty) {
      this.difficulty.setLevel(mode.difficulty);
    }

    this.init();
  }

  // Public API methods
  public start(): void {
    this.engine.start();
  }

  public getState(): GameState {
    return this.engine.getState();
  }

  public destroy(): void {
    this.engine.destroy();
  }

  public pause(): void {
    this.engine.pause();
  }

  public resume(): void {
    this.engine.resume();
  }

  private init(): void {
    // Create player
    this.player = {
      id: 'player',
      type: 'player',
      x: 150,
      y: 300,
      width: 32,
      height: 32,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: this.activeSkin.core.color,
      components: new Map<string, any>([
        ['collisionShape', 'circle'],
        ['invincible', false],
        ['ghost', false],
      ]),
    };

    this.engine.addEntity(this.player);
    this.initBackgroundStars();
    this.setupControls();

    // Start engine loop
    this.engine.onUpdate((dt) => this.updateGameLogic(dt));
    this.engine.onRender(() => this.renderGame());
    this.engine.start();
  }

  private initBackgroundStars(): void {
    this.backgroundStars = [];
    const galaxy = GALAXIES[this.currentGalaxy];
    for (let i = 0; i < galaxy.starDensity; i++) {
      this.backgroundStars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: 1 + Math.random() * 2,
        speed: 20 + Math.random() * 50,
        alpha: 0.2 + Math.random() * 0.8,
      });
    }
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      if (this.player) {
        const speed = 400;
        switch (e.key) {
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
            if (this.engine.getState().isGameOver) this.restart();
            break;
        }
      }
    });
  }

  private updateGameLogic(dt: number): void {
    const state = this.engine.getState();
    if (state.isGameOver) return;

    this.cfg = getConfig();
    this.difficulty.progressTime(dt);
    this.combo.update(dt);
    this.particles.update(dt);
    this.powerups.update(dt);
    this.vfxPool.update(dt);

    if (this.player) {
      const effects = this.featureManager.update(dt, this.player.x, this.player.y) as any;
      if (effects && Array.isArray(effects)) {
        effects.forEach((effect: any) => {
          this.player!.x += effect.force.x * dt * 100;
          this.player!.y += effect.force.y * dt * 100;
        });
      }
    }

    // Screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt * 1000;
      const amp = this.cfg.vfx.screenShakeAmplitude;
      this.shakeOffset.x = (Math.random() - 0.5) * amp * 2;
      this.shakeOffset.y = (Math.random() - 0.5) * amp * 2;
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }

    // Spawn logic
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.difficulty.getSpawnInterval()) {
      this.spawnObstacle();
      this.spawnTimer = 0;
    }

    this.updateBackgroundStars(dt);
    if (this.player) this.updatePlayer(dt);
    this.updateObstacles(dt);
    this.updateCollectibles(dt);
    this.checkCollisions();
    this.constrainPlayer();
    this.engine.setState({ score: this.combo.getScore() });
  }

  private updatePlayer(dt: number): void {
    if (!this.player) return;
    const modifiers = this.featureManager.getSkinModifiers();
    const friction = Math.pow(0.88 * modifiers.speedMultiplier, dt * 60);
    this.player.velocity.x *= friction;
    this.player.velocity.y *= friction;

    // Trail
    if (this.cfg.player.trailEnabled) {
      this.playerTrail.push({
        x: this.player.x,
        y: this.player.y,
        alpha: 1.0,
        size: this.player.width * 0.4,
        color: this.cfg.player.trailColor,
      });
      for (let i = this.playerTrail.length - 1; i >= 0; i--) {
        this.playerTrail[i].alpha -= this.cfg.player.trailFade;
        if (this.playerTrail[i].alpha <= 0) this.playerTrail.splice(i, 1);
      }
      while (this.playerTrail.length > this.cfg.player.trailLength) this.playerTrail.shift();
    }
  }

  private spawnObstacle(): void {
    const kind = pickObstacleType();
    const y = 60 + Math.random() * 480;
    const obstacle: Entity = {
      id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'obstacle',
      x: 850,
      y,
      width: 32,
      height: 32,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: OBSTACLE_PALETTE[kind].primary,
      components: new Map<string, any>([
        ['collisionShape', 'circle'],
        ['obstacleKind', kind],
      ]),
    };

    this.engine.addEntity(obstacle);
    this.obstacles.push(obstacle);
  }

  private updateObstacles(dt: number): void {
    const baseSpeed = this.difficulty.getObstacleSpeed();
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const kind: ObstacleKind = obs.components.get('obstacleKind') || 'dasher';
      
      // PERFECT ALIGNMENT: Obstacles move perfectly straight unless they are orbiters
      if (kind === 'orbiter') {
        let anchor = this.orbiterAnchors.get(obs.id);
        if (!anchor) {
          anchor = { cx: obs.x, cy: obs.y, angle: 0, radius: 50 };
          this.orbiterAnchors.set(obs.id, anchor);
        }
        anchor.cx -= baseSpeed * dt;
        anchor.angle += dt * 2.5;
        obs.x = anchor.cx + Math.cos(anchor.angle) * anchor.radius;
        obs.y = anchor.cy + Math.sin(anchor.angle) * anchor.radius;
      } else {
        obs.x -= baseSpeed * dt;
      }
      
      obs.rotation += dt * 2;

      if (obs.x < -100) {
        this.engine.removeEntity(obs.id);
        this.obstacles.splice(i, 1);
        this.orbiterAnchors.delete(obs.id);
      }
    }
  }

  private updateCollectibles(dt: number): void {
    const speed = this.difficulty.getObstacleSpeed();
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= speed * dt;
      if (col.x < -100) {
        this.engine.removeEntity(col.id);
        this.collectibles.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    if (!this.player) return;
    const isInvincible = this.player.components.get('invincible');
    
    for (const obs of this.obstacles) {
      if (this.simpleCollision(this.player, obs)) {
        if (!isInvincible) {
          this.onFail();
          return;
        }
      }
    }
  }

  private simpleCollision(a: Entity, b: Entity): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (a.width + b.width) * 0.4;
  }

  private onFail(): void {
    this.shieldHP--;
    this.shake(300);
    if (this.shieldHP <= 0) this.gameOver(false);
    else this.screenFlash = { color: '#ff0000', alpha: 0.5 };
  }

  private gameOver(_win: boolean): void {
    this.engine.setState({ isGameOver: true });
  }

  public restart(): void {
    window.location.reload();
  }

  private constrainPlayer(): void {
    if (!this.player) return;
    const w = this.engine['config'].width;
    const h = this.engine['config'].height;
    this.player.x = Math.max(20, Math.min(w - 20, this.player.x));
    this.player.y = Math.max(20, Math.min(h - 20, this.player.y));
  }

  private updateBackgroundStars(dt: number): void {
    for (const star of this.backgroundStars) {
      star.x -= star.speed * dt;
      if (star.x < -10) {
        star.x = 810;
        star.y = Math.random() * 600;
      }
    }
  }

  private renderGame(): void {
    const ctx = this.engine['ctx'];
    const w = this.engine['config'].width;
    const h = this.engine['config'].height;
    const time = this.engine.getState().time;

    ctx.save();
    ctx.translate(this.shakeOffset.x, this.shakeOffset.y);

    // Background
    ctx.fillStyle = '#050818';
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (const star of this.backgroundStars) {
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Obstacles
    this.renderObstacles(ctx, time);
    // Player
    this.renderPlayer(ctx, time);
    // UI
    this.featureManager.render(ctx, w, h);

    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.player) return;
    const skin = getSelectedSkin();
    const img = this.assets.get(skin.imageKey || 'vaisseau_cyan');

    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    
    if (img && img.complete && img.naturalWidth > 0) {
      const size = this.player.width * 2.5;
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
    } else {
      // SOLID FALLBACK: Diamond shape if image fails
      ctx.fillStyle = skin.core.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = skin.core.color;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(15, 0);
      ctx.lineTo(0, 20);
      ctx.lineTo(-15, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private renderObstacles(ctx: CanvasRenderingContext2D, time: number): void {
    for (const obs of this.obstacles) {
      const kind: ObstacleKind = obs.components.get('obstacleKind') || 'dasher';
      const palette = OBSTACLE_PALETTE[kind];
      
      ctx.save();
      ctx.translate(obs.x, obs.y);
      ctx.rotate(obs.rotation);
      
      ctx.fillStyle = palette.primary;
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.glow;
      ctx.fillRect(-15, -15, 30, 30);
      ctx.restore();
    }
  }
}
