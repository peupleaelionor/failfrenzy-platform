/**
 * FAIL FRENZY - ULTIMATE Dynamic Difficulty System
 * Adaptive difficulty that keeps players in the "flow zone"
 * Tracks performance and adjusts in real-time
 */

export interface DifficultyConfig {
  baseSpeed: number;
  maxSpeed: number;
  baseSpawnRate: number;
  minSpawnRate: number;
  adaptationRate: number;
  targetSuccessRate: number;
  difficultyFloor: number;
  difficultyCeiling: number;
}

export interface PerformanceMetrics {
  recentDodges: number;
  recentFails: number;
  averageReactionTime: number;
  longestStreak: number;
  currentStreak: number;
  totalAttempts: number;
  successRate: number;
}

export interface DifficultyState {
  level: number;
  speed: number;
  spawnRate: number;
  obstacleComplexity: number;
  patternDifficulty: number;
  reactionWindow: number;
}

export class DifficultySystem {
  private config: DifficultyConfig;
  private metrics: PerformanceMetrics;
  private state: DifficultyState;
  private history: number[] = [];
  private historySize: number = 20;
  
  // Difficulty curve presets
  private static CURVES = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    exponential: (t: number) => Math.pow(2, 10 * (t - 1)),
    elastic: (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
  };
  
  // Obstacle patterns by difficulty
  private static PATTERNS = {
    easy: [
      // Single obstacles with large gaps
      [{ y: 0.2 }],
      [{ y: 0.5 }],
      [{ y: 0.8 }],
    ],
    medium: [
      // Two obstacles
      [{ y: 0.2 }, { y: 0.6 }],
      [{ y: 0.3 }, { y: 0.7 }],
      // Moving obstacles
      [{ y: 0.5, moving: true }],
    ],
    hard: [
      // Three obstacles
      [{ y: 0.2 }, { y: 0.5 }, { y: 0.8 }],
      // Fast movers
      [{ y: 0.3, speed: 1.5 }, { y: 0.7, speed: 1.5 }],
      // Zigzag pattern
      [{ y: 0.2 }, { y: 0.5, delay: 0.2 }, { y: 0.8, delay: 0.4 }],
    ],
    extreme: [
      // Wall with gap
      [{ y: 0.1 }, { y: 0.3 }, { y: 0.7 }, { y: 0.9 }],
      // Converging obstacles
      [{ y: 0.2, converge: true }, { y: 0.8, converge: true }],
      // Spiral pattern
      [{ y: 0.2 }, { y: 0.4, delay: 0.1 }, { y: 0.6, delay: 0.2 }, { y: 0.8, delay: 0.3 }],
    ],
    nightmare: [
      // Almost full wall
      [{ y: 0.1 }, { y: 0.25 }, { y: 0.4 }, { y: 0.6 }, { y: 0.75 }, { y: 0.9 }],
      // Rapid fire
      [{ y: 0.3, rapid: 3 }, { y: 0.7, rapid: 3 }],
      // Boss pattern
      [{ y: 0.5, size: 2, pulsing: true }],
    ],
  };
  
  constructor(config: Partial<DifficultyConfig> = {}) {
    this.config = {
      baseSpeed: 200,
      maxSpeed: 600,
      baseSpawnRate: 2,
      minSpawnRate: 0.3,
      adaptationRate: 0.1,
      targetSuccessRate: 0.65,
      difficultyFloor: 0.1,
      difficultyCeiling: 2.0,
      ...config,
    };
    
    this.metrics = {
      recentDodges: 0,
      recentFails: 0,
      averageReactionTime: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalAttempts: 0,
      successRate: 0.5,
    };
    
    this.state = {
      level: 1,
      speed: this.config.baseSpeed,
      spawnRate: this.config.baseSpawnRate,
      obstacleComplexity: 1,
      patternDifficulty: 0,
      reactionWindow: 1,
    };
  }
  
  // Record a successful dodge
  public recordDodge(reactionTime: number = 0): void {
    this.metrics.recentDodges++;
    this.metrics.currentStreak++;
    this.metrics.totalAttempts++;
    
    if (this.metrics.currentStreak > this.metrics.longestStreak) {
      this.metrics.longestStreak = this.metrics.currentStreak;
    }
    
    if (reactionTime > 0) {
      this.metrics.averageReactionTime = 
        (this.metrics.averageReactionTime * 0.9) + (reactionTime * 0.1);
    }
    
    this.history.push(1);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }
    
