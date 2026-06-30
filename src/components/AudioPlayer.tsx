import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music } from 'lucide-react';

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

  useEffect(() => {
    // Reset player states if audioUrl changes
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

  // Generate audio bars for visualizer simulation
  const audioBars = Array.from({ length: 24 });

  return (
    <div className="w-full glass-panel rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/5">
      {/* underlying audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Decorative Glows */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      {/* Title & Track Details */}
      <div className="flex items-center gap-5 mb-8 relative z-10">
        {/* Album Art Representation */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-premium-card-bg flex items-center justify-center shadow-md border border-premium-border/30 group">
          <div className={`w-11 h-11 rounded-full border border-premium-border/50 flex items-center justify-center bg-white text-brand-pink transition-transform duration-[6s] ease-linear shadow-sm ${isPlaying ? 'rotate-360 animate-[spin_6s_infinite_linear]' : ''}`}>
            <Music className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 text-left min-w-0">
          <h4 className="font-serif text-lg text-premium-title font-bold truncate tracking-tight">
            {title}
          </h4>
          <p className="text-sm text-premium-label font-semibold truncate opacity-80 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Visualizer */}
      <div className="h-14 flex items-end justify-between gap-[3px] px-1 mb-6 relative z-10">
        {audioBars.map((_, index) => {
          const delay = (index % 4) * 0.15;
          const randomBaseHeight = 15 + (index % 5) * 8 + (index % 3) * 10;
          return (
            <div
              key={index}
              className={`flex-1 rounded-t-full transition-all duration-300 ${
                isPlaying ? 'bg-brand-pink' : 'bg-premium-border/40'
              }`}
              style={{
                height: isPlaying ? '100%' : '20%',
                maxHeight: `${randomBaseHeight}px`,
                animation: isPlaying ? `bounceVisualizer 1.2s ease-in-out infinite alternate` : 'none',
                animationDelay: `${delay}s`,
                boxShadow: isPlaying ? '0 0 15px rgba(255,79,139,0.2)' : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Progress Slider */}
      <div className="space-y-3 mb-8 relative z-10">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-1.5 bg-premium-border/30 rounded-full appearance-none cursor-pointer accent-brand-pink focus:outline-none select-none transition-all hover:bg-premium-border/50"
          style={{
            background: `linear-gradient(to right, #FF4F8B 0%, #FF4F8B ${(currentTime / (duration || 1)) * 100}%, rgba(243, 214, 228, 0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(243, 214, 228, 0.3) 100%)`
          }}
        />
        <div className="flex justify-between text-[11px] text-premium-label font-mono font-bold tracking-wider">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 w-32">
          <button
            onClick={toggleMute}
            className="text-premium-label hover:text-brand-pink transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-premium-border/30 rounded-full appearance-none cursor-pointer accent-brand-pink focus:outline-none"
            style={{
              background: `linear-gradient(to right, #FF4F8B 0%, #FF4F8B ${(isMuted ? 0 : volume) * 100}%, rgba(243, 214, 228, 0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(243, 214, 228, 0.2) 100%)`
            }}
          />
        </div>

        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full btn-premium-gradient flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl group"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current text-white" />
          ) : (
            <Play className="w-6 h-6 fill-current text-white translate-x-0.5 group-hover:scale-110 transition-transform" />
          )}
        </button>

        <div className="flex justify-end w-32">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="p-2.5 rounded-full bg-white hover:bg-premium-card-bg text-premium-label hover:text-brand-pink transition-all cursor-pointer shadow-sm border border-premium-border/40"
            title="Recomeçar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounceVisualizer {
          0% { height: 15%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
