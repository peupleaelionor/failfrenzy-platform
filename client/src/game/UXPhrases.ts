/**
 * FAIL FRENZY: ECHOES OF THE VOID — UX PHRASES SYSTEM
 * 
 * Micro-phrases narratives qui déclenchent le transfert de conscience (replay).
 * Sélection contextuelle basée sur : score, fails, temps, position leaderboard.
 * 
 * Catégories :
 * - Mission / Devoir (Ego)
 * - Gloire de Xylos (Pride)
 * - Transfert de Conscience (Replay)
 * - Soutien de l'Effort de Guerre (Monetization)
 */

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
  const country = { code: 'FR', name: 'France' };
  localStorage.setItem(COUNTRY_KEY, JSON.stringify(country));
  return country;
}

export function generateLeaderboard(playerScore: number): LeaderboardEntry[] {
  const country = getPlayerCountry();
  let board: LeaderboardEntry[] = [];
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) board = JSON.parse(saved);
  } catch {}

  if (board.length < 20) {
    board = generateInitialBoard(playerScore);
  }

  const playerEntry: LeaderboardEntry = {
    rank: 0,
    name: 'VOUS',
    score: playerScore,
    country: country.name,
    countryCode: country.code,
  };

  const allEntries = [...board, playerEntry].sort((a, b) => b.score - a.score);
  allEntries.forEach((e, i) => e.rank = i + 1);

  const toSave = allEntries.filter(e => e.name !== 'VOUS').slice(0, 50);
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
    
    const tier = Math.random();
    let score: number;
    if (tier < 0.05) {
      score = Math.floor(baseScore * (2.5 + Math.random() * 1.5));
    } else if (tier < 0.2) {
      score = Math.floor(baseScore * (1.2 + Math.random() * 0.8));
    } else if (tier < 0.6) {
      score = Math.floor(baseScore * (0.5 + Math.random() * 0.7));
    } else {
      score = Math.floor(baseScore * (0.1 + Math.random() * 0.4));
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

export function getCountryTop(board: LeaderboardEntry[], n: number = 5): LeaderboardEntry[] {
  const country = getPlayerCountry();
  return board
    .filter(e => e.countryCode === country.code || e.name === 'VOUS')
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getPlayerCountryRank(board: LeaderboardEntry[]): number {
  const countryBoard = getCountryTop(board, 100);
  const player = countryBoard.find(e => e.name === 'VOUS');
  return player?.rank || countryBoard.length + 1;
}

export function getPlayerEuropeRank(board: LeaderboardEntry[]): number {
  const player = board.find(e => e.name === 'VOUS');
  return player?.rank || board.length + 1;
}

// ============================================================
// MICRO-PHRASES UX DYNAMIQUES (NARRATIVES)
// ============================================================

export interface UXPhrase {
  text: string;
  category: 'ego' | 'pride' | 'replay' | 'monetization';
  intensity: number;
}

export function getContextualPhrase(
  score: number,
  fails: number,
  time: number,
  board: LeaderboardEntry[],
): UXPhrase {
  const countryRank = getPlayerCountryRank(board);
  const europeRank = getPlayerEuropeRank(board);
  const country = getPlayerCountry();
  
  const sorted = board.filter(e => e.name !== 'VOUS').sort((a, b) => b.score - a.score);
  const playerIdx = sorted.findIndex(e => e.score < score);
  const nextAbove = playerIdx > 0 ? sorted[playerIdx - 1] : sorted[0];
  const gap = nextAbove ? nextAbove.score - score : 0;

  // ─── MISSION / DEVOIR ───
  if (gap > 0 && gap <= 10 && countryRank <= 15) {
    return {
      text: `Xylos : A ${gap} Échos du grade de Commandeur ${Math.max(countryRank - 1, 1)}`,
      category: 'ego',
      intensity: 0.9,
    };
  }

  if (gap > 0 && gap <= 20 && countryRank <= 5) {
    return {
      text: `Le Haut Commandement attendait ton Top 3`,
      category: 'ego',
      intensity: 0.85,
    };
  }

  // ─── GLOIRE DE XYLOS ───
  if (countryRank <= 3) {
    return {
      text: `Héros de Xylos : Top ${countryRank} ${country.name}`,
      category: 'pride',
      intensity: 1.0,
    };
  }

  if (countryRank <= 10) {
    return {
      text: `Écho-Pilote d'Élite : Top 10 ${country.name}`,
      category: 'pride',
      intensity: 0.75,
    };
  }

  // ─── TRANSFERT DE CONSCIENCE ───
  if (fails <= 1 && time > 20) {
    return {
      text: 'Transfert de conscience prêt. Relance la mission.',
      category: 'replay',
      intensity: 0.6,
    };
  }

  if (score > 150) {
    return {
      text: 'Xylos a besoin de plus de lumière.',
      category: 'replay',
      intensity: 0.5,
    };
  }

  // ─── FALLBACK ───
  const fallbacks: UXPhrase[] = [
    { text: 'Revanche tactique ?', category: 'replay', intensity: 0.4 },
    { text: 'Le loop du vide continue.', category: 'replay', intensity: 0.3 },
    { text: 'Nouveau clone activé.', category: 'replay', intensity: 0.4 },
    { text: 'Ne laisse pas Xylos s\'éteindre.', category: 'replay', intensity: 0.5 },
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export function getGameOverSubtext(score: number, fails: number, time: number): string {
  if (score === 0) return 'Le Grand Silence a frappé trop vite.';
  if (fails === 0 && time > 30) return 'Lumière collectée avec une précision chirurgicale.';
  if (fails <= 1) return 'Mission presque accomplie. Xylos vous salue.';
  if (score > 300) return 'Performance digne d\'une légende.';
  if (score > 150) return 'Bien joué, Pilote.';
  if (time < 5) return 'Anomalie détectée au décollage.';
  return 'Échec glorieux. Le cycle recommence.';
}

export function getContinueSubtext(countryRank: number): string {
  if (countryRank <= 5) return 'Défends ton titre de Commandeur';
  if (countryRank <= 10) return 'Monte au Panthéon';
  return 'Pour Xylos !';
}
