/**
 * FAIL FRENZY - ULTIMATE Combo & Scoring System
 * Advanced combo mechanics, multipliers, and achievement tracking
 */

import { NeonRenderer } from '../engine/NeonRenderer';

export interface ComboState {
  current: number;
  max: number;
  multiplier: number;
  timer: number;
  maxTimer: number;
  level: ComboLevel;
  nearMissStreak: number;
  perfectStreak: number;
}

export type ComboLevel = 'none' | 'good' | 'great' | 'amazing' | 'incredible' | 'legendary' | 'godlike';

export interface ScoreEvent {
  type: 'dodge' | 'nearMiss' | 'perfect' | 'collect' | 'powerup' | 'boss' | 'milestone';
  basePoints: number;
  multiplier: number;
  finalPoints: number;
  x: number;
  y: number;
  timestamp: number;
}

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
}

export class ComboSystem {
  private state: ComboState;
  private score: number = 0;
  private floatingTexts: FloatingText[] = [];
  private scoreHistory: ScoreEvent[] = [];
  private onComboChange: ((level: ComboLevel, combo: number) => void) | null = null;
  private onScoreChange: ((score: number, event: ScoreEvent) => void) | null = null;
  
  // Combo thresholds
  private static COMBO_LEVELS: { [key in ComboLevel]: { min: number; color: string; multiplier: number } } = {
    none: { min: 0, color: '#ffffff', multiplier: 1 },
    good: { min: 5, color: NeonRenderer.COLORS.GREEN, multiplier: 1.5 },
    great: { min: 15, color: NeonRenderer.COLORS.YELLOW, multiplier: 2 },
    amazing: { min: 30, color: NeonRenderer.COLORS.ORANGE, multiplier: 3 },
    incredible: { min: 50, color: NeonRenderer.COLORS.RED, multiplier: 4 },
    legendary: { min: 75, color: NeonRenderer.COLORS.MAGENTA, multiplier: 5 },
    godlike: { min: 100, color: NeonRenderer.COLORS.CYAN, multiplier: 7 },
  };
  
  // Base point values
  private static POINTS = {
    dodge: 10,
    nearMiss: 50,
    perfect: 100,
    collect: 25,
    powerup: 75,
    boss: 500,
    milestone: 1000,
  };
  
  constructor() {
    this.state = {
      current: 0,
      max: 0,
      multiplier: 1,
      timer: 0,
      maxTimer: 3,
      level: 'none',
      nearMissStreak: 0,
      perfectStreak: 0,
    };
  }
  
  // Set callbacks
  public onCombo(callback: (level: ComboLevel, combo: number) => void): void {
    this.onComboChange = callback;
  }
  
  public onScore(callback: (score: number, event: ScoreEvent) => void): void {
    this.onScoreChange = callback;
  }
  
  // Add to combo
  public addCombo(amount: number = 1): void {
    const previousLevel = this.state.level;
    
    this.state.current += amount;
    this.state.timer = this.state.maxTimer;
    
    if (this.state.current > this.state.max) {
      this.state.max = this.state.current;
    }
    
    this.updateLevel();
    
    if (this.state.level !== previousLevel && this.onComboChange) {
      this.onComboChange(this.state.level, this.state.current);
    }
  }
  
  // Break combo
  public breakCombo(): void {
    if (this.state.current > 0) {
      this.state.current = 0;
      this.state.timer = 0;
      this.state.nearMissStreak = 0;
      this.state.perfectStreak = 0;
      this.updateLevel();
      
      if (this.onComboChange) {
        this.onComboChange('none', 0);
      }
    }
  }
  
