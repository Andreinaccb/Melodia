import React from 'react';
import { MusicOrder } from '../../lib/types';
import AudioPlayer from './AudioPlayer';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';

interface StepPreviewPlayerProps {
  order: MusicOrder;
  onBuyClick: () => void;
}

export default function StepPreviewPlayer({ order, onBuyClick }: StepPreviewPlayerProps) {
  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1 sm:space-y-2"
      >
        <h3 className="font-serif text-xl sm:text-3xl text-premium-title font-bold tracking-tight px-2">
          A prévia para <span className="text-brand-pink underline decoration-brand-pink/20 underline-offset-8">{order.recipient_name}</span> ficou pronta
        </h3>
        <p className="text-[13px] text-premium-label font-medium opacity-60 uppercase tracking-widest pt-2">
          Melodia exclusiva • Versão demonstrativa
        </p>
      </motion.div>

      {/* Modern Compact Player */}
      <AudioPlayer 
        audioUrl={order.preview_audio_url || ''} 
        title={`Para ${order.recipient_name}`}
        subtitle={`${order.music_style} • ${order.emotion}`}
      />

      {/* Action & Offer Section */}
      <div className="space-y-6 pt-2">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -12px rgba(255,79,139,0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onBuyClick}
          className="w-full btn-premium-gradient py-5 rounded-2xl font-bold text-white shadow-xl shadow-brand-pink/20 flex items-center justify-center gap-3 group cursor-pointer relative overflow-hidden"
        >
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
          <Download className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Baixar música completa</span>
        </motion.button>
      </div>
    </div>
  );
}
