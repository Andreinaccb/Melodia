import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const BackgroundEffects: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; left: string; delay: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate 15 random particles
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      size: `${Math.random() * 3 + 1}px`,
      duration: `${Math.random() * 20 + 20}s`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      <div className="bg-glow-container" aria-hidden="true">
        {/* Animated Blobs */}
        <div className="blob blob-rose"></div>
        <div className="blob blob-purple"></div>
        
        {/* Subtle radial center light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,79,139,0.03)_0%,transparent_70%)]"></div>
      </div>

      <div className="particles-container" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              bottom: '-20px',
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          ></div>
        ))}
      </div>
    </>
  );
};
