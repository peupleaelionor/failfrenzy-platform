/**
 * FAIL FRENZY - CORE GAME ENGINE (ROBUST VERSION)
 */
import { GameEngine, Entity } from '../engine/GameEngine';
import { NeonRenderer } from '../engine/NeonRenderer';
import { PhysicsSystem } from '../engine/PhysicsSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { AssetLoader } from './AssetLoader';
import { getConfig, applyDeviceOptimizedConfig } from './CONFIG';
import { getSelectedSkin, type SkinDefinition } from './SkinSystem';
import { getIntegratedGameManager, IntegratedGameManager } from './FeatureIntegration';

export interface GameMode {
  name: string;
  description: string;
  difficulty: number;
  duration?: number;
  seed?: number;
}

export interface GameState {
  score: number;
  fails: number;
  time: number;
  combo: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export class FailFrenzyGame {
  private engine: GameEngine;
  private renderer: NeonRenderer;
  private physics: PhysicsSystem;
  private audio: AudioSystem;
  private combo: ComboSystem;
  private difficulty: DifficultySystem;
  private particles: ParticleSystem;
  private powerups: PowerUpSystem;
  private assets: AssetLoader;
  private featureManager: IntegratedGameManager;
  
  private player: Entity | null = null;
  private obstacles: Entity[] = [];
  private activeSkin: SkinDefinition;
  private mode: GameMode;
  private lastTime: number = 0;
  private startTime: number = 0;
  private currentTime: number = 0;
  private fails: number = 0;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private score: number = 0;
  private canvasId: string;

  constructor(canvasId: string, mode: GameMode, assets: AssetLoader) {
    this.canvasId = canvasId;
    this.assets = assets;
    this.mode = mode;
    this.activeSkin = getSelectedSkin();
    this.featureManager = getIntegratedGameManager();
    
    applyDeviceOptimizedConfig();
    
    this.engine = new GameEngine(canvasId, { width: 800, height: 600 });
    this.renderer = new NeonRenderer(this.engine['ctx'], 800, 600);
    this.physics = new PhysicsSystem();
    this.audio = new AudioSystem();
    this.combo = new ComboSystem();
    this.difficulty = new DifficultySystem({ baseSpeed: 200, baseSpawnRate: 2.0 });
    this.particles = new ParticleSystem(500);
    this.powerups = new PowerUpSystem();

    this.createPlayer();
    this.setupInput();
  }

  private createPlayer() {
    this.player = {
      x: 400, y: 500, vx: 0, vy: 0, width: 48, height: 48, color: '#00f0ff'
    };
  }

  private setupInput() {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.player || this.isPaused || this.isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') this.player.vx = -500;
      if (e.key === 'ArrowRight' || e.key === 'd') this.player.vx = 500;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (this.player && (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd')) {
        this.player.vx = 0;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (canvas) {
      const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!this.player || this.isPaused || this.isGameOver) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const targetX = (clientX - rect.left) * (800 / rect.width);
        this.player.x = targetX;
      };
      canvas.addEventListener('mousemove', handleMove);
      canvas.addEventListener('touchmove', handleMove, { passive: false });
      canvas.addEventListener('mousedown', () => {
        if (this.isGameOver) this.restart();
      });
    }
  }

  public start() {
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.isPaused = false;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  public pause() { this.isPaused = true; }
  public resume() { this.isPaused = false; }
  public stop() { this.isPaused = true; }
  public destroy() { this.isPaused = true; }

  public restart() {
    this.createPlayer();
    this.obstacles = [];
    this.score = 0;
    this.fails = 0;
    this.currentTime = 0;
    this.startTime = performance.now();
    this.isGameOver = false;
    this.isPaused = false;
    this.combo.reset();
  }

  public getState(): GameState {
    return {
      score: Math.floor(this.score),
      fails: this.fails,
      time: this.currentTime,
      combo: this.combo.get(),
      isGameOver: this.isGameOver,
      isPaused: this.isPaused
    };
  }

  private gameLoop(now: number) {
    if (this.isPaused) {
      this.lastTime = now;
      requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }

    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (!this.isGameOver) {
      this.currentTime += dt;
      this.update(dt);
    }
    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number) {
    if (this.player) {
      this.player.x += this.player.vx * dt;
      this.player.x = Math.max(30, Math.min(770, this.player.x));
    }

    // Spawn obstacles based on difficulty
    const spawnChance = 0.02 + (this.currentTime / 100) * 0.05;
    if (Math.random() < Math.min(spawnChance, 0.1)) {
      this.obstacles.push({
        x: Math.random() * 800, 
        y: -50, 
        vx: (Math.random() - 0.5) * 50, 
        vy: 300 + (this.currentTime * 2), 
        width: 32, 
        height: 32, 
        color: '#ff2d7b'
      });
    }

    // Update obstacles
    this.obstacles.forEach((o) => {
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      
      // Collision
      if (this.player && !this.isGameOver) {
        const dx = this.player.x - o.x;
        const dy = this.player.y - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 35) {
          this.fails++;
          this.isGameOver = true;
          this.audio.play('fail');
        }
      }
    });
    
    this.obstacles = this.obstacles.filter(o => o.y < 650);
    
    if (!this.isGameOver) {
      this.score += dt * 100 * (1 + this.combo.get() * 0.1);
    }
  }

  private render() {
    const ctx = this.engine['ctx'];
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#050818';
    ctx.fillRect(0, 0, 800, 600);

    // Grid effect
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
    }
    for (let y = 0; y < 600; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
    }

    // Player
    if (this.player) {
      ctx.save();
      ctx.translate(this.player.x, this.player.y);
      
      // Glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.activeSkin.rarity === 'legendary' ? '#ffd700' : '#00f0ff';
      
      const img = this.assets.get(this.activeSkin.imagePath);
      if (img) {
        // Rotation pour pointer vers la DROITE (direction du jeu)
        ctx.rotate(Math.PI / 2); 
        ctx.drawImage(img, -24, -24, 48, 48);
      } else {
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-15, -15);
        ctx.lineTo(-15, 15);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Obstacles
    this.obstacles.forEach(o => {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff2d7b';
      ctx.fillStyle = '#ff2d7b';
      ctx.rotate(this.currentTime * 2);
      ctx.fillRect(-15, -15, 30, 30);
      ctx.restore();
    });
  }
}
