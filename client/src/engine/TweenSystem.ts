/**
 * FAIL FRENZY – Tween System
 * Smooth, eased value interpolation without external dependencies.
 *
 * Inspired by:
 *  • GSAP timeline API (chaining, labels, callbacks)
 *  • LittleJS engineObjects (framerate-independent lerp)
 *  • Phaser 3 Tweens (easing library, onComplete)
 *
 * Usage:
 *   const tweens = new TweenSystem();
 *
 *   // In your game loop:
 *   tweens.update(delta);
 *
 *   // Animate a value:
 *   const obj = { x: 0 };
 *   tweens.to(obj, { x: 400 }, { duration: 0.5, ease: 'elasticOut', onComplete: () => console.log('done') });
 *
 *   // Chain tweens:
 *   tweens.sequence([
 *     { target: obj, props: { x: 400 }, options: { duration: 0.3, ease: 'cubicOut' } },
 *     { target: obj, props: { y: 200 }, options: { duration: 0.2, ease: 'linear', delay: 0.1 } },
 *   ]);
 */

// ─── Easing functions ─────────────────────────────────────────────────────────
// Based on Robert Penner's equations (BSD license, fused into the project).

export type EaseName =
  | "linear"
  | "quadIn" | "quadOut" | "quadInOut"
  | "cubicIn" | "cubicOut" | "cubicInOut"
  | "sineIn" | "sineOut" | "sineInOut"
  | "expoIn" | "expoOut" | "expoInOut"
  | "circIn" | "circOut" | "circInOut"
  | "backIn" | "backOut" | "backInOut"
  | "elasticIn" | "elasticOut" | "elasticInOut"
  | "bounceIn" | "bounceOut" | "bounceInOut";

const EASE: Record<EaseName, (t: number) => number> = {
  linear: (t) => t,
  quadIn: (t) => t * t,
  quadOut: (t) => t * (2 - t),
  quadInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  cubicIn: (t) => t ** 3,
  cubicOut: (t) => (--t) * t * t + 1,
  cubicInOut: (t) => t < 0.5 ? 4 * t ** 3 : (t - 1) * (2 * t - 2) ** 2 + 1,
  sineIn: (t) => 1 - Math.cos(t * Math.PI / 2),
  sineOut: (t) => Math.sin(t * Math.PI / 2),
  sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  expoIn: (t) => t === 0 ? 0 : 2 ** (10 * t - 10),
  expoOut: (t) => t === 1 ? 1 : 1 - 2 ** (-10 * t),
  expoInOut: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2,
  circIn: (t) => 1 - Math.sqrt(1 - t * t),
  circOut: (t) => Math.sqrt(1 - (--t) * t),
  circInOut: (t) => t < 0.5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,
  backIn: (t) => { const c = 1.70158; return (c + 1) * t ** 3 - c * t * t; },
  backOut: (t) => { const c = 1.70158; return 1 + (c + 1) * (--t) ** 3 + c * t * t; },
  backInOut: (t) => { const c = 2.5949095; return t < 0.5 ? (2 * t) ** 2 * ((c + 1) * 2 * t - c) / 2 : ((2 * t - 2) ** 2 * ((c + 1) * (t * 2 - 2) + c) + 2) / 2; },
  elasticIn: (t) => t === 0 ? 0 : t === 1 ? 1 : -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3),
  elasticOut: (t) => t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
  elasticInOut: (t) => { const c = (2 * Math.PI) / 4.5; return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * c)) / 2 : (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * c)) / 2 + 1; },
  bounceOut: (t) => { const n = 7.5625, d = 2.75; if (t < 1/d) return n*t*t; if (t < 2/d) return n*(t-=1.5/d)*t+.75; if (t < 2.5/d) return n*(t-=2.25/d)*t+.9375; return n*(t-=2.625/d)*t+.984375; },
  bounceIn: (t) => 1 - EASE.bounceOut(1 - t),
  bounceInOut: (t) => t < 0.5 ? (1 - EASE.bounceOut(1 - 2 * t)) / 2 : (1 + EASE.bounceOut(2 * t - 1)) / 2,
};

