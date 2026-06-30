import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  subtitle: string;
}

export default function AudioPlayer({ audioUrl, title, subtitle }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error('[AudioPlayer] Error playing audio:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
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

  const progressPercentage = (currentTime / (duration || 1)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_32px_64px_-16px_rgba(255,79,139,0.15)] transition-all duration-500 hover:shadow-[0_48px_80px_-20px_rgba(255,79,139,0.25)]">
        {/* Progress Bar Background (Subtle Fill) */}
        <div 
          className="absolute inset-0 bg-brand-pink/5 transition-all duration-700 ease-out origin-left pointer-events-none"
          style={{ transform: `scaleX(${currentTime / (duration || 1)})` }}
        />

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />

        <div className="p-5 sm:p-7 relative z-10">
          {/* Top Section: Info & Artwork */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <motion.div 
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-pink to-[#FF8AB3] flex items-center justify-center shadow-lg relative z-20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/5" />
                <Music className="w-6 h-6 text-white" />
                
                {/* Vinyl Texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ background: 'repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(255,255,255,0.4) 3px, transparent 4px)' }} 
                />
              </motion.div>
              
              {/* Pulse effect when playing */}
              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 bg-brand-pink/30 rounded-full z-10"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-w-0 text-left">
              <h4 className="font-serif text-lg text-premium-title font-bold truncate leading-tight">
                {title}
              </h4>
              <p className="text-[13px] text-premium-label font-medium truncate opacity-60 mt-1 uppercase tracking-wider">
                {subtitle}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/80 text-brand-pink/60 hover:text-brand-pink hover:bg-white transition-all cursor-pointer shadow-sm border border-white"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Visualizer Row */}
          <div className="h-10 flex items-center justify-center gap-1 mb-6 px-2 overflow-hidden">
            {[...Array(32)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: isPlaying ? [10, Math.random() * 32 + 8, 10] : 4,
                  opacity: isPlaying ? [0.4, 1, 0.4] : 0.2
                }}
                transition={{ 
                  duration: isPlaying ? 0.6 + Math.random() * 0.4 : 1,
                  repeat: Infinity,
                  delay: i * 0.02
                }}
                className={`w-1 rounded-full ${isPlaying ? 'bg-brand-pink' : 'bg-premium-label'}`}
              />
            ))}
          </div>

          {/* Controls & Progress Section */}
          <div className="space-y-5">
            {/* Custom Progress Bar */}
            <div className="relative group/progress">
              <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-pink to-[#FF8AB3] rounded-full shadow-[0_0_12px_rgba(255,79,139,0.4)]"
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
              
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              <div className="flex justify-between mt-2.5 px-0.5 text-[10px] font-mono font-bold tracking-widest text-premium-label/50 uppercase">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Bottom Row: Play & Volume */}
            <div className="flex items-center justify-between gap-6 pt-1">
              <div className="flex items-center gap-3 w-28 group/vol">
                <button
                  onClick={toggleMute}
                  className="text-premium-label/40 hover:text-brand-pink transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="relative flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-premium-label/20 rounded-full transition-all duration-300"
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(255,79,139,0.4)] cursor-pointer overflow-hidden z-20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-pink to-[#FF3F81]" />
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Pause className="w-7 h-7 text-white fill-current" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="translate-x-0.5"
                    >
                      <Play className="w-7 h-7 text-white fill-current" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="w-28 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.1, color: '#FF4F8B' }}
                  className="text-premium-label/40 transition-colors p-2"
                >
                  <Maximize2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
