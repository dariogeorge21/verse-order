"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, PlayerRecord } from "@/lib/supabase";
import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Home, 
  Settings2, 
  MapPin, 
  ShieldAlert, 
  X, 
  Crown,
  Loader2
} from "lucide-react";

export default function LeaderboardPage() {
  const router = useRouter();
  const { resetGame } = useGameStore();
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const ADMIN_PASSWORD = "jaago"; 

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, 
      () => fetchLeaderboard())
      .subscribe();

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

      if (!error) setPlayers(data || []);
    } catch (error) {
      console.error("Error:", error);
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
      const { error } = await supabase.from("players").delete().neq("id", "");
      if (!error) {
        setPlayers([]);
        setShowResetConfirm(false);
        setResetPassword("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getRankStyles = (rank: number) => {
    if (rank === 1) return "from-yellow-400/20 to-transparent border-yellow-500/50 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)]";
    if (rank === 2) return "from-gray-400/10 to-transparent border-gray-400/40 text-gray-300";
    if (rank === 3) return "from-orange-700/10 to-transparent border-orange-700/40 text-orange-400";
    return "border-white/5 bg-white/[0.02] text-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* --- Header Section --- */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 glass-effect p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Hall of Fame</h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Global Standings</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => router.push("/")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold hover:scale-105 transition-all active:scale-95"
            >
              <Home className="w-5 h-5" /> Home
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
              title="Admin Reset"
            >
              <Settings2 className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* --- Leaderboard Content --- */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Syncing Scores...</p>
            </div>
          ) : players.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-effect rounded-[2.5rem] border border-white/10">
              <p className="text-xl text-gray-500">The podium is empty. Be the first to claim it!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {/* Header Row (Hidden on Mobile) */}
              <div className="hidden md:grid grid-cols-12 px-8 py-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-3">Region</div>
                <div className="col-span-3 text-right">Final Score</div>
              </div>

              {/* Player Rows */}
              <div className="space-y-3">
                {players.map((player, idx) => {
                  const rank = idx + 1;
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`grid grid-cols-1 md:grid-cols-12 items-center px-6 md:px-8 py-5 md:py-4 rounded-2xl border bg-gradient-to-r transition-all duration-300 hover:translate-x-2 group ${getRankStyles(rank)}`}
                    >
                      <div className="col-span-1 flex items-center gap-3 mb-2 md:mb-0">
                        <span className="text-2xl font-black italic opacity-50 w-8">#{rank}</span>
                        {rank <= 3 && <Crown className="w-5 h-5 md:hidden" />}
                      </div>
                      
                      <div className="col-span-5 flex items-center gap-4">
                        <div className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center font-black text-xs border ${rank <= 3 ? 'border-current' : 'border-white/10 bg-white/5'}`}>
                          {rank <= 3 ? <Crown className="w-5 h-5" /> : player.name[0].toUpperCase()}
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                          {player.name}
                        </span>
                      </div>

                      <div className="col-span-3 flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{player.region}</span>
                      </div>

                      <div className="col-span-3 text-right">
                        <span className={`text-2xl font-black tracking-tighter ${rank === 1 ? 'text-yellow-400' : 'text-white'}`}>
                          {player.final_score.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Admin Reset Modal --- */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass-effect border border-red-500/20 bg-[#121216] rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Wipe Data?</h2>
                  <p className="text-gray-500 text-sm">This action is irreversible. All scores will be purged from the archive.</p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter Administrator Key"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-red-500/50 outline-none text-center font-mono tracking-widest transition-all"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all active:scale-95"
                  >
                    Confirm Purge
                  </button>
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetPassword("");
                    }}
                    className="p-4 bg-white/5 text-gray-400 rounded-2xl hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}