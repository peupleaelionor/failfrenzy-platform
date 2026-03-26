/**
 * FAIL FRENZY - Premium Game Engine
 * Canvas-based game loop avec performance optimization
 * Architecture: Entity-Component-System (ECS)
 */

export interface GameConfig {
  width: number;
  height: number;
  fps: number;
  backgroundColor: string;
  pixelRatio: number;
  debug: boolean;
}

export interface Entity {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  rotation: number;
  scale: number;
  alive: boolean;
  color: string;
  components: Map<string, any>;
}

export interface GameState {
  score: number;
  fails: number;
  combo: number;
  level: number;
  time: number;
  isPaused: boolean;
  isGameOver: boolean;
  mode: 'classic' | 'time-trial' | 'infinite' | 'seed';
  seed?: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private entities: Map<string, Entity>;
  private systems: Array<(dt: number) => void>;
  private state: GameState;
  
  private lastFrameTime: number;
  private frameCount: number;
  private fps: number;
  private animationId: number | null;
  
  private particles: Array<any>;
  private cameraShake: { x: number; y: number; intensity: number };
  
  private updateCallbacks: Array<(dt: number) => void>;
  private renderCallbacks: Array<() => void>;
  
  constructor(canvasId: string, config: Partial<GameConfig> = {}) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }
    
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true, // Performance optimization
    })!;
    
    this.config = {
      width: config.width || 800,
      height: config.height || 600,
      fps: config.fps || 60,
      backgroundColor: config.backgroundColor || '#0a0e27',
      pixelRatio: config.pixelRatio || window.devicePixelRatio || 1,
      debug: config.debug || false,
    };
    
    this.entities = new Map();
    this.systems = [];
    this.particles = [];
    this.cameraShake = { x: 0, y: 0, intensity: 0 };
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    
    this.state = {
      score: 0,
      fails: 0,
      combo: 0,
      level: 1,
      time: 0,
      isPaused: false,
      isGameOver: false,
      mode: 'classic',
    };
    
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.animationId = null;
    
    this.initCanvas();
    this.setupInputHandlers();
  }
  
  private initCanvas(): void {
    const { width, height, pixelRatio } = this.config;
    
    // High DPI support
    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    this.ctx.scale(pixelRatio, pixelRatio);
    
    // Optimization: disable image smoothing for pixel art
    this.ctx.imageSmoothingEnabled = false;
  }
  
  private setupInputHandlers(): void {
    // Touch support
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouch.bind(this), { passive: false });
    
    // Mouse support
    this.canvas.addEventListener('mousedown', this.handleMouse.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouse.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouse.bind(this));
    
    // Keyboard support
    window.addEventListener('keydown', this.handleKeyboard.bind(this));
    window.addEventListener('keyup', this.handleKeyboard.bind(this));
  }
  
  private handleTouch(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0] || event.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.dispatchEvent('input', {
      type: event.type,
      x,
      y,
      touch: true,
    });
  }
  
  private handleMouse(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.dispatchEvent('input', {
      type: event.type,
      x,
      y,
      touch: false,
    });
  }
  
  private handleKeyboard(event: KeyboardEvent): void {
    this.dispatchEvent('keyboard', {
      type: event.type,
      key: event.key,
      code: event.code,
    });
  }
  
  // Entity Management
  public addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }
  
  public removeEntity(id: string): void {
    this.entities.delete(id);
  }
  
  public getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }
  
  public getEntitiesByType(type: string): Entity[] {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }
  
  // System Management
  public addSystem(system: (dt: number) => void): void {
    this.systems.push(system);
  }
  
  // Callback registration
  public onUpdate(callback: (dt: number) => void): void {
    this.updateCallbacks.push(callback);
  }
  
  public onRender(callback: () => void): void {
    this.renderCallbacks.push(callback);
  }
  
  // Game Loop
  public start(): void {
    if (this.animationId !== null) return;
    
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  private gameLoop(currentTime: number): void {
    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    // FPS calculation
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1 / deltaTime);
    }
    
    if (this.state.isPaused) return;
    
    // Update
    this.update(deltaTime);
    
    // Render
    this.render();
  }
  
  private update(dt: number): void {
    // Update game state
    this.state.time += dt;
    
    // Run systems
    for (const system of Array.from(this.systems)) {
      system(dt);
    }
    
    // Run update callbacks
    for (const cb of this.updateCallbacks) {
      cb(dt);
    }
    
    // Update entities
    for (const entity of this.entities.values()) {
      this.updateEntity(entity, dt);
    }
    
    // Update particles
    this.updateParticles(dt);
    
    // Update camera shake
    this.updateCameraShake(dt);
    
    // Clean up dead entities
    this.cleanupEntities();
  }
  
  private updateEntity(entity: Entity, dt: number): void {
    if (!entity.alive) return;
    
    // Apply acceleration
    entity.velocity.x += entity.acceleration.x * dt;
    entity.velocity.y += entity.acceleration.y * dt;
    
    // Apply velocity
    entity.x += entity.velocity.x * dt;
    entity.y += entity.velocity.y * dt;
  }
  
  private updateParticles(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });
  }
  
  private updateCameraShake(dt: number): void {
    if (this.cameraShake.intensity > 0) {
      this.cameraShake.x = (Math.random() - 0.5) * this.cameraShake.intensity;
      this.cameraShake.y = (Math.random() - 0.5) * this.cameraShake.intensity;
      this.cameraShake.intensity *= 0.9; // Decay
    }
  }
  
  private cleanupEntities(): void {
    for (const [id, entity] of this.entities) {
      if (!entity.alive) {
        this.entities.delete(id);
      }
    }
  }
  
  private render(): void {
    // Run registered render callbacks (FailFrenzyGame.renderGame handles all rendering)
    for (const cb of this.renderCallbacks) {
      cb();
    }
  }
  
  private renderEntity(entity: Entity): void {
    this.ctx.save();
    
    this.ctx.translate(entity.x, entity.y);
    this.ctx.rotate(entity.rotation);
    this.ctx.scale(entity.scale, entity.scale);
    
    this.ctx.fillStyle = entity.color;
    this.ctx.fillRect(-entity.width / 2, -entity.height / 2, entity.width, entity.height);
    
    this.ctx.restore();
  }
  
  private renderParticles(): void {
    for (const particle of Array.from(this.particles)) {
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      this.ctx.restore();
    }
  }
  
  private renderDebug(): void {
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    this.ctx.fillText(`Entities: ${this.entities.size}`, 10, 40);
    this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 60);
    this.ctx.fillText(`Score: ${this.state.score}`, 10, 80);
    this.ctx.fillText(`Fails: ${this.state.fails}`, 10, 100);
  }
  
  // Public API
  public getState(): GameState {
    return { ...this.state };
  }
  
  public setState(newState: Partial<GameState>): void {
    this.state = { ...this.state, ...newState };
  }
  
  public pause(): void {
    this.state.isPaused = true;
  }
  
  public resume(): void {
    this.state.isPaused = false;
  }
  
  public reset(): void {
    this.entities.clear();
    this.particles = [];
    this.state = {
      score: 0,
      fails: 0,
      combo: 0,
      level: 1,
      time: 0,
      isPaused: false,
      isGameOver: false,
      mode: this.state.mode,
      seed: this.state.seed,
    };
  }
  
  public shake(intensity: number): void {
    this.cameraShake.intensity = intensity;
  }
  
  public spawnParticles(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 100;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        life: Math.random() * 0.5 + 0.5,
        maxLife: 1,
        alpha: 1,
      });
    }
  }
  
  // Event system
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();
  
  public on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }
  
  private dispatchEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }
  
  // Collision detection
  public checkCollision(a: Entity, b: Entity): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  
  public destroy(): void {
    this.stop();
    this.entities.clear();
    this.systems = [];
    this.particles = [];
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    this.eventHandlers.clear();
  }
}
