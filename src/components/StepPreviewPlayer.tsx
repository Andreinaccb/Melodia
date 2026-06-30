import React, { useState, useEffect } from 'react';
import { MusicOrder } from '../types';
import AudioPlayer from './AudioPlayer';
import { motion } from 'motion/react';
import { Download, Clock } from 'lucide-react';

interface StepPreviewPlayerProps {
  order: MusicOrder;
  onBuyClick: () => void;
}

export default function StepPreviewPlayer({ order, onBuyClick }: StepPreviewPlayerProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

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
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-8 py-4">
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h3 className="font-serif text-2xl sm:text-3xl text-premium-title font-bold tracking-tight px-2">
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

        {/* Countdown Offer */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-premium-label/40 line-through font-medium">De R$59,00</span>
            <motion.span 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-premium-title font-bold bg-green-50 text-green-600 px-4 py-1.5 rounded-full border border-green-100 shadow-sm"
            >
              por apenas R$19,90
            </motion.span>
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-brand-pink/10 shadow-sm">
            <Clock className="w-4 h-4 text-brand-pink animate-pulse" />
            <span className="text-brand-pink font-mono font-bold text-sm tracking-widest">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
