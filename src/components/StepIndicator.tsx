import React from 'react';
import { motion } from 'motion/react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  // Determine which index (1, 2, or 3) is active
  let activeIndex = 1;
  if (currentStep === 'generating') {
    activeIndex = 2;
  } else if (currentStep === 'preview' || currentStep === 'checkout' || currentStep === 'payment' || currentStep === 'success') {
    activeIndex = 3;
  }

  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-8 sm:mb-12 relative z-10">
      {/* Step 1 */}
      <div className="flex flex-col items-center flex-1">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            activeIndex >= 1
              ? 'step-circle-active'
              : 'border-2 border-premium-border/60 text-premium-text/30 bg-white/50'
          }`}
        >
          1
        </div>
        <span
          className={`text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mt-3.5 transition-all duration-300 ${
            activeIndex >= 1 ? 'text-brand-pink' : 'text-premium-label/40'
          }`}
        >
          Criar
        </span>
      </div>

      {/* Line 1 -> 2 */}
      <div className="h-[3px] flex-1 bg-premium-border/30 mx-2 -mt-7 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: activeIndex >= 2 ? '100%' : '0%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-brand-pink to-brand-pink-soft shadow-[0_0_10px_rgba(255,79,139,0.3)]"
        />
      </div>

      {/* Step 2 */}
      <div className="flex flex-col items-center flex-1">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            activeIndex >= 2
              ? 'step-circle-active'
              : 'border-2 border-premium-border/60 text-premium-text/30 bg-white/50'
          }`}
        >
          2
        </div>
        <span
          className={`text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mt-3.5 transition-all duration-300 ${
            activeIndex >= 2 ? 'text-brand-pink' : 'text-premium-label/40'
          }`}
        >
          Gerar
        </span>
      </div>

      {/* Line 2 -> 3 */}
      <div className="h-[3px] flex-1 bg-premium-border/30 mx-2 -mt-7 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: activeIndex >= 3 ? '100%' : '0%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-brand-pink to-brand-pink-soft shadow-[0_0_10px_rgba(255,79,139,0.3)]"
        />
      </div>

      {/* Step 3 */}
      <div className="flex flex-col items-center flex-1">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            activeIndex >= 3
              ? 'step-circle-active'
              : 'border-2 border-premium-border/60 text-premium-text/30 bg-white/50'
          }`}
        >
          3
        </div>
        <span
          className={`text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mt-3.5 transition-all duration-300 ${
            activeIndex >= 3 ? 'text-brand-pink' : 'text-premium-label/40'
          }`}
        >
          Ouvir
        </span>
      </div>
    </div>
  );
}
