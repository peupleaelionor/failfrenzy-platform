/**
 * FAIL FRENZY — Experience & Level System
 * Authentic progression system with 50 levels, French rank titles,
 * XP earned from gameplay, and rewards per level.
 */

// ============================================================
// TYPES
// ============================================================

export interface LevelDefinition {
  level: number;
  title: string;
  titleShort: string;
  xpRequired: number;       // cumulative XP to reach this level
  color: string;
  reward?: LevelReward;
}

export interface LevelReward {
  tokens: number;
  skinUnlock?: string;
  title?: string;
  badge?: string;
}

export interface XPGainBreakdown {
  base: number;            // from score
  comboBonus: number;      // from max combo
  survivalBonus: number;   // from time survived
  failPenalty: number;     // deduction from fails
  streakBonus: number;     // daily streak multiplier
  modeBonus: number;       // mode-specific bonus
  total: number;
}

export interface ExperienceData {
  level: number;
  totalXP: number;
  currentLevelXP: number;  // XP within current level
  xpToNextLevel: number;   // XP needed to reach next level
  streak: number;
  lastPlayDate: string;    // ISO date
  dailyBonusClaimed: boolean;
  totalGamesForXP: number;
}

// ============================================================
// LEVEL DEFINITIONS — 50 authentic French rank titles
// ============================================================

const LEVEL_COLORS: string[] = [
  '#607080', // 1-5:  grey (Recrue)
  '#00f0ff', // 6-10: cyan (Pilote)
  '#00ff88', // 11-15: green (Navigateur)
  '#ffff00', // 16-20: yellow (Commandant)
  '#ff8800', // 21-25: orange (Capitaine)
  '#ff2d7b', // 26-30: pink (As Stellaire)
  '#ff00ff', // 31-35: magenta (Virtuose)
  '#bb44ff', // 36-40: purple (Maître)
  '#ffd700', // 41-45: gold (Légende)
  '#ffffff', // 46-50: white (Cosmique)
];

function getLevelColor(level: number): string {
  const idx = Math.min(Math.floor((level - 1) / 5), LEVEL_COLORS.length - 1);
  return LEVEL_COLORS[idx];
}

/**
 * XP curve: exponential growth with a smooth feel.
 * Level 1→2: 100 XP, Level 49→50: ~15000 XP
 */
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(80 * Math.pow(level - 1, 1.6) + 20 * (level - 1));
}

function cumulativeXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export const LEVEL_TITLES: Array<{ min: number; max: number; title: string; titleShort: string }> = [
  { min: 1, max: 2, title: 'Recrue Stellaire', titleShort: 'Recrue' },
  { min: 3, max: 5, title: 'Apprenti du Vide', titleShort: 'Apprenti' },
  { min: 6, max: 8, title: 'Pilote Novice', titleShort: 'Pilote' },
  { min: 9, max: 10, title: 'Pilote Confirmé', titleShort: 'Confirmé' },
  { min: 11, max: 13, title: 'Navigateur Spatial', titleShort: 'Navigateur' },
  { min: 14, max: 15, title: 'Éclaireur Galactique', titleShort: 'Éclaireur' },
  { min: 16, max: 18, title: 'Commandant de Secteur', titleShort: 'Commandant' },
  { min: 19, max: 20, title: 'Stratège du Chaos', titleShort: 'Stratège' },
  { min: 21, max: 23, title: 'Capitaine Nébulaire', titleShort: 'Capitaine' },
  { min: 24, max: 25, title: 'Héros du Rift', titleShort: 'Héros' },
  { min: 26, max: 28, title: 'As Stellaire', titleShort: 'As' },
  { min: 29, max: 30, title: 'Fléau des Obstacles', titleShort: 'Fléau' },
  { min: 31, max: 33, title: 'Virtuose du Fail', titleShort: 'Virtuose' },
  { min: 34, max: 35, title: 'Prodige Cosmique', titleShort: 'Prodige' },
  { min: 36, max: 38, title: 'Maître du Vortex', titleShort: 'Maître' },
  { min: 39, max: 40, title: 'Gardien de Xylos', titleShort: 'Gardien' },
  { min: 41, max: 43, title: 'Légende Neon', titleShort: 'Légende' },
  { min: 44, max: 45, title: 'Mythique Absolu', titleShort: 'Mythique' },
  { min: 46, max: 48, title: 'Transcendance Stellaire', titleShort: 'Transcendé' },
  { min: 49, max: 50, title: 'Légende Cosmique', titleShort: 'Cosmique' },
];

function getTitleForLevel(level: number): { title: string; titleShort: string } {
  for (const t of LEVEL_TITLES) {
    if (level >= t.min && level <= t.max) return { title: t.title, titleShort: t.titleShort };
  }
  return { title: 'Légende Cosmique', titleShort: 'Cosmique' };
}

/**
 * Level rewards - tokens + occasional special rewards
 */
