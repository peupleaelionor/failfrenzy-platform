/**
 * FAIL FRENZY — DYNAMIC MESSAGE SYSTEM
 * 
 * Messages courts, non bloquants, aléatoires
 * Contextes: frôlé, fail, skill, obstacles
 */

// ============================================================
// TYPES
// ============================================================

export type MessageContext = 
  | 'near_miss'      // Quand frôlé
  | 'fail'           // Quand collision/mort
  | 'skill'          // Quand combo/performance
  | 'obstacle_warn'  // Approche d'obstacle dangereux
  | 'xylos'          // Messages Xylos
  | 'general';       // Messages généraux

export interface DynamicMessage {
  text: string;
  context: MessageContext;
  duration: number;  // secondes
  alpha: number;     // 0-1
  color: string;
}

// ============================================================
// MESSAGE POOLS
// ============================================================

const MESSAGES: Record<MessageContext, string[]> = {
  near_miss: [
    'CLOSE. TOO CLOSE.',
    'ALMOST SMART.',
    'LUCKY.',
    'NOT BAD.',
    'CALCULATED?',
    'RISKY.',
  ],
  
  fail: [
    'NOTED.',
    'EXPECTED.',
    'CLASSIC.',
    'PREDICTABLE.',
    'AGAIN?',
    'INTERESTING.',
    'DATA LOGGED.',
  ],
  
  skill: [
    'OK, WE SEE YOU.',
    'THIS IS GETTING SERIOUS.',
    'IMPRESSIVE.',
    'SHOW OFF.',
    'KEEP GOING.',
    'NOW WE\'RE TALKING.',
    'SKILL DETECTED.',
  ],
  
  obstacle_warn: [
    'BAD IDEA',
    'YOU LOOK LOST',
    'TOO CURIOUS',
    'DANGER AHEAD',
    'TURN BACK',
    'NOT RECOMMENDED',
    'RECONSIDER',
  ],
  
  xylos: [
    'XYLOS RESPONDS',
    'ECHO RECEIVED',
    'RESONANCE',
    'CONNECTION',
    'SYNCHRONIZED',
  ],
  
  general: [
    'FOCUS',
    'BREATHE',
    'SURVIVE',
    'ADAPT',
    'PERSIST',
  ],
};

// Couleurs par contexte
const MESSAGE_COLORS: Record<MessageContext, string> = {
  near_miss: '#ffdd00',
  fail: '#ff4444',
  skill: '#00ff88',
  obstacle_warn: '#ff8800',
  xylos: '#00ffff',
  general: '#ffffff',
};

// ============================================================
// DYNAMIC MESSAGE SYSTEM
// ============================================================

export class DynamicMessageSystem {
  private activeMessages: DynamicMessage[] = [];
  private maxMessages: number = 3;
  private minInterval: number = 1.0; // secondes entre messages
  private lastMessageTime: number = 0;

  constructor() {}

  /**
   * Afficher un message
   */
  show(context: MessageContext, customText?: string): void {
    const now = performance.now() / 1000;
    
    // Throttle messages
    if (now - this.lastMessageTime < this.minInterval) {
      return;
    }

    // Limite de messages actifs
    if (this.activeMessages.length >= this.maxMessages) {
      this.activeMessages.shift(); // Retirer le plus ancien
    }

    const text = customText || this.randomFrom(MESSAGES[context]);
    const message: DynamicMessage = {
      text,
      context,
      duration: this.getDuration(context),
      alpha: 1.0,
      color: MESSAGE_COLORS[context],
    };

    this.activeMessages.push(message);
    this.lastMessageTime = now;
  }

  /**
   * Update messages (fade out)
   */
  update(dt: number): void {
    for (let i = this.activeMessages.length - 1; i >= 0; i--) {
      const msg = this.activeMessages[i];
      msg.duration -= dt;
      
      // Fade out dans les dernières 0.5s
      if (msg.duration < 0.5) {
        msg.alpha = msg.duration / 0.5;
      }
      
      // Retirer si terminé
      if (msg.duration <= 0) {
        this.activeMessages.splice(i, 1);
      }
    }
  }

  /**
   * Render messages
   */
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const startY = height * 0.25;
    const spacing = 40;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px "Courier New", monospace';

    this.activeMessages.forEach((msg, index) => {
      const y = startY + index * spacing;
      
      ctx.globalAlpha = msg.alpha;
      
      // Ombre
      ctx.shadowBlur = 10;
      ctx.shadowColor = msg.color;
      
      // Texte
      ctx.fillStyle = msg.color;
      ctx.fillText(msg.text, width / 2, y);
    });

    ctx.restore();
  }

  /**
   * Obtenir la durée selon le contexte
   */
  private getDuration(context: MessageContext): number {
    switch (context) {
      case 'near_miss':
        return 1.5;
      case 'fail':
        return 2.5;
      case 'skill':
        return 2.0;
      case 'obstacle_warn':
        return 1.0;
      case 'xylos':
        return 2.0;
      case 'general':
        return 1.5;
      default:
        return 2.0;
    }
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.activeMessages = [];
  }

  /**
   * Helper: random from array
   */
  private randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Obtenir le nombre de messages actifs
   */
  getActiveCount(): number {
    return this.activeMessages.length;
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Déterminer si un message "near miss" doit être affiché
 */
export function shouldShowNearMiss(distance: number, threshold: number): boolean {
  return distance < threshold && Math.random() < 0.3; // 30% chance
}

/**
 * Déterminer si un message "skill" doit être affiché
 */
export function shouldShowSkill(combo: number, threshold: number): boolean {
  return combo >= threshold && combo % threshold === 0; // Tous les X combos
}
