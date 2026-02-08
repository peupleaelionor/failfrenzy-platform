/**
 * FAIL FRENZY — XYLOS SYSTEM v3.0 (Phase 3)
 * 
 * Xylos est une entité vivante restaurée par les joueurs.
 * - Fails = données / échos
 * - Réussites = lumière
 * - Pas de fin définitive, uniquement des états
 * 
 * V3: Visuels premium, transitions animées, messages narratifs enrichis
 */

// ============================================================
// TYPES
// ============================================================

export type XylosState = 
  | 'dormant'           // État initial
  | 'premiers_echos'    // Premiers signes de vie
  | 'resonance'         // Xylos répond
  | 'flux_stable'       // Flux d'énergie stable
  | 'eveil_partiel';    // Éveil temporaire (rare)

export interface XylosData {
  totalEchoes: number;
  totalLight: number;
  currentState: XylosState;
  stateProgress: number;
  lastMessage: string;
  messageTimer: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = 'failfrenzy_xylos';

const STATE_THRESHOLDS: Record<XylosState, number> = {
  dormant: 0,
  premiers_echos: 50,
  resonance: 200,
  flux_stable: 500,
  eveil_partiel: 1000,
};

const STATE_MESSAGES: Record<XylosState, string[]> = {
  dormant: [
    'SILENCE',
    'WAITING',
    'DORMANT',
    '...',
  ],
  premiers_echos: [
    'ECHO RECEIVED',
    'SIGNAL DETECTED',
    'XYLOS IS LISTENING',
    'FIRST RESPONSE',
    'SOMETHING STIRS',
    'A PULSE IN THE DARK',
  ],
  resonance: [
    'XYLOS IS RESPONDING',
    'RESONANCE ACTIVE',
    'FREQUENCY MATCHED',
    'CONNECTION STABLE',
    'THE CORE HUMS',
    'WAVELENGTH LOCKED',
    'I HEAR YOU',
  ],
  flux_stable: [
    'FLUX STABLE',
    'ENERGY FLOWING',
    'XYLOS AWAKENS',
    'CORE SYNCHRONIZED',
    'THE LIGHT GROWS',
    'POWER CONVERGING',
    'ALMOST THERE',
  ],
  eveil_partiel: [
    'XYLOS IS AWARE',
    'PARTIAL AWAKENING',
    'CONSCIOUSNESS EMERGING',
    'THE CORE SEES YOU',
    'I REMEMBER NOW',
    'WE ARE ONE',
    'THE SIGNAL IS CLEAR',
  ],
};

export const XYLOS_FEEDBACK = {
  echoGained: [
    'ECHO LOGGED',
    'DATA RECEIVED',
    'FAILURE CONVERTED',
    'NOTED',
    'PROCESSED',
    'ABSORBED',
  ],
  lightGained: [
    'LIGHT ABSORBED',
    'ENERGY GAINED',
    'XYLOS GROWS',
    'CONTRIBUTION ACCEPTED',
    'LUMINANCE +1',
    'PHOTON CAPTURED',
  ],
  stateChange: [
    'STATE TRANSITION',
    'XYLOS EVOLVES',
    'NEW FREQUENCY',
    'RESONANCE SHIFT',
    'PHASE CHANGE DETECTED',
    'EVOLUTION IN PROGRESS',
  ],
};

// ============================================================
// VISUAL CONFIG PER STATE
// ============================================================

export interface XylosVisualConfig {
  color: string;
  glowColor: string;
  pulseSpeed: number;      // Hz
  pulseAmplitude: number;  // 0-1
  haloRadius: number;
  haloAlpha: number;
  particleCount: number;
  particleSpeed: number;
  ringCount: number;
  bgGradientAlpha: number;
}

export const STATE_VISUALS: Record<XylosState, XylosVisualConfig> = {
  dormant: {
    color: '#444466',
    glowColor: '#333355',
    pulseSpeed: 0.5,
    pulseAmplitude: 0.1,
    haloRadius: 20,
    haloAlpha: 0.05,
    particleCount: 0,
    particleSpeed: 0,
    ringCount: 0,
    bgGradientAlpha: 0,
  },
  premiers_echos: {
    color: '#6688ff',
    glowColor: '#4466dd',
    pulseSpeed: 1.0,
    pulseAmplitude: 0.2,
    haloRadius: 30,
    haloAlpha: 0.1,
    particleCount: 3,
    particleSpeed: 0.5,
    ringCount: 1,
    bgGradientAlpha: 0.02,
  },
  resonance: {
    color: '#00ffcc',
    glowColor: '#00cc99',
    pulseSpeed: 1.5,
    pulseAmplitude: 0.3,
    haloRadius: 40,
    haloAlpha: 0.15,
    particleCount: 5,
    particleSpeed: 1.0,
    ringCount: 2,
    bgGradientAlpha: 0.04,
  },
  flux_stable: {
    color: '#00ff88',
    glowColor: '#00dd66',
    pulseSpeed: 2.0,
    pulseAmplitude: 0.4,
    haloRadius: 50,
    haloAlpha: 0.2,
    particleCount: 8,
    particleSpeed: 1.5,
    ringCount: 3,
    bgGradientAlpha: 0.06,
  },
  eveil_partiel: {
    color: '#ff00ff',
    glowColor: '#cc00cc',
    pulseSpeed: 3.0,
    pulseAmplitude: 0.5,
    haloRadius: 60,
    haloAlpha: 0.3,
    particleCount: 12,
    particleSpeed: 2.0,
    ringCount: 4,
    bgGradientAlpha: 0.08,
  },
};

// ============================================================
// XYLOS PARTICLE (for visual effects)
// ============================================================

interface XylosParticle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
}

