"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { getScoreBreakdown } from "@/utils/scoring";
import { supabase, PlayerRecord } from "@/lib/supabase";
import confetti from "canvas-confetti";

export default function FinalScorePage() {
  const router = useRouter();
  const {
    playerData,
    levelScores,
    getFinalScore,
    resetGame,
    securityCode,
  } = useGameStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const finalScore = getFinalScore();
  const breakdown = getScoreBreakdown(levelScores);

  useEffect(() => {
    // Celebratory animation
    setShowAnimation(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  useEffect(() => {
    // Submit score to Supabase
    const submitScore = async () => {
      if (!playerData) return;

      setIsSubmitting(true);
      try {
        const playerRecord: Omit<PlayerRecord, "id" | "created_at"> = {
          name: playerData.name,
          region: playerData.region,
          security_code: securityCode || undefined,
          final_score: finalScore,
          easy_score: breakdown.easy,
          medium_score: breakdown.medium,
          hard_score: breakdown.hard,
        };

        const { error } = await supabase.from("players").insert(playerRecord);

        if (error) {
          console.error("Error submitting score:", error);
          // Continue anyway - don't block user from seeing their score
        }
      } catch (error) {
        console.error("Error submitting score:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitScore();
  }, [playerData, finalScore, breakdown, securityCode]);

  const handlePlayAgain = () => {
    resetGame();
    router.push("/");
    router.refresh();
  };

  const handleViewLeaderboard = () => {
    // Don't reset game state here - let leaderboard handle it
    router.push("/score");
  };

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div
        className={`w-full max-w-2xl glass-effect rounded-2xl shadow-xl p-8 space-y-6 transition-opacity duration-500 ${
          showAnimation ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-church-dark mb-2">
            Game Complete!
          </h1>
          <p className="text-2xl text-gray-700">{playerData.name}</p>
          <p className="text-lg text-gray-600">{playerData.region}</p>
        </div>

        {/* Final Score */}
        <div className="text-center py-6 bg-gradient-to-r from-church-blue to-church-gold rounded-xl">
          <p className="text-lg text-white font-semibold mb-2">Final Score</p>
          <p className="text-6xl font-bold text-white">{finalScore}</p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-center text-church-dark mb-4">
            Score Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-300">
              <p className="text-sm font-medium text-gray-600 mb-1">Easy</p>
              <p className="text-2xl font-bold text-green-700">
                {breakdown.easy}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center border-2 border-yellow-300">
              <p className="text-sm font-medium text-gray-600 mb-1">Medium</p>
              <p className="text-2xl font-bold text-yellow-700">
                {breakdown.medium}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-red-300">
              <p className="text-sm font-medium text-gray-600 mb-1">Hard</p>
              <p className="text-2xl font-bold text-red-700">
                {breakdown.hard}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleViewLeaderboard}
            className="w-full py-4 bg-church-gold text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-600 active:bg-yellow-700 transition-colors touch-target"
          >
            View Leaderboard
          </button>
          <button
            onClick={handlePlayAgain}
            className="w-full py-4 bg-church-blue text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-target"
          >
            Play Again
          </button>
        </div>

        {isSubmitting && (
          <p className="text-center text-sm text-gray-500">
            Submitting score...
          </p>
        )}
      </div>
    </div>
  );
}

