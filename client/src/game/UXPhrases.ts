/**
 * FAIL FRENZY PREMIUM — UX PHRASES SYSTEM
 * 
 * Micro-phrases dynamiques qui déclenchent le replay.
 * Sélection contextuelle basée sur : score, fails, temps, position leaderboard.
 * 
 * Catégories :
 * - Ego / Frustration positive
 * - Fierté locale (leaderboard régional)
 * - Replay immédiat
 * - Monétisation soft
 */

// ============================================================
// LEADERBOARD SIMULATION (local, évolutif vers backend)
// ============================================================

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  country: string;
  countryCode: string;
}

const LEADERBOARD_KEY = 'failfrenzy_leaderboard';
const COUNTRY_KEY = 'failfrenzy_country';

// Noms réalistes par pays
const NAMES_BY_COUNTRY: Record<string, string[]> = {
  FR: ['Lucas', 'Emma', 'Hugo', 'Léa', 'Nathan', 'Chloé', 'Raphaël', 'Jade', 'Louis', 'Manon',
       'Gabriel', 'Camille', 'Arthur', 'Inès', 'Jules', 'Lina', 'Adam', 'Sarah', 'Léo', 'Zoé'],
  DE: ['Lukas', 'Mia', 'Felix', 'Hannah', 'Leon', 'Sophia', 'Finn', 'Emilia', 'Paul', 'Lena'],
  ES: ['Pablo', 'Lucía', 'Hugo', 'Martina', 'Daniel', 'Sofía', 'Mateo', 'María', 'Leo', 'Paula'],
  IT: ['Leonardo', 'Sofia', 'Francesco', 'Aurora', 'Lorenzo', 'Giulia', 'Alessandro', 'Alice', 'Andrea', 'Ginevra'],
  GB: ['Oliver', 'Olivia', 'George', 'Amelia', 'Harry', 'Isla', 'Noah', 'Ava', 'Jack', 'Mia'],
  BE: ['Liam', 'Emma', 'Noah', 'Louise', 'Lucas', 'Olivia', 'Louis', 'Marie', 'Adam', 'Alice'],
};

const EU_COUNTRIES = [
  { code: 'FR', name: 'France', flag: 'FR' },
  { code: 'DE', name: 'Allemagne', flag: 'DE' },
  { code: 'ES', name: 'Espagne', flag: 'ES' },
  { code: 'IT', name: 'Italie', flag: 'IT' },
  { code: 'GB', name: 'UK', flag: 'GB' },
  { code: 'BE', name: 'Belgique', flag: 'BE' },
];

function getPlayerCountry(): { code: string; name: string } {
  try {
    const saved = localStorage.getItem(COUNTRY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  // Default France
  const country = { code: 'FR', name: 'France' };
  localStorage.setItem(COUNTRY_KEY, JSON.stringify(country));
  return country;
}

/**
 * Génère un leaderboard réaliste autour du score du joueur.
 * Les scores sont distribués de manière crédible.
 */
export function generateLeaderboard(playerScore: number): LeaderboardEntry[] {
  const country = getPlayerCountry();
  
  // Charger le leaderboard persisté ou en créer un nouveau
  let board: LeaderboardEntry[] = [];
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) board = JSON.parse(saved);
  } catch {}

  // Générer des entrées si le board est vide ou trop petit
  if (board.length < 20) {
    board = generateInitialBoard(playerScore);
  }

  // Insérer le score du joueur
  const playerEntry: LeaderboardEntry = {
    rank: 0,
    name: 'YOU',
    score: playerScore,
    country: country.name,
    countryCode: country.code,
  };

  // Trouver la position du joueur
  const allEntries = [...board, playerEntry].sort((a, b) => b.score - a.score);
  allEntries.forEach((e, i) => e.rank = i + 1);

  // Sauvegarder (garder les 50 meilleurs)
  const toSave = allEntries.filter(e => e.name !== 'YOU').slice(0, 50);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(toSave));

  return allEntries;
}

function generateInitialBoard(referenceScore: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const baseScore = Math.max(referenceScore * 1.5, 200);

  for (let i = 0; i < 30; i++) {
    const countryInfo = EU_COUNTRIES[Math.floor(Math.random() * EU_COUNTRIES.length)];
    const names = NAMES_BY_COUNTRY[countryInfo.code] || NAMES_BY_COUNTRY.FR;
    const name = names[Math.floor(Math.random() * names.length)];
    
    // Distribution réaliste : quelques très bons, beaucoup de moyens
    const tier = Math.random();
    let score: number;
    if (tier < 0.05) {
      score = Math.floor(baseScore * (2.5 + Math.random() * 1.5)); // Top players
    } else if (tier < 0.2) {
      score = Math.floor(baseScore * (1.2 + Math.random() * 0.8)); // Good players
    } else if (tier < 0.6) {
      score = Math.floor(baseScore * (0.5 + Math.random() * 0.7)); // Average
    } else {
      score = Math.floor(baseScore * (0.1 + Math.random() * 0.4)); // Beginners
    }

    entries.push({
      rank: i + 1,
      name,
      score,
      country: countryInfo.name,
      countryCode: countryInfo.code,
    });
  }

  return entries.sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
}

