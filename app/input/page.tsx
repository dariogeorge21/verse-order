"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { INDIAN_STATES } from "@/data/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, User, MapPin, Sparkles, Keyboard, X } from "lucide-react";

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
  const [inputMode, setInputMode] = useState<'voice' | 'keyboard'>('voice');
  const [showOnScreenKeyboard, setShowOnScreenKeyboard] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- (Keep existing useEffect hooks for SpeechRecognition logic) ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const supported = !!SpeechRecognition;
      setIsSpeechSupported(supported);
      // If voice not supported, default to keyboard mode
      if (!supported) {
        setInputMode('keyboard');
      }
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
          setErrors((prev) => ({ ...prev, name: "No speech detected. Switching to keyboard..." }));
          setTimeout(() => {
            setInputMode('keyboard');
            setShowOnScreenKeyboard(true);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }, 2000);
        } else if (event.error === "not-allowed") {
          setErrors((prev) => ({ ...prev, name: "Microphone access denied. Using keyboard instead." }));
          setInputMode('keyboard');
          setShowOnScreenKeyboard(true);
        } else {
          // Other errors - fallback to keyboard
          setInputMode('keyboard');
          setShowOnScreenKeyboard(true);
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
      setErrors((prev) => ({ ...prev, name: "Voice input not supported. Using keyboard instead." }));
      setInputMode('keyboard');
      setShowOnScreenKeyboard(true);
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
          setShowOnScreenKeyboard(false);
          setErrors((prev) => {
            if (prev.name) return { ...prev, name: undefined };
            return prev;
          });
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          setIsListening(false);
          // Fallback to keyboard if voice fails
          setInputMode('keyboard');
          setShowOnScreenKeyboard(true);
        }
      }
    }
  };

  // Auto-start voice input when field is focused (primary method)
  const handleInputFocus = () => {
    if (inputMode === 'voice' && isSpeechSupported && !isListening) {
      handleVoiceInput();
    } else if (inputMode === 'keyboard' || !isSpeechSupported) {
      setShowOnScreenKeyboard(true);
    }
  };

  // Block physical keyboard input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Only allow backspace and delete for editing
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setName(prev => prev.slice(0, -1));
    }
  };

  const handleInputClick = () => {
    if (inputMode === 'voice' && isSpeechSupported) {
      if (!isListening) {
        handleVoiceInput();
      }
    } else {
      setShowOnScreenKeyboard(true);
    }
  };

  const handleKeyboardKeyPress = (key: string) => {
    if (key === 'backspace') {
      setName(prev => prev.slice(0, -1));
    } else if (key === 'space') {
      setName(prev => prev + ' ');
    } else if (key === 'clear') {
      setName('');
    } else {
      setName(prev => prev + key);
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const switchToKeyboard = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setInputMode('keyboard');
    setShowOnScreenKeyboard(true);
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
        className="relative w-full max-w-5xl"
      >
        {/* Decorative glowing border */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/30 to-purple-600/30 rounded-[2.5rem] blur-md opacity-50"></div>

        <div className="relative glass-effect rounded-[2rem] border border-white/10 bg-black/95 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-2xl overflow-hidden">
           {/* Top Shine */}
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          <div className="text-center space-y-2 mb-4">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              We want to know you
            </h1>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              Prepare for the challenge!
            </p>
          </div>

          <div className="space-y-4">
            {/* Name Input Group */}
            <div className="space-y-2 mb-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 ml-1">
                Player Name
              </label>
              <div className={`relative flex items-center group rounded-2xl transition-all duration-300 ${isListening ? 'ring-2 ring-red-500/50' : inputMode === 'voice' ? 'ring-2 ring-blue-500/30' : 'ring-2 ring-purple-500/30'}`}>
                <User className="absolute left-4 h-5 w-5 text-blue-400 transition-colors" />
                <input
                  ref={inputRef}
                  id="name"
                  type="text"
                  value={name}
                  readOnly
                  onFocus={handleInputFocus}
                  onClick={handleInputClick}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-16 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:bg-white/10 transition-all outline-none text-lg font-medium cursor-pointer"
                  placeholder={inputMode === 'voice' && isSpeechSupported ? "Tap to start voice input..." : "Tap to open on-screen keyboard..."}
                  maxLength={50}
                />
                
                {/* Input Method Indicator */}
                <div className="absolute right-2 flex items-center gap-2">
                  {inputMode === 'voice' && isSpeechSupported && (
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`p-3 rounded-xl transition-all duration-300 backdrop-blur-md
                        ${isListening 
                          ? "bg-red-500/80 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                          : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-white"
                        }`}
                      title={isListening ? "Stop recording" : "Start voice input"}
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
                  {inputMode === 'keyboard' && (
                    <button
                      type="button"
                      onClick={() => setShowOnScreenKeyboard(true)}
                      className="p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-white transition-all duration-300 backdrop-blur-md"
                      title="Open keyboard"
                    >
                      <Keyboard className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Error / Listening Status Messages */}
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div key="listening" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-between">
                    <motion.p className="text-sm text-red-400 font-medium flex items-center gap-2 ml-1">
                       <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                       </span>
                       Listening... Speak clearly
                    </motion.p>
                    <button
                      type="button"
                      onClick={switchToKeyboard}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors underline"
                    >
                      Use keyboard instead
                    </button>
                  </motion.div>
                ) : inputMode === 'keyboard' ? (
                  <motion.div key="keyboard-mode" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-between">
                    <motion.p className="text-sm text-purple-400 font-medium flex items-center gap-2 ml-1">
                      <Keyboard className="h-4 w-4" />
                      Keyboard mode active
                    </motion.p>
                    {isSpeechSupported && (
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode('voice');
                          setShowOnScreenKeyboard(false);
                          handleVoiceInput();
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline"
                      >
                        Use voice instead
                      </button>
                    )}
                  </motion.div>
                ) : errors.name ? (
                  <motion.p key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400 ml-1">
                    {errors.name}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Region Select Group */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                Region (State)
              </label>
              
              {/* State Cards Grid */}
              <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
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

      {/* On-Screen Keyboard Modal */}
      <AnimatePresence>
        {showOnScreenKeyboard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOnScreenKeyboard(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4"
            >
              <div className="glass-effect rounded-t-3xl border-t border-white/10 bg-black/95 backdrop-blur-2xl p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">On-Screen Keyboard</h3>
                  <button
                    onClick={() => setShowOnScreenKeyboard(false)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <OnScreenKeyboard onKeyPress={handleKeyboardKeyPress} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// On-Screen Keyboard Component
function OnScreenKeyboard({ onKeyPress }: { onKeyPress: (key: string) => void }) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {row.map((key) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onKeyPress(key.toLowerCase())}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all touch-target"
            >
              {key}
            </motion.button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-2 mt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onKeyPress('space')}
          className="flex-1 max-w-md py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all touch-target"
        >
          Space
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onKeyPress('backspace')}
          className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 hover:text-red-300 transition-all touch-target"
        >
          ⌫
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onKeyPress('clear')}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all touch-target"
        >
          Clear
        </motion.button>
      </div>
    </div>
  );
}