import React from 'react';
import { Sparkles, CheckCircle2, Download, Share2, Heart } from 'lucide-react';
import { MusicOrder } from '../../lib/types';
import AudioPlayer from './AudioPlayer';

interface SuccessStepProps {
  order: MusicOrder;
}

export default function SuccessStep({ order }: SuccessStepProps) {
  const trackTitle = `Melodia de ${order.sender_name} para ${order.recipient_name}`;
  const trackSubtitle = `Música Completa • Estilo ${order.music_style}`;

  // Helper to trigger direct browser download
  const handleDownload = async () => {
    const url = order.full_audio_url || '';
    if (!url) return;

    try {
      // Try fetching as blob to force download
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `melodia-ia-${order.recipient_name.toLowerCase().replace(/\s+/g, '-')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('[Download] Failed to fetch blob, falling back to direct link:', error);
      // Fallback to standard link behavior
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `melodia-ia-homenagem-${order.id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper to share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Preciso que você ouça isso até o final... ❤️\nAcho que você vai gostar. 🎶\nOuça aqui: ${order.full_audio_url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-center py-1 sm:py-4 relative">
      {/* Celebration Header */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 mb-4 sm:mb-5 shadow-lg animate-bounce">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
        </div>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.3em] text-emerald-500 bg-emerald-50 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
          Pagamento Aprovado
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-premium-title font-bold mt-4 tracking-tight">
          Sua Música está Liberada!
        </h3>
        <p className="text-sm text-premium-text font-medium mt-3 max-w-xs mx-auto leading-relaxed opacity-80">
          Que lindo! O pagamento foi confirmado e a música completa em alta definição foi gerada com sucesso.
        </p>
      </div>

      {/* Audio Player for the FULL Track */}
      <div className="py-1">
        <AudioPlayer
          audioUrl={order.full_audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'}
          title={trackTitle}
          subtitle={trackSubtitle}
          isFullVersion={true}
        />
      </div>

      {/* Details Box */}
      <div className="bg-white border border-premium-border/50 rounded-2xl p-5 text-left space-y-3 text-xs shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-premium-label font-bold uppercase tracking-widest text-[9px]">Código do Pedido:</span>
          <span className="text-premium-title font-bold font-mono text-sm">{order.id}</span>
        </div>
        <div className="flex justify-between items-center border-t border-premium-border/30 mt-3 pt-3">
          <span className="text-premium-label font-bold uppercase tracking-widest text-[9px]">Formato:</span>
          <span className="text-brand-pink font-bold">MP3 Alta Fidelidade (HQ)</span>
        </div>
        <div className="flex justify-between items-center border-t border-premium-border/30 mt-3 pt-3">
          <span className="text-premium-label font-bold uppercase tracking-widest text-[9px]">Liberado para:</span>
          <span className="text-premium-title font-bold truncate max-w-[160px]">{order.recipient_name}</span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button
          onClick={handleDownload}
          className="py-5 px-6 bg-white hover:bg-premium-card-bg text-premium-title font-bold rounded-2xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 transition-all duration-300 border border-premium-border shadow-md"
        >
          <Download className="w-5 h-5 text-brand-pink" />
          <span>Baixar Música</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="py-5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl"
        >
          <Share2 className="w-5 h-5" />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* Share Quote / Message */}
      <div className="pt-6 flex flex-col items-center gap-4 max-w-[320px] mx-auto">
        <p className="text-[11px] text-premium-text font-medium leading-relaxed opacity-60 italic">
          "Prepare uma surpresa! Envie pela WhatsApp, monte um vídeo com fotos, ou toque durante um jantar romântico."
        </p>
        <span className="flex items-center gap-2 text-xs text-brand-pink font-bold mt-2">
          Desejamos muito amor! <Heart className="w-4 h-4 text-brand-pink fill-current animate-pulse" />
        </span>
      </div>
    </div>
  );
}
