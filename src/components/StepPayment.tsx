import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Copy, Check, Loader2, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicOrder } from '../../lib/types';

interface StepPaymentProps {
  order: MusicOrder;
  onPaymentApproved: (updatedOrder: MusicOrder) => void;
}

export default function StepPayment({ order, onPaymentApproved }: StepPaymentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    status: string;
  } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Expiration Timer
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

  // Initialize Pix payment on mount
  useEffect(() => {
    let active = true;
    async function initPayment() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/create-pix-payment?id=${order.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        let data: any = null;
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await res.json();
          }
        } catch (e) {
          console.error('[StepPayment] Error parsing response:', e);
        }

        if (!res.ok) {
          throw new Error((data && data.error) || 'Falha ao gerar o Pix.');
        }

        if (active && data) {
          setPixData(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Erro ao gerar pagamento.');
          setLoading(false);
        }
      }
    }
    initPayment();
    return () => { active = false; };
  }, [order.id]);

  // Polling
  useEffect(() => {
    if (!pixData?.paymentId) return;
    async function checkStatus() {
      try {
        const res = await fetch(`/api/check-payment-status?id=${order.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'approved') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          onPaymentApproved(data.order);
        }
      } catch (err) {
        console.error('Check payment error:', err);
      }
    }
    pollingRef.current = setInterval(checkStatus, 4000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [pixData, order.id, onPaymentApproved]);

  const copyToClipboard = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading && !pixData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-12 h-12 text-brand-pink animate-spin mb-6" />
        <p className="text-premium-label font-medium animate-pulse">Gerando QR Code Pix seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-premium-title font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 btn-premium-gradient rounded-2xl text-white font-bold shadow-lg">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex items-center justify-center gap-2 text-brand-pink mb-1 sm:mb-2">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em]">Pagamento Seguro via Pix</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-premium-title font-bold tracking-tight">Finalize o Pagamento</h3>
        <p className="text-sm sm:text-lg text-premium-label font-medium opacity-80">Para Baixar Sua Música Exclusiva</p>
      </div>

      {/* Instruction text updated and inverted */}
      <div className="text-center px-4">
        <p className="text-xs sm:text-sm text-premium-label font-bold uppercase tracking-widest opacity-60 leading-relaxed">
          Use o código Copia e Cola abaixo ou<br className="sm:hidden" /> escaneie o QR Code para pagar
        </p>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-center gap-3 bg-red-50 px-6 py-3 rounded-2xl border border-red-100 w-fit mx-auto">
        <Clock className="w-4 h-4 text-red-500 animate-pulse" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Expira em:</span>
          <span className="text-red-500 font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Copia e Cola */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-white border border-premium-border/50 rounded-2xl px-5 py-4 text-xs font-mono text-premium-text truncate h-14 flex items-center shadow-sm">
            {pixData?.qrCode}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="px-6 h-14 btn-premium-gradient rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer flex-shrink-0"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Copiado!</span>
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                  <Copy className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Copiar</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* QR Code */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-[240px] sm:max-w-[280px] mx-auto group"
      >
        <div className="absolute inset-0 bg-brand-pink/5 blur-[80px] rounded-full group-hover:bg-brand-pink/10 transition-colors" />
        <div className="relative bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 border-2 border-premium-border/30 shadow-2xl overflow-hidden">
          {pixData?.qrCodeBase64 ? (
            <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code" className="w-full h-auto rounded-2xl relative z-10" />
          ) : (
            <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <QrCode className="w-16 h-16 text-gray-200" />
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2.5 mt-6 text-xs text-brand-pink font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-pink"></span>
            </span>
            <span>Aguardando Pagamento...</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
