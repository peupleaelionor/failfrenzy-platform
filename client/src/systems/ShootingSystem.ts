/**
 * FAIL FRENZY — SHOOTING SYSTEM
 * 
 * Système de tir automatique et manuel pour le joueur.
 * Les projectiles détruisent les engins spéciaux (élites) qui apparaissent.
 * 
 * Engins Spéciaux (Élites):
 * - Sentinel: Bouclier frontal, doit être touché par derrière
 * - Phantom: Se téléporte quand touché, nécessite 2 tirs
 * - Titan: Gros, lent, 3 HP, explose en récompenses
 * - Swarm: Petit, rapide, apparaît en groupe de 3-5
 * 
 * Le joueur tire automatiquement toutes les X secondes.
 * Double-tap/clic = tir chargé (plus gros, traverse les ennemis).
 */

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  color: string;
  glowColor: string;
  alive: boolean;
  type: 'normal' | 'charged' | 'homing';
  trail: { x: number; y: number; alpha: number }[];
  piercing: boolean;
  lifetime: number;
}

export type EliteType = 'sentinel' | 'phantom' | 'titan' | 'swarm';

export interface EliteEnemy {
  id: string;
  type: EliteType;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  color: string;
  glowColor: string;
  alive: boolean;
  rotation: number;
  behavior: EliteBehavior;
  reward: { score: number; tokens: number; energy: number };
  flashTimer: number;
  deathTimer: number;
  shieldAngle?: number; // For Sentinel
  teleportCooldown?: number; // For Phantom
}

interface EliteBehavior {
  pattern: 'linear' | 'sine' | 'zigzag' | 'chase' | 'orbit';
  amplitude: number;
  frequency: number;
  phase: number;
  baseY: number;
}

// Elite definitions
const ELITE_DEFS: Record<EliteType, {
  name: string;
  hp: number;
  width: number;
  speed: number;
  color: string;
  glowColor: string;
  pattern: EliteBehavior['pattern'];
  reward: { score: number; tokens: number; energy: number };
}> = {
  sentinel: {
    name: 'Sentinelle',
    hp: 2,
    width: 44,
    speed: 0.7,
    color: '#ff6600',
    glowColor: '#ff8800',
    pattern: 'linear',
    reward: { score: 150, tokens: 5, energy: 10 },
  },
  phantom: {
    name: 'Fantôme',
    hp: 2,
    width: 36,
    speed: 0.9,
    color: '#8800ff',
    glowColor: '#aa44ff',
    pattern: 'sine',
    reward: { score: 200, tokens: 8, energy: 15 },
  },
  titan: {
    name: 'Titan',
    hp: 5,
    width: 64,
    speed: 0.4,
    color: '#ff0044',
    glowColor: '#ff2266',
    pattern: 'linear',
    reward: { score: 500, tokens: 15, energy: 25 },
  },
  swarm: {
    name: 'Essaim',
    hp: 1,
    width: 24,
    speed: 1.4,
    color: '#00ff88',
    glowColor: '#44ffaa',
    pattern: 'zigzag',
    reward: { score: 50, tokens: 2, energy: 5 },
  },
};

export class ShootingSystem {
  private projectiles: Projectile[] = [];
  private elites: EliteEnemy[] = [];
  
  // Auto-fire
  private autoFireTimer: number = 0;
  private autoFireRate: number = 0.35; // seconds between shots
  
  // Charged shot
  private chargeTimer: number = 0;
  private isCharging: boolean = false;
  private maxCharge: number = 1.5;
  
  // Elite spawn
  private eliteSpawnTimer: number = 0;
  private eliteSpawnInterval: number = 12; // seconds
  private elitesKilled: number = 0;
  
  // Stats
  private totalShotsFired: number = 0;
  private totalHits: number = 0;
  
