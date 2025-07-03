import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 300);
    const timer2 = setTimeout(() => setAnimationPhase(2), 800);
    const timer3 = setTimeout(() => setAnimationPhase(3), 1300);
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center z-50 opacity-0 transition-opacity duration-500" />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <div 
          className={`mb-8 transition-all duration-1000 ${
            animationPhase >= 1 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-75 translate-y-8'
          }`}
        >
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-white rounded-lg shadow-lg"></div>
            <img 
              src="/dove icon.png" 
              alt="Life Journal" 
              className="w-full h-full object-contain rounded-lg p-2"
            />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200/30 to-warm-200/30 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Life Journal Text */}
        <div 
          className={`transition-all duration-1000 delay-300 ${
            animationPhase >= 2 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-wide">
            Life Journal
          </h1>
        </div>

        {/* Daily Devotions Text */}
        <div 
          className={`transition-all duration-1000 delay-500 ${
            animationPhase >= 3 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xl text-gray-600 font-medium tracking-wider">
            Daily Devotions
          </p>
        </div>

        {/* Loading indicator */}
        <div 
          className={`mt-12 transition-all duration-500 delay-1000 ${
            animationPhase >= 3 
              ? 'opacity-100' 
              : 'opacity-0'
          }`}
        >
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Loading your devotional journey...</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-primary-300 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-32 right-32 w-1 h-1 bg-warm-400 rounded-full opacity-40 animate-pulse delay-500"></div>
      <div className="absolute bottom-40 left-32 w-1.5 h-1.5 bg-primary-400 rounded-full opacity-50 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-warm-500 rounded-full opacity-30 animate-pulse delay-700"></div>
    </div>
  );
};

export default SplashScreen;