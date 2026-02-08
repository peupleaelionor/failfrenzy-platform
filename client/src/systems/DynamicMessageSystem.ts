/**
 * FAIL FRENZY — DYNAMIC MESSAGE SYSTEM v3.0 (Phase 3)
 * 
 * Messages courts, non bloquants, aléatoires
 * V3: Animations glitch, slide-in/out, scale, couleurs dynamiques
 */

// ============================================================
// TYPES
// ============================================================

export type MessageContext = 
  | 'near_miss' | 'fail' | 'skill' | 'obstacle_warn' | 'xylos' | 'general';

export interface DynamicMessage {
  text: string;
  context: MessageContext;
  duration: number;
  maxDuration: number;
  alpha: number;
  color: string;
  // Animation state
  slideOffset: number;   // horizontal slide (pixels)
  scale: number;         // text scale
  glitchPhase: number;   // glitch animation phase
  yOffset: number;       // vertical position offset
}

// ============================================================
// MESSAGE POOLS (enriched)
// ============================================================

const MESSAGES: Record<MessageContext, string[]> = {
  near_miss: [
    'CLOSE. TOO CLOSE.',
    'ALMOST SMART.',
    'LUCKY.',
    'NOT BAD.',
    'CALCULATED?',
    'RISKY.',
    'BOLD MOVE.',
    'INCHES.',
    'HAIR\'S BREADTH.',
    'THREADING THE NEEDLE.',
  ],
  fail: [
    'NOTED.',
    'EXPECTED.',
    'CLASSIC.',
    'PREDICTABLE.',
    'AGAIN?',
    'INTERESTING.',
    'DATA LOGGED.',
    'OUCH.',
    'THAT HAPPENED.',
    'WELL THEN.',
    'FASCINATING.',
    'RECORDED.',
  ],
  skill: [
    'OK, WE SEE YOU.',
    'THIS IS GETTING SERIOUS.',
    'IMPRESSIVE.',
    'SHOW OFF.',
    'KEEP GOING.',
    'NOW WE\'RE TALKING.',
    'SKILL DETECTED.',
    'NICE.',
    'CLEAN.',
    'FLAWLESS.',
    'RESPECT.',
    'ELITE MOVES.',
  ],
  obstacle_warn: [
    'BAD IDEA',
    'YOU LOOK LOST',
    'TOO CURIOUS',
    'DANGER AHEAD',
    'TURN BACK',
    'NOT RECOMMENDED',
    'RECONSIDER',
    'ABORT',
    'NOPE.',
    'REALLY?',
  ],
  xylos: [
    'XYLOS RESPONDS',
    'ECHO RECEIVED',
    'RESONANCE',
    'CONNECTION',
    'SYNCHRONIZED',
    'THE CORE PULSES',
    'SIGNAL STRONG',
  ],
  general: [
    'FOCUS',
    'BREATHE',
    'SURVIVE',
    'ADAPT',
    'PERSIST',
    'EVOLVE',
    'ENDURE',
  ],
};

const MESSAGE_COLORS: Record<MessageContext, string> = {
  near_miss: '#ffdd00',
  fail: '#ff4444',
  skill: '#00ff88',
  obstacle_warn: '#ff8800',
  xylos: '#00ffff',
  general: '#ffffff',
};

// Glitch colors for each context
const GLITCH_COLORS: Record<MessageContext, [string, string]> = {
  near_miss: ['#ff0066', '#00ffff'],
  fail: ['#ff0000', '#0066ff'],
  skill: ['#00ff00', '#ff00ff'],
  obstacle_warn: ['#ff4400', '#ffff00'],
  xylos: ['#ff00ff', '#00ff88'],
  general: ['#ff0066', '#00ffff'],
};

// Font sizes per context
const FONT_SIZES: Record<MessageContext, number> = {
  near_miss: 22,
  fail: 26,
  skill: 24,
  obstacle_warn: 20,
  xylos: 18,
  general: 16,
};

// ============================================================
// DYNAMIC MESSAGE SYSTEM v3.0
// ============================================================

export class DynamicMessageSystem {
  private activeMessages: DynamicMessage[] = [];
  private maxMessages: number = 3;
  private minInterval: number = 0.8;
  private lastMessageTime: number = 0;

  constructor() {}

