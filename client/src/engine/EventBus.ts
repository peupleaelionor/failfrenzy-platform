/**
 * FAIL FRENZY – EventBus
 * Typed publish/subscribe event system.
 *
 * Inspired by Phaser 3's EventEmitter and Excalibur.js's EventDispatcher,
 * but smaller, fully typed, and with wildcard listener support.
 *
 * Usage:
 *   const bus = new EventBus<GameEvents>();
 *   bus.on('score:update', ({ score }) => updateHUD(score));
 *   bus.emit('score:update', { score: 1000 });
 *   bus.once('game:over', handleGameOver);
 */

type Listener<T> = (payload: T) => void;

interface Registration<T> {
  listener: Listener<T>;
  once: boolean;
}

export class EventBus<TEvents extends Record<string, unknown>> {
  private readonly listeners: {
    [K in keyof TEvents]?: Array<Registration<TEvents[K]>>;
  } = {};

  private wildcardListeners: Array<(event: string, payload: unknown) => void> = [];

  // ── Subscribe ──────────────────────────────────────────────────────────────

  on<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): this {
    (this.listeners[event] ??= []).push({ listener, once: false });
    return this;
  }

  once<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): this {
    (this.listeners[event] ??= []).push({ listener, once: true });
    return this;
  }

  /** Listen to every event (useful for logging / analytics). */
  onAny(listener: (event: string, payload: unknown) => void): this {
    this.wildcardListeners.push(listener);
    return this;
  }

  // ── Unsubscribe ────────────────────────────────────────────────────────────

  off<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): this {
    const regs = this.listeners[event];
    if (!regs) return this;
    this.listeners[event] = regs.filter((r) => r.listener !== listener) as typeof regs;
    return this;
  }

  offAll<K extends keyof TEvents>(event: K): this {
    delete this.listeners[event];
    return this;
  }

  // ── Emit ───────────────────────────────────────────────────────────────────

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): this {
    const regs = this.listeners[event];
    if (regs) {
      const toRemove: number[] = [];
      regs.forEach((reg, i) => {
        reg.listener(payload);
        if (reg.once) toRemove.push(i);
      });
      // Remove once-listeners in reverse order
      for (let i = toRemove.length - 1; i >= 0; i--) {
        regs.splice(toRemove[i]!, 1);
      }
    }

    // Wildcard listeners
    for (const wl of this.wildcardListeners) {
      wl(event as string, payload);
    }

    return this;
  }

  // ── Promise helper ─────────────────────────────────────────────────────────

  /** Resolve when the event fires next (or timeout). */
  waitFor<K extends keyof TEvents>(event: K, timeoutMs = 5000): Promise<TEvents[K]> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`EventBus: timeout waiting for "${String(event)}"`)), timeoutMs);
      this.once(event, (payload) => {
        clearTimeout(timer);
        resolve(payload);
      });
    });
  }

  clear(): void {
    for (const key of Object.keys(this.listeners)) {
      delete (this.listeners as Record<string, unknown>)[key];
    }
    this.wildcardListeners = [];
  }
}

// ─── Game-wide event map ──────────────────────────────────────────────────────

export interface GameEventMap {
  "score:update": { score: number; delta: number };
  "combo:change": { level: string; combo: number; multiplier: number };
  "player:hit": { x: number; y: number; lives: number };
  "player:death": { finalScore: number; mode: string };
  "player:respawn": { lives: number };
  "obstacle:destroyed": { x: number; y: number; type: string };
  "star:collected": { x: number; y: number; points: number };
  "powerup:activated": { type: string; duration: number };
  "level:start": { seed: string; mode: string };
  "level:end": { score: number; time: number; reason: "gameover" | "timeout" | "win" };
  "replay:start": { seed: string; duration: number };
  "replay:seek": { posMs: number };
  "replay:end": Record<string, never>;
  "anticheat:flag": { confidence: number; reasons: string[] };
}

/** Singleton game event bus – import and use anywhere in the client. */
export const gameEvents = new EventBus<GameEventMap>();
