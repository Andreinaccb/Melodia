import React from 'react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col justify-center text-left py-6 lg:py-12 pr-0 lg:pr-8 max-w-xl"
    >
      {/* Brand Header */}
      <motion.div variants={itemVariants} className="mb-6 lg:mb-10">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] font-bold text-brand-pink-soft/70">
          SUA CANÇÃO
        </span>
        <div className="h-[2px] w-12 bg-gradient-to-r from-brand-pink to-transparent mt-2.5 rounded-full"></div>
      </motion.div>

      {/* Main Headline */}
      <motion.h1 variants={itemVariants} className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] mb-8 tracking-tight">
        Transforme uma <br />
        <motion.span 
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="font-serif italic font-normal text-brand-pink text-glow-rose inline-block"
        >
          história
        </motion.span> especial em uma música <span className="font-serif italic font-normal text-brand-pink text-glow-rose">inesquecível</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p variants={itemVariants} className="text-base sm:text-lg text-text-muted leading-relaxed font-light mb-12 max-w-md">
        Surpreenda quem você ama com essa homenagem única e exclusiva
      </motion.p>

      {/* Benefits List */}
      <motion.ul variants={itemVariants} className="space-y-5 mb-12 sm:mb-16">
        {[
          "Criada com a sua história",
          "Feita para emocionar",
          "Entrega imediata"
        ].map((benefit, i) => (
          <motion.li 
            key={i}
            whileHover={{ x: 5 }}
            className="flex items-center gap-4 text-sm sm:text-base text-text-soft group cursor-default"
          >
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-pink shadow-[0_0_10px_#FF4F8B] group-hover:scale-125 transition-transform"></span>
            <span className="group-hover:text-white transition-colors">{benefit}</span>
          </motion.li>
        ))}
      </motion.ul>

      {/* Social Proof */}
      <motion.div variants={itemVariants} className="flex items-center gap-5 pt-8 border-t border-white/10 relative">
        {/* Subtle glow behind social proof */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex -space-x-3">
          {[
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
          ].map((src, i) => (
            <div 
              key={i}
              className="w-10 h-10 rounded-full border-2 border-[#0D0C1D] overflow-hidden shadow-xl"
            >
              <img 
                src={src} 
                alt="User avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-text-muted font-light">
          <span className="text-brand-pink font-semibold">+1500 canções únicas</span> criadas hoje
        </p>
      </motion.div>
    </motion.div>
  );
}
