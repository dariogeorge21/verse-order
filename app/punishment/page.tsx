"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PunishmentPage() {
  const router = useRouter();
  const [checked, setChecked] = useState([false, false, false, false, false]);

  const handleCheck = (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  const allChecked = checked.every((c) => c);

  const handleContinue = () => {
    if (allChecked) {
      router.push("/final-score");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="w-full max-w-md glass-effect rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-church-dark mb-2">
          Verification Failed
        </h1>
        <p className="text-center text-gray-700 text-lg mb-8">
          Recite 5 Hail Marys to continue
        </p>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((num, idx) => (
            <label
              key={num}
              className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-church-blue transition-colors touch-target"
            >
              <input
                type="checkbox"
                checked={checked[idx]}
                onChange={() => handleCheck(idx)}
                className="w-6 h-6 text-church-blue border-gray-300 rounded focus:ring-church-blue cursor-pointer"
              />
              <span className="ml-4 text-lg font-medium text-gray-800">
                Hail Mary {num}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!allChecked}
          className="w-full py-4 bg-church-blue text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-target"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

