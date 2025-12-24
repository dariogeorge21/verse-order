"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { getRandomVerse, getRandomVerses, Verse } from "@/data/verses";
import {
  splitVerseIntoFragments,
  shuffleFragments,
  Fragment,
} from "@/utils/fragmentSplitter";
import { calculateLevelScore } from "@/utils/scoring";
import { FragmentDraggable } from "@/components/FragmentDraggable";
import { LevelTimer } from "@/components/LevelTimer";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Layers, Trophy, CheckCircle2, AlertCircle } from "lucide-react";

const LEVEL_TIME = 45;

export default function LevelPage() {
  const router = useRouter();
  const params = useParams();
  const levelNumber = parseInt(params.levelNumber as string, 10);
  const {
    currentLevel,
    setCurrentLevel,
    setCurrentVerse,
    addLevelScore,
    setGameCompleted,
  } = useGameStore();

  const [verse, setVerse] = useState<Verse | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Fragment[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIME);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showFullReference, setShowFullReference] = useState(true);
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);
  const [selectedReference, setSelectedReference] = useState<string>("");

  useEffect(() => {
    if (![1, 2, 3].includes(levelNumber)) {
      router.push("/");
      return;
    }

    setCurrentLevel(levelNumber as 1 | 2 | 3);
    const difficulty = levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard";
    const selectedVerse = getRandomVerse(difficulty);
    setVerse(selectedVerse);
    setCurrentVerse(selectedVerse);

    const verseFragments = splitVerseIntoFragments(selectedVerse.text);
    const shuffled = shuffleFragments(verseFragments);
    setFragments(shuffled);

    if (levelNumber === 2) {
      setShowFullReference(false);
      const timer = setTimeout(() => setShowFullReference(true), 15000);
      return () => clearTimeout(timer);
    }

    if (levelNumber === 3) {
      const otherVerses = getRandomVerses(4, [selectedVerse.id]);
      const options = [selectedVerse.reference, ...otherVerses.map((v) => v.reference)];
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
      setReferenceOptions(shuffledOptions);
    }
  }, [levelNumber, setCurrentLevel, setCurrentVerse, router]);

  const proceedToNext = () => {
    if (levelNumber === 3) {
      setGameCompleted(true);
      router.push("/verify");
    } else {
      router.push(`/level/${levelNumber + 1}`);
    }
  };

  const handleTimeout = () => {
    if (!verse || isSubmitted) return;
    setIsSubmitted(true);
    const score = calculateLevelScore(0, levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard", false);
    addLevelScore({
      level: levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard",
      score,
      timeRemaining: 0,
      correct: false,
    });
    setFeedback("incorrect");
    setTimeout(proceedToNext, 2500);
  };

  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted && verse) handleTimeout();
  }, [timeRemaining, isSubmitted, verse]);

  const handleFragmentClick = (fragment: Fragment) => {
    if (isSubmitted) return;
    if (selectedOrder.some((f) => f.id === fragment.id)) {
      setSelectedOrder(selectedOrder.filter((f) => f.id !== fragment.id));
    } else {
      setSelectedOrder([...selectedOrder, fragment]);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted || !verse) return;

    if (levelNumber === 3) {
      if (!selectedReference) return;
      if (selectedReference !== verse.reference) {
        setIsSubmitted(true);
        addLevelScore({ level: "hard", score: 0, timeRemaining, correct: false });
        setFeedback("incorrect");
        setTimeout(proceedToNext, 2500);
        return;
      }
    }

    const correctOrder = fragments.slice().sort((a, b) => a.originalIndex - b.originalIndex);
    const isCorrect = selectedOrder.length === correctOrder.length && 
                      selectedOrder.every((f, idx) => f.originalIndex === correctOrder[idx].originalIndex);

    setIsSubmitted(true);
    const difficulty = levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard";
    const score = calculateLevelScore(timeRemaining, difficulty, isCorrect);
    addLevelScore({ level: difficulty, score, timeRemaining, correct: isCorrect });
    setFeedback(isCorrect ? "correct" : "incorrect");
    setTimeout(proceedToNext, 2500);
  };

  const getDisplayReference = () => {
    if (!verse) return "";
    if (levelNumber === 1) return verse.reference;
    if (levelNumber === 2) return showFullReference ? verse.reference : verse.reference.split(" ")[0];
    return "";
  };

  if (!verse) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className={`min-h-screen p-4 md:p-8 relative overflow-hidden transition-colors duration-500 bg-[#0a0a0c]`}>
      
      {/* Dynamic Background Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${feedback === 'correct' ? 'bg-green-500/10 opacity-100' : feedback === 'incorrect' ? 'bg-red-500/10 opacity-100' : 'opacity-0'}`} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-5 relative z-10">
        
        {/* --- Top Header Card --- */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="glass-effect rounded-[2rem] border border-white/10 p-5 md:p-6 shadow-2xl overflow-hidden relative"
        >
          {/* Subtle Shine */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="flex justify-between items-end mb-5">
            <div className="space-y-1">
              <span className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">Phase 0{levelNumber}</span>
              <h1 className="text-4xl font-black text-white flex items-center gap-3">
                Level {levelNumber}
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                  {levelNumber === 1 ? "Beginner" : levelNumber === 2 ? "Acolyte" : "Scholar"}
                </span>
              </h1>
            </div>
            
            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Time Remaining</p>
              <LevelTimer seconds={timeRemaining} totalSeconds={LEVEL_TIME} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {getDisplayReference() && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-3 px-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center"
              >
                <p className="text-2xl font-bold text-blue-400 tracking-tight italic">
                  "{getDisplayReference()}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- Level 3: Reference Selection --- */}
        {levelNumber === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-effect rounded-[2rem] border border-white/10 p-5 md:p-6">
            <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4 text-center flex items-center justify-center gap-2">
              <Hash className="w-4 h-4" /> Identify the Source
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referenceOptions.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedReference(ref)}
                  disabled={isSubmitted}
                  className={`relative group px-6 py-4 rounded-2xl border-2 transition-all duration-300 text-lg font-bold
                    ${selectedReference === ref 
                      ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                      : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"}`}
                >
                  {ref}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- Main Fragment Interaction Area --- */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Target Zone */}
          <motion.div layout className="glass-effect rounded-[2rem] border-2 border-dashed border-white/10 p-5 min-h-[140px] bg-white/[0.02]">
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Reconstructed Verse
            </h2>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {selectedOrder.map((fragment) => (
                  <motion.div key={fragment.id} layoutId={fragment.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                    <FragmentDraggable
                      fragment={fragment}
                      isSelected={true}
                      onClick={() => handleFragmentClick(fragment)}
                      isInOrder={false}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {selectedOrder.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-8 text-gray-600">
                  <p className="text-sm font-medium">Select fragments below to begin assembly</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Source Zone */}
          <motion.div layout className="p-2">
            <div className="flex flex-wrap justify-center gap-3">
              <AnimatePresence>
                {fragments.map((fragment) => {
                  const isSelected = selectedOrder.some((f) => f.id === fragment.id);
                  if (isSelected) return null;
                  return (
                    <motion.div key={fragment.id} layoutId={fragment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <FragmentDraggable
                        fragment={fragment}
                        isSelected={false}
                        onClick={() => handleFragmentClick(fragment)}
                        isInOrder={false}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* --- Submit Action --- */}
        <div className="pt-6 flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitted || selectedOrder.length === 0}
            className={`group relative px-12 py-4 rounded-2xl font-black text-xl transition-all duration-300 transform
              ${isSubmitted || selectedOrder.length === 0 
                ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5" 
                : "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)]"}`}
          >
            {isSubmitted ? (
               <div className="flex items-center gap-3">
                  {feedback === 'correct' ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                  {feedback === 'correct' ? "PERFECT" : "FAILED"}
               </div>
            ) : "SUBMIT ANSWER"}
          </button>
        </div>
      </div>
    </div>
  );
}