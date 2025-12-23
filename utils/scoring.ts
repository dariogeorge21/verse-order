import { LevelScore } from "@/store/gameStore";

const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.5,
} as const;

/**
 * Calculates score for a single level using non-linear time weighting
 */
export function calculateLevelScore(
  remainingSeconds: number,
  difficulty: "easy" | "medium" | "hard",
  correct: boolean
): number {
  if (!correct || remainingSeconds <= 0) {
    return 0;
  }

  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const accuracyFactor = 1.0; // First attempt bonus (could be enhanced)

  // Non-linear time weighting: remainingSeconds ^ 1.3
  const timeScore = Math.pow(remainingSeconds, 1.3);

  const score = Math.floor(
    timeScore * difficultyMultiplier * accuracyFactor
  );

  return score;
}

/**
 * Calculates total score from level scores
 */
export function calculateFinalScore(levelScores: LevelScore[]): number {
  return levelScores.reduce((sum, ls) => sum + ls.score, 0);
}

/**
 * Gets score breakdown by level
 */
export function getScoreBreakdown(levelScores: LevelScore[]) {
  const easy = levelScores.find((ls) => ls.level === "easy");
  const medium = levelScores.find((ls) => ls.level === "medium");
  const hard = levelScores.find((ls) => ls.level === "hard");

  return {
    easy: easy?.score || 0,
    medium: medium?.score || 0,
    hard: hard?.score || 0,
    total: calculateFinalScore(levelScores),
  };
}

