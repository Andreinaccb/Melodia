import React, { useState, useEffect } from 'react';
import { Sparkles, Music, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const phrases = [
  "Preparando sua prévia...",
  "Tecendo memórias em melodia...",
  "Capturando a essência da sua história...",
  "Harmonizando sentimentos...",
  "Dando vida às suas palavras...",
  "Finalizando os últimos acordes...",
];

export default function StepGenerating() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12 text-center min-h-[350px] sm:min-h-[400px] relative overflow-hidden">
      {/* Central Magical Orb */}
      <div className="relative mb-8 sm:mb-16">
        {/* Ambient Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-brand-pink rounded-full blur-[60px]"
        />
        
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
          {/* Rotating Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-brand-pink/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 sm:inset-4 border border-brand-pink-soft/10 rounded-full"
          />

          {/* Core Icon Container */}
          <motion.div 
            animate={{ 
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white border border-premium-border/40 flex items-center justify-center shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-pink/5 to-transparent rounded-2xl sm:rounded-3xl"></div>
            <Music className="w-6 h-6 sm:w-8 sm:h-8 text-brand-pink" />
            
            {/* Orbiting Elements */}
            <motion.div 
              animate={{ 
                rotate: 360,
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 sm:-inset-8 pointer-events-none"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-brand-pink/20 flex items-center justify-center shadow-md"
              >
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-pink fill-current" />
              </motion.div>
            </motion.div>

            <motion.div 
              animate={{ 
                rotate: -360,
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-9 sm:-inset-12 pointer-events-none"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-0 right-1/4 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border border-purple-500/20 flex items-center justify-center shadow-md"
              >
                <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-purple-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-4 sm:space-y-6 relative z-10 px-4">
        <h4 className="font-serif text-2xl sm:text-3xl text-premium-title font-bold tracking-tight leading-tight">
          Transformando Amor em Música...
        </h4>
        
        <div className="h-8 sm:h-10 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p 
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="text-base sm:text-lg text-premium-label font-medium"
            >
              {phrases[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Countdown Timer */}
        <div className="mt-6 sm:mt-8">
          {timeLeft > 0 ? (
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-sm font-mono font-bold text-premium-label/40 tracking-[0.2em] uppercase">
                Tempo estimado
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-brand-pink">
                {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-brand-pink/5 border border-brand-pink/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3"
            >
              <p className="text-brand-pink text-sm sm:text-base font-bold">
                Finalizando sua música, só mais uns instantes...
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Wave Visualizer */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-8 sm:mt-12 h-6 sm:h-8">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              height: [6, 24, 6],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 1 + Math.random(), 
              repeat: Infinity, 
              delay: i * 0.1 
            }}
            className="w-0.5 sm:w-1 bg-brand-pink rounded-full shadow-[0_0_10px_rgba(255,79,139,0.5)]"
          />
        ))}
      </div>
    </div>
  );
}
