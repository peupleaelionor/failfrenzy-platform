/**
 * FAIL FRENZY - Achievements & Progression System
 * Track player progress, unlock achievements, manage stats
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
  progress: number;
  target: number;
  reward: {
    type: 'cosmetic' | 'title' | 'currency';
    value: string | number;
  };
}

export interface PlayerStats {
  totalGames: number;
  totalScore: number;
  highScore: number;
  totalFails: number;
  totalTime: number;
  longestCombo: number;
  modesCompleted: {
    classic: number;
    timeTrial: number;
    infinite: number;
    seeds: number;
  };
  achievements: Achievement[];
  cosmetics: string[];
  currency: number;
  level: number;
  experience: number;
}

export class AchievementSystem {
  private stats: PlayerStats;
  private listeners: Array<(achievement: Achievement) => void>;
  
  constructor() {
    this.listeners = [];
    this.stats = this.loadStats();
  }
  
  // Load stats from localStorage
  private loadStats(): PlayerStats {
    const savedStats = localStorage.getItem('failfrenzy_stats');
    if (savedStats) {
      return JSON.parse(savedStats);
    }
    
    // Default stats
    return {
      totalGames: 0,
      totalScore: 0,
      highScore: 0,
      totalFails: 0,
      totalTime: 0,
      longestCombo: 0,
      modesCompleted: {
        classic: 0,
        timeTrial: 0,
        infinite: 0,
        seeds: 0,
      },
      achievements: this.initializeAchievements(),
      cosmetics: ['default'],
      currency: 0,
      level: 1,
      experience: 0,
    };
  }
  
  // Initialize all achievements
  private initializeAchievements(): Achievement[] {
    return [
      // Beginner achievements
      {
        id: 'first_fail',
        name: 'First Fail',
        description: 'Fail for the first time',
        icon: '💥',
        tier: 'bronze',
        unlocked: false,
        progress: 0,
        target: 1,
        reward: { type: 'currency', value: 10 },
      },
      {
        id: 'first_game',
        name: 'Getting Started',
        description: 'Complete your first game',
        icon: '🎮',
        tier: 'bronze',
        unlocked: false,
        progress: 0,
        target: 1,
        reward: { type: 'currency', value: 25 },
      },
      {
        id: 'score_100',
        name: 'Century',
        description: 'Score 100 points in a single game',
        icon: '💯',
        tier: 'bronze',
        unlocked: false,
        progress: 0,
        target: 100,
        reward: { type: 'cosmetic', value: 'trail_cyan' },
      },
      
      // Intermediate achievements
      {
        id: 'combo_10',
        name: 'Combo Master',
        description: 'Reach a 10x combo',
        icon: '🔥',
        tier: 'silver',
        unlocked: false,
        progress: 0,
        target: 10,
        reward: { type: 'cosmetic', value: 'glow_magenta' },
      },
      {
        id: 'fail_100',
        name: 'Fail Forward',
        description: 'Fail 100 times (across all games)',
        icon: '💀',
        tier: 'silver',
        unlocked: false,
        progress: 0,
        target: 100,
        reward: { type: 'title', value: 'Persistent' },
      },
      {
        id: 'score_500',
        name: 'High Roller',
        description: 'Score 500 points in a single game',
        icon: '🌟',
        tier: 'silver',
        unlocked: false,
        progress: 0,
        target: 500,
        reward: { type: 'currency', value: 100 },
      },
      
      // Advanced achievements
      {
        id: 'perfect_run',
        name: 'Perfect Run',
        description: 'Complete a Classic game with 0 fails',
        icon: '👑',
        tier: 'gold',
        unlocked: false,
        progress: 0,
        target: 1,
        reward: { type: 'cosmetic', value: 'crown_gold' },
      },
      {
        id: 'time_trial_master',
        name: 'Time Trial Master',
        description: 'Complete 10 Time Trial runs',
        icon: '⏱️',
        tier: 'gold',
        unlocked: false,
        progress: 0,
        target: 10,
        reward: { type: 'cosmetic', value: 'particle_yellow' },
      },
      {
        id: 'score_1000',
        name: 'Legend',
        description: 'Score 1000 points in a single game',
        icon: '💎',
        tier: 'gold',
        unlocked: false,
        progress: 0,
        target: 1000,
        reward: { type: 'currency', value: 250 },
      },
      
      // Master achievements
      {
        id: 'all_modes',
        name: 'Jack of All Trades',
        description: 'Complete all 4 game modes',
        icon: '🎯',
        tier: 'platinum',
        unlocked: false,
        progress: 0,
        target: 4,
        reward: { type: 'title', value: 'Versatile' },
      },
      {
        id: 'combo_50',
        name: 'Combo God',
        description: 'Reach a 50x combo',
        icon: '⚡',
        tier: 'platinum',
        unlocked: false,
        progress: 0,
        target: 50,
        reward: { type: 'cosmetic', value: 'ultimate_effect' },
      },
      {
        id: 'fail_1000',
        name: 'Failure Expert',
        description: 'Fail 1000 times (across all games)',
        icon: '🔮',
        tier: 'platinum',
        unlocked: false,
        progress: 0,
        target: 1000,
        reward: { type: 'title', value: 'Unstoppable' },
      },
    ];
  }
  
  // Save stats to localStorage
  private saveStats(): void {
    localStorage.setItem('failfrenzy_stats', JSON.stringify(this.stats));
  }
  
  // Update stats after a game
  public updateGameStats(
    score: number,
    fails: number,
    time: number,
    combo: number,
    mode: string
  ): void {
    this.stats.totalGames++;
    this.stats.totalScore += score;
    this.stats.totalFails += fails;
    this.stats.totalTime += time;
    
    if (score > this.stats.highScore) {
      this.stats.highScore = score;
    }
    
    if (combo > this.stats.longestCombo) {
      this.stats.longestCombo = combo;
    }
    
    // Update mode-specific stats
    const modeKey = mode.toLowerCase().replace(/\s+/g, '') as keyof typeof this.stats.modesCompleted;
    if (modeKey in this.stats.modesCompleted) {
      this.stats.modesCompleted[modeKey as keyof typeof this.stats.modesCompleted]++;
    }
    
    // Add experience
    this.addExperience(Math.floor(score / 10));
    
    // Check achievements
    this.checkAchievements(score, fails, combo, mode);
    
    this.saveStats();
  }
  
  // Check and unlock achievements
  private checkAchievements(score: number, fails: number, combo: number, mode: string): void {
    const achievements = this.stats.achievements;
    
    for (const achievement of achievements) {
      if (achievement.unlocked) continue;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_fail':
          achievement.progress = Math.min(this.stats.totalFails, achievement.target);
          shouldUnlock = this.stats.totalFails >= achievement.target;
          break;
          
        case 'first_game':
          achievement.progress = Math.min(this.stats.totalGames, achievement.target);
          shouldUnlock = this.stats.totalGames >= achievement.target;
          break;
          
        case 'score_100':
        case 'score_500':
        case 'score_1000':
          achievement.progress = Math.min(score, achievement.target);
          shouldUnlock = score >= achievement.target;
          break;
          
        case 'combo_10':
        case 'combo_50':
          achievement.progress = Math.min(combo, achievement.target);
          shouldUnlock = combo >= achievement.target;
          break;
          
        case 'fail_100':
        case 'fail_1000':
          achievement.progress = Math.min(this.stats.totalFails, achievement.target);
          shouldUnlock = this.stats.totalFails >= achievement.target;
          break;
          
        case 'perfect_run':
          if (mode.toLowerCase().includes('classic') && fails === 0) {
            achievement.progress = 1;
            shouldUnlock = true;
          }
          break;
          
        case 'time_trial_master':
          achievement.progress = Math.min(this.stats.modesCompleted.timeTrial, achievement.target);
          shouldUnlock = this.stats.modesCompleted.timeTrial >= achievement.target;
          break;
          
        case 'all_modes':
          const modesCompleted = Object.values(this.stats.modesCompleted).filter(c => c > 0).length;
          achievement.progress = modesCompleted;
          shouldUnlock = modesCompleted >= achievement.target;
          break;
      }
      
      if (shouldUnlock) {
        this.unlockAchievement(achievement);
      }
    }
  }
  
  // Unlock achievement and grant reward
  private unlockAchievement(achievement: Achievement): void {
    achievement.unlocked = true;
    achievement.progress = achievement.target;
    
    // Grant reward
    if (achievement.reward.type === 'currency') {
      this.stats.currency += achievement.reward.value as number;
    } else if (achievement.reward.type === 'cosmetic') {
      this.stats.cosmetics.push(achievement.reward.value as string);
    }
    
    // Notify listeners
    for (const listener of this.listeners) {
      listener(achievement);
    }
    
    this.saveStats();
  }
  
  // Add experience and level up
  private addExperience(amount: number): void {
    this.stats.experience += amount;
    
    const expToNextLevel = this.getExpToNextLevel();
    
    if (this.stats.experience >= expToNextLevel) {
      this.stats.level++;
      this.stats.experience -= expToNextLevel;
      this.stats.currency += 50 * this.stats.level; // Bonus currency on level up
    }
  }
  
  // Calculate experience needed for next level
  private getExpToNextLevel(): number {
    return Math.floor(100 * Math.pow(1.5, this.stats.level - 1));
  }
  
  // Get all stats
  public getStats(): PlayerStats {
    return { ...this.stats };
  }
  
  // Get unlocked achievements
  public getUnlockedAchievements(): Achievement[] {
    return this.stats.achievements.filter(a => a.unlocked);
  }
  
  // Get locked achievements
  public getLockedAchievements(): Achievement[] {
    return this.stats.achievements.filter(a => !a.unlocked);
  }
  
  // Get achievements by tier
  public getAchievementsByTier(tier: Achievement['tier']): Achievement[] {
    return this.stats.achievements.filter(a => a.tier === tier);
  }
  
  // Get progress percentage
  public getProgressPercentage(): number {
    const total = this.stats.achievements.length;
    const unlocked = this.getUnlockedAchievements().length;
    return Math.round((unlocked / total) * 100);
  }
  
  // Subscribe to achievement unlocks
  public onAchievementUnlock(listener: (achievement: Achievement) => void): void {
    this.listeners.push(listener);
  }
  
  // Get current level progress
  public getLevelProgress(): { current: number; max: number; percentage: number } {
    const max = this.getExpToNextLevel();
    const current = this.stats.experience;
    const percentage = Math.round((current / max) * 100);
    
    return { current, max, percentage };
  }
  
  // Reset all stats (for testing)
  public resetStats(): void {
    localStorage.removeItem('failfrenzy_stats');
    this.stats = this.loadStats();
  }
  
  // Export stats as JSON
  public exportStats(): string {
    return JSON.stringify(this.stats, null, 2);
  }
  
  // Import stats from JSON
  public importStats(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      this.stats = imported;
      this.saveStats();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const achievementSystem = new AchievementSystem();
