/**
 * GameEngine - Moteur de base
 */
export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  type?: string;
  id?: string;
}

export interface GameState {
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: any;
  private state: GameState = { score: 0, isGameOver: false, isPaused: false };
  private running: boolean = false;
  private lastTime: number = 0;

  constructor(canvasId: string, config: any) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.config = config;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  getState() { return this.state; }
  setState(newState: Partial<GameState>) {
    this.state = { ...this.state, ...newState };
  }

  private loop(now: number) {
    if (!this.running) return;
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Le jeu s'occupe de l'update et du render via des hooks ou en étendant cette classe
    // Pour FailFrenzy, on va appeler les méthodes manuellement si besoin ou laisser la classe principale gérer.
    
    requestAnimationFrame(this.loop.bind(this));
  }
}
