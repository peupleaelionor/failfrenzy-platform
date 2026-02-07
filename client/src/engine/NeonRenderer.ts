/**
 * FAIL FRENZY - ULTIMATE Neon Glitch Pop Renderer
 * Premium rendering system with extreme glow, scanlines, chromatic aberration,
 * particle trails, shockwaves, and dynamic visual effects
 */

export interface NeonStyle {
  glowIntensity: number;
  glowColor: string;
  scanlineOpacity: number;
  chromaticAberration: number;
  bloomStrength: number;
  pulseSpeed: number;
  glitchIntensity: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
  color: string;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  thickness: number;
}

export class NeonRenderer {
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private style: NeonStyle;
  private time: number = 0;
  
  // Trail system
  private trails: Map<string, TrailPoint[]> = new Map();
  private maxTrailLength: number = 20;
  
  // Shockwave system
  private shockwaves: Shockwave[] = [];
  
  // Screen flash
  private flashAlpha: number = 0;
  private flashColor: string = '#ffffff';
  
  // Neon colors - Extended palette
  public static COLORS = {
    CYAN: '#00ffff',
    MAGENTA: '#ff00ff',
    YELLOW: '#ffff00',
    GREEN: '#00ff00',
    ORANGE: '#ff6600',
    BLUE: '#0066ff',
    RED: '#ff0066',
    WHITE: '#ffffff',
    PINK: '#ff69b4',
    PURPLE: '#9400d3',
    LIME: '#32cd32',
    GOLD: '#ffd700',
  };
  
