/**
 * FAIL FRENZY — XYLOS SYSTEM
 * 
 * Xylos est une entité vivante restaurée par les joueurs.
 * - Fails = données / échos
 * - Réussites = lumière
 * - Pas de fin définitive, uniquement des états
 * 
 * V1: localStorage, calcul simple basé sur score + fails
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
  totalEchoes: number;      // Total d'échos collectés (fails)
  totalLight: number;       // Total de lumière (score)
  currentState: XylosState;
  stateProgress: number;    // 0-100, progression vers état suivant
  lastMessage: string;
  messageTimer: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = 'failfrenzy_xylos';

// Seuils pour chaque état (échos + lumière combinés)
const STATE_THRESHOLDS: Record<XylosState, number> = {
  dormant: 0,
  premiers_echos: 50,
  resonance: 200,
  flux_stable: 500,
  eveil_partiel: 1000,
};

// Messages par état
const STATE_MESSAGES: Record<XylosState, string[]> = {
  dormant: [
    'SILENCE',
    'WAITING',
    'DORMANT',
  ],
  premiers_echos: [
    'ECHO RECEIVED',
    'SIGNAL DETECTED',
    'XYLOS IS LISTENING',
    'FIRST RESPONSE',
  ],
  resonance: [
    'XYLOS IS RESPONDING',
    'RESONANCE ACTIVE',
    'FREQUENCY MATCHED',
    'CONNECTION STABLE',
  ],
  flux_stable: [
    'FLUX STABLE',
    'ENERGY FLOWING',
    'XYLOS AWAKENS',
    'CORE SYNCHRONIZED',
  ],
  eveil_partiel: [
    'XYLOS IS AWARE',
    'PARTIAL AWAKENING',
    'CONSCIOUSNESS EMERGING',
    'THE CORE SEES YOU',
  ],
};

// Messages de feedback in-game
export const XYLOS_FEEDBACK = {
  echoGained: [
    'ECHO LOGGED',
    'DATA RECEIVED',
    'FAILURE CONVERTED',
    'NOTED',
  ],
  lightGained: [
    'LIGHT ABSORBED',
    'ENERGY GAINED',
    'XYLOS GROWS',
    'CONTRIBUTION ACCEPTED',
  ],
  stateChange: [
    'STATE TRANSITION',
    'XYLOS EVOLVES',
    'NEW FREQUENCY',
    'RESONANCE SHIFT',
  ],
};

// ============================================================
// XYLOS MANAGER
// ============================================================

export class XylosSystem {
  private data: XylosData;
  private messageQueue: string[] = [];
  private messageDisplayTime: number = 2.0; // secondes

  constructor() {
    this.data = this.loadData();
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
      totalEchoes: 0,
      totalLight: 0,
      currentState: 'dormant',
      stateProgress: 0,
      lastMessage: '',
      messageTimer: 0,
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

  /**
   * Ajouter des échos (fails)
   */
  addEchoes(count: number): void {
    this.data.totalEchoes += count;
    this.updateState();
    this.queueMessage(this.randomFrom(XYLOS_FEEDBACK.echoGained));
    this.saveData();
  }

  /**
   * Ajouter de la lumière (score)
   */
  addLight(amount: number): void {
    this.data.totalLight += amount;
    this.updateState();
    if (Math.random() < 0.3) { // 30% chance de message
      this.queueMessage(this.randomFrom(XYLOS_FEEDBACK.lightGained));
    }
    this.saveData();
  }

  /**
   * Calculer l'état actuel basé sur échos + lumière
   */
  private updateState(): void {
    const total = this.data.totalEchoes + this.data.totalLight * 0.5; // Light compte moins que les échos
    const previousState = this.data.currentState;

    // Déterminer le nouvel état
    let newState: XylosState = 'dormant';
    if (total >= STATE_THRESHOLDS.eveil_partiel) {
      newState = 'eveil_partiel';
    } else if (total >= STATE_THRESHOLDS.flux_stable) {
      newState = 'flux_stable';
    } else if (total >= STATE_THRESHOLDS.resonance) {
      newState = 'resonance';
    } else if (total >= STATE_THRESHOLDS.premiers_echos) {
      newState = 'premiers_echos';
    }

    // Calculer la progression vers l'état suivant
    const states: XylosState[] = ['dormant', 'premiers_echos', 'resonance', 'flux_stable', 'eveil_partiel'];
    const currentIndex = states.indexOf(newState);
    const nextState = states[currentIndex + 1];
    
    if (nextState) {
      const currentThreshold = STATE_THRESHOLDS[newState];
      const nextThreshold = STATE_THRESHOLDS[nextState];
      const progress = ((total - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
      this.data.stateProgress = Math.min(100, Math.max(0, progress));
    } else {
      this.data.stateProgress = 100; // État max atteint
    }

    // Notification de changement d'état
    if (newState !== previousState) {
      this.data.currentState = newState;
      this.queueMessage(this.randomFrom(XYLOS_FEEDBACK.stateChange));
      this.queueMessage(this.randomFrom(STATE_MESSAGES[newState]));
    }
  }

  /**
   * Obtenir un message aléatoire pour l'état actuel
   */
  getStateMessage(): string {
    return this.randomFrom(STATE_MESSAGES[this.data.currentState]);
  }

  /**
   * Ajouter un message à la queue
   */
  private queueMessage(msg: string): void {
    this.messageQueue.push(msg);
    if (this.data.messageTimer <= 0) {
      this.showNextMessage();
    }
  }

  /**
   * Afficher le prochain message
   */
  private showNextMessage(): void {
    if (this.messageQueue.length > 0) {
      this.data.lastMessage = this.messageQueue.shift()!;
      this.data.messageTimer = this.messageDisplayTime;
    }
  }

  /**
   * Update (appelé chaque frame)
   */
  update(dt: number): void {
    if (this.data.messageTimer > 0) {
      this.data.messageTimer -= dt;
      if (this.data.messageTimer <= 0 && this.messageQueue.length > 0) {
        this.showNextMessage();
      }
    }
  }

  /**
   * Obtenir le message actuel à afficher
   */
  getCurrentMessage(): string | null {
    return this.data.messageTimer > 0 ? this.data.lastMessage : null;
  }

  /**
   * Obtenir les données complètes
   */
  getData(): Readonly<XylosData> {
    return { ...this.data };
  }

  /**
   * Reset (pour debug)
   */
  reset(): void {
    this.data = {
      totalEchoes: 0,
      totalLight: 0,
      currentState: 'dormant',
      stateProgress: 0,
      lastMessage: '',
      messageTimer: 0,
    };
    this.messageQueue = [];
    this.saveData();
  }

  /**
   * Helper: random from array
   */
  private randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Obtenir la couleur de l'état actuel (pour feedback visuel)
   */
  getStateColor(): string {
    const colors: Record<XylosState, string> = {
      dormant: '#444466',
      premiers_echos: '#6688ff',
      resonance: '#00ffcc',
      flux_stable: '#00ff88',
      eveil_partiel: '#ff00ff',
    };
    return colors[this.data.currentState];
  }

  /**
   * Obtenir l'intensité du glow (0-1) basée sur l'état
   */
  getGlowIntensity(): number {
    const intensities: Record<XylosState, number> = {
      dormant: 0.2,
      premiers_echos: 0.4,
      resonance: 0.6,
      flux_stable: 0.8,
      eveil_partiel: 1.0,
    };
    return intensities[this.data.currentState];
  }
}

// ============================================================
// SINGLETON INSTANCE
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