function getRewardForLevel(level: number): LevelReward | undefined {
  const baseTokens = 25 + level * 10;
  const reward: LevelReward = { tokens: baseTokens };

  // Special milestone rewards
  if (level === 5)  { reward.tokens = 200; reward.badge = '⭐'; }
  if (level === 10) { reward.tokens = 500; reward.skinUnlock = 'neon_pulse'; reward.badge = '🌟'; }
  if (level === 15) { reward.tokens = 750; reward.badge = '💫'; }
  if (level === 20) { reward.tokens = 1000; reward.skinUnlock = 'void_walker'; reward.badge = '🏆'; }
  if (level === 25) { reward.tokens = 1500; reward.badge = '👑'; }
  if (level === 30) { reward.tokens = 2000; reward.skinUnlock = 'chaos_rift'; reward.badge = '💎'; }
  if (level === 40) { reward.tokens = 3000; reward.badge = '🔮'; }
  if (level === 50) { reward.tokens = 5000; reward.skinUnlock = 'cosmic_legend'; reward.title = 'Légende Cosmique'; reward.badge = '🌌'; }

  return reward;
}

// ============================================================
// BUILD LEVELS
// ============================================================

export function getAllLevels(): LevelDefinition[] {
  const levels: LevelDefinition[] = [];
  for (let i = 1; i <= 50; i++) {
    const { title, titleShort } = getTitleForLevel(i);
    levels.push({
      level: i,
      title,
      titleShort,
      xpRequired: cumulativeXPForLevel(i),
      color: getLevelColor(i),
      reward: getRewardForLevel(i),
    });
  }
  return levels;
}

const ALL_LEVELS = getAllLevels();

// ============================================================
// XP CALCULATION
// ============================================================

/**
 * Calculate XP gained from a game session.
 * Authentic formula based on real gameplay metrics.
 */
export function calculateXPGain(
  score: number,
  fails: number,
  timeSeconds: number,
  maxCombo: number,
  mode: string,
  streak: number,
): XPGainBreakdown {
  // Base XP: 1 XP per 5 score points
  const base = Math.floor(score / 5);

  // Combo bonus: reward sustained performance
  const comboBonus = Math.floor(maxCombo * 3);

  // Survival bonus: reward time alive (1 XP per 2 seconds)
  const survivalBonus = Math.floor(timeSeconds / 2);

  // Fail penalty: small deduction to reward clean play
  const failPenalty = Math.floor(fails * 2);

  // Streak bonus: multiplier for consecutive days (max +50%)
  const streakMultiplier = Math.min(1 + streak * 0.1, 1.5);
  const streakBonus = Math.floor((base + comboBonus + survivalBonus) * (streakMultiplier - 1));

  // Mode bonus
  let modeMultiplier = 1;
  if (mode.toLowerCase().includes('time')) modeMultiplier = 1.2;
  if (mode.toLowerCase().includes('infinite')) modeMultiplier = 0.8;
  if (mode.toLowerCase().includes('seeds')) modeMultiplier = 1.3;
  const modeBonus = Math.floor((base + comboBonus + survivalBonus) * (modeMultiplier - 1));

  const total = Math.max(5, base + comboBonus + survivalBonus - failPenalty + streakBonus + modeBonus);

  return { base, comboBonus, survivalBonus, failPenalty, streakBonus, modeBonus, total };
}

// ============================================================
// DAILY STREAK
// ============================================================

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function isYesterday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
}

// ============================================================
// EXPERIENCE SYSTEM CLASS
// ============================================================

const STORAGE_KEY = 'failfrenzy_experience';

export class ExperienceSystem {
  private data: ExperienceData;
  private levelUpListeners: Array<(level: number, reward?: LevelReward) => void> = [];

  constructor() {
    this.data = this.load();
    this.checkStreak();
  }

