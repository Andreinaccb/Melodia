import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Copy, Check, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { MusicOrder } from '../types';

interface PixCheckoutProps {
  order: MusicOrder;
  onPaymentApproved: (updatedOrder: MusicOrder) => void;
}

export default function PixCheckout({ order, onPaymentApproved }: PixCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    status: string;
  } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Pix payment on mount
  useEffect(() => {
    let active = true;

    async function initPayment() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/orders/${order.id}/create-pix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Falha ao gerar o Pix. Por favor, tente novamente.');
        }

        const data = await res.json();
        if (active) {
          setPixData(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('[PixCheckout] Error generating Pix:', err);
        if (active) {
          setError(err.message || 'Ocorreu um erro ao gerar o pagamento Pix.');
          setLoading(false);
        }
      }
    }

    initPayment();

    return () => {
      active = false;
    };
  }, [order.id]);

  // Set up polling for payment status
  useEffect(() => {
    if (!pixData?.paymentId) return;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/orders/${order.id}/check-payment`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.status === 'approved') {
          // Clear interval immediately
          if (pollingRef.current) clearInterval(pollingRef.current);
          onPaymentApproved(data.order);
        }
      } catch (err) {
        console.error('[PixCheckout] Error checking payment status:', err);
      }
    }

    // Poll every 4 seconds
    pollingRef.current = setInterval(checkStatus, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pixData, order.id, onPaymentApproved]);

  // Helper to copy code to clipboard
  const copyToClipboard = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper to simulate payment approval instantly (Demo purposes)
  const forceSimulateApproval = async () => {
    if (!pixData?.paymentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${order.id}/force-approve`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order.payment_status === 'approved') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          onPaymentApproved(data.order);
        }
      }
    } catch (err) {
      console.error('[PixCheckout] Error forcing approval:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pixData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="w-10 h-10 text-brand-pink animate-spin mb-5" />
        <p className="text-sm text-text-muted font-light">Gerando seu QR Code Pix seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <p className="text-base text-white font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl text-sm font-bold cursor-pointer shadow-lg transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center py-1 relative">
      {/* Checkout header */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-pink px-4 py-1.5 rounded-full bg-brand-pink/5 border border-brand-pink/20 mb-4 shadow-sm">
          Checkout Seguro • Pix
        </span>
        <h3 className="font-serif text-3xl text-premium-title font-bold tracking-tight">
          Finalize seu Pedido
        </h3>
        <p className="text-sm text-premium-text mt-3 font-medium leading-relaxed opacity-80">
          Realize o pagamento instantâneo para liberar a música completa em alta definição.
        </p>
      </div>

      {/* Price Visual Tag */}
      <div className="bg-white border border-premium-border/50 rounded-2xl py-4 px-6 flex items-center justify-between text-left shadow-sm">
        <div>
          <span className="text-[10px] text-premium-label uppercase font-bold tracking-widest">Produto</span>
          <span className="text-sm text-premium-title font-bold block mt-0.5">Música Homenagem Completa</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-premium-label uppercase font-bold tracking-widest">Total</span>
          <span className="text-xl text-brand-pink font-bold block mt-0.5">R$ 19,90</span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center bg-white border-2 border-premium-border/30 rounded-[2.5rem] p-6 max-w-[260px] mx-auto shadow-xl relative">
        <div className="absolute inset-0 bg-brand-pink/[0.02] blur-3xl rounded-full"></div>
        {pixData?.qrCodeBase64 ? (
          <img
            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
            alt="Pix QR Code"
            className="w-44 h-44 rounded-2xl border border-premium-border/10 p-1 bg-white relative z-10"
          />
        ) : (
          <div className="w-44 h-44 bg-brand-pink/[0.03] rounded-2xl flex items-center justify-center border border-dashed border-brand-pink/20 relative z-10">
            <QrCode className="w-14 h-14 text-brand-pink/20 animate-pulse" />
          </div>
        )}

        {/* Pulsing Status indicator */}
        <div className="flex items-center gap-2.5 mt-5 text-xs text-premium-title font-bold relative z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-pink"></span>
          </span>
          <span className="opacity-80 uppercase tracking-widest text-[9px]">Aguardando Pix...</span>
        </div>
      </div>

      {/* Copia e cola section */}
      <div className="space-y-3 text-left">
        <label className="text-[10px] font-bold text-premium-label uppercase tracking-[0.2em] block ml-1">
          Código Pix Copia e Cola:
        </label>
        <div className="flex gap-3">
          <div className="flex-1 premium-input rounded-2xl px-4 py-3 text-xs font-mono text-premium-text truncate select-all h-14 flex items-center shadow-sm">
            {pixData?.qrCode}
          </div>
          <button
            onClick={copyToClipboard}
            className="w-14 h-14 btn-premium-gradient rounded-2xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-lg"
            title="Copiar Código"
          >
            {copied ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6" />}
          </button>
        </div>
        {copied && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-emerald-600 font-bold mt-2 ml-1"
          >
            Código Pix copiado! Cole no aplicativo do seu banco para pagar.
          </motion.p>
        )}
      </div>

      {/* Safety Note */}
      <div className="flex items-center justify-center gap-2.5 text-[10px] text-premium-label font-bold pt-4 border-t border-premium-border/40 uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4 text-brand-pink" />
        <span>Pagamento 100% seguro</span>
      </div>

      {/* Quick Approval Simulated button for Testing */}
      {pixData?.paymentId.startsWith('pay_') && (
        <div className="pt-2">
          <button
            type="button"
            onClick={forceSimulateApproval}
            className="w-full py-2.5 px-3 border border-dashed border-white/10 hover:border-brand-pink/30 text-[10px] text-text-muted/60 hover:text-brand-pink-soft font-bold tracking-[0.1em] uppercase rounded-xl transition-all cursor-pointer bg-white/5 hover:bg-white/10"
          >
            ⚡ APROVAR PIX INSTANTANEAMENTE (MODO DEMO)
          </button>
        </div>
      )}
    </div>
  );
}