// ─── Tween ────────────────────────────────────────────────────────────────────

export interface TweenOptions {
  duration: number;
  ease?: EaseName;
  delay?: number;
  repeat?: number;   // -1 = infinite
  yoyo?: boolean;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

interface ActiveTween<T extends object> {
  target: T;
  from: Partial<T>;
  to: Partial<T>;
  opts: Required<TweenOptions>;
  elapsed: number;
  iteration: number;
  started: boolean;
  done: boolean;
}

// ─── TweenSystem ──────────────────────────────────────────────────────────────

export class TweenSystem {
  private tweens: Array<ActiveTween<object>> = [];

  /** Tween numeric properties of `target` to `props`. */
  to<T extends object>(target: T, props: Partial<T>, options: TweenOptions): void {
    const from: Partial<T> = {};
    for (const key of Object.keys(props) as Array<keyof T>) {
      from[key] = target[key];
    }
    this.tweens.push({
      target,
      from,
      to: props,
      opts: {
        delay: 0,
        ease: "cubicOut",
        repeat: 0,
        yoyo: false,
        onStart: undefined!,
        onUpdate: undefined!,
        onComplete: undefined!,
        ...options,
      } as Required<TweenOptions>,
      elapsed: 0,
      iteration: 0,
      started: false,
      done: false,
    });
  }

  /** Run a list of tweens sequentially (each starts after the previous completes). */
  sequence(steps: Array<{ target: object; props: object; options: TweenOptions }>): void {
    let cumulativeDelay = 0;
    for (const step of steps) {
      const delay = (step.options.delay ?? 0) + cumulativeDelay;
      this.to(step.target, step.props, { ...step.options, delay });
      cumulativeDelay += delay + step.options.duration;
    }
  }

  /** Advance all active tweens. Call this once per frame with delta time in seconds. */
  update(deltaSec: number): void {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i]!;
      if (tw.done) { this.tweens.splice(i, 1); continue; }

      tw.elapsed += deltaSec;

      // Handle delay
      if (tw.elapsed < tw.opts.delay) continue;
      const localTime = tw.elapsed - tw.opts.delay;

      if (!tw.started) {
        tw.started = true;
        tw.opts.onStart?.();
      }

      const rawT = Math.min(1, localTime / tw.opts.duration);
      const dir = tw.opts.yoyo && tw.iteration % 2 === 1 ? 1 - rawT : rawT;
      const t = EASE[tw.opts.ease](dir);

      // Apply interpolated values
      for (const key of Object.keys(tw.to) as string[]) {
        const fromVal = (tw.from as Record<string, number>)[key] ?? 0;
        const toVal = (tw.to as Record<string, number>)[key] ?? 0;
        (tw.target as Record<string, number>)[key] = fromVal + (toVal - fromVal) * t;
      }

      tw.opts.onUpdate?.(rawT);

      if (rawT >= 1) {
        tw.iteration++;
        tw.elapsed = tw.opts.delay;

        if (tw.opts.repeat === -1 || tw.iteration <= tw.opts.repeat) {
          // Repeat: reset from values if not yoyo
          if (!tw.opts.yoyo) {
            for (const key of Object.keys(tw.to) as string[]) {
              (tw.target as Record<string, number>)[key] = (tw.from as Record<string, number>)[key] ?? 0;
            }
          }
        } else {
          tw.done = true;
          tw.opts.onComplete?.();
        }
      }
    }
  }

  killTweensOf(target: object): void {
    this.tweens = this.tweens.filter((t) => t.target !== target);
  }

  killAll(): void {
    this.tweens = [];
  }

  get activeTweenCount(): number {
    return this.tweens.length;
  }
}

/** Shared tween system instance for UI and game-layer animations. */
export const tweens = new TweenSystem();
