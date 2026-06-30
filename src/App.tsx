import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import HeroSection from './components/HeroSection';
import MusicCreationCard from './components/MusicCreationCard';
import { BackgroundEffects } from './components/BackgroundEffects';

export default function App() {
  return (
    <div className="min-h-screen text-gray-100 flex flex-col justify-between relative select-none selection:bg-brand-pink/30">
      <BackgroundEffects />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Branding, Title, Bullets */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <HeroSection />
          </motion.div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Right Column: Interaction Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 w-full relative"
          >
            <MusicCreationCard />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="w-full py-8 text-center border-t border-white/5 relative z-10 px-4"
      >
        <p className="text-text-muted text-[11px] sm:text-xs font-light flex items-center justify-center gap-1.5">
          <span>Melodia IA • CNPJ 45.234.908/0001-92 © 2026</span>
          <span className="text-white/10">•</span>
          <span className="flex items-center gap-1 text-brand-pink-soft">
            Feito com carinho <Heart className="w-3 h-3 fill-current text-brand-pink" />
          </span>
          <span className="text-white/10">•</span>
          <span>Todos os direitos reservados.</span>
        </p>
      </motion.footer>
    </div>
  );
}
