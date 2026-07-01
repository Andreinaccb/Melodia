import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { MusicOrder, SongGenerationInput, Step } from '../../lib/types';
import StepIndicator from './StepIndicator';
import StepForm from './StepForm';
import StepGenerating from './StepGenerating';
import StepPreviewPlayer from './StepPreviewPlayer';
import StepCheckout from './StepCheckout';
import StepPayment from './StepPayment';
import SuccessStep from './SuccessStep';

export default function MusicCreationCard() {
  const [step, setStep] = useState<Step>('form');
  const [order, setOrder] = useState<MusicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'immediate' | 'standard'>('immediate');

  const checkGenerationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any intervals on unmount
  useEffect(() => {
    return () => {
      if (checkGenerationIntervalRef.current) {
        clearInterval(checkGenerationIntervalRef.current);
      }
    };
  }, []);

  // Form submission handler -> transition to generating, call API, then poll
  const handleFormSubmit = async (input: SongGenerationInput) => {
    try {
      setError(null);
      setStep('generating');

      // 1. Send form details to backend
      const res = await fetch('/api/generate-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      let responseData: any = null;
      try {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await res.json();
        } else {
          const text = await res.text();
          console.warn('[MusicCard] Non-JSON response:', text.substring(0, 200));
        }
      } catch (e) {
        console.error('[MusicCard] Error parsing response:', e);
      }

      if (!res.ok) {
        throw new Error((responseData && responseData.error) || 'Não foi possível iniciar a geração da música na Treblo.');
      }

      if (!responseData) {
        throw new Error('O servidor retornou uma resposta inesperada.');
      }

      const createdOrder: MusicOrder = responseData;
      setOrder(createdOrder);

      // 2. Poll generation status on Treblo
      startPollingGeneration(createdOrder.id);
    } catch (err: any) {
      console.error('[MusicCard] Submission error:', err);
      setError(err.message || 'Falha ao iniciar a composição da música. Por favor, tente novamente.');
      setStep('form');
    }
  };

  // Polls the status of the song creation from backend
  const startPollingGeneration = (orderId: string) => {
    if (checkGenerationIntervalRef.current) {
      clearInterval(checkGenerationIntervalRef.current);
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/check-song-status?id=${orderId}`);
        if (!res.ok) return;

        const data = await res.json();
        const isCompleted = data.status === 'completed' || data.status === 'SUCCESS';
        const previewAudioUrl = data.previewAudioUrl || data.preview_audio_url || data.order?.preview_audio_url || data.order?.previewAudioUrl;

        if (isCompleted && previewAudioUrl) {
          // Success! Clear timer, set the updated order details and transition to preview player
          if (checkGenerationIntervalRef.current) {
            clearInterval(checkGenerationIntervalRef.current);
          }
          // Merge or set order correctly
          const finalOrder = data.order || { ...order, ...data, preview_audio_url: previewAudioUrl };
          setOrder(finalOrder);
          setStep('preview');
        } else if (data.status === 'FAILED') {
          // Failed! Clear timer, show error and return to form
          if (checkGenerationIntervalRef.current) {
            clearInterval(checkGenerationIntervalRef.current);
          }
          setError(data.message || 'Houve um problema ao gerar a música. Por favor, tente novamente.');
          setStep('form');
        }
      } catch (err) {
        console.error('[MusicCard] Status checking failed:', err);
      }
    };

    // Run first check after 2 seconds
    checkGenerationIntervalRef.current = setInterval(checkStatus, 3000);
  };

  // Checkout transitions
  const handleBuyClick = () => {
    setStep('checkout');
  };

  const handleProceedToPayment = (option: 'immediate' | 'standard') => {
    setDeliveryOption(option);
    setStep('payment');
  };

  // Payment completed
  const handlePaymentApproved = (updatedOrder: MusicOrder) => {
    setOrder(updatedOrder);
    setStep('success');
  };

  // Reset order to start a new one
  const handleReset = () => {
    setStep('form');
    setOrder(null);
    setError(null);
  };

  return (
    <div className="premium-card p-6 sm:p-10 w-full relative transition-all duration-500 flex flex-col justify-between group">
      {/* Decorative Glow behind card */}
      <div className="absolute -inset-10 bg-brand-pink/5 rounded-[4rem] blur-[80px] opacity-40 pointer-events-none transition-opacity duration-500"></div>
      
      {/* Decorative Warm Accents */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-pink/[0.03] rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/[0.03] rounded-full blur-3xl -ml-20 -mb-20"></div>

      {/* Step Progress indicators at top - Only show until hearing the music (preview) */}
      {(step === 'form' || step === 'generating' || step === 'preview') && (
        <div className="relative z-10 mb-8">
          <StepIndicator currentStep={step} />
        </div>
      )}

      {/* Main step content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {/* Error Alert Overlay */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-left animate-fade-in shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-red-800 font-medium leading-relaxed">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-[10px] text-red-400 hover:text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer mt-1"
              >
                Dispensar aviso
              </button>
            </div>
          </div>
        )}

        {/* Step Routing */}
        {step === 'form' && <StepForm onSubmit={handleFormSubmit} />}

        {step === 'generating' && <StepGenerating />}

        {step === 'preview' && order && (
          <StepPreviewPlayer order={order} onBuyClick={handleBuyClick} />
        )}

        {step === 'checkout' && order && (
          <StepCheckout order={order} onProceedToPayment={handleProceedToPayment} />
        )}

        {step === 'payment' && order && (
          <StepPayment order={order} onPaymentApproved={handlePaymentApproved} />
        )}

        {step === 'success' && order && (
          <SuccessStep order={order} />
        )}
      </div>

      {/* Footer link to create a new music (only in final steps for ease of navigation) */}
      {(step === 'preview' || step === 'checkout' || step === 'payment' || step === 'success') && (
        <button
          onClick={handleReset}
          className="mt-8 text-[10px] sm:text-xs text-premium-text/40 hover:text-brand-pink font-light tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t border-premium-border/40 pt-6"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Criar outra música personalizada</span>
        </button>
      )}
    </div>
  );
}
