"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameStore, LevelType } from "@/store/gameStore";
import {
  getRandomVerse,
  getRandomVerses,
  Verse,
  getRandomIncompleteVerse,
  getRandomMCQVerse,
  IncompleteVerse,
  MCQVerse,
  shuffleArray,
} from "@/data/verses";
import {
  splitVerseIntoFragments,
  shuffleFragments,
  Fragment,
} from "@/utils/fragmentSplitter";
import { calculateLevelScore } from "@/utils/scoring";
import { FragmentDraggable } from "@/components/FragmentDraggable";
import { LevelTimer } from "@/components/LevelTimer";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Layers, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

// Timer durations for each level
const LEVEL_TIMES: Record<number, number> = {
  1: 45,  // Level 1: Complete-the-verse (45s)
  2: 30,  // Level 2: Multiple choice (30s)
  3: 45,  // Level 3: Easy fragment arrange
  4: 45,  // Level 4: Medium fragment arrange
  5: 45,  // Level 5: Hard fragment + reference
};

// Map level number to difficulty type
const getLevelType = (level: number): LevelType => {
  switch (level) {
    case 1: return "intro";
    case 2: return "mcq";
    case 3: return "easy";
    case 4: return "medium";
    case 5: return "hard";
    default: return "easy";
  }
};

// Get level display info
const getLevelInfo = (level: number) => {
  switch (level) {
    case 1: return { name: "Intro", subtitle: "Complete the Verse" };
    case 2: return { name: "Quiz", subtitle: "Multiple Choice" };
    case 3: return { name: "Beginner", subtitle: "Arrange Fragments" };
    case 4: return { name: "Acolyte", subtitle: "Arrange Fragments" };
    case 5: return { name: "Scholar", subtitle: "Full Challenge" };
    default: return { name: "Unknown", subtitle: "" };
  }
};

