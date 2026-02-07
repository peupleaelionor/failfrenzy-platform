/**
 * FAIL FRENZY - ULTIMATE Particle System
 * High-performance particle effects for explosions, trails, and ambient visuals
 */

import { NeonRenderer } from '../engine/NeonRenderer';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  friction: number;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'spark';
}

export interface EmitterConfig {
  x: number;
  y: number;
  count: number;
  spread: number;
  speed: { min: number; max: number };
  size: { min: number; max: number };
  life: { min: number; max: number };
  colors: string[];
  gravity: number;
  friction: number;
  type: Particle['type'];
  burst: boolean;
  rate: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 1000;
  private emitters: Map<string, EmitterConfig & { timer: number }> = new Map();
  
  constructor(maxParticles: number = 1000) {
    this.maxParticles = maxParticles;
  }
  
  // Create a single particle
  private createParticle(config: Partial<EmitterConfig>): Particle {
    const angle = Math.random() * Math.PI * 2;
    const spread = config.spread || Math.PI * 2;
    const direction = angle - spread / 2 + Math.random() * spread;
    
    const speedMin = config.speed?.min || 50;
    const speedMax = config.speed?.max || 200;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    
    const sizeMin = config.size?.min || 2;
    const sizeMax = config.size?.max || 8;
    
    const lifeMin = config.life?.min || 0.5;
    const lifeMax = config.life?.max || 2;
    const life = lifeMin + Math.random() * (lifeMax - lifeMin);
    
    const colors = config.colors || [NeonRenderer.COLORS.CYAN];
    
    return {
      x: config.x || 0,
      y: config.y || 0,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      life,
      maxLife: life,
      size: sizeMin + Math.random() * (sizeMax - sizeMin),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: config.gravity || 0,
      friction: config.friction || 0.98,
      type: config.type || 'circle',
    };
  }
  
  // Emit particles in a burst
  public burst(config: Partial<EmitterConfig>): void {
    const count = config.count || 20;
    
    for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
      this.particles.push(this.createParticle(config));
    }
  }
  
  // Create continuous emitter
  public createEmitter(id: string, config: EmitterConfig): void {
    this.emitters.set(id, { ...config, timer: 0 });
  }
  
  // Remove emitter
  public removeEmitter(id: string): void {
    this.emitters.delete(id);
  }
  
  // Update emitter position
  public updateEmitter(id: string, x: number, y: number): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.x = x;
      emitter.y = y;
    }
  }
  
  // Update all particles
  public update(dt: number): void {
    // Update emitters
    for (const [, emitter] of this.emitters) {
      if (!emitter.burst) {
        emitter.timer += dt;
        const interval = 1 / emitter.rate;
        
        while (emitter.timer >= interval && this.particles.length < this.maxParticles) {
          emitter.timer -= interval;
          this.particles.push(this.createParticle(emitter));
        }
      }
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Apply physics
      p.vy += p.gravity * dt * 500;
      p.vx *= p.friction;
      p.vy *= p.friction;
      
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;
      
      // Update life
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      
      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  // Render all particles
  public render(ctx: CanvasRenderingContext2D, renderer: NeonRenderer): void {
    for (const p of Array.from(this.particles)) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      // Set glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      
      switch (p.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          break;
          
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.866, p.size * 0.5);
          ctx.lineTo(-p.size * 0.866, p.size * 0.5);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'star':
          this.drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
          break;
          
        case 'spark':
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    }
  }
  
  // Draw star shape
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
  
  // Preset effects
  public explosion(x: number, y: number, color: string = NeonRenderer.COLORS.ORANGE): void {
    this.burst({
      x, y,
      count: 50,
      spread: Math.PI * 2,
      speed: { min: 100, max: 400 },
      size: { min: 3, max: 12 },
      life: { min: 0.3, max: 1 },
      colors: [color, NeonRenderer.COLORS.YELLOW, NeonRenderer.COLORS.WHITE],
      gravity: 0.5,
      friction: 0.95,
      type: 'circle',
      burst: true,
      rate: 0,
    });
  }
  
  public sparkle(x: number, y: number, color: string = NeonRenderer.COLORS.CYAN): void {
    this.burst({
      x, y,
      count: 15,
      spread: Math.PI * 2,
      speed: { min: 50, max: 150 },
      size: { min: 2, max: 6 },
      life: { min: 0.2, max: 0.6 },
      colors: [color, NeonRenderer.COLORS.WHITE],
      gravity: 0,
      friction: 0.9,
      type: 'star',
      burst: true,
      rate: 0,
    });
  }
  
  public trail(x: number, y: number, color: string = NeonRenderer.COLORS.MAGENTA): void {
    this.burst({
      x, y,
      count: 3,
      spread: Math.PI / 4,
      speed: { min: 20, max: 60 },
      size: { min: 2, max: 5 },
      life: { min: 0.2, max: 0.5 },
      colors: [color],
      gravity: 0,
      friction: 0.95,
      type: 'circle',
      burst: true,
      rate: 0,
    });
  }
  
  public confetti(x: number, y: number): void {
    this.burst({
      x, y,
      count: 100,
      spread: Math.PI,
      speed: { min: 200, max: 500 },
      size: { min: 5, max: 15 },
      life: { min: 2, max: 4 },
      colors: Object.values(NeonRenderer.COLORS),
      gravity: 0.8,
      friction: 0.98,
      type: 'square',
      burst: true,
      rate: 0,
    });
  }
  
  public shockwave(x: number, y: number, color: string = NeonRenderer.COLORS.CYAN): void {
    this.burst({
      x, y,
      count: 30,
      spread: Math.PI * 2,
      speed: { min: 300, max: 500 },
      size: { min: 2, max: 4 },
      life: { min: 0.2, max: 0.4 },
      colors: [color],
      gravity: 0,
      friction: 0.9,
      type: 'spark',
      burst: true,
      rate: 0,
    });
  }
  
  // Clear all particles
  public clear(): void {
    this.particles = [];
    this.emitters.clear();
  }
  
  // Get particle count
  public getCount(): number {
    return this.particles.length;
  }
}

// Singleton
let particleInstance: ParticleSystem | null = null;

export function getParticleSystem(): ParticleSystem {
  if (!particleInstance) {
    particleInstance = new ParticleSystem();
  }
  return particleInstance;
}