/**
 * Obtenir le Top N du pays du joueur
 */
export function getCountryTop(board: LeaderboardEntry[], n: number = 5): LeaderboardEntry[] {
  const country = getPlayerCountry();
  return board
    .filter(e => e.countryCode === country.code || e.name === 'YOU')
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

/**
 * Obtenir le rang du joueur dans le pays
 */
export function getPlayerCountryRank(board: LeaderboardEntry[]): number {
  const countryBoard = getCountryTop(board, 100);
  const player = countryBoard.find(e => e.name === 'YOU');
  return player?.rank || countryBoard.length + 1;
}

/**
 * Obtenir le rang du joueur en Europe
 */
export function getPlayerEuropeRank(board: LeaderboardEntry[]): number {
  const player = board.find(e => e.name === 'YOU');
  return player?.rank || board.length + 1;
}

// ============================================================
// MICRO-PHRASES UX DYNAMIQUES
// ============================================================

export interface UXPhrase {
  text: string;
  category: 'ego' | 'pride' | 'replay' | 'monetization';
  intensity: number; // 0-1, pour le style visuel
}

/**
 * Sélectionne la meilleure phrase UX en fonction du contexte.
 * Priorité : ego > fierté locale > replay > monétisation
 */
export function getContextualPhrase(
  score: number,
  fails: number,
  time: number,
  board: LeaderboardEntry[],
): UXPhrase {
  const countryRank = getPlayerCountryRank(board);
  const europeRank = getPlayerEuropeRank(board);
  const country = getPlayerCountry();
  
  // Trouver le score juste au-dessus
  const sorted = board.filter(e => e.name !== 'YOU').sort((a, b) => b.score - a.score);
  const playerIdx = sorted.findIndex(e => e.score < score);
  const nextAbove = playerIdx > 0 ? sorted[playerIdx - 1] : sorted[0];
  const gap = nextAbove ? nextAbove.score - score : 0;

  // ─── EGO / FRUSTRATION POSITIVE ───
  if (gap > 0 && gap <= 5 && countryRank <= 15) {
    return {
      text: `A ${gap} point${gap > 1 ? 's' : ''} du Top ${Math.max(countryRank - 1, 1)}`,
      category: 'ego',
      intensity: 0.9,
    };
  }

  if (gap > 0 && gap <= 15 && countryRank <= 5) {
    return {
      text: `Tu étais presque dans le Top 3`,
      category: 'ego',
      intensity: 0.85,
    };
  }

  if (gap > 0 && gap <= 30) {
    return {
      text: `A ${gap} points du classement supérieur`,
      category: 'ego',
      intensity: 0.7,
    };
  }

  // ─── FIERTÉ LOCALE ───
  if (countryRank <= 3) {
    return {
      text: `Top ${countryRank} ${country.name}`,
      category: 'pride',
      intensity: 1.0,
    };
  }

  if (countryRank <= 5) {
    return {
      text: `Top 5 ${country.name}`,
      category: 'pride',
      intensity: 0.9,
    };
  }

  if (europeRank <= 10) {
    return {
      text: `#${europeRank} Europe`,
      category: 'pride',
      intensity: 0.85,
    };
  }

  if (countryRank <= 10) {
    return {
      text: `Top 10 ${country.name}`,
      category: 'pride',
      intensity: 0.75,
    };
  }

  // ─── REPLAY IMMÉDIAT ───
  if (fails <= 1 && time > 20) {
    return {
      text: 'Si proche de la perfection.',
      category: 'replay',
      intensity: 0.6,
    };
  }

  if (score > 150) {
    return {
      text: 'Tu peux faire mieux.',
      category: 'replay',
      intensity: 0.5,
    };
  }

  if (time < 10) {
    return {
      text: 'Encore un essai.',
      category: 'replay',
      intensity: 0.4,
    };
  }

  // ─── FALLBACK ───
  const fallbacks: UXPhrase[] = [
    { text: 'Revanche ?', category: 'replay', intensity: 0.4 },
    { text: 'Le loop continue.', category: 'replay', intensity: 0.3 },
    { text: 'Encore un essai.', category: 'replay', intensity: 0.4 },
    { text: 'Tu peux faire mieux.', category: 'replay', intensity: 0.5 },
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Phrase de sous-titre Game Over (variable, courte)
 */
export function getGameOverSubtext(score: number, fails: number, time: number): string {
  if (score === 0) return 'Le chaos ne pardonne pas.';
  if (fails === 0 && time > 30) return 'Run parfait. Impressionnant.';
  if (fails <= 1) return 'Presque parfait.';
  if (score > 300) return 'Performance remarquable.';
  if (score > 150) return 'Bien joué.';
  if (time < 5) return 'Début brutal.';
  if (fails > 5) return 'Le chaos a gagné. Pour l\'instant.';
  return 'Another glorious failure.';
}

/**
 * Phrase de monétisation soft pour le bouton CONTINUER
 */
export function getContinueSubtext(countryRank: number): string {
  if (countryRank <= 5) return 'Garde ton rang';
  if (countryRank <= 10) return 'Monte dans le classement';
  return 'Un essai de plus';
}
