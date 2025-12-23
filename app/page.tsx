"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/input");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-church-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-church-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-church-blue/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center space-y-8">
        {/* Main Title */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-church-dark mb-4 leading-tight">
            Verse Order
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-church-blue to-transparent mx-auto"></div>
        </div>

        {/* Subtitle */}
        <p className="text-2xl md:text-3xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
          Arrange Bible verses in the correct order
        </p>

        {/* Description */}
        <div className="glass-effect rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto space-y-6">
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Test your knowledge of Scripture by arranging scrambled Bible verse
            fragments in their proper order. Challenge yourself across three
            difficulty levels and compete on the leaderboard!
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="space-y-2">
              <div className="text-4xl mb-2">📖</div>
              <h3 className="font-semibold text-church-dark">3 Levels</h3>
              <p className="text-sm text-gray-600">
                Easy, Medium, and Hard challenges
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">⏱️</div>
              <h3 className="font-semibold text-church-dark">30 Seconds</h3>
              <p className="text-sm text-gray-600">Per level to complete</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="font-semibold text-church-dark">Leaderboard</h3>
              <p className="text-sm text-gray-600">Compete with others</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            onClick={handleGetStarted}
            className="px-12 py-5 bg-gradient-to-r from-church-blue to-blue-600 text-white rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-100 transition-all duration-200 touch-target"
          >
            Get Started
          </button>
        </div>

        {/* Additional Info */}
        <p className="text-sm text-gray-500 mt-8">
          Join the challenge and see how well you know God's Word
        </p>
      </div>
    </div>
  );
}