  private load(): ExperienceData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migration: ensure all fields exist
        return {
          level: parsed.level ?? 1,
          totalXP: parsed.totalXP ?? 0,
          currentLevelXP: parsed.currentLevelXP ?? 0,
          xpToNextLevel: parsed.xpToNextLevel ?? xpForLevel(2),
          streak: parsed.streak ?? 0,
          lastPlayDate: parsed.lastPlayDate ?? '',
          dailyBonusClaimed: parsed.dailyBonusClaimed ?? false,
          totalGamesForXP: parsed.totalGamesForXP ?? 0,
        };
      }
    } catch {
      // Corrupted data, reset
    }
    return {
      level: 1,
      totalXP: 0,
      currentLevelXP: 0,
      xpToNextLevel: xpForLevel(2),
      streak: 0,
      lastPlayDate: '',
      dailyBonusClaimed: false,
      totalGamesForXP: 0,
    };
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  private checkStreak(): void {
    const today = getToday();
    if (this.data.lastPlayDate === today) {
      // Already played today, streak maintained
      return;
    }
    if (isYesterday(this.data.lastPlayDate)) {
      // Streak continues
      this.data.streak++;
      this.data.dailyBonusClaimed = false;
    } else if (this.data.lastPlayDate !== '') {
      // Streak broken
      this.data.streak = 1;
      this.data.dailyBonusClaimed = false;
    } else {
      // First time
      this.data.streak = 1;
      this.data.dailyBonusClaimed = false;
    }
    this.data.lastPlayDate = today;
    this.save();
  }

  /**
   * Add XP from a game session.
   * Returns the breakdown and whether a level-up occurred.
   */
  public addGameXP(
    score: number,
    fails: number,
    timeSeconds: number,
    maxCombo: number,
    mode: string,
  ): { breakdown: XPGainBreakdown; leveledUp: boolean; newLevel: number; reward?: LevelReward } {
    const breakdown = calculateXPGain(score, fails, timeSeconds, maxCombo, mode, this.data.streak);

    this.data.totalXP += breakdown.total;
    this.data.currentLevelXP += breakdown.total;
    this.data.totalGamesForXP++;
    this.data.lastPlayDate = getToday();

    let leveledUp = false;
    let reward: LevelReward | undefined;

    // Check for level ups (can level up multiple times)
    while (this.data.level < 50 && this.data.currentLevelXP >= this.data.xpToNextLevel) {
      this.data.currentLevelXP -= this.data.xpToNextLevel;
      this.data.level++;
      this.data.xpToNextLevel = xpForLevel(this.data.level + 1);
      leveledUp = true;
      reward = getRewardForLevel(this.data.level);

      // Grant token rewards
      if (reward) {
        try {
          const currentTokens = parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10);
          localStorage.setItem('failfrenzy_tokens', String(currentTokens + reward.tokens));
        } catch {
          // Ignore token storage errors
        }
      }

      // Notify listeners
      for (const listener of this.levelUpListeners) {
        listener(this.data.level, reward);
      }
    }

    // Cap at level 50
    if (this.data.level >= 50) {
      this.data.level = 50;
      this.data.xpToNextLevel = 0;
    }

    this.save();
    return { breakdown, leveledUp, newLevel: this.data.level, reward };
  }

  /**
   * Claim daily login bonus XP
   */
  public claimDailyBonus(): { xp: number; tokens: number } | null {
    if (this.data.dailyBonusClaimed) return null;

    const bonusXP = 25 + this.data.streak * 10; // More XP with higher streak
    const bonusTokens = 5 + Math.min(this.data.streak * 2, 20);

    this.data.dailyBonusClaimed = true;
    this.data.totalXP += bonusXP;
    this.data.currentLevelXP += bonusXP;

    // Check for level up after daily bonus
    while (this.data.level < 50 && this.data.currentLevelXP >= this.data.xpToNextLevel) {
      this.data.currentLevelXP -= this.data.xpToNextLevel;
      this.data.level++;
      this.data.xpToNextLevel = xpForLevel(this.data.level + 1);
    }

    // Grant tokens
    try {
      const currentTokens = parseInt(localStorage.getItem('failfrenzy_tokens') || '500', 10);
      localStorage.setItem('failfrenzy_tokens', String(currentTokens + bonusTokens));
    } catch {
      // Ignore
    }

    this.save();
    return { xp: bonusXP, tokens: bonusTokens };
  }

  // ============================================================
  // GETTERS
  // ============================================================

  public getLevel(): number { return this.data.level; }
  public getTotalXP(): number { return this.data.totalXP; }
  public getCurrentLevelXP(): number { return this.data.currentLevelXP; }
  public getXPToNextLevel(): number { return this.data.xpToNextLevel; }
  public getStreak(): number { return this.data.streak; }
  public isDailyBonusClaimed(): boolean { return this.data.dailyBonusClaimed; }
  public getTotalGames(): number { return this.data.totalGamesForXP; }

  public getLevelProgress(): number {
    if (this.data.level >= 50) return 1;
    if (this.data.xpToNextLevel <= 0) return 1;
    return Math.min(this.data.currentLevelXP / this.data.xpToNextLevel, 1);
  }

  public getLevelTitle(): string {
    return getTitleForLevel(this.data.level).title;
  }

  public getLevelTitleShort(): string {
    return getTitleForLevel(this.data.level).titleShort;
  }

  public getLevelColor(): string {
    return getLevelColor(this.data.level);
  }

  public getLevelDefinition(): LevelDefinition {
    return ALL_LEVELS[Math.min(this.data.level - 1, ALL_LEVELS.length - 1)];
  }

  public getNextLevelDefinition(): LevelDefinition | null {
    if (this.data.level >= 50) return null;
    return ALL_LEVELS[this.data.level]; // level is 1-indexed, array is 0-indexed
  }

  public getData(): ExperienceData {
    return { ...this.data };
  }

  // ============================================================
  // EVENTS
  // ============================================================

  public onLevelUp(listener: (level: number, reward?: LevelReward) => void): void {
    this.levelUpListeners.push(listener);
  }

  // ============================================================
  // RESET
  // ============================================================

  public reset(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
  }
}

// ============================================================
// SINGLETON
// ============================================================

let _instance: ExperienceSystem | null = null;

export function getExperienceSystem(): ExperienceSystem {
  if (!_instance) {
    _instance = new ExperienceSystem();
  }
  return _instance;
}
