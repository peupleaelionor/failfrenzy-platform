/**
 * FAIL FRENZY – Procedural Level Generator
 * Generates level layouts from a seed string.
 *
 * Two modes:
 *  1. Server-side AI (POST /api/generate-level) – call your tRPC/LLM backend
 *  2. Local procedural fallback (always available, no network needed)
 *
 * The local generator uses the mulberry32 seeded PRNG so levels are identical
 * on every device for the same seed – enabling shareable challenges.
 *
 * The output LevelLayout is consumed by FailFrenzyGame to spawn entities.
 */

import { SeededRandom } from "@/lib/deterministicRandom";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ObstacleLayout {
  x: number;          // 0–1 (relative to canvas width)
  y: number;          // 0–1 (relative to canvas height)
  radius: number;     // pixels
  speedX: number;     // relative velocity, pixels/sec at 1× difficulty
  speedY: number;
  type: "rock" | "missile" | "laser" | "mine";
}

export interface StarLayout {
  x: number;
  y: number;
  points: number;
}

export interface PowerupLayout {
  x: number;
  y: number;
  type: "shield" | "boost" | "slow" | "bonus";
}

export interface LevelLayout {
  seed: string;
  difficulty: number;
  theme: string;
  obstacles: ObstacleLayout[];
  stars: StarLayout[];
  powerups: PowerupLayout[];
}

// ─── Generator ────────────────────────────────────────────────────────────────

export class ProceduralGenerator {
  /**
   * Generate a LevelLayout.
   * Attempts the AI backend first, falls back to local generation.
   *
   * @param seed       Reproducible seed string (e.g. "daily-2026-04-26")
   * @param difficulty Scalar ≥ 1. Controls spawn density and speed.
   * @param theme      Flavour hint for AI generation (ignored in fallback).
   */
  static async generateLevel(
    seed: string,
    difficulty = 1,
    theme = "neon-space"
  ): Promise<LevelLayout> {
    try {
      const response = await fetch("/api/generate-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, difficulty, theme }),
        signal: AbortSignal.timeout(4000),
      });
      if (response.ok) {
        return (await response.json()) as LevelLayout;
      }
    } catch {
      // Network unavailable or endpoint not yet implemented – fall through
    }
    return ProceduralGenerator.localGenerate(seed, difficulty, theme);
  }

  /**
   * Fully local, offline-capable level generation.
   * Deterministic: same seed → same layout on every platform.
   */
  static localGenerate(
    seed: string,
    difficulty = 1,
    theme = "neon-space"
  ): LevelLayout {
    const rng = new SeededRandom(seed);

    const obstacleCount = Math.floor(rng.nextRange(8, 14) * Math.sqrt(difficulty));
    const starCount = Math.floor(rng.nextRange(5, 10) / Math.sqrt(difficulty));
    const powerupCount = Math.max(1, Math.floor(3 / difficulty));

    const obstacles: ObstacleLayout[] = Array.from({ length: obstacleCount }, () =>
      ProceduralGenerator.spawnObstacle(rng, difficulty)
    );

    const stars: StarLayout[] = Array.from({ length: starCount }, () => ({
      x: rng.nextFloat(),
      y: rng.nextFloat(),
      points: rng.nextInt(10, 50),
    }));

    const powerups: PowerupLayout[] = Array.from({ length: powerupCount }, () => ({
      x: rng.nextFloat(),
      y: rng.nextFloat(),
      type: rng.pick<PowerupLayout["type"]>(["shield", "boost", "slow", "bonus"]),
    }));

    return { seed, difficulty, theme, obstacles, stars, powerups };
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private static spawnObstacle(rng: SeededRandom, difficulty: number): ObstacleLayout {
    const types: ObstacleLayout["type"][] = ["rock", "missile", "laser", "mine"];
    // Higher difficulty → heavier weighting toward fast types
    const typeWeights = difficulty < 2
      ? [0.5, 0.3, 0.15, 0.05]
      : [0.2, 0.35, 0.3, 0.15];

    const type = ProceduralGenerator.weightedPick(rng, types, typeWeights);

    const baseSpeed = 80 + difficulty * 40;
    const speedMultiplier = rng.nextRange(0.7, 1.4);

    const angleRad = rng.nextRange(0, Math.PI * 2);

    return {
      x: rng.nextFloat(),
      y: rng.nextFloat(),
      radius: type === "mine" ? rng.nextRange(14, 22)
             : type === "laser" ? rng.nextRange(4, 8)
             : rng.nextRange(10, 20),
      speedX: Math.cos(angleRad) * baseSpeed * speedMultiplier,
      speedY: Math.abs(Math.sin(angleRad)) * baseSpeed * speedMultiplier, // bias downwards
      type,
    };
  }

  private static weightedPick<T>(rng: SeededRandom, items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng.nextFloat() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i]!;
      if (r <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  }
}