    this.updateSuccessRate();
    this.adaptDifficulty();
  }
  
  // Record a fail
  public recordFail(): void {
    this.metrics.recentFails++;
    this.metrics.currentStreak = 0;
    this.metrics.totalAttempts++;
    
    this.history.push(0);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }
    
    this.updateSuccessRate();
    this.adaptDifficulty();
  }
  
  // Update success rate from history
  private updateSuccessRate(): void {
    if (this.history.length === 0) return;
    
    const successes = this.history.reduce((sum, val) => sum + val, 0);
    this.metrics.successRate = successes / this.history.length;
  }
  
  // Adapt difficulty based on performance
  private adaptDifficulty(): void {
    const targetRate = this.config.targetSuccessRate;
    const currentRate = this.metrics.successRate;
    const adaptRate = this.config.adaptationRate;
    
    // Calculate adjustment
    let adjustment = 0;
    
    if (currentRate > targetRate + 0.1) {
      // Player is doing too well, increase difficulty
      adjustment = adaptRate * (currentRate - targetRate);
    } else if (currentRate < targetRate - 0.1) {
      // Player is struggling, decrease difficulty
      adjustment = -adaptRate * (targetRate - currentRate);
    }
    
    // Apply adjustment with bounds
    this.state.level = Math.max(
      this.config.difficultyFloor,
      Math.min(this.config.difficultyCeiling, this.state.level + adjustment)
    );
    
    // Update derived values
    this.updateDerivedState();
  }
  
  // Update speed, spawn rate, etc. based on level
  private updateDerivedState(): void {
    const t = (this.state.level - this.config.difficultyFloor) / 
              (this.config.difficultyCeiling - this.config.difficultyFloor);
    
    // Use easeInOut curve for smooth progression
    const curve = DifficultySystem.CURVES.easeInOut(t);
    
    // Speed increases with difficulty
    this.state.speed = this.config.baseSpeed + 
      (this.config.maxSpeed - this.config.baseSpeed) * curve;
    
    // Spawn rate decreases (faster spawning) with difficulty
    this.state.spawnRate = this.config.baseSpawnRate - 
      (this.config.baseSpawnRate - this.config.minSpawnRate) * curve;
    
    // Obstacle complexity increases
    this.state.obstacleComplexity = 1 + curve * 2;
    
    // Pattern difficulty (0-4 for easy to nightmare)
    this.state.patternDifficulty = Math.floor(curve * 4);
    
    // Reaction window shrinks
    this.state.reactionWindow = 1 - (curve * 0.5);
  }
  
  // Get current obstacle pattern
  public getObstaclePattern(): any[] {
    const patterns = this.getPatternSet();
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
  
  // Get pattern set based on difficulty
  private getPatternSet(): any[][] {
    const difficulty = this.state.patternDifficulty;
    
    switch (difficulty) {
      case 0: return DifficultySystem.PATTERNS.easy;
      case 1: return DifficultySystem.PATTERNS.medium;
      case 2: return DifficultySystem.PATTERNS.hard;
      case 3: return DifficultySystem.PATTERNS.extreme;
      case 4: return DifficultySystem.PATTERNS.nightmare;
      default: return DifficultySystem.PATTERNS.easy;
    }
  }
  
  // Get current difficulty state
  public getState(): DifficultyState {
    return { ...this.state };
  }
  
  // Get performance metrics
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  // Set difficulty level directly (for modes)
  public setLevel(level: number): void {
    this.state.level = Math.max(
      this.config.difficultyFloor,
      Math.min(this.config.difficultyCeiling, level)
    );
    this.updateDerivedState();
  }
  
  // Increase difficulty over time
  public progressTime(dt: number): void {
    // Gradual increase over time
    const timeIncrease = dt * 0.01;
    this.state.level = Math.min(
      this.config.difficultyCeiling,
      this.state.level + timeIncrease
    );
    this.updateDerivedState();
  }
  
  // Get difficulty label
  public getDifficultyLabel(): string {
    const level = this.state.level;
    
    if (level < 0.3) return 'EASY';
    if (level < 0.6) return 'NORMAL';
    if (level < 0.9) return 'HARD';
    if (level < 1.2) return 'EXTREME';
    if (level < 1.5) return 'NIGHTMARE';
    return 'IMPOSSIBLE';
  }
  
  // Get difficulty color
  public getDifficultyColor(): string {
    const level = this.state.level;
    
    if (level < 0.3) return '#00ff00';
    if (level < 0.6) return '#ffff00';
    if (level < 0.9) return '#ff6600';
    if (level < 1.2) return '#ff0066';
    if (level < 1.5) return '#ff00ff';
    return '#ffffff';
  }
  
  // Reset metrics
  public reset(): void {
    this.metrics = {
      recentDodges: 0,
      recentFails: 0,
      averageReactionTime: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalAttempts: 0,
      successRate: 0.5,
    };
    
    this.history = [];
    this.state.level = 1;
    this.updateDerivedState();
  }
  
  // Get spawn interval in seconds
  public getSpawnInterval(): number {
    return this.state.spawnRate;
  }
  
  // Get obstacle speed
  public getObstacleSpeed(): number {
    return this.state.speed;
  }
  
  // Should spawn boss obstacle?
  public shouldSpawnBoss(): boolean {
    return this.metrics.currentStreak > 0 && 
           this.metrics.currentStreak % 25 === 0;
  }
  
  // Get boss multiplier
  public getBossMultiplier(): number {
    return 1 + Math.floor(this.metrics.currentStreak / 25) * 0.5;
  }
}

// Singleton
let difficultyInstance: DifficultySystem | null = null;

export function getDifficultySystem(): DifficultySystem {
  if (!difficultyInstance) {
    difficultyInstance = new DifficultySystem();
  }
  return difficultyInstance;
}