export default function LevelPage() {
  const router = useRouter();
  const params = useParams();
  const levelNumber = parseInt(params.levelNumber as string, 10);
  const {
    setCurrentLevel,
    setCurrentVerse,
    addLevelScore,
    setGameCompleted,
  } = useGameStore();

  // Common state
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIMES[levelNumber] || 45);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  // Level 1 (intro) state: Complete-the-verse
  const [incompleteVerse, setIncompleteVerse] = useState<IncompleteVerse | null>(null);
  const [introFragments, setIntroFragments] = useState<Fragment[]>([]);
  const [selectedIntroOrder, setSelectedIntroOrder] = useState<Fragment[]>([]);

  // Level 2 (mcq) state: Multiple choice
  const [mcqVerse, setMcqVerse] = useState<MCQVerse | null>(null);
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [selectedMcqOption, setSelectedMcqOption] = useState<string>("");

  // Level 3-5 state (fragment arrange)
  const [verse, setVerse] = useState<Verse | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Fragment[]>([]);
  const [showFullReference, setShowFullReference] = useState(true);
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);
  const [selectedReference, setSelectedReference] = useState<string>("");

  useEffect(() => {
    // Validate level number
    if (![1, 2, 3, 4, 5].includes(levelNumber)) {
      router.push("/");
      return;
    }

    setCurrentLevel(levelNumber as 1 | 2 | 3 | 4 | 5);
    setTimeRemaining(LEVEL_TIMES[levelNumber] || 45);

    // Level 1: Complete-the-verse
    if (levelNumber === 1) {
      const selected = getRandomIncompleteVerse();
      setIncompleteVerse(selected);
      // Create fragments from the missing pieces
      const frags: Fragment[] = selected.missingFragments.map((text, idx) => ({
        id: `intro-frag-${idx}`,
        text,
        originalIndex: idx,
      }));
      setIntroFragments(shuffleFragments(frags));
      return;
    }

    // Level 2: Multiple choice
    if (levelNumber === 2) {
      const selected = getRandomMCQVerse();
      setMcqVerse(selected);
      // Shuffle all options (correct + wrong)
      const allOptions = shuffleArray([selected.correctEnding, ...selected.wrongOptions]);
      setMcqOptions(allOptions);
      return;
    }

    // Levels 3-5: Fragment arrange (original functionality)
    const difficulty = levelNumber === 3 ? "easy" : levelNumber === 4 ? "medium" : "hard";
    const selectedVerse = getRandomVerse(difficulty);
    setVerse(selectedVerse);
    setCurrentVerse(selectedVerse);

    const verseFragments = splitVerseIntoFragments(selectedVerse.text);
    const shuffled = shuffleFragments(verseFragments);
    setFragments(shuffled);

    // Level 4: Show partial reference initially
    if (levelNumber === 4) {
      setShowFullReference(false);
      const timer = setTimeout(() => setShowFullReference(true), 15000);
      return () => clearTimeout(timer);
    }

    // Level 5: Multiple choice reference selection
    if (levelNumber === 5) {
      const otherVerses = getRandomVerses(4, [selectedVerse.id]);
      const options = [selectedVerse.reference, ...otherVerses.map((v) => v.reference)];
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
      setReferenceOptions(shuffledOptions);
    }
  }, [levelNumber, setCurrentLevel, setCurrentVerse, router]);

  const proceedToNext = () => {
    if (levelNumber === 5) {
      setGameCompleted(true);
      router.push("/verify");
    } else {
      router.push(`/level/${levelNumber + 1}`);
    }
  };

  const handleTimeout = () => {
    if (isSubmitted) return;
    // Check if we have any content to score
    const hasContent = levelNumber === 1 ? incompleteVerse : levelNumber === 2 ? mcqVerse : verse;
    if (!hasContent) return;

    setIsSubmitted(true);
    const levelType = getLevelType(levelNumber);
    const score = calculateLevelScore(0, levelType, false);
    addLevelScore({
      level: levelType,
      score,
      timeRemaining: 0,
      correct: false,
    });
    setFeedback("incorrect");
    setTimeout(proceedToNext, 2500);
  };

  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((prev: number) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  useEffect(() => {
    const hasContent = levelNumber === 1 ? incompleteVerse : levelNumber === 2 ? mcqVerse : verse;
    if (timeRemaining === 0 && !isSubmitted && hasContent) handleTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isSubmitted, incompleteVerse, mcqVerse, verse]);

  // Handle fragment click for Level 1 (intro)
  const handleIntroFragmentClick = (fragment: Fragment) => {
    if (isSubmitted) return;
    if (selectedIntroOrder.some((f) => f.id === fragment.id)) {
      setSelectedIntroOrder(selectedIntroOrder.filter((f) => f.id !== fragment.id));
    } else {
      setSelectedIntroOrder([...selectedIntroOrder, fragment]);
    }
  };

  // Handle fragment click for Levels 3-5
  const handleFragmentClick = (fragment: Fragment) => {
    if (isSubmitted) return;
    if (selectedOrder.some((f) => f.id === fragment.id)) {
      setSelectedOrder(selectedOrder.filter((f) => f.id !== fragment.id));
    } else {
      setSelectedOrder([...selectedOrder, fragment]);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    const levelType = getLevelType(levelNumber);

    // Level 1: Complete-the-verse
    if (levelNumber === 1 && incompleteVerse) {
      const correctOrder = incompleteVerse.missingFragments;
      const isCorrect = selectedIntroOrder.length === correctOrder.length &&
        selectedIntroOrder.every((f, idx) => f.text === correctOrder[idx]);

      setIsSubmitted(true);
      const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
      addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
      setFeedback(isCorrect ? "correct" : "incorrect");
      setTimeout(proceedToNext, 2500);
      return;
    }

    // Level 2: Multiple choice
    if (levelNumber === 2 && mcqVerse) {
      const isCorrect = selectedMcqOption === mcqVerse.correctEnding;

      setIsSubmitted(true);
      const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
      addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
      setFeedback(isCorrect ? "correct" : "incorrect");
      setTimeout(proceedToNext, 2500);
      return;
    }

    // Levels 3-5: Fragment arrange
    if (!verse) return;

    // Level 5: Check reference first
    if (levelNumber === 5) {
      if (!selectedReference) return;
      if (selectedReference !== verse.reference) {
        setIsSubmitted(true);
        addLevelScore({ level: levelType, score: 0, timeRemaining, correct: false });
        setFeedback("incorrect");
        setTimeout(proceedToNext, 2500);
        return;
      }
    }

    const correctOrder = fragments.slice().sort((a, b) => a.originalIndex - b.originalIndex);
    const isCorrect = selectedOrder.length === correctOrder.length &&
                      selectedOrder.every((f, idx) => f.originalIndex === correctOrder[idx].originalIndex);

    setIsSubmitted(true);
    const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
    addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
    setFeedback(isCorrect ? "correct" : "incorrect");
    setTimeout(proceedToNext, 2500);
  };

  const getDisplayReference = () => {
    // Level 1: Show incomplete verse reference
    if (levelNumber === 1 && incompleteVerse) return incompleteVerse.reference;
    // Level 2: Show MCQ verse reference
    if (levelNumber === 2 && mcqVerse) return mcqVerse.reference;
    // Level 3: Full reference
    if (levelNumber === 3 && verse) return verse.reference;
    // Level 4: Partial then full reference
    if (levelNumber === 4 && verse) return showFullReference ? verse.reference : verse.reference.split(" ")[0];
    // Level 5: No reference shown (must select from options)
    return "";
  };

  // Check if we have content to display
  const isLoading = levelNumber === 1 ? !incompleteVerse : levelNumber === 2 ? !mcqVerse : !verse;
  if (isLoading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Loading...</div>;

  const levelInfo = getLevelInfo(levelNumber);

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
                  {levelInfo.name}
                </span>
              </h1>
              <p className="text-gray-500 text-sm">{levelInfo.subtitle}</p>
            </div>

            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Time Remaining</p>
              <LevelTimer seconds={timeRemaining} totalSeconds={LEVEL_TIMES[levelNumber]} />
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

        {/* ==================== LEVEL 1: Complete-the-verse ==================== */}
        {levelNumber === 1 && incompleteVerse && (
          <>
            {/* Visible verse text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-5 md:p-6"
            >
              <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4 text-center">
                Complete this verse
              </h2>
              <p className="text-xl md:text-2xl text-white text-center leading-relaxed">
                "{incompleteVerse.visibleText} <span className="text-blue-400">___</span>"
              </p>
            </motion.div>

            {/* Target Zone for selected fragments */}
            <motion.div layout className="glass-effect rounded-[2rem] border-2 border-dashed border-white/10 p-5 min-h-[100px] bg-white/[0.02]">
              <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Arrange the Missing Fragments
              </h2>
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {selectedIntroOrder.map((fragment) => (
                    <motion.div key={fragment.id} layoutId={fragment.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                      <FragmentDraggable
                        fragment={fragment}
                        isSelected={true}
                        onClick={() => handleIntroFragmentClick(fragment)}
                        isInOrder={false}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {selectedIntroOrder.length === 0 && (
                  <div className="w-full flex flex-col items-center justify-center py-6 text-gray-600">
                    <p className="text-sm font-medium">Select the 3 fragments in correct order</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Source fragments */}
            <motion.div layout className="p-2">
              <div className="flex flex-wrap justify-center gap-3">
                <AnimatePresence>
                  {introFragments.map((fragment) => {
                    const isSelected = selectedIntroOrder.some((f) => f.id === fragment.id);
                    if (isSelected) return null;
                    return (
                      <motion.div key={fragment.id} layoutId={fragment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <FragmentDraggable
                          fragment={fragment}
                          isSelected={false}
                          onClick={() => handleIntroFragmentClick(fragment)}
                          isInOrder={false}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}

        {/* ==================== LEVEL 2: Multiple Choice ==================== */}
        {levelNumber === 2 && mcqVerse && (
          <>
            {/* Incomplete verse text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-5 md:p-6"
            >
              <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4 text-center">
                Complete the Quotation
              </h2>
              <p className="text-xl md:text-2xl text-white text-center leading-relaxed">
                "{mcqVerse.incompleteText} <span className="text-blue-400">___</span>"
              </p>
            </motion.div>

            {/* Multiple choice options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-5 md:p-6"
            >
              <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4 text-center flex items-center justify-center gap-2">
                <Hash className="w-4 h-4" /> Select the Correct Ending
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mcqOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMcqOption(option)}
                    disabled={isSubmitted}
                    className={`relative group px-6 py-4 rounded-2xl border-2 transition-all duration-300 text-lg font-medium text-left
                      ${selectedMcqOption === option
                        ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        : "border-white/5 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* ==================== LEVELS 3-5: Fragment Arrange ==================== */}
        {levelNumber >= 3 && levelNumber <= 5 && verse && (
          <>
            {/* Level 5: Reference Selection */}
            {levelNumber === 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`glass-effect rounded-[2rem] border p-5 md:p-6 transition-all duration-300 ${
                  !selectedReference && selectedOrder.length > 0
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-white/10"
                }`}
              >
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

                <AnimatePresence>
                  {!selectedReference && selectedOrder.length > 0 && !isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-amber-300">
                        <span className="font-bold">Warning:</span> Don't forget to select the quotation reference above before submitting!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Main Fragment Interaction Area */}
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
          </>
        )}

        {/* --- Submit Action --- */}
        <div className="pt-6 flex flex-col items-center gap-3">
          {/* Warning for Level 5 if reference not selected */}
          {levelNumber === 5 && selectedOrder.length > 0 && !selectedReference && !isSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Select a quotation reference to continue
              </p>
            </motion.div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitted ||
              (levelNumber === 1 && selectedIntroOrder.length === 0) ||
              (levelNumber === 2 && !selectedMcqOption) ||
              (levelNumber >= 3 && selectedOrder.length === 0) ||
              (levelNumber === 5 && !selectedReference)
            }
            className={`group relative px-12 py-4 rounded-2xl font-black text-xl transition-all duration-300 transform
              ${isSubmitted ||
                (levelNumber === 1 && selectedIntroOrder.length === 0) ||
                (levelNumber === 2 && !selectedMcqOption) ||
                (levelNumber >= 3 && selectedOrder.length === 0) ||
                (levelNumber === 5 && !selectedReference)
                ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                : "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)]"}`}
          >
            {isSubmitted ? (
               <div className="flex items-center gap-3">
                  {feedback === 'correct' ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                  {feedback === 'correct' ? "PERFECT" : "FAILED"}
               </div>
            ) : levelNumber === 5 && !selectedReference && selectedOrder.length > 0 ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                SELECT REFERENCE FIRST
              </div>
            ) : "SUBMIT ANSWER"}
          </button>
        </div>
      </div>
    </div>
  );
}