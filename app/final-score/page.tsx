"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { getScoreBreakdown } from "@/utils/scoring";
import { supabase, PlayerRecord } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, History, LayoutDashboard, RotateCcw, MapPin } from "lucide-react";
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
  const [showContent, setShowContent] = useState(false);
  const hasSubmittedRef = useRef(false); // Prevent duplicate submissions

  const finalScore = getFinalScore();
  const breakdown = getScoreBreakdown(levelScores);

  useEffect(() => {
    setShowContent(true);
    
    // Fabulous Multi-burst Confetti Sequence
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#fbbf24', '#ffffff']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#fbbf24', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  useEffect(() => {
    const submitScore = async () => {
      // Prevent duplicate submissions
      if (!playerData || hasSubmittedRef.current) return;
      
      hasSubmittedRef.current = true;
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
          // Reset flag on error so user can retry if needed
          hasSubmittedRef.current = false;
        }
      } catch (error) {
        console.error("Error submitting score:", error);
        // Reset flag on error so user can retry if needed
        hasSubmittedRef.current = false;
      } finally {
        setIsSubmitting(false);
      }
    };
    
    submitScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - dependencies removed to prevent re-submission

  const handlePlayAgain = () => {
    resetGame();
    router.push("/");
    router.refresh();
  };

  const handleViewLeaderboard = () => {
    router.push("/score");
  };

  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="rounded-full h-12 w-12 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0c] text-white">
      
      {/* --- Visual Backdrop --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl relative z-10"
          >
            {/* Main Card */}
            <div className="relative glass-effect rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-8 md:p-12 shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="text-center space-y-2 mb-10">
                <motion.div 
                  initial={{ y: -20 }} 
                  animate={{ y: 0 }} 
                  className="inline-block p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4"
                >
                  <Trophy className="w-10 h-10 text-amber-500" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">Game Complete</h1>
                <div className="flex items-center justify-center gap-4 text-gray-400">
                  <span className="text-xl font-medium text-blue-400">{playerData.name}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span className="flex items-center gap-1 text-sm uppercase tracking-widest"><MapPin className="w-3 h-3" /> {playerData.region}</span>
                </div>
              </div>

              {/* Massive Score Display */}
              <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                className="relative mb-12"
              >
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-50" />
                <div className="relative py-10 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent border border-white/10 text-center shadow-inner">
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Total Score</p>
                  <span className="text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                    {finalScore}
                  </span>
                </div>
              </motion.div>

              {/* Breakdown Grid */}
              <div className="space-y-6 mb-12">
                <h2 className="text-center text-xs font-black uppercase tracking-[0.2em] text-gray-500">Performance Breakdown</h2>
                <div className="grid grid-cols-3 gap-4">
                  <ScoreBox label="Easy" score={breakdown.easy} color="text-green-400" borderColor="border-green-500/20" bgColor="bg-green-500/5" />
                  <ScoreBox label="Medium" score={breakdown.medium} color="text-yellow-400" borderColor="border-yellow-500/20" bgColor="bg-yellow-500/5" />
                  <ScoreBox label="Hard" score={breakdown.hard} color="text-red-400" borderColor="border-red-500/20" bgColor="bg-red-500/5" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleViewLeaderboard}
                  className="group relative w-full py-5 bg-white text-black rounded-2xl font-black text-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <LayoutDashboard className="w-6 h-6" />
                    View Leaderboard
                  </div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine" />
                </button>

                <button
                  onClick={handlePlayAgain}
                  className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 font-bold text-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>

              {isSubmitting && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="mt-6 flex items-center justify-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-3 w-3 border-t border-blue-400 rounded-full" />
                  Securing score to cloud...
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Text */}
      <div className="absolute bottom-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">
        Scripture Mastered • Session Ended
      </div>
    </div>
  );
}

function ScoreBox({ label, score, color, borderColor, bgColor }: { label: string, score: number, color: string, borderColor: string, bgColor: string }) {
  return (
    <div className={`rounded-2xl p-4 text-center border ${borderColor} ${bgColor} backdrop-blur-sm`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{score}</p>
    </div>
  );
}