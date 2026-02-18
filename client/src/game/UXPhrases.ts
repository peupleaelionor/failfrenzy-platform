export interface LeaderboardEntry {
  name: string;
  score: number;
  country: string;
}

export function generateLeaderboard(score: number): LeaderboardEntry[] {
  return [
    { name: "Player 1", score: 5000, country: "FR" },
    { name: "Player 2", score: 3000, country: "FR" },
    { name: "You", score: score, country: "FR" }
  ];
}

export function getCountryTop(board: LeaderboardEntry[], count: number) { return board.slice(0, count); }
export function getPlayerCountryRank(board: LeaderboardEntry[]) { return 3; }
export function getPlayerEuropeRank(board: LeaderboardEntry[]) { return 150; }
export function getContextualPhrase(score: number, fails: number, time: number, board: any) {
  return { text: "Bien joué !", category: "pride" };
}
export function getGameOverSubtext(score: number, fails: number, time: number) { return "Fin de partie"; }
export function getContinueSubtext(rank: number) { return "Continue comme ça !"; }
