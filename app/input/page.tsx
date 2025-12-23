"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { INDIAN_STATES } from "@/data/constants";

// Type definition for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export default function InputPage() {
  const router = useRouter();
  const { setPlayerData, resetGame } = useGameStore();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [errors, setErrors] = useState<{ name?: string; region?: string }>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (isSpeechSupported && typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.trim();
        setName(transcript);
        setErrors((prev) => {
          if (prev.name) {
            return { ...prev, name: undefined };
          }
          return prev;
        });
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "no-speech") {
          setErrors((prev) => ({
            ...prev,
            name: "No speech detected. Please try again.",
          }));
        } else if (event.error === "not-allowed") {
          setErrors((prev) => ({
            ...prev,
            name: "Microphone permission denied. Please allow microphone access.",
          }));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
    };
  }, [isSpeechSupported]);

  const handleVoiceInput = () => {
    if (!isSpeechSupported) {
      setErrors((prev) => ({
        ...prev,
        name: "Voice input is not supported in your browser.",
      }));
      return;
    }

    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setErrors((prev) => {
            if (prev.name) {
              return { ...prev, name: undefined };
            }
            return prev;
          });
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          setIsListening(false);
        }
      }
    }
  };

  const handleStart = () => {
    const newErrors: { name?: string; region?: string } = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!region) {
      newErrors.region = "Please select your region";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    resetGame();
    setPlayerData({ name: name.trim(), region });
    router.push("/countdown");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-effect rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-4xl font-bold text-center text-church-dark mb-2">
          Verse Order
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Arrange Bible verses in the correct order
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Player Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className="w-full px-4 py-3 pr-14 rounded-lg border-2 border-gray-300 focus:border-church-blue focus:outline-none text-lg touch-target"
                placeholder="Enter your name or use voice input"
                maxLength={50}
              />
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all touch-target ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-church-blue text-white hover:bg-blue-600 active:bg-blue-700"
                  }`}
                  aria-label={isListening ? "Stop recording" : "Start voice input"}
                  title={isListening ? "Stop recording" : "Use voice input"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {isListening ? (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                        />
                      </>
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    )}
                  </svg>
                </button>
              )}
            </div>
            {isListening && (
              <p className="mt-1 text-sm text-church-blue font-medium animate-pulse">
                🎤 Listening... Speak your name now
              </p>
            )}
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="region"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Region (Indian State)
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                if (errors.region) setErrors({ ...errors, region: undefined });
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-church-blue focus:outline-none text-lg touch-target bg-white"
            >
              <option value="">Select your state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.region && (
              <p className="mt-1 text-sm text-red-600">{errors.region}</p>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={!name.trim() || name.trim().length < 2 || !region}
            className="w-full py-4 bg-church-blue text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-target"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}

