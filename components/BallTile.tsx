
import React, { useState, useRef, useEffect } from 'react';

interface BallTileProps {
  initialX: number;
  initialY: number;
}

const BallTile: React.FC<BallTileProps> = ({ initialX, initialY }) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const parent = tileRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      setPos({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div
      ref={tileRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className={`absolute w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-100 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl transition-all border-2 border-zinc-950 z-20 touch-none before:content-[''] before:absolute before:-inset-4 before:rounded-full ${isDragging ? 'scale-150' : 'hover:scale-110'}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'radial-gradient(circle, #fff 0%, #a1a1aa 100%)'
      }}
    >
      <div className="w-full h-px bg-zinc-900 absolute rotate-45 opacity-20" />
      <div className="w-full h-px bg-zinc-900 absolute -rotate-45 opacity-20" />
    </div>
  );
};

export default BallTile;
