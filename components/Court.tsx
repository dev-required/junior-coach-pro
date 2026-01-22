
import React from 'react';
import PlayerTile from './PlayerTile';
import BallTile from './BallTile';
import { Player } from '../types';

interface CourtProps {
  players: Player[];
  onPlayerMove: (id: string, x: number, y: number) => void;
}

const Court: React.FC<CourtProps> = ({ players, onPlayerMove }) => {
  return (
    <div className="relative w-full aspect-[15/14] bg-zinc-950 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] border-4 border-zinc-800">
      {/* Basketball Court SVG Background - Monochrome Style */}
      <svg viewBox="0 0 500 470" className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <rect x="0" y="0" width="500" height="470" fill="none" stroke="white" strokeWidth="2" />
        
        {/* Baseline & Sidelines */}
        <line x1="0" y1="470" x2="500" y2="470" stroke="white" strokeWidth="2" />
        
        {/* Key / Paint */}
        <rect x="170" y="280" width="160" height="190" fill="none" stroke="white" strokeWidth="2" />
        <line x1="170" y1="330" x2="330" y2="330" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Free Throw Circle */}
        <circle cx="250" y="280" r="60" fill="none" stroke="white" strokeWidth="2" />
        
        {/* Three Point Line */}
        <path d="M 30,470 L 30,380 A 220,220 0 0 1 470,380 L 470,470" fill="none" stroke="white" strokeWidth="2" />
        
        {/* Hoop / Backboard */}
        <line x1="220" y1="430" x2="280" y2="430" stroke="white" strokeWidth="2" />
        <circle cx="250" y="415" r="15" fill="none" stroke="white" strokeWidth="2" />
      </svg>

      {/* Modern Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Players Layer */}
      <div className="absolute inset-0">
        {players.map((p) => (
          <PlayerTile
            key={p.id}
            number={p.number}
            initialX={p.position.x}
            initialY={p.position.y}
            team={p.team}
            onPositionChange={(x, y) => onPlayerMove(p.id, x, y)}
          />
        ))}
        {/* Ball Tile */}
        <BallTile initialX={50} initialY={40} />
      </div>
    </div>
  );
};

export default Court;
