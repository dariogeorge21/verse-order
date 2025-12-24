"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Info, Zap } from "lucide-react";

export default function CountdownPage() {
  const router = useRouter();
  const { generateSecurityCode } = useGameStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const code = generateSecurityCode();
    setDisplayCode(code);

    // Progress bar animation for the 3-second memorization window
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - (100 / 30))); // 3 seconds total
    }, 100);

    const codeTimer = setTimeout(() => {
      setCountdown(5);
      clearInterval(progressInterval);
    }, 3000);

    return () => {
      clearTimeout(codeTimer);
      clearInterval(progressInterval);
    };
  }, [generateSecurityCode]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setTimeout(() => router.push("/level/1"), 800); // Slight delay for the "GO!" effect
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0c] text-white">
      
      {/* --- Atmospheric Background --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-colors duration-1000 ${countdown !== null ? 'bg-blue-600/5' : 'bg-amber-600/5'}`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {/* PHASE 1: SECURITY CODE DISPLAY */}
          {displayCode && countdown === null && (
            <motion.div
              key="code-phase"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              className="space-y-6 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <ShieldCheck className="w-10 h-10 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Memorize Cipher
                </h2>
                <p className="text-gray-400 flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Info className="w-4 h-4" />
                  Required for leaderboard entry
                </p>
              </div>

              <div className="relative group">
                {/* Glow effect for code */}
                <div className="absolute -inset-4 bg-amber-500/20 rounded-[2rem] blur-xl opacity-50" />
                
                <div className="relative glass-effect rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 overflow-hidden">
                  <div className="text-7xl md:text-8xl font-black text-amber-400 tracking-[0.2em] font-mono leading-none">
                    {displayCode}
                  </div>
                  
                  {/* Progress bar countdown */}
                  <div className="absolute bottom-0 left-0 h-1.5 bg-amber-500/50 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: NUMERIC COUNTDOWN */}
          {countdown !== null && (
            <motion.div
              key="countdown-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <AnimatePresence mode="popLayout">
                {countdown > 0 ? (
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative"
                  >
                    {/* Pulsing ring around number */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-blue-500/30 rounded-full animate-ping" />
                    
                    <span className="text-[12rem] md:text-[15rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                      {countdown}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="go"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="p-6 bg-blue-500 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.6)]">
                      <Zap className="w-16 h-16 text-white fill-white" />
                    </div>
                    <h1 className="text-9xl font-black italic tracking-tighter text-white">
                      GO!
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- UI Labels --- */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
        <p className="text-gray-500 text-sm font-medium tracking-[0.3em] uppercase">
          {countdown === null ? "Initializing Secure Session" : "Level 1 Loading"}
        </p>
      </div>
    </div>
  );
}