  // Gradient presets
  public static GRADIENTS = {
    CYBER: ['#00ffff', '#ff00ff'],
    SUNSET: ['#ff6600', '#ff0066'],
    MATRIX: ['#00ff00', '#003300'],
    FIRE: ['#ffff00', '#ff0000'],
    ICE: ['#00ffff', '#0066ff'],
    RAINBOW: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
  };
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    
    // Create offscreen canvas for post-processing
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    
    this.style = {
      glowIntensity: 15,
      glowColor: NeonRenderer.COLORS.CYAN,
      scanlineOpacity: 0.08,
      chromaticAberration: 3,
      bloomStrength: 0.6,
      pulseSpeed: 2,
      glitchIntensity: 0.3,
    };
  }
  
  // Update time for animations
  public update(dt: number): void {
    this.time += dt;
    
    // Update shockwaves
    this.shockwaves = this.shockwaves.filter(sw => {
      sw.radius += 300 * dt;
      sw.alpha -= dt * 2;
      return sw.alpha > 0 && sw.radius < sw.maxRadius;
    });
    
    // Update trails
    this.trails.forEach((trail, key) => {
      trail.forEach(point => {
        point.alpha -= dt * 2;
      });
      this.trails.set(key, trail.filter(p => p.alpha > 0));
    });
    
    // Update flash
    if (this.flashAlpha > 0) {
      this.flashAlpha -= dt * 4;
    }
  }
  
  // Add trail point for an entity
  public addTrailPoint(id: string, x: number, y: number, color: string, size: number = 10): void {
    if (!this.trails.has(id)) {
      this.trails.set(id, []);
    }
    
    const trail = this.trails.get(id)!;
    trail.push({ x, y, alpha: 1, size, color });
    
    if (trail.length > this.maxTrailLength) {
      trail.shift();
    }
  }
  
  // Spawn shockwave effect
  public spawnShockwave(x: number, y: number, color: string = NeonRenderer.COLORS.CYAN, maxRadius: number = 200): void {
    this.shockwaves.push({
      x, y,
      radius: 10,
      maxRadius,
      alpha: 1,
      color,
      thickness: 4,
    });
  }
  
  // Trigger screen flash
  public flash(color: string = '#ffffff', intensity: number = 0.8): void {
    this.flashColor = color;
    this.flashAlpha = intensity;
  }
  
  // Draw all trails
  public drawTrails(): void {
    this.trails.forEach(trail => {
      for (let i = 0; i < trail.length; i++) {
        const point = trail[i];
        const progress = i / trail.length;
        
        this.ctx.save();
        this.ctx.globalAlpha = point.alpha * progress * 0.6;
        this.ctx.shadowBlur = this.style.glowIntensity * progress;
        this.ctx.shadowColor = point.color;
        this.ctx.fillStyle = point.color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, point.size * progress, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });
  }
  
  // Draw all shockwaves
  public drawShockwaves(): void {
    for (const sw of this.shockwaves) {
      this.ctx.save();
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.strokeStyle = sw.color;
      this.ctx.lineWidth = sw.thickness;
      this.ctx.shadowBlur = this.style.glowIntensity * 2;
      this.ctx.shadowColor = sw.color;
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
  
  // Draw screen flash
  public drawFlash(): void {
    if (this.flashAlpha > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = this.flashAlpha;
      this.ctx.fillStyle = this.flashColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }
  }
  
  // Draw neon line with glow and pulse
  public drawNeonLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number = 2,
    pulse: boolean = true
  ): void {
    const ctx = this.ctx;
    const pulseIntensity = pulse ? 1 + Math.sin(this.time * this.style.pulseSpeed) * 0.3 : 1;
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 2 * pulseIntensity;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = width + 6;
    ctx.globalAlpha = 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
    
    // Middle glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * pulseIntensity;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = width + 3;
    ctx.globalAlpha = 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
    
    // Core line
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 0.5;
    ctx.shadowColor = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  
  // Draw neon circle with glow and pulse
  public drawNeonCircle(
    x: number,
    y: number,
    radius: number,
    color: string,
    fill: boolean = false,
    pulse: boolean = true
  ): void {
    const ctx = this.ctx;
    const pulseIntensity = pulse ? 1 + Math.sin(this.time * this.style.pulseSpeed) * 0.2 : 1;
    const pulseRadius = radius * (pulse ? (1 + Math.sin(this.time * this.style.pulseSpeed * 2) * 0.05) : 1);
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 3 * pulseIntensity;
    ctx.shadowColor = color;
    
    if (fill) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius * 1.5);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + '80');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    
    // Inner glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 1.5 * pulseIntensity;
    ctx.shadowColor = color;
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    
    // Core
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 0.5;
    ctx.shadowColor = '#ffffff';
    if (fill) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // Draw neon rectangle with glow
  public drawNeonRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    fill: boolean = false,
    cornerRadius: number = 0
  ): void {
    const ctx = this.ctx;
    const pulseIntensity = 1 + Math.sin(this.time * this.style.pulseSpeed) * 0.2;
    
    const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 2 * pulseIntensity;
    ctx.shadowColor = color;
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      drawRoundedRect(ctx, x - 3, y - 3, width + 6, height + 6, cornerRadius);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.globalAlpha = 0.3;
      drawRoundedRect(ctx, x, y, width, height, cornerRadius);
      ctx.stroke();
    }
    ctx.restore();
    
    // Inner glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * pulseIntensity;
    ctx.shadowColor = color;
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      drawRoundedRect(ctx, x - 1, y - 1, width + 2, height + 2, cornerRadius);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      drawRoundedRect(ctx, x, y, width, height, cornerRadius);
      ctx.stroke();
    }
    ctx.restore();
    
    // Core
    ctx.save();
    if (fill) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      drawRoundedRect(ctx, x, y, width, height, cornerRadius);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, x, y, width, height, cornerRadius);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // Draw neon triangle
  public drawNeonTriangle(
    x: number,
    y: number,
    size: number,
    color: string,
    rotation: number = 0,
    fill: boolean = false
  ): void {
    const ctx = this.ctx;
    const pulseIntensity = 1 + Math.sin(this.time * this.style.pulseSpeed) * 0.2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    const drawTriangle = () => {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.866, size * 0.5);
      ctx.lineTo(-size * 0.866, size * 0.5);
      ctx.closePath();
    };
    
    // Outer glow
    ctx.shadowBlur = this.style.glowIntensity * 2 * pulseIntensity;
    ctx.shadowColor = color;
    ctx.globalAlpha = 0.3;
    if (fill) {
      ctx.fillStyle = color;
      drawTriangle();
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      drawTriangle();
      ctx.stroke();
    }
    
    // Inner glow
    ctx.shadowBlur = this.style.glowIntensity * pulseIntensity;
    ctx.globalAlpha = 0.6;
    if (fill) {
      ctx.fillStyle = color;
      drawTriangle();
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      drawTriangle();
      ctx.stroke();
    }
    
    // Core
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    if (fill) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      drawTriangle();
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      drawTriangle();
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Draw neon text with glow and optional animation
  public drawNeonText(
    text: string,
    x: number,
    y: number,
    color: string,
    font: string = '24px "Press Start 2P"',
    animate: boolean = false
  ): void {
    const ctx = this.ctx;
    const pulseIntensity = animate ? 1 + Math.sin(this.time * this.style.pulseSpeed * 3) * 0.3 : 1;
    
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Chromatic aberration effect for animated text
    if (animate && this.style.chromaticAberration > 0) {
      const offset = Math.sin(this.time * 10) * 2;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff0000';
      ctx.fillText(text, x - offset, y);
      ctx.fillStyle = '#0000ff';
      ctx.fillText(text, x + offset, y);
      ctx.restore();
    }
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 3 * pulseIntensity;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fillText(text, x, y);
    ctx.restore();
    
    // Inner glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 1.5 * pulseIntensity;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fillText(text, x, y);
    ctx.restore();
    
    // Core text
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 0.5;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  
  // Draw glitch effect (enhanced)
  public drawGlitch(
    x: number,
    y: number,
    width: number,
    height: number,
    intensity: number = 0.5
  ): void {
    const ctx = this.ctx;
    const slices = Math.floor(Math.random() * 8) + 4;
    
    for (let i = 0; i < slices; i++) {
      if (Math.random() > intensity) continue;
      
      const sliceY = y + (height / slices) * i;
      const sliceHeight = height / slices;
      const offset = (Math.random() - 0.5) * 30 * intensity;
      
      try {
        const imageData = ctx.getImageData(x, sliceY, width, sliceHeight);
        ctx.putImageData(imageData, x + offset, sliceY);
      } catch (e) {
        // Ignore security errors
      }
      
      // Add color distortion
      if (Math.random() > 0.5) {
        ctx.save();
        ctx.globalAlpha = 0.4 * intensity;
        ctx.fillStyle = Math.random() > 0.5 ? NeonRenderer.COLORS.CYAN : NeonRenderer.COLORS.MAGENTA;
        ctx.fillRect(x + offset, sliceY, width, sliceHeight);
        ctx.restore();
      }
      
      // Add horizontal lines
      if (Math.random() > 0.7) {
        ctx.save();
        ctx.strokeStyle = NeonRenderer.COLORS.WHITE;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, sliceY);
        ctx.lineTo(this.width, sliceY);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
  
  // Draw scanlines overlay (enhanced)
  public drawScanlines(): void {
    const ctx = this.ctx;
    const lineHeight = 2;
    const time = this.time;
    
    ctx.save();
    ctx.globalAlpha = this.style.scanlineOpacity;
    ctx.fillStyle = '#000000';
    
    for (let y = 0; y < this.height; y += lineHeight * 2) {
      // Add slight wave effect
      const offset = Math.sin(y * 0.01 + time) * 0.5;
      ctx.fillRect(0, y + offset, this.width, lineHeight);
    }
    
    // Add moving scanline
    const scanY = (time * 100) % this.height;
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = NeonRenderer.COLORS.CYAN;
    ctx.fillRect(0, scanY, this.width, 4);
    
    ctx.restore();
  }
  
  // Draw animated grid background
  public drawGrid(cellSize: number = 50, color: string = NeonRenderer.COLORS.CYAN): void {
    const ctx = this.ctx;
    const offset = (this.time * 20) % cellSize;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;
    
    // Vertical lines (moving)
    for (let x = -offset; x < this.width + cellSize; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    
    // Add perspective grid at bottom
    ctx.globalAlpha = 0.05;
    const horizon = this.height * 0.4;
    for (let i = 0; i < 20; i++) {
      const y = horizon + (this.height - horizon) * (i / 20);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Draw vignette effect
  public drawVignette(intensity: number = 0.5): void {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.height * 0.3,
      this.width / 2, this.height / 2, this.height
    );
    
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
  
  // Draw particle with trail
  public drawParticle(
    x: number,
    y: number,
    size: number,
    color: string,
    alpha: number = 1,
    trail: boolean = false
  ): void {
    const ctx = this.ctx;
    
    if (trail) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + '40');
      gradient.addColorStop(1, 'transparent');
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw particle
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity;
    ctx.shadowColor = color;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Apply chromatic aberration effect
  public applyChromaticAberration(intensity: number = 2): void {
    if (intensity <= 0) return;
    
    const ctx = this.ctx;
    
    try {
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;
      
      const redChannel = new Uint8ClampedArray(data.length / 4);
      const blueChannel = new Uint8ClampedArray(data.length / 4);
      
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        redChannel[idx] = data[i];
        blueChannel[idx] = data[i + 2];
      }
      
      const offset = Math.floor(intensity);
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = y * this.width + x;
          const pixelIdx = idx * 4;
          
          const redIdx = y * this.width + Math.max(0, x - offset);
          data[pixelIdx] = redChannel[redIdx];
          
          const blueIdx = y * this.width + Math.min(this.width - 1, x + offset);
          data[pixelIdx + 2] = blueChannel[blueIdx];
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Draw combo multiplier effect
  public drawComboEffect(combo: number, x: number, y: number): void {
    if (combo <= 0) return;
    
    const ctx = this.ctx;
    const scale = 1 + Math.min(combo * 0.1, 1);
    const colors = [
      NeonRenderer.COLORS.YELLOW,
      NeonRenderer.COLORS.ORANGE,
      NeonRenderer.COLORS.RED,
      NeonRenderer.COLORS.MAGENTA,
      NeonRenderer.COLORS.PURPLE,
    ];
    const color = colors[Math.min(Math.floor(combo / 5), colors.length - 1)];
    
    // Pulsing ring
    const ringRadius = 50 + Math.sin(this.time * 8) * 10;
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // Combo text
    this.drawNeonText(
      `x${combo}`,
      x,
      y,
      color,
      `${Math.floor(24 * scale)}px "Press Start 2P"`,
      true
    );
  }
  
  // Set neon style
  public setStyle(style: Partial<NeonStyle>): void {
    this.style = { ...this.style, ...style };
  }
  
  // Get random neon color
  public static getRandomColor(): string {
    const colors = Object.values(NeonRenderer.COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Get gradient colors
  public static getGradient(name: keyof typeof NeonRenderer.GRADIENTS): string[] {
    return NeonRenderer.GRADIENTS[name];
  }
}
