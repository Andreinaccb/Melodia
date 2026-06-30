import React from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { MusicOrder } from '../types';
import AudioPlayer from './AudioPlayer';

interface StepPreviewPlayerProps {
  order: MusicOrder;
  onBuyClick: () => void;
}

export default function StepPreviewPlayer({ order, onBuyClick }: StepPreviewPlayerProps) {
  // Title for the custom preview track
  const trackTitle = `Melodia para ${order.recipient_name}`;
  const trackSubtitle = `${order.music_style} • Especial de ${order.occasion}`;

  return (
    <div className="space-y-8 text-center py-2 sm:py-4 relative">
      {/* Sparkle Header */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-brand-pink/5 flex items-center justify-center border border-brand-pink/20 mb-5 shadow-lg">
          <Sparkles className="w-7 h-7 text-brand-pink animate-pulse" />
        </div>
        <h3 className="font-serif text-3xl text-premium-title font-bold tracking-tight">
          Sua prévia está pronta!
        </h3>
        <p className="text-sm text-premium-text mt-3 font-medium max-w-xs mx-auto leading-relaxed opacity-80">
          Ouça agora a melodia exclusiva criada com base na história de vocês.
        </p>
      </div>

      {/* Audio Player */}
      <div className="py-2">
        <AudioPlayer
          audioUrl={order.preview_audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
          title={trackTitle}
          subtitle={trackSubtitle}
        />
      </div>

      {/* Song Custom Info Cards */}
      <div className="grid grid-cols-2 gap-5 text-left bg-white border border-premium-border/50 rounded-2xl p-5 text-xs shadow-sm">
        <div className="space-y-1">
          <span className="text-premium-label block text-[10px] font-bold uppercase tracking-widest opacity-60">Homenageado(a)</span>
          <span className="text-premium-title font-bold truncate block">{order.recipient_name}</span>
        </div>
        <div className="space-y-1">
          <span className="text-premium-label block text-[10px] font-bold uppercase tracking-widest opacity-60">Criado por</span>
          <span className="text-premium-title font-bold truncate block">{order.sender_name}</span>
        </div>
        <div className="col-span-2 border-t border-premium-border/30 mt-3 pt-3 space-y-1">
          <span className="text-premium-label block text-[10px] font-bold uppercase tracking-widest opacity-60">Estilo e Emoção</span>
          <span className="text-brand-pink font-bold block">{order.music_style} • {order.emotion}</span>
        </div>
      </div>

      {/* Buy Button Section */}
      <div className="space-y-5 pt-4">
        <button
          onClick={onBuyClick}
          className="w-full py-5 px-6 btn-premium-gradient text-white font-bold rounded-2xl text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl"
        >
          <ShoppingBag className="w-5 h-5 text-white" />
          <span>Adquirir música completa • R$ 19,90</span>
        </button>
        <p className="text-[11px] text-premium-text font-bold leading-relaxed max-w-xs mx-auto opacity-40 uppercase tracking-widest">
          Download imediato em alta definição
        </p>
      </div>
    </div>
  );
}
