"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { INDIAN_STATES } from "@/data/constants";

export default function InputPage() {
  const router = useRouter();
  const { setPlayerData, resetGame } = useGameStore();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [errors, setErrors] = useState<{ name?: string; region?: string }>({});

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
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-church-blue focus:outline-none text-lg touch-target"
              placeholder="Enter your name"
              maxLength={50}
            />
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

