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

const LEVEL_TIME = 30;

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
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [showFullReference, setShowFullReference] = useState(true);
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);
  const [selectedReference, setSelectedReference] = useState<string>("");

  // Initialize level
  useEffect(() => {
    if (![1, 2, 3].includes(levelNumber)) {
      router.push("/");
      return;
    }

    setCurrentLevel(levelNumber as 1 | 2 | 3);

    // Get verse based on difficulty
    const difficulty =
      levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard";
    const selectedVerse = getRandomVerse(difficulty);
    setVerse(selectedVerse);
    setCurrentVerse(selectedVerse);

    // Split into fragments
    const verseFragments = splitVerseIntoFragments(selectedVerse.text);
    const shuffled = shuffleFragments(verseFragments);
    setFragments(shuffled);

    // Level 2: Show partial reference initially, then full at 15 seconds
    if (levelNumber === 2) {
      setShowFullReference(false);
      const timer = setTimeout(() => {
        setShowFullReference(true);
      }, 15000); // Show full reference at 15 seconds
      return () => clearTimeout(timer);
    }

    // Level 3: Generate reference options
    if (levelNumber === 3) {
      const otherVerses = getRandomVerses(4, [selectedVerse.id]);
      const options = [
        selectedVerse.reference,
        ...otherVerses.map((v) => v.reference),
      ];
      // Shuffle options
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
    if (!verse) return;
    setIsSubmitted(true);
    const correct = false;
    const score = calculateLevelScore(
      0,
      levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard",
      correct
    );
    addLevelScore({
      level: levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard",
      score,
      timeRemaining: 0,
      correct,
    });
    setFeedback("incorrect");
    setTimeout(() => {
      proceedToNext();
    }, 2500);
  };

  // Timer
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  // Handle timeout separately
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted && verse) {
      handleTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isSubmitted, verse]);

  const handleFragmentClick = (fragment: Fragment) => {
    if (isSubmitted) return;

    // Remove if already selected
    if (selectedOrder.some((f) => f.id === fragment.id)) {
      setSelectedOrder(selectedOrder.filter((f) => f.id !== fragment.id));
    } else {
      // Add to selection
      setSelectedOrder([...selectedOrder, fragment]);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted || !verse) return;

    // Level 3: Check both fragment order and reference
    if (levelNumber === 3) {
      if (!selectedReference) {
        alert("Please select a Bible reference");
        return;
      }
      if (selectedReference !== verse.reference) {
        setIsSubmitted(true);
        const score = calculateLevelScore(
          timeRemaining,
          "hard",
          false
        );
        addLevelScore({
          level: "hard",
          score,
          timeRemaining,
          correct: false,
        });
        setFeedback("incorrect");
        setTimeout(() => {
          proceedToNext();
        }, 2500);
        return;
      }
    }

    // Check fragment order
    const correctOrder = fragments
      .slice()
      .sort((a, b) => a.originalIndex - b.originalIndex);
    const isCorrect =
      selectedOrder.length === correctOrder.length &&
      selectedOrder.every(
        (f, idx) => f.originalIndex === correctOrder[idx].originalIndex
      );

    setIsSubmitted(true);
    const difficulty =
      levelNumber === 1 ? "easy" : levelNumber === 2 ? "medium" : "hard";
    const score = calculateLevelScore(timeRemaining, difficulty, isCorrect);
    addLevelScore({
      level: difficulty,
      score,
      timeRemaining,
      correct: isCorrect,
    });
    setFeedback(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      proceedToNext();
    }, 2500);
  };

  const getDisplayReference = () => {
    if (!verse) return "";
    if (levelNumber === 1) return verse.reference;
    if (levelNumber === 2) {
      if (showFullReference) return verse.reference;
      const parts = verse.reference.split(" ");
      return parts[0]; // Just the book name
    }
    return ""; // Level 3: no reference shown
  };

  if (!verse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 transition-colors duration-300 ${
        feedback === "correct"
          ? "animate-flash-green"
          : feedback === "incorrect"
          ? "animate-flash-red"
          : "bg-gradient-to-br from-blue-50 via-white to-amber-50"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-church-dark">
              Level {levelNumber}
            </h1>
            <div className="text-lg font-semibold text-gray-600">
              {levelNumber === 1
                ? "Easy"
                : levelNumber === 2
                ? "Medium"
                : "Hard"}
            </div>
          </div>

          <LevelTimer seconds={timeRemaining} totalSeconds={LEVEL_TIME} />

          {getDisplayReference() && (
            <div className={`mt-4 text-center transition-opacity duration-500 ${
              levelNumber === 2 && !showFullReference ? "opacity-100" : "opacity-100"
            }`}>
              <p className="text-2xl font-semibold text-church-blue">
                {getDisplayReference()}
              </p>
            </div>
          )}
        </div>

        {/* Level 3: Reference Selection */}
        {levelNumber === 3 && (
          <div className="glass-effect rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Select the correct Bible reference:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {referenceOptions.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedReference(ref)}
                  disabled={isSubmitted}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all touch-target
                    ${
                      selectedReference === ref
                        ? "border-church-blue bg-blue-100 shadow-lg"
                        : "border-gray-300 bg-white hover:border-church-blue"
                    }
                    ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <span className="text-lg font-medium">{ref}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fragment Selection Area */}
        <div className="glass-effect rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Arrange the fragments in order:
          </h2>
          <div className="space-y-4">
            {/* Selected fragments (in order) */}
            <div className="min-h-[100px] p-4 bg-blue-50 rounded-lg border-2 border-dashed border-church-blue">
              {selectedOrder.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.map((fragment, idx) => (
                    <FragmentDraggable
                      key={fragment.id}
                      fragment={fragment}
                      isSelected={false}
                      onClick={() => handleFragmentClick(fragment)}
                      isInOrder={false}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  Tap fragments below to add them here
                </p>
              )}
            </div>

            {/* Available fragments */}
            <div className="flex flex-wrap gap-3">
              {fragments.map((fragment) => {
                const isSelected = selectedOrder.some((f) => f.id === fragment.id);
                if (isSelected) return null;
                return (
                  <FragmentDraggable
                    key={fragment.id}
                    fragment={fragment}
                    isSelected={false}
                    onClick={() => handleFragmentClick(fragment)}
                    isInOrder={false}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitted || selectedOrder.length === 0}
            className="px-8 py-4 bg-church-blue text-white rounded-lg font-semibold text-xl shadow-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-target"
          >
            {isSubmitted ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