  // Update combo level based on current count
  private updateLevel(): void {
    const levels = Object.entries(ComboSystem.COMBO_LEVELS) as [ComboLevel, typeof ComboSystem.COMBO_LEVELS[ComboLevel]][];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      const [level, config] = levels[i];
      if (this.state.current >= config.min) {
        this.state.level = level;
        this.state.multiplier = config.multiplier;
        break;
      }
    }
  }
  
  // Add score with event
  public addScore(type: ScoreEvent['type'], x: number, y: number, bonusMultiplier: number = 1): number {
    const basePoints = ComboSystem.POINTS[type];
    const totalMultiplier = this.state.multiplier * bonusMultiplier;
    const finalPoints = Math.floor(basePoints * totalMultiplier);
    
    const event: ScoreEvent = {
      type,
      basePoints,
      multiplier: totalMultiplier,
      finalPoints,
      x,
      y,
      timestamp: Date.now(),
    };
    
    this.score += finalPoints;
    this.scoreHistory.push(event);
    
    // Create floating text
    this.createFloatingText(finalPoints, x, y, type);
    
    // Update streaks
    if (type === 'nearMiss') {
      this.state.nearMissStreak++;
      this.addCombo(2);
    } else if (type === 'perfect') {
      this.state.perfectStreak++;
      this.addCombo(3);
    } else if (type === 'dodge') {
      this.addCombo(1);
    }
    
    if (this.onScoreChange) {
      this.onScoreChange(this.score, event);
    }
    
    return finalPoints;
  }
  
  // Create floating score text
  private createFloatingText(points: number, x: number, y: number, type: ScoreEvent['type']): void {
    const levelConfig = ComboSystem.COMBO_LEVELS[this.state.level];
    
    let text = `+${points}`;
    let size = 20;
    let color = levelConfig.color;
    
    // Special text for high combos
    if (this.state.current >= 10 && this.state.current % 10 === 0) {
      text = `${this.state.current}x COMBO!`;
      size = 32;
    } else if (type === 'perfect') {
      text = `PERFECT! +${points}`;
      size = 28;
      color = NeonRenderer.COLORS.GOLD;
    } else if (type === 'nearMiss') {
      text = `CLOSE! +${points}`;
      size = 24;
    } else if (type === 'boss') {
      text = `BOSS DOWN! +${points}`;
      size = 36;
      color = NeonRenderer.COLORS.RED;
    }
    
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      size,
      life: 1.5,
      maxLife: 1.5,
      vy: -80,
      scale: 1.2,
    });
  }
  
  // Update system
  public update(dt: number): void {
    // Update combo timer
    if (this.state.timer > 0) {
      this.state.timer -= dt;
      
      if (this.state.timer <= 0) {
        this.breakCombo();
      }
    }
    
    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      
      ft.y += ft.vy * dt;
      ft.vy *= 0.95;
      ft.life -= dt;
      ft.scale = 1 + (1 - ft.life / ft.maxLife) * 0.3;
      
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
  
  // Render floating texts
  public render(ctx: CanvasRenderingContext2D): void {
    for (const ft of this.floatingTexts) {
      const alpha = Math.min(1, ft.life / ft.maxLife * 2);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${ft.size * ft.scale}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = ft.color;
      
      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);
      
      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      
      ctx.restore();
    }
  }
  
  // Render combo meter
  public renderComboMeter(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    if (this.state.current === 0) return;
    
    const levelConfig = ComboSystem.COMBO_LEVELS[this.state.level];
    const timerProgress = this.state.timer / this.state.maxTimer;
    
    // Background
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, height);
    
    // Timer bar
    ctx.fillStyle = levelConfig.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = levelConfig.color;
    ctx.fillRect(x, y, width * timerProgress, height);
    
    // Combo text
    ctx.font = 'bold 16px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.state.current}x`, x + width / 2, y + height / 2);
    
    ctx.restore();
  }
  
  // Get current state
  public getState(): ComboState {
    return { ...this.state };
  }
  
  // Get score
  public getScore(): number {
    return this.score;
  }
  
  // Get level color
  public getLevelColor(): string {
    return ComboSystem.COMBO_LEVELS[this.state.level].color;
  }
  
  // Get level name
  public getLevelName(): string {
    return this.state.level.toUpperCase();
  }
  
  // Reset
  public reset(): void {
    this.state = {
      current: 0,
      max: 0,
      multiplier: 1,
      timer: 0,
      maxTimer: 3,
      level: 'none',
      nearMissStreak: 0,
      perfectStreak: 0,
    };
    this.score = 0;
    this.floatingTexts = [];
    this.scoreHistory = [];
  }
  
  // Get statistics
  public getStats(): {
    totalScore: number;
    maxCombo: number;
    totalDodges: number;
    nearMisses: number;
    perfects: number;
  } {
    return {
      totalScore: this.score,
      maxCombo: this.state.max,
      totalDodges: this.scoreHistory.filter(e => e.type === 'dodge').length,
      nearMisses: this.scoreHistory.filter(e => e.type === 'nearMiss').length,
      perfects: this.scoreHistory.filter(e => e.type === 'perfect').length,
    };
  }
}

// Singleton
let comboInstance: ComboSystem | null = null;

export function getComboSystem(): ComboSystem {
  if (!comboInstance) {
    comboInstance = new ComboSystem();
  }
  return comboInstance;
}
