"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { INDIAN_STATES } from "@/data/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, User, MapPin, Sparkles } from "lucide-react";

// --- (Keep existing SpeechRecognition TypeScript interfaces here) ---
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
// --------------------------------------------------

export default function InputPage() {
  const router = useRouter();
  const { setPlayerData, resetGame } = useGameStore();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [errors, setErrors] = useState<{ name?: string; region?: string }>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // --- (Keep existing useEffect hooks for SpeechRecognition logic) ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSpeechSupported(!!SpeechRecognition);
    }
  }, []);

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
            if (prev.name) return { ...prev, name: undefined };
            return prev;
        });
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "no-speech") {
          setErrors((prev) => ({ ...prev, name: "No speech detected. Please try again." }));
        } else if (event.error === "not-allowed") {
          setErrors((prev) => ({ ...prev, name: "Microphone access denied." }));
        }
      };

      recognition.onend = () => { setIsListening(false); };
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
    };
  }, [isSpeechSupported]);
  // --------------------------------------------------

  const handleVoiceInput = () => {
    if (!isSpeechSupported) {
      setErrors((prev) => ({ ...prev, name: "Voice input not supported." }));
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
            if (prev.name) return { ...prev, name: undefined };
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
    if (!name || name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!region) newErrors.region = "Please select your region";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    resetGame();
    setPlayerData({ name: name.trim(), region });
    router.push("/countdown");
  };

  const isFormValid = name.trim().length >= 2 && region;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0c] text-white">
       {/* --- Visual Backdrop Elements (Consistent with Landing) --- */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-700/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-700/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgNDhVNjBINTJVNDhINDVWNDZINTVWMzRINTRWMzZINjZWMzZINTVWNDhaIiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuNCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Decorative glowing border */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/30 to-purple-600/30 rounded-[2.5rem] blur-md opacity-50"></div>

        <div className="relative glass-effect rounded-[2rem] border border-white/10 bg-black/95 backdrop-blur-2xl p-8 md:p-10 space-y-8 shadow-2xl overflow-hidden">
           {/* Top Shine */}
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Profile Setup
            </h1>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Prepare for the challenge
            </p>
          </div>

          <div className="space-y-6">
            {/* Name Input Group */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 ml-1">
                Player Name
              </label>
              <div className={`relative flex items-center group rounded-2xl transition-all duration-300 ${isListening ? 'ring-2 ring-red-500/50' : 'focus-within:ring-2 focus-within:ring-blue-500/50'}`}>
                <User className="absolute left-4 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className="w-full pl-12 pr-16 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:bg-white/10 transition-all outline-none text-lg font-medium"
                  placeholder="Enter your name or use voice input..."
                  maxLength={50}
                />
                
                {/* Voice Input Trigger */}
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`absolute right-2 p-3 rounded-xl transition-all duration-300 backdrop-blur-md
                      ${isListening 
                        ? "bg-red-500/80 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                        : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-white"
                      }`}
                    title={isListening ? "Stop recording" : "Use voice input"}
                  >
                   <AnimatePresence mode="wait">
                        {isListening ? (
                            <motion.div key="mic-off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <MicOff className="h-5 w-5" />
                            </motion.div>
                        ) : (
                            <motion.div key="mic-on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Mic className="h-5 w-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </button>
                )}
              </div>

              {/* Error / Listening Status Messages */}
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.p key="listening" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-red-400 font-medium flex items-center gap-2 ml-1">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                     </span>
                     Listening... Speak clearly
                  </motion.p>
                ) : errors.name ? (
                  <motion.p key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400 ml-1">
                    {errors.name}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Region Select Group */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                Region (State)
              </label>
              
              {/* State Cards Grid */}
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                  {INDIAN_STATES.map((state) => (
                    <motion.button
                      key={state}
                      type="button"
                      onClick={() => {
                        setRegion(state);
                        if (errors.region) setErrors({ ...errors, region: undefined });
                      }}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left touch-target
                        ${
                          region === state
                            ? "border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20"
                            : "border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/50 hover:bg-white/10"
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-sm font-medium block truncate">{state}</span>
                      {region === state && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {errors.region && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-sm text-red-400 ml-1"
                >
                  {errors.region}
                </motion.p>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!isFormValid}
              className={`relative w-full group py-4 rounded-xl font-bold text-xl overflow-hidden transition-all duration-300
                ${isFormValid 
                    ? 'bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isFormValid && (
                 <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine"></div>
              )}
              Start Game
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}