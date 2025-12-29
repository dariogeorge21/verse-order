import { LevelScore, LevelType } from "@/store/gameStore";

const DIFFICULTY_MULTIPLIERS: Record<LevelType, number> = {
  intro: 0.8,   // Level 1: Complete-the-verse (easier)
  mcq: 0.9,     // Level 2: Multiple choice (easier)
  easy: 1.0,    // Level 3: Current easy
  medium: 1.5,  // Level 4: Current medium
  hard: 2.5,    // Level 5: Current hard
} as const;

/**
 * Calculates score for a single level using non-linear time weighting
 */
export function calculateLevelScore(
  remainingSeconds: number,
  difficulty: LevelType,
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
 * Gets score breakdown by level (all 5 levels)
 */
export function getScoreBreakdown(levelScores: LevelScore[]) {
  const intro = levelScores.find((ls) => ls.level === "intro");
  const mcq = levelScores.find((ls) => ls.level === "mcq");
  const easy = levelScores.find((ls) => ls.level === "easy");
  const medium = levelScores.find((ls) => ls.level === "medium");
  const hard = levelScores.find((ls) => ls.level === "hard");

  return {
    intro: intro?.score || 0,
    mcq: mcq?.score || 0,
    easy: easy?.score || 0,
    medium: medium?.score || 0,
    hard: hard?.score || 0,
    total: calculateFinalScore(levelScores),
  };
}
