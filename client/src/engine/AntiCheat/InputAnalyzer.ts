/**
 * FAIL FRENZY – Input Analyzer (Anti-Cheat)
 * Detects suspicious input patterns that indicate macro use, bots, or scripts.
 *
 * Algorithm:
 *  • Computes the coefficient of variation (std-dev / mean) of inter-key intervals
 *  • Human inputs have high variance (CV > 0.15); scripts repeat with low variance
 *  • Additional heuristics: impossibly fast reaction time, constant press duration
 *
 * This is a lightweight client-side signal – final adjudication happens server-side.
 */

export interface AnalysisResult {
  suspicious: boolean;
  confidence: number; // 0–1 where 1 = certain cheating
  reasons: string[];
}

export class InputAnalyzer {
  /**
   * Minimum coefficient of variation for human input.
   * Below this the sequence looks scripted.
   */
  private static readonly MIN_CV = 0.10;

  /** Minimum plausible human reaction time in ms (under this = suspicious). */
  private static readonly MIN_REACTION_MS = 60;

  /** If a key is held for EXACTLY the same duration N times, flag it. */
  private static readonly REPEAT_HOLD_THRESHOLD = 5;

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Analyse a series of raw key-down timestamps (ms).
   * Returns a result even with few samples, but confidence will be low.
   */
  static analyzeTimestamps(timestamps: number[]): AnalysisResult {
    const reasons: string[] = [];
    let confidence = 0;

    if (timestamps.length < 6) {
      return { suspicious: false, confidence: 0, reasons: ["Insufficient data"] };
    }

    const intervals = InputAnalyzer.toIntervals(timestamps);

    // ── 1. Coefficient of variation ──────────────────────────────────────────
    const cv = InputAnalyzer.coefficientOfVariation(intervals);
    if (cv < InputAnalyzer.MIN_CV) {
      reasons.push(`Input timing too regular (CV=${cv.toFixed(3)}, threshold=${InputAnalyzer.MIN_CV})`);
      // Confidence scales linearly: 0.7 at the threshold, approaching 1.0 as CV approaches 0.
      // The multiplier 5 was chosen so that a CV of 0 (perfectly uniform script) gives confidence 1.0
      // and a CV at the threshold gives 0.7, with smooth interpolation in between.
      confidence = Math.max(confidence, 0.7 + (InputAnalyzer.MIN_CV - cv) * 5);
    }

    // ── 2. Impossible reaction times ─────────────────────────────────────────
    const impossiblyFast = intervals.filter((i) => i < InputAnalyzer.MIN_REACTION_MS);
    if (impossiblyFast.length > 2) {
      reasons.push(`${impossiblyFast.length} inputs faster than ${InputAnalyzer.MIN_REACTION_MS}ms`);
      confidence = Math.max(confidence, 0.6);
    }

    // ── 3. Outlier-free uniformity (histogram test) ──────────────────────────
    if (InputAnalyzer.isHistogramFlat(intervals)) {
      reasons.push("Interval histogram unusually flat (uniform distribution)");
      confidence = Math.max(confidence, 0.5);
    }

    return {
      suspicious: confidence > 0.5,
      confidence: Math.min(1, confidence),
      reasons,
    };
  }

  /**
   * Analyse press+release pairs for identical hold durations.
   * @param holdDurations Array of key-hold lengths in ms
   */
  static analyzeHoldDurations(holdDurations: number[]): AnalysisResult {
    const reasons: string[] = [];
    let confidence = 0;

    if (holdDurations.length < InputAnalyzer.REPEAT_HOLD_THRESHOLD) {
      return { suspicious: false, confidence: 0, reasons: [] };
    }

    const freq = new Map<number, number>();
    for (const d of holdDurations) {
      // Round to 5 ms buckets
      const bucket = Math.round(d / 5) * 5;
      freq.set(bucket, (freq.get(bucket) ?? 0) + 1);
    }

    for (const [duration, count] of freq) {
      if (count >= InputAnalyzer.REPEAT_HOLD_THRESHOLD) {
        reasons.push(`Same hold duration (${duration}ms) repeated ${count} times`);
        confidence = Math.max(confidence, 0.65);
      }
    }

    return {
      suspicious: confidence > 0.5,
      confidence: Math.min(1, confidence),
      reasons,
    };
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  static toIntervals(timestamps: number[]): number[] {
    const result: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      result.push(timestamps[i]! - timestamps[i - 1]!);
    }
    return result;
  }

  static mean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  static stdDev(values: number[]): number {
    const m = InputAnalyzer.mean(values);
    const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }

  static coefficientOfVariation(values: number[]): number {
    const m = InputAnalyzer.mean(values);
    if (m === 0) return 0;
    return InputAnalyzer.stdDev(values) / m;
  }

  /**
   * Chi-squared-like flatness test: flags if the interval histogram
   * looks more uniform than any human would produce.
   */
  private static isHistogramFlat(intervals: number[]): boolean {
    if (intervals.length < 20) return false;
    const min = Math.min(...intervals);
    const max = Math.max(...intervals);
    if (max - min < 50) return false; // too narrow a range anyway

    const buckets = 10;
    const bucketSize = (max - min) / buckets;
    const counts = new Array<number>(buckets).fill(0);
    for (const v of intervals) {
      const b = Math.min(buckets - 1, Math.floor((v - min) / bucketSize));
      counts[b]++;
    }
    const expected = intervals.length / buckets;
    const chiSq = counts.reduce((s, c) => s + (c - expected) ** 2 / expected, 0);
    // Under ~18 with 9 dof → not suspicious at p=0.05
    return chiSq < 5;
  }
}
