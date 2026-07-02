import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  subtitle: string;
  isFullVersion?: boolean;
}

export default function AudioPlayer({ audioUrl, title, subtitle, isFullVersion = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [showLimitError, setShowLimitError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayCount(0);
    setShowLimitError(false);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Preview restrictions
      if (!isFullVersion) {
        // 50 seconds limit reached or ended
        const isAtEnd = audioRef.current.currentTime >= 50 || audioRef.current.ended;
        
        // Check limit before playing
        if (isAtEnd && playCount >= 2) {
          setShowLimitError(true);
          return;
        }

        // If at end, reset to start
        if (isAtEnd) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }

        // If starting fresh or from end, increment count
        if (audioRef.current.currentTime === 0) {
          if (playCount >= 2) {
            setShowLimitError(true);
            return;
          }
          setPlayCount(prev => prev + 1);
        }
      }

      audioRef.current.play().catch((err) => {
        console.error('[AudioPlayer] Error playing audio:', err);
      });
      setIsPlaying(true);
      setShowLimitError(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    
    // 50 seconds preview limit
    if (!isFullVersion && time >= 50) {
      audioRef.current.pause();
      audioRef.current.currentTime = 50;
      setIsPlaying(false);
      setCurrentTime(50);
      return;
    }
    
    setCurrentTime(time);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    // Cap duration at 50 seconds for preview display
    setDuration(isFullVersion ? audioRef.current.duration : Math.min(audioRef.current.duration, 50));
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const maxTime = isFullVersion ? audioRef.current.duration : 50;
    const newTime = Math.min(parseFloat(e.target.value), maxTime);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    audioRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalDuration = isFullVersion ? duration : (duration || 50);
  const progressPercentage = (currentTime / totalDuration) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-white/30 backdrop-blur-2xl border border-white/50 shadow-[0_24px_48px_-12px_rgba(255,79,139,0.12)]">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />

        <div className="p-8 relative z-10 flex flex-col items-center">
          {/* Visualizer - Minimalist Bars */}
          <div className="h-12 flex items-end justify-center gap-1.5 mb-8 w-full px-4">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: isPlaying ? [8, Math.random() * 32 + 8, 8] : 6,
                  opacity: isPlaying ? [0.3, 0.8, 0.3] : 0.2
                }}
                transition={{ 
                  duration: isPlaying ? 0.5 + Math.random() * 0.5 : 1,
                  repeat: Infinity,
                  delay: i * 0.03
                }}
                className={`w-1.5 rounded-full ${isPlaying ? 'bg-brand-pink' : 'bg-premium-label'}`}
              />
            ))}
          </div>

          {/* Main Control: Play/Pause with Circle Progress */}
          <div className="relative mb-8 group/play">
            {/* Rotating Outer Ring */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                className="text-black/5"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray="364.4"
                animate={{ strokeDashoffset: 364.4 - (364.4 * progressPercentage) / 100 }}
                transition={{ duration: 0.1, ease: "linear" }}
                className="text-brand-pink"
              />
            </svg>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-pink to-[#FF3F81] text-white shadow-lg shadow-brand-pink/30 cursor-pointer z-20"
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Pause className="w-8 h-8 fill-current" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="translate-x-1"
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Info Section */}
          <div className="text-center mb-8">
            <h4 className="font-serif text-xl text-premium-title font-bold leading-tight mb-1">
              {title}
            </h4>
            <p className="text-[12px] text-premium-label/60 font-medium uppercase tracking-[0.2em]">
              {subtitle}
            </p>
          </div>

          {/* Limit Message */}
          <AnimatePresence>
            {showLimitError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-6 p-4 rounded-2xl bg-brand-pink/10 border border-brand-pink/20 text-center"
              >
                <p className="text-xs font-bold text-brand-pink leading-relaxed">
                  Limite de reproduções excedido.<br/>
                  <span className="font-normal opacity-80">Baixe a música para continuar ouvindo a versão completa.</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Time & Volume Minimalist Controls */}
          <div className="w-full flex items-center justify-between gap-6 px-2">
            <div className="text-[10px] font-mono font-bold text-premium-label/40 tracking-widest">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>

            <div className="flex items-center gap-3 group/vol">
              <button
                onClick={toggleMute}
                className="text-premium-label/40 hover:text-brand-pink transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="w-16 h-1 bg-black/5 rounded-full relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-brand-pink/40"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="text-premium-label/40 hover:text-brand-pink transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Subtle Bottom Progress Strip */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/5 overflow-hidden">
          <motion.div 
            className="h-full bg-brand-pink/20"
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </div>
      
      {/* Version Tag */}
      <div className="mt-4 text-center">
        {isFullVersion ? (
          <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            Versão Completa Liberada
          </span>
        ) : (
          <span className="text-[10px] font-bold text-brand-pink/60 uppercase tracking-widest px-3 py-1 rounded-full bg-brand-pink/5 border border-brand-pink/10">
            Versão de Prévia • 50 Segundos
          </span>
        )}
      </div>
    </motion.div>
  );
}