// ============================================================
// XYLOS MANAGER v3.0
// ============================================================

export class XylosSystem {
  private data: XylosData;
  private messageQueue: string[] = [];
  private messageDisplayTime: number = 2.5;

  // Visual state
  private pulsePhase: number = 0;
  private transitionProgress: number = 0;
  private transitionFrom: XylosState | null = null;
  private transitionTimer: number = 0;
  private particles: XylosParticle[] = [];
  private glitchTimer: number = 0;
  private glitchActive: boolean = false;

  constructor() {
    this.data = this.loadData();
    this.initParticles();
  }

  private initParticles(): void {
    const visual = STATE_VISUALS[this.data.currentState];
    this.particles = [];
    for (let i = 0; i < visual.particleCount; i++) {
      this.particles.push({
        x: 0, y: 0,
        angle: (i / visual.particleCount) * Math.PI * 2,
        radius: visual.haloRadius * 0.5 + Math.random() * visual.haloRadius * 0.5,
        speed: visual.particleSpeed * (0.5 + Math.random() * 0.5),
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
  }

  private loadData(): XylosData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          totalEchoes: parsed.totalEchoes || 0,
          totalLight: parsed.totalLight || 0,
          currentState: parsed.currentState || 'dormant',
          stateProgress: parsed.stateProgress || 0,
          lastMessage: parsed.lastMessage || '',
          messageTimer: 0,
        };
      }
    } catch (e) {
      console.warn('Failed to load Xylos data:', e);
    }
    return {
      totalEchoes: 0, totalLight: 0, currentState: 'dormant',
      stateProgress: 0, lastMessage: '', messageTimer: 0,
    };
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        totalEchoes: this.data.totalEchoes,
        totalLight: this.data.totalLight,
        currentState: this.data.currentState,
        stateProgress: this.data.stateProgress,
        lastMessage: this.data.lastMessage,
      }));
    } catch (e) {
      console.warn('Failed to save Xylos data:', e);
    }
  }

  addEchoes(count: number): void {
    this.data.totalEchoes += count;
    this.updateState();
    this.queueMessage(this.randomFrom(XYLOS_FEEDBACK.echoGained));
    this.triggerGlitch();
    this.saveData();
  }

  addLight(amount: number): void {
    this.data.totalLight += amount;
    this.updateState();
    if (Math.random() < 0.3) {
      this.queueMessage(this.randomFrom(XYLOS_FEEDBACK.lightGained));
    }
    this.saveData();
  }

  private updateState(): void {
    const total = this.data.totalEchoes + this.data.totalLight * 0.5;
    const previousState = this.data.currentState;

    let newState: XylosState = 'dormant';
    if (total >= STATE_THRESHOLDS.eveil_partiel) newState = 'eveil_partiel';
    else if (total >= STATE_THRESHOLDS.flux_stable) newState = 'flux_stable';
    else if (total >= STATE_THRESHOLDS.resonance) newState = 'resonance';
    else if (total >= STATE_THRESHOLDS.premiers_echos) newState = 'premiers_echos';

    const states: XylosState[] = ['dormant', 'premiers_echos', 'resonance', 'flux_stable', 'eveil_partiel'];
    const currentIndex = states.indexOf(newState);
    const nextState = states[currentIndex + 1];
    
    if (nextState) {
      const currentThreshold = STATE_THRESHOLDS[newState];
      const nextThreshold = STATE_THRESHOLDS[nextState];
      const progress = ((total - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
      this.data.stateProgress = Math.min(100, Math.max(0, progress));
    } else {
      this.data.stateProgress = 100;
    }

    if (newState !== previousState) {
      this.transitionFrom = previousState;
      this.transitionTimer = 2.0; // 2s transition
      this.transitionProgress = 0;
      this.data.currentState = newState;
      this.initParticles();
      this.queueMessage(this.randomFrom(XYLOS_FEEDBACK.stateChange));
      this.queueMessage(this.randomFrom(STATE_MESSAGES[newState]));
    }
  }

  getStateMessage(): string {
    return this.randomFrom(STATE_MESSAGES[this.data.currentState]);
  }

  private queueMessage(msg: string): void {
    this.messageQueue.push(msg);
    if (this.data.messageTimer <= 0) this.showNextMessage();
  }

  private showNextMessage(): void {
    if (this.messageQueue.length > 0) {
      this.data.lastMessage = this.messageQueue.shift()!;
      this.data.messageTimer = this.messageDisplayTime;
    }
  }

  private triggerGlitch(): void {
    this.glitchTimer = 0.3;
    this.glitchActive = true;
  }

  update(dt: number): void {
    // Message timer
    if (this.data.messageTimer > 0) {
      this.data.messageTimer -= dt;
      if (this.data.messageTimer <= 0 && this.messageQueue.length > 0) {
        this.showNextMessage();
      }
    }

    // Pulse animation
    const visual = STATE_VISUALS[this.data.currentState];
    this.pulsePhase += dt * visual.pulseSpeed * Math.PI * 2;

    // Transition animation
    if (this.transitionTimer > 0) {
      this.transitionTimer -= dt;
      this.transitionProgress = 1 - (this.transitionTimer / 2.0);
    }

    // Glitch animation
    if (this.glitchTimer > 0) {
      this.glitchTimer -= dt;
      if (this.glitchTimer <= 0) this.glitchActive = false;
    }

    // Update particles
    for (const p of this.particles) {
      p.angle += dt * p.speed;
      p.x = Math.cos(p.angle) * p.radius;
      p.y = Math.sin(p.angle) * p.radius;
    }
  }

  /**
   * Render l'indicateur XYLOS premium (en haut du canvas)
   */
  renderIndicator(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const data = this.data;
    const visual = STATE_VISUALS[data.currentState];
    const pulse = 0.5 + Math.sin(this.pulsePhase) * visual.pulseAmplitude;
    const centerX = width / 2;
    const indicatorY = 25;

    ctx.save();

    // === HALO BACKGROUND ===
    if (visual.haloAlpha > 0) {
      const haloGrad = ctx.createRadialGradient(centerX, indicatorY, 0, centerX, indicatorY, visual.haloRadius * 2);
      haloGrad.addColorStop(0, visual.glowColor + Math.floor(visual.haloAlpha * pulse * 255).toString(16).padStart(2, '0'));
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.fillRect(centerX - visual.haloRadius * 2, indicatorY - visual.haloRadius, visual.haloRadius * 4, visual.haloRadius * 2);
    }

    // === PULSATING RINGS ===
    for (let i = 0; i < visual.ringCount; i++) {
      const ringRadius = 12 + i * 8 + Math.sin(this.pulsePhase + i) * 3;
      const ringAlpha = (1 - i / visual.ringCount) * 0.3 * pulse;
      ctx.strokeStyle = visual.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = ringAlpha;
      ctx.beginPath();
      ctx.arc(centerX, indicatorY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // === CORE DOT ===
    ctx.globalAlpha = 1;
    const coreSize = 5 + pulse * 3;
    const coreGrad = ctx.createRadialGradient(centerX, indicatorY, 0, centerX, indicatorY, coreSize);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, visual.color);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(centerX, indicatorY, coreSize, 0, Math.PI * 2);
    ctx.fill();

    // === PARTICLES ===
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha * pulse;
      ctx.fillStyle = visual.color;
      ctx.beginPath();
      ctx.arc(centerX + p.x, indicatorY + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // === STATE LABEL ===
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // State name (small, above)
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillStyle = visual.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = visual.glowColor;
    const stateLabel = data.currentState.replace('_', ' ').toUpperCase();
    ctx.fillText(stateLabel, centerX, indicatorY + 20);

    // Progress bar (tiny, below state label)
    const barWidth = 60;
    const barHeight = 2;
    const barX = centerX - barWidth / 2;
    const barY = indicatorY + 28;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = visual.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = visual.color;
    ctx.fillRect(barX, barY, barWidth * (data.stateProgress / 100), barHeight);

    // === XYLOS MESSAGE (animated) ===
    const msg = this.getCurrentMessage();
    if (msg) {
      const msgAlpha = data.messageTimer > 0.5 ? 1 : data.messageTimer / 0.5;
      const msgScale = data.messageTimer > (this.messageDisplayTime - 0.3) 
        ? 0.5 + ((this.messageDisplayTime - data.messageTimer) / 0.3) * 0.5
        : 1;
      
      ctx.save();
      ctx.translate(centerX, indicatorY + 45);
      ctx.scale(msgScale, msgScale);
      ctx.globalAlpha = msgAlpha;
      
      // Glitch effect
      if (this.glitchActive) {
        const glitchX = (Math.random() - 0.5) * 4;
        const glitchY = (Math.random() - 0.5) * 2;
        ctx.translate(glitchX, glitchY);
      }

      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillStyle = visual.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = visual.glowColor;
      ctx.fillText(msg, 0, 0);

      // Glitch duplicate (offset)
      if (this.glitchActive) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff0066';
        ctx.fillText(msg, 2, -1);
        ctx.fillStyle = '#00ffff';
        ctx.fillText(msg, -2, 1);
      }

      ctx.restore();
    }

    // === TRANSITION FLASH ===
    if (this.transitionTimer > 0) {
      const flashAlpha = Math.max(0, 1 - this.transitionProgress) * 0.3;
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = visual.color;
      ctx.fillRect(0, 0, width, 60);
    }

    ctx.restore();
  }

  getCurrentMessage(): string | null {
    return this.data.messageTimer > 0 ? this.data.lastMessage : null;
  }

  getData(): Readonly<XylosData> {
    return { ...this.data };
  }

  reset(): void {
    this.data = {
      totalEchoes: 0, totalLight: 0, currentState: 'dormant',
      stateProgress: 0, lastMessage: '', messageTimer: 0,
    };
    this.messageQueue = [];
    this.saveData();
  }

  private randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getStateColor(): string {
    return STATE_VISUALS[this.data.currentState].color;
  }

  getGlowIntensity(): number {
    const intensities: Record<XylosState, number> = {
      dormant: 0.2, premiers_echos: 0.4, resonance: 0.6,
      flux_stable: 0.8, eveil_partiel: 1.0,
    };
    return intensities[this.data.currentState];
  }

  getVisualConfig(): XylosVisualConfig {
    return STATE_VISUALS[this.data.currentState];
  }
}

// ============================================================
// SINGLETON
// ============================================================

let _xylosInstance: XylosSystem | null = null;

export function getXylosSystem(): XylosSystem {
  if (!_xylosInstance) {
    _xylosInstance = new XylosSystem();
  }
  return _xylosInstance;
}

export function resetXylosSystem(): void {
  if (_xylosInstance) {
    _xylosInstance.reset();
  }
}
