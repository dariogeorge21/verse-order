"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, PlayerRecord } from "@/lib/supabase";
import { useGameStore } from "@/store/gameStore";

export default function LeaderboardPage() {
  const router = useRouter();
  const { resetGame } = useGameStore();
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const ADMIN_PASSWORD = "admin123"; // Change this in production

  // Reset game state when entering leaderboard
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    // Also poll every 5 seconds as backup
    const interval = setInterval(fetchLeaderboard, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("final_score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else {
        setPlayers(data || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (resetPassword !== ADMIN_PASSWORD) {
      alert("Incorrect password");
      setResetPassword("");
      return;
    }

    try {
      const { error } = await supabase.from("players").delete().neq("id", ""); // Delete all

      if (error) {
        console.error("Error resetting leaderboard:", error);
        alert("Error resetting leaderboard");
      } else {
        setPlayers([]);
        setShowResetConfirm(false);
        setResetPassword("");
        alert("Leaderboard reset successfully");
      }
    } catch (error) {
      console.error("Error resetting leaderboard:", error);
      alert("Error resetting leaderboard");
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 border-yellow-400 text-yellow-900";
    if (rank === 2) return "bg-gray-100 border-gray-400 text-gray-900";
    if (rank === 3) return "bg-orange-100 border-orange-400 text-orange-900";
    return "bg-white border-gray-300";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-church-dark">Leaderboard</h1>
            <div className="space-x-3">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-church-blue text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors touch-target"
              >
                Home
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors touch-target"
              >
                Reset (Admin)
              </button>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl shadow-xl p-6 max-w-md w-full space-y-4">
              <h2 className="text-2xl font-bold text-church-dark">
                Reset Leaderboard
              </h2>
              <p className="text-gray-600">
                This will delete all scores. Are you sure?
              </p>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-church-blue focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors touch-target"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetPassword("");
                  }}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors touch-target"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading leaderboard...</div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 glass-effect rounded-xl shadow-lg">
            <p className="text-xl text-gray-600">No scores yet. Be the first!</p>
          </div>
        ) : (
          <div className="glass-effect rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-church-blue text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Region</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-gray-200 ${getRankColor(
                          rank
                        )}`}
                      >
                        <td className="px-6 py-4 font-bold text-lg">
                          {getRankIcon(rank)} {rank}
                        </td>
                        <td className="px-6 py-4 font-semibold text-lg">
                          {player.name}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {player.region}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xl">
                          {player.final_score.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

