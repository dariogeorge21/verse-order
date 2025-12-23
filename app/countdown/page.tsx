"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

export default function CountdownPage() {
  const router = useRouter();
  const { generateSecurityCode, securityCode } = useGameStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [displayCode, setDisplayCode] = useState<string | null>(null);

  useEffect(() => {
    // Generate and display security code
    const code = generateSecurityCode();
    setDisplayCode(code);

    // Show code for 3 seconds, then start countdown
    const codeTimer = setTimeout(() => {
      setCountdown(5);
    }, 3000);

    return () => clearTimeout(codeTimer);
  }, [generateSecurityCode]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      router.push("/level/1");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="text-center space-y-8">
        {displayCode && countdown === null && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-effect rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-church-dark mb-4">
                Remember this code!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                You'll need it later.
              </p>
              <div className="text-6xl font-bold text-church-blue tracking-wider">
                {displayCode}
              </div>
            </div>
          </div>
        )}

        {countdown !== null && (
          <div className="space-y-4">
            {countdown > 0 ? (
              <div
                key={countdown}
                className="text-9xl font-bold text-church-gold animate-countdown"
              >
                {countdown}
              </div>
            ) : (
              <div className="text-7xl font-bold text-church-blue animate-fade-in">
                GO!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

