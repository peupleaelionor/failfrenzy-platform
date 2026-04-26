/**
 * FAIL FRENZY – Game Replayer
 * Deterministic playback of a RecordingData session.
 *
 * Works against any IReplayTarget (FailFrenzyGame or a test stub) –
 * no direct dependency on the full GameEngine to keep things decoupled.
 *
 * Approach (StarCraft / GGPO-inspired):
 *  • Reissues the original key-events at the exact recorded timestamps
 *  • Falls back to snapshot interpolation for seeking / scrubbing
 *
 * Usage:
 *   const replayer = new GameReplayer(game);
 *   replayer.load(GameRecorder.import(encoded));
 *   replayer.play();                 // real-time
 *   replayer.seekTo(15_000);         // jump to 15 s mark
 */

import type { RecordingData, InputRecord, SnapshotRecord } from "./GameRecorder";

// ─── Replay target interface (implemented by FailFrenzyGame) ──────────────────

export interface IReplayTarget {
  /** Teleport the player to x, y (used for snapshot seeking). */
  setPlayerPosition(x: number, y: number): void;
  /** Override the current score display. */
  setScore(score: number): void;
  /** Simulate a key being pressed or released (for deterministic replay). */
  injectKeyEvent(key: string, down: boolean): void;
  pause(): void;
  resume(): void;
}

// ─── Replayer ─────────────────────────────────────────────────────────────────

export type ReplayState = "idle" | "playing" | "paused" | "finished";

export class GameReplayer {
  private target: IReplayTarget;
  private data: RecordingData | null = null;
  private nextInputIndex = 0;
  private playbackStart = 0;
  private rafId: number | null = null;
  private _state: ReplayState = "idle";
  private _speed = 1;

  /** Called when replay finishes naturally. */
  public onFinished: (() => void) | null = null;
  /** Called on each tick with current playback position in ms. */
  public onProgress: ((posMs: number) => void) | null = null;

  constructor(target: IReplayTarget) {
    this.target = target;
  }

  get state(): ReplayState {
    return this._state;
  }

  get duration(): number {
    return this.data?.duration ?? 0;
  }

  /** Load a RecordingData object for playback. */
  load(data: RecordingData): void {
    this.stop();
    this.data = data;
    this.nextInputIndex = 0;
    this._state = "idle";
  }

  /** Start or resume playback. */
  play(speed = 1): void {
    if (!this.data) throw new Error("No recording loaded");
    this._speed = speed;
    this._state = "playing";
    this.playbackStart = performance.now() - (this._currentPosMs ?? 0) / speed;
    this.target.pause(); // pause game simulation – we drive it
    this._tick();
  }

  /** Pause playback. */
  pause(): void {
    if (this._state !== "playing") return;
    this._state = "paused";
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Stop and reset. */
  stop(): void {
    this._state = "idle";
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.nextInputIndex = 0;
    this._currentPosMs = 0;
  }

  /**
   * Jump to a specific time in ms using the nearest snapshot.
   * This resets input replay from that point; full determinism
   * requires the game's RNG to also reset to the snapshot state.
   */
  seekTo(posMs: number): void {
    if (!this.data) return;
    const snap = this.nearestSnapshot(posMs);
    if (snap) {
      this.target.setPlayerPosition(snap.x, snap.y);
      this.target.setScore(snap.score);
    }
    // Advance input cursor past the seek point
    this.nextInputIndex = this.data.inputs.findIndex((i) => i.t >= posMs);
    if (this.nextInputIndex < 0) this.nextInputIndex = this.data.inputs.length;
    this._currentPosMs = posMs;
    if (this._state === "playing") {
      this.playbackStart = performance.now() - posMs / this._speed;
    }
  }

  // ── Internal ────────────────────────────────────────────────────────────────

  private _currentPosMs = 0;

  private _tick(): void {
    if (this._state !== "playing" || !this.data) return;

    const posMs = (performance.now() - this.playbackStart) * this._speed;
    this._currentPosMs = posMs;    // Fire all input events whose timestamp has passed
    while (
      this.nextInputIndex < this.data.inputs.length &&
      this.data.inputs[this.nextInputIndex]!.t <= posMs
    ) {
      const ev = this.data.inputs[this.nextInputIndex]!;
      this.target.injectKeyEvent(ev.key, ev.down);
      this.nextInputIndex++;
    }

    this.onProgress?.(posMs);

    if (posMs >= this.data.duration) {
      this._state = "finished";
      this.target.resume();
      this.onFinished?.();
      return;
    }

    this.rafId = requestAnimationFrame(() => this._tick());
  }

  private nearestSnapshot(posMs: number): SnapshotRecord | null {
    if (!this.data || this.data.snapshots.length === 0) return null;
    let best = this.data.snapshots[0]!;
    for (const snap of this.data.snapshots) {
      if (snap.t <= posMs) best = snap;
      else break;
    }
    return best;
  }
}