  // Callbacks
  private onScoreCallback?: (score: number, x: number, y: number) => void;
  private onTokensCallback?: (tokens: number) => void;
  private onEnergyCallback?: (energy: number) => void;
  private onShakeCallback?: (duration: number) => void;
  
  constructor() {}
  
  public onScore(cb: (score: number, x: number, y: number) => void) { this.onScoreCallback = cb; }
  public onTokens(cb: (tokens: number) => void) { this.onTokensCallback = cb; }
  public onEnergy(cb: (energy: number) => void) { this.onEnergyCallback = cb; }
  public onShake(cb: (duration: number) => void) { this.onShakeCallback = cb; }
  
  // ==================== FIRE ====================
  
  public fire(playerX: number, playerY: number, skinColor: string, skinGlow: string): void {
    const proj: Projectile = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      x: playerX + 30,
      y: playerY,
      vx: 600,
      vy: 0,
      width: 12,
      height: 4,
      damage: 1,
      color: skinColor,
      glowColor: skinGlow,
      alive: true,
      type: 'normal',
      trail: [],
      piercing: false,
      lifetime: 3,
    };
    this.projectiles.push(proj);
    this.totalShotsFired++;
  }
  
  public fireCharged(playerX: number, playerY: number, charge: number, skinColor: string, skinGlow: string): void {
    const power = Math.min(charge / this.maxCharge, 1);
    const proj: Projectile = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      x: playerX + 30,
      y: playerY,
      vx: 500 + power * 300,
      vy: 0,
      width: 16 + power * 20,
      height: 6 + power * 10,
      damage: 1 + Math.floor(power * 3),
      color: '#ffffff',
      glowColor: skinGlow,
      alive: true,
      type: 'charged',
      trail: [],
      piercing: power > 0.7,
      lifetime: 4,
    };
    this.projectiles.push(proj);
    this.totalShotsFired++;
  }
  
  // ==================== UPDATE ====================
  
  public update(dt: number, playerX: number, playerY: number, skinColor: string, skinGlow: string, gameSpeed: number): void {
    // Auto-fire
    this.autoFireTimer += dt;
    if (this.autoFireTimer >= this.autoFireRate) {
      this.fire(playerX, playerY, skinColor, skinGlow);
      this.autoFireTimer = 0;
    }
    
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime -= dt;
      
      // Trail
      p.trail.push({ x: p.x, y: p.y, alpha: 1 });
      if (p.trail.length > 8) p.trail.shift();
      for (const t of p.trail) t.alpha -= dt * 4;
      p.trail = p.trail.filter(t => t.alpha > 0);
      
      // Remove if off-screen or expired
      if (p.x > 850 || p.x < -50 || p.y < -50 || p.y > 650 || p.lifetime <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // Elite spawn
    this.eliteSpawnTimer += dt;
    const adjustedInterval = Math.max(6, this.eliteSpawnInterval - this.elitesKilled * 0.3);
    if (this.eliteSpawnTimer >= adjustedInterval) {
      this.spawnElite(gameSpeed);
      this.eliteSpawnTimer = 0;
    }
    
    // Update elites
    for (let i = this.elites.length - 1; i >= 0; i--) {
      const e = this.elites[i];
      
      // Movement
      const speed = e.speed * gameSpeed;
      e.x -= speed * dt * 100;
      e.rotation += dt * 2;
      
      // Behavior patterns
      switch (e.behavior.pattern) {
        case 'sine':
          e.y = e.behavior.baseY + Math.sin(e.behavior.phase) * e.behavior.amplitude;
          e.behavior.phase += dt * e.behavior.frequency;
          break;
        case 'zigzag':
          e.y = e.behavior.baseY + ((Math.floor(e.behavior.phase) % 2 === 0 ? 1 : -1)) * e.behavior.amplitude * 0.5;
          e.behavior.phase += dt * e.behavior.frequency;
          break;
        case 'chase':
          const dy = playerY - e.y;
          e.y += Math.sign(dy) * Math.min(Math.abs(dy), 80 * dt);
          break;
      }
      
      // Sentinel shield rotation
      if (e.type === 'sentinel' && e.shieldAngle !== undefined) {
        e.shieldAngle += dt * 2;
      }
      
      // Phantom teleport cooldown
      if (e.type === 'phantom' && e.teleportCooldown !== undefined && e.teleportCooldown > 0) {
        e.teleportCooldown -= dt;
      }
      
      // Flash timer
      if (e.flashTimer > 0) e.flashTimer -= dt * 4;
      
      // Death animation
      if (!e.alive && e.deathTimer > 0) {
        e.deathTimer -= dt;
        if (e.deathTimer <= 0) {
          this.elites.splice(i, 1);
          continue;
        }
      }
      
      // Remove if off-screen
      if (e.x < -100) {
        this.elites.splice(i, 1);
      }
    }
    
    // Check projectile-elite collisions
    this.checkProjectileCollisions();
  }
  
  // ==================== SPAWN ELITES ====================
  
  private spawnElite(gameSpeed: number): void {
    // Choose type based on difficulty
    const types: EliteType[] = ['sentinel', 'phantom', 'titan', 'swarm'];
    const weights = [3, 2, 1, 4]; // swarm most common, titan rarest
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    let type: EliteType = 'swarm';
    for (let i = 0; i < types.length; i++) {
      r -= weights[i];
      if (r <= 0) { type = types[i]; break; }
    }
    
    const def = ELITE_DEFS[type];
    const y = 60 + Math.random() * 480;
    
    if (type === 'swarm') {
      // Spawn group of 3-5
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        this.createElite(type, def, 850 + i * 40, y + (i - count / 2) * 30, gameSpeed);
      }
    } else {
      this.createElite(type, def, 850, y, gameSpeed);
    }
  }
  
  private createElite(type: EliteType, def: typeof ELITE_DEFS[EliteType], x: number, y: number, gameSpeed: number): void {
    const elite: EliteEnemy = {
      id: `elite-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      x,
      y,
      width: def.width,
      height: def.width,
      hp: def.hp,
      maxHp: def.hp,
      speed: def.speed * (1 + gameSpeed * 0.1),
      color: def.color,
      glowColor: def.glowColor,
      alive: true,
      rotation: 0,
      behavior: {
        pattern: def.pattern,
        amplitude: 40 + Math.random() * 60,
        frequency: 2 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        baseY: y,
      },
      reward: { ...def.reward },
      flashTimer: 0,
      deathTimer: 0,
      shieldAngle: type === 'sentinel' ? 0 : undefined,
      teleportCooldown: type === 'phantom' ? 0 : undefined,
    };
    
    // Titan chases player
    if (type === 'titan') {
      elite.behavior.pattern = 'chase';
    }
    
    this.elites.push(elite);
  }
  
  // ==================== COLLISIONS ====================
  
  private checkProjectileCollisions(): void {
    for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
      const p = this.projectiles[pi];
      if (!p.alive) continue;
      
      for (let ei = this.elites.length - 1; ei >= 0; ei--) {
        const e = this.elites[ei];
        if (!e.alive) continue;
        
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < (p.width / 2 + e.width / 2)) {
          // Hit!
          this.totalHits++;
          
          // Sentinel: check if hit from behind (projectile x > enemy x)
          if (e.type === 'sentinel' && p.x < e.x + e.width * 0.3) {
            // Blocked by shield - deflect
            p.vx = -p.vx * 0.5;
            p.vy = (Math.random() - 0.5) * 200;
            e.flashTimer = 1;
            continue;
          }
          
          // Phantom: teleport on first hit
          if (e.type === 'phantom' && e.teleportCooldown !== undefined && e.teleportCooldown <= 0) {
            e.x = 400 + Math.random() * 350;
            e.y = 60 + Math.random() * 480;
            e.behavior.baseY = e.y;
            e.teleportCooldown = 3;
            e.hp -= p.damage;
            e.flashTimer = 1;
            if (!p.piercing) p.alive = false;
          } else {
            e.hp -= p.damage;
            e.flashTimer = 1;
            if (!p.piercing) p.alive = false;
          }
          
          // Check death
          if (e.hp <= 0) {
            e.alive = false;
            e.deathTimer = 0.5;
            this.elitesKilled++;
            
            // Rewards
            if (this.onScoreCallback) this.onScoreCallback(e.reward.score, e.x, e.y);
            if (this.onTokensCallback) this.onTokensCallback(e.reward.tokens);
            if (this.onEnergyCallback) this.onEnergyCallback(e.reward.energy);
            if (this.onShakeCallback) this.onShakeCallback(e.type === 'titan' ? 200 : 80);
          }
          
          if (!p.piercing && p.alive) {
            p.alive = false;
          }
        }
      }
    }
    
    // Clean dead projectiles
    this.projectiles = this.projectiles.filter(p => p.alive);
  }
  
  // ==================== RENDER ====================
  
  public render(ctx: CanvasRenderingContext2D, time: number): void {
    // Render projectiles
    for (const p of this.projectiles) {
      // Trail
      for (const t of p.trail) {
        ctx.save();
        ctx.globalAlpha = t.alpha * 0.4;
        ctx.fillStyle = p.glowColor;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.glowColor;
        ctx.fillRect(t.x - p.width * 0.3, t.y - p.height * 0.3, p.width * 0.6, p.height * 0.6);
        ctx.restore();
      }
      
      // Main projectile
      ctx.save();
      ctx.translate(p.x, p.y);
      
      if (p.type === 'charged') {
        // Charged shot - bright orb
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.width / 2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, p.glowColor + '00');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 25;
        ctx.shadowColor = p.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal shot - laser bolt
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.glowColor;
        
        // Core
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        
        // Bright center
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(-p.width / 3, -p.height / 4, p.width * 0.6, p.height / 2);
      }
      
      ctx.restore();
    }
    
    // Render elites
    for (const e of this.elites) {
      ctx.save();
      ctx.translate(e.x, e.y);
      
      // Death animation
      if (!e.alive) {
        const deathProgress = 1 - (e.deathTimer / 0.5);
        ctx.globalAlpha = 1 - deathProgress;
        ctx.scale(1 + deathProgress * 2, 1 + deathProgress * 2);
      }
      
      // Flash on hit
      const flashAlpha = e.flashTimer > 0 ? 0.5 : 0;
      
      // Draw based on type
      switch (e.type) {
        case 'sentinel':
          this.renderSentinel(ctx, e, time, flashAlpha);
          break;
        case 'phantom':
          this.renderPhantom(ctx, e, time, flashAlpha);
          break;
        case 'titan':
          this.renderTitan(ctx, e, time, flashAlpha);
          break;
        case 'swarm':
          this.renderSwarm(ctx, e, time, flashAlpha);
          break;
      }
      
      // HP bar (if not full)
      if (e.alive && e.hp < e.maxHp) {
        const barW = e.width * 0.8;
        const barH = 3;
        const barY = -e.width / 2 - 10;
        
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-barW / 2, barY, barW, barH);
        
        ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#00ff88' : e.hp / e.maxHp > 0.25 ? '#ffaa00' : '#ff0044';
        ctx.fillRect(-barW / 2, barY, barW * (e.hp / e.maxHp), barH);
      }
      
      // Elite label
      if (e.alive) {
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = e.glowColor;
        ctx.globalAlpha = 0.7;
        ctx.fillText(ELITE_DEFS[e.type].name.toUpperCase(), 0, -e.width / 2 - 14);
      }
      
      ctx.restore();
    }
  }
  
  // ==================== ELITE RENDERERS ====================
  
  private renderSentinel(ctx: CanvasRenderingContext2D, e: EliteEnemy, time: number, flash: number): void {
    const s = e.width / 2;
    
    // Shield (front arc)
    if (e.shieldAngle !== undefined) {
      ctx.save();
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff8800';
      ctx.globalAlpha = 0.6 + Math.sin(time * 4) * 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, s + 6, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.restore();
    }
    
    // Body - hexagonal
    ctx.save();
    ctx.fillStyle = flash > 0 ? '#ffffff' : e.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = e.glowColor;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + e.rotation * 0.3;
      const px = Math.cos(angle) * s;
      const py = Math.sin(angle) * s;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  private renderPhantom(ctx: CanvasRenderingContext2D, e: EliteEnemy, time: number, flash: number): void {
    const s = e.width / 2;
    
    // Ghostly body with transparency
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.2;
    ctx.fillStyle = flash > 0 ? '#ffffff' : e.color;
    ctx.shadowBlur = 25;
    ctx.shadowColor = e.glowColor;
    
    // Diamond shape
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.8, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Glitch lines
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = e.glowColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time * 10 + i * 2) * 5;
      ctx.beginPath();
      ctx.moveTo(-s + offset, -s * 0.5 + i * s * 0.5);
      ctx.lineTo(s + offset, -s * 0.5 + i * s * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  private renderTitan(ctx: CanvasRenderingContext2D, e: EliteEnemy, time: number, flash: number): void {
    const s = e.width / 2;
    
    // Danger aura
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(time * 2) * 0.05;
    const auraGrad = ctx.createRadialGradient(0, 0, s * 0.5, 0, 0, s * 1.5);
    auraGrad.addColorStop(0, e.glowColor + '40');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Heavy armored body
    ctx.save();
    ctx.fillStyle = flash > 0 ? '#ffffff' : e.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = e.glowColor;
    
    // Octagonal shape
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i + Math.PI / 8;
      const px = Math.cos(angle) * s;
      const py = Math.sin(angle) * s;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Inner armor plates
    ctx.save();
    ctx.strokeStyle = '#ff4466';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // Pulsing core
    ctx.save();
    const coreSize = s * 0.25 + Math.sin(time * 5) * s * 0.05;
    ctx.fillStyle = '#ff0044';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0044';
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  private renderSwarm(ctx: CanvasRenderingContext2D, e: EliteEnemy, time: number, flash: number): void {
    const s = e.width / 2;
    
    // Small triangle
    ctx.save();
    ctx.rotate(e.rotation);
    ctx.fillStyle = flash > 0 ? '#ffffff' : e.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = e.glowColor;
    ctx.beginPath();
    ctx.moveTo(s, 0);
    ctx.lineTo(-s * 0.6, -s * 0.7);
    ctx.lineTo(-s * 0.6, s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Tiny core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // ==================== PUBLIC API ====================
  
  public getProjectiles(): Projectile[] { return this.projectiles; }
  public getElites(): EliteEnemy[] { return this.elites; }
  public getElitesKilled(): number { return this.elitesKilled; }
  public getAccuracy(): number { return this.totalShotsFired > 0 ? this.totalHits / this.totalShotsFired : 0; }
  
  /** Check if an elite collides with the player (for damage) */
  public checkPlayerCollision(px: number, py: number, pw: number): EliteEnemy | null {
    for (const e of this.elites) {
      if (!e.alive) continue;
      const dx = px - e.x;
      const dy = py - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (pw / 2 + e.width / 2) * 0.75) {
        return e;
      }
    }
    return null;
  }
  
  public reset(): void {
    this.projectiles = [];
    this.elites = [];
    this.autoFireTimer = 0;
    this.chargeTimer = 0;
    this.isCharging = false;
    this.eliteSpawnTimer = 0;
    this.elitesKilled = 0;
    this.totalShotsFired = 0;
    this.totalHits = 0;
  }
}
