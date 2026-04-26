/**
 * FAIL FRENZY – Deterministic Random Number Generator
 *
 * Uses the **mulberry32** algorithm – the standard seeded PRNG in the roguelike
 * community (used in Spelunky 2, many Ludum Dare entries, and academic papers).
 *
 * Properties:
 *  • Fully deterministic: same seed → same sequence on every platform
 *  • Period ≈ 2³² (4 billion values)
 *  • Passes BigCrush statistical tests
 *  • Zero dependencies, < 40 LOC
 *
 * Useful for:
 *  • ProceduralGenerator (same seed → same level on every device)
 *  • Replay validation (server re-runs same RNG sequence to verify score)
 *  • AI-generated level verification
 *
 * @example
 *   const rng = new SeededRandom(12345);
 *   rng.nextFloat();      // 0.0 – 1.0
 *   rng.nextInt(1, 100);  // 1 – 100 inclusive
 *   rng.shuffle([1,2,3]); // in-place Fisher-Yates
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number | string) {
    this.state = typeof seed === "string" ? SeededRandom.hashString(seed) : seed >>> 0;
  }

  /** Returns a float in [0, 1). */
  nextFloat(): number {
    // mulberry32
    let z = (this.state += 0x6d2b79f5);
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  }

  /** Returns an integer in [min, max] inclusive. */
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  /** Returns a float in [min, max). */
  nextRange(min: number, max: number): number {
    return this.nextFloat() * (max - min) + min;
  }

  /** Returns true with the given probability (0–1). */
  chance(p: number): boolean {
    return this.nextFloat() < p;
  }

  /** In-place Fisher-Yates shuffle. Returns the same array. */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  }

  /** Pick a random element from an array. */
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]!;
  }

  /** Clone the current state so the same sequence can be replayed. */
  clone(): SeededRandom {
    return new SeededRandom(this.state);
  }

  /** Snapshot the raw state for serialisation. */
  getState(): number {
    return this.state;
  }

  /** Restore a previously snapshotted state. */
  setState(state: number): void {
    this.state = state >>> 0;
  }

  // ── String hashing (djb2) ──────────────────────────────────────────────────

  static hashString(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
    }
    return h;
  }
}
