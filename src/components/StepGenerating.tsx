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

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center min-h-[400px] relative overflow-hidden">
      {/* Central Magical Orb */}
      <div className="relative mb-16">
        {/* Ambient Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-brand-pink rounded-full blur-[60px]"
        />
        
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Rotating Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-brand-pink/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-brand-pink-soft/10 rounded-full"
          />

          {/* Core Icon Container */}
          <motion.div 
            animate={{ 
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-20 h-20 rounded-3xl bg-white border border-premium-border/40 flex items-center justify-center shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-pink/5 to-transparent rounded-3xl"></div>
            <Music className="w-8 h-8 text-brand-pink" />
            
            {/* Orbiting Elements */}
            <motion.div 
              animate={{ 
                rotate: 360,
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 pointer-events-none"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-brand-pink/20 flex items-center justify-center shadow-md"
              >
                <Heart className="w-3 h-3 text-brand-pink fill-current" />
              </motion.div>
            </motion.div>

            <motion.div 
              animate={{ 
                rotate: -360,
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-12 pointer-events-none"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-0 right-1/4 w-5 h-5 rounded-full bg-white border border-purple-500/20 flex items-center justify-center shadow-md"
              >
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-6 relative z-10">
        <h4 className="font-serif text-3xl text-premium-title font-bold tracking-tight">
          Transformando Amor em Música...
        </h4>
        
        <div className="h-10 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p 
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="text-lg text-premium-label font-medium"
            >
              {phrases[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Wave Visualizer */}
      <div className="flex items-center justify-center gap-1.5 mt-12 h-8">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              height: [8, 32, 8],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 1 + Math.random(), 
              repeat: Infinity, 
              delay: i * 0.1 
            }}
            className="w-1 bg-brand-pink rounded-full shadow-[0_0_10px_rgba(255,79,139,0.5)]"
          />
        ))}
      </div>
    </div>
  );
}
