/**
 * FAIL FRENZY – Game Recorder
 * Records player input events and key state snapshots at regular intervals.
 *
 * Design:
 *  • Records raw key-down / key-up events with timestamps (deterministic replay)
 *  • Also snapshots score + position every N ms as a safety net
 *  • Output: compact base64-encoded JSON (≈ 2–4 KB/minute of gameplay)
 *
 * Usage:
 *   const rec = new GameRecorder();
 *   rec.start(seed);
 *   // On key events:
 *   rec.recordInput('ArrowUp', true);
 *   // Per frame:
 *   rec.recordSnapshot(playerX, playerY, score);
 *   // On game over:
 *   const data = rec.export();  // send to server
 */

export type InputEventType = "keydown" | "keyup" | "touchstart" | "touchend";

export interface InputRecord {
  /** ms since recording started */
  t: number;
  /** e.g. "ArrowUp", "a", "touchstart" */
  key: string;
  down: boolean;
}

export interface SnapshotRecord {
  /** ms since recording started */
  t: number;
  x: number;
  y: number;
  score: number;
}

export interface RecordingData {
  /** Seed used for procedural generation (for full deterministic replay) */
  seed: string;
  /** Unix timestamp when the recording started */
  startedAt: number;
  /** Total duration in ms */
  duration: number;
  inputs: InputRecord[];
  snapshots: SnapshotRecord[];
}

export class GameRecorder {
  private recording: RecordingData | null = null;
  private startTime = 0;
  private snapshotInterval: number;
  private lastSnapshotTime = 0;

  /**
   * @param snapshotIntervalMs How often to write a position/score snapshot
   *        (default 500 ms). Lower = more accurate seeking, more data.
   */
  constructor(snapshotIntervalMs = 500) {
    this.snapshotInterval = snapshotIntervalMs;
  }

  /** Begin a new recording. Call this when the game starts. */
  start(seed = "0"): void {
    this.startTime = performance.now();
    this.lastSnapshotTime = 0;
    this.recording = {
      seed,
      startedAt: Date.now(),
      duration: 0,
      inputs: [],
      snapshots: [],
    };
  }

  get isRecording(): boolean {
    return this.recording !== null;
  }

  /** Record a key or touch event. */
  recordInput(key: string, down: boolean): void {
    if (!this.recording) return;
    this.recording.inputs.push({
      t: Math.round(performance.now() - this.startTime),
      key,
      down,
    });
  }

  /**
   * Record a position + score snapshot (throttled to snapshotInterval).
   * Call this every frame from the game loop.
   */
  recordSnapshot(x: number, y: number, score: number): void {
    if (!this.recording) return;
    const now = performance.now() - this.startTime;
    if (now - this.lastSnapshotTime >= this.snapshotInterval) {
      this.recording.snapshots.push({ t: Math.round(now), x, y, score });
      this.lastSnapshotTime = now;
    }
  }

  /** Finalise and return the raw RecordingData. */
  stop(): RecordingData | null {
    if (!this.recording) return null;
    this.recording.duration = Math.round(performance.now() - this.startTime);
    const data = this.recording;
    this.recording = null;
    return data;
  }

  /** Finalise and return a base64-encoded JSON string ready to send to the server. */
  export(): string | null {
    const data = this.stop();
    if (!data) return null;
    return btoa(JSON.stringify(data));
  }

  /** Decode a previously exported string back to RecordingData. */
  static import(encoded: string): RecordingData {
    return JSON.parse(atob(encoded)) as RecordingData;
  }
}
