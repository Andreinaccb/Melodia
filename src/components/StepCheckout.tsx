import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MusicOrder } from '../../lib/types';
import { Zap, Clock, ChevronRight, ShoppingBag } from 'lucide-react';

interface StepCheckoutProps {
  order: MusicOrder;
  onProceedToPayment: (deliveryOption: 'immediate' | 'standard') => void;
}

export default function StepCheckout({ order, onProceedToPayment }: StepCheckoutProps) {
  const [deliveryOption, setDeliveryOption] = useState<'immediate' | 'standard'>('immediate');

  const basePrice = 19.90;
  const immediatePrice = 9.90;
  const total = deliveryOption === 'immediate' ? basePrice + immediatePrice : basePrice;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="font-serif text-2xl text-premium-title font-bold tracking-tight uppercase">
          Finalizar Pedido
        </h3>
        <div className="h-1 w-12 bg-brand-pink mx-auto rounded-full mt-1" />
      </div>

      {/* Delivery Options */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-premium-label uppercase tracking-widest ml-1">
          Opções de Entrega:
        </p>
        
        <div className="grid gap-4">
          {/* Immediate Option */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setDeliveryOption('immediate')}
            className={`relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${
              deliveryOption === 'immediate' 
                ? 'border-brand-pink bg-brand-pink/[0.03] shadow-lg shadow-brand-pink/5' 
                : 'border-premium-border/40 bg-white/40 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  deliveryOption === 'immediate' ? 'bg-brand-pink text-white' : 'bg-premium-border/20 text-premium-label'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-premium-title text-sm">Entrega Imediata</h4>
                  <p className="text-[11px] text-premium-label font-medium">Link enviado em segundos</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-brand-pink">R$ 9,90</span>
              </div>
            </div>
            
            {/* Badge */}
            <div className="absolute -top-3 -right-2 bg-brand-pink text-white text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-sm">
              Mais pedido
            </div>
          </motion.div>

          {/* Standard Option */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setDeliveryOption('standard')}
            className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${
              deliveryOption === 'standard' 
                ? 'border-brand-pink bg-brand-pink/[0.03] shadow-lg shadow-brand-pink/5' 
                : 'border-premium-border/40 bg-white/40 opacity-50 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  deliveryOption === 'standard' ? 'bg-brand-pink text-white' : 'bg-premium-border/20 text-premium-label'
                }`}>
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-premium-title text-sm">Entrega Padrão</h4>
                  <p className="text-[11px] text-premium-label font-medium">Prazo de 3 a 4 horas</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-premium-label">Grátis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-brand-pink/10 p-7 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-pink/5 pb-4">
          <span className="text-[10px] font-bold text-premium-label uppercase tracking-widest">Pedido #{order.id.slice(-6).toUpperCase()}</span>
          <ShoppingBag className="w-4 h-4 text-brand-pink/30" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-premium-label">Música Completa</span>
            <span className="font-bold text-premium-title">R$ 19,90</span>
          </div>
          {deliveryOption === 'immediate' && (
            <div className="flex justify-between text-sm">
              <span className="text-premium-label">Entrega Imediata</span>
              <span className="font-bold text-premium-title">R$ 9,90</span>
            </div>
          )}
          <div className="pt-4 border-t border-brand-pink/10 flex justify-between items-center">
            <span className="text-sm font-bold text-premium-title uppercase">Total</span>
            <span className="text-2xl font-black text-brand-pink">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onProceedToPayment(deliveryOption)}
        className="w-full btn-premium-gradient py-5 rounded-2xl font-bold text-white shadow-xl shadow-brand-pink/20 flex items-center justify-center gap-3 group cursor-pointer"
      >
        <span>Gerar PIX</span>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
}
