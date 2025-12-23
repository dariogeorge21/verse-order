import { create } from "zustand";
import { Verse } from "@/data/verses";

export interface PlayerData {
  name: string;
  region: string;
}

export interface LevelScore {
  level: "easy" | "medium" | "hard";
  score: number;
  timeRemaining: number;
  correct: boolean;
}

export interface GameState {
  // Player data
  playerData: PlayerData | null;
  securityCode: string | null;

  // Game state
  currentLevel: 1 | 2 | 3 | null;
  currentVerse: Verse | null;
  levelScores: LevelScore[];
  gameStarted: boolean;
  gameCompleted: boolean;

  // Actions
  setPlayerData: (data: PlayerData) => void;
  generateSecurityCode: () => string;
  setSecurityCode: (code: string) => void;
  setCurrentLevel: (level: 1 | 2 | 3 | null) => void;
  setCurrentVerse: (verse: Verse | null) => void;
  addLevelScore: (score: LevelScore) => void;
  setGameStarted: (started: boolean) => void;
  setGameCompleted: (completed: boolean) => void;
  resetGame: () => void;
  getFinalScore: () => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerData: null,
  securityCode: null,
  currentLevel: null,
  currentVerse: null,
  levelScores: [],
  gameStarted: false,
  gameCompleted: false,

  setPlayerData: (data) => set({ playerData: data }),

  generateSecurityCode: () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    set({ securityCode: code });
    return code;
  },

  setSecurityCode: (code) => set({ securityCode: code }),

  setCurrentLevel: (level) => set({ currentLevel: level }),

  setCurrentVerse: (verse) => set({ currentVerse: verse }),

  addLevelScore: (score) =>
    set((state) => ({
      levelScores: [...state.levelScores, score],
    })),

  setGameStarted: (started) => set({ gameStarted: started }),

  setGameCompleted: (completed) => set({ gameCompleted: completed }),

  resetGame: () =>
    set({
      playerData: null,
      securityCode: null,
      currentLevel: null,
      currentVerse: null,
      levelScores: [],
      gameStarted: false,
      gameCompleted: false,
    }),

  getFinalScore: () => {
    const { levelScores } = get();
    return levelScores.reduce((sum, ls) => sum + ls.score, 0);
  },
}));

