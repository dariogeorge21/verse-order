"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

export default function VerifyPage() {
  const router = useRouter();
  const { securityCode } = useGameStore();
  const [enteredCode, setEnteredCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");

  const handleNumberClick = (num: string) => {
    if (enteredCode.length < 6) {
      setEnteredCode(enteredCode + num);
      setError("");
    }
  };

  const handleBackspace = () => {
    setEnteredCode(enteredCode.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setEnteredCode("");
    setError("");
  };

  const handleSubmit = () => {
    if (enteredCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    if (enteredCode === securityCode) {
      router.push("/final-score");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 2) {
        router.push("/punishment");
      } else {
        setError(`Incorrect. ${2 - newAttempts} attempt${2 - newAttempts === 1 ? "" : "s"} remaining.`);
        setEnteredCode("");
      }
    }
  };

  const handleForgotCode = () => {
    router.push("/punishment");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="w-full max-w-md glass-effect rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-church-dark mb-2">
          Verification
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your 6-digit security code
        </p>

        {/* Code Display */}
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="w-12 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center text-2xl font-bold bg-white"
              >
                {enteredCode[idx] || ""}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-center text-red-600 font-semibold">{error}</p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="py-4 bg-white border-2 border-gray-300 rounded-lg text-2xl font-semibold hover:border-church-blue hover:bg-blue-50 active:bg-blue-100 transition-colors touch-target"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="py-4 bg-gray-200 border-2 border-gray-300 rounded-lg text-lg font-semibold hover:bg-gray-300 active:bg-gray-400 transition-colors touch-target"
            >
              Clear
            </button>
            <button
              onClick={() => handleNumberClick("0")}
              className="py-4 bg-white border-2 border-gray-300 rounded-lg text-2xl font-semibold hover:border-church-blue hover:bg-blue-50 active:bg-blue-100 transition-colors touch-target"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="py-4 bg-gray-200 border-2 border-gray-300 rounded-lg text-lg font-semibold hover:bg-gray-300 active:bg-gray-400 transition-colors touch-target"
            >
              ⌫
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={enteredCode.length !== 6}
            className="w-full py-4 bg-church-blue text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-target"
          >
            Verify
          </button>

          {/* Forgot Code Button */}
          <button
            onClick={handleForgotCode}
            className="w-full py-3 text-church-blue font-medium hover:underline"
          >
            Forgot Code?
          </button>
        </div>
      </div>
    </div>
  );
}