  show(context: MessageContext, customText?: string): void {
    const now = performance.now() / 1000;
    if (now - this.lastMessageTime < this.minInterval) return;
    if (this.activeMessages.length >= this.maxMessages) this.activeMessages.shift();

    const text = customText || this.randomFrom(MESSAGES[context]);
    const duration = this.getDuration(context);
    
    const message: DynamicMessage = {
      text,
      context,
      duration,
      maxDuration: duration,
      alpha: 1.0,
      color: MESSAGE_COLORS[context],
      slideOffset: context === 'fail' ? -50 : (context === 'skill' ? 50 : 0),
      scale: 0.3,
      glitchPhase: 0,
      yOffset: 0,
    };

    this.activeMessages.push(message);
    this.lastMessageTime = now;
  }

  update(dt: number): void {
    for (let i = this.activeMessages.length - 1; i >= 0; i--) {
      const msg = this.activeMessages[i];
      msg.duration -= dt;
      
      const elapsed = msg.maxDuration - msg.duration;
      const progress = elapsed / msg.maxDuration;

      // Entry animation (first 0.3s)
      if (elapsed < 0.3) {
        const t = elapsed / 0.3;
        msg.scale = 0.3 + t * 0.7; // Scale up from 0.3 to 1.0
        msg.slideOffset *= (1 - t);  // Slide to center
        msg.glitchPhase = t < 0.15 ? 1 : 0; // Glitch on entry
      } else {
        msg.scale = 1.0;
        msg.slideOffset = 0;
        msg.glitchPhase = 0;
      }

      // Exit animation (last 0.5s)
      if (msg.duration < 0.5) {
        const t = msg.duration / 0.5;
        msg.alpha = t;
        msg.scale = 1.0 + (1 - t) * 0.2; // Slightly grow on exit
        msg.yOffset = (1 - t) * -10; // Float up
      }

      // Random micro-glitch (rare)
      if (Math.random() < 0.005) {
        msg.glitchPhase = 1;
        setTimeout(() => { msg.glitchPhase = 0; }, 50);
      }

      if (msg.duration <= 0) {
        this.activeMessages.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const startY = height * 0.22;
    const spacing = 45;

    ctx.save();

    this.activeMessages.forEach((msg, index) => {
      const y = startY + index * spacing + msg.yOffset;
      const fontSize = FONT_SIZES[msg.context];
      
      ctx.save();
      ctx.translate(width / 2 + msg.slideOffset, y);
      ctx.scale(msg.scale, msg.scale);
      ctx.globalAlpha = msg.alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${fontSize}px "Courier New", monospace`;

      // Background blur effect
      const textWidth = ctx.measureText(msg.text).width;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      const pad = 8;
      ctx.fillRect(-textWidth / 2 - pad, -fontSize / 2 - pad / 2, textWidth + pad * 2, fontSize + pad);

      // Glitch effect
      if (msg.glitchPhase > 0) {
        const [g1, g2] = GLITCH_COLORS[msg.context];
        ctx.globalAlpha = msg.alpha * 0.4;
        ctx.fillStyle = g1;
        ctx.fillText(msg.text, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
        ctx.fillStyle = g2;
        ctx.fillText(msg.text, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
        ctx.globalAlpha = msg.alpha;
      }

      // Main text with glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = msg.color;
      ctx.fillStyle = msg.color;
      ctx.fillText(msg.text, 0, 0);

      // Bright core text (no shadow)
      ctx.shadowBlur = 0;
      ctx.globalAlpha = msg.alpha * 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(msg.text, 0, 0);

      ctx.restore();
    });

    ctx.restore();
  }

  private getDuration(context: MessageContext): number {
    switch (context) {
      case 'near_miss': return 1.5;
      case 'fail': return 2.5;
      case 'skill': return 2.0;
      case 'obstacle_warn': return 1.2;
      case 'xylos': return 2.0;
      case 'general': return 1.5;
      default: return 2.0;
    }
  }

  clear(): void {
    this.activeMessages = [];
  }

  private randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getActiveCount(): number {
    return this.activeMessages.length;
  }
}

export function shouldShowNearMiss(distance: number, threshold: number): boolean {
  return distance < threshold && Math.random() < 0.3;
}

export function shouldShowSkill(combo: number, threshold: number): boolean {
  return combo >= threshold && combo % threshold === 0;
}
