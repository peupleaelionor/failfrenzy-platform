import { useMemo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  opacity: number;
}

const COLORS = ['#00f0ff', '#ff00ff', '#ffff00', '#ffffff', '#00ff88', '#ffd700'];

export default function StarField({ count = 40 }: { count?: number }) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 5,
      opacity: 0.2 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
            background: star.color,
            boxShadow: `0 0 ${star.size * 3}px ${star.color}`,
            animation: `starTwinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
