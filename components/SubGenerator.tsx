
import React, { useState, useEffect } from 'react';
import { Player, Shift, RotationConfig } from '../types';
import { generateRotation } from '../utils/subLogic';
import { Users, Clock, AlertCircle, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';

interface SubGeneratorProps {
  players: Player[];
  config: RotationConfig;
  onConfigChange: (config: RotationConfig) => void;
}

const SubGenerator: React.FC<SubGeneratorProps> = ({ players, config, onConfigChange }) => {
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const [calculatedShifts, setCalculatedShifts] = useState<Shift[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Initial calculation on mount if not already done
  useEffect(() => {
    if (!hasCalculated && players.length >= config.playersOnCourt) {
      handleCalculate();
    }
  }, []);

  const handleCalculate = () => {
    const shifts = generateRotation(players, config);
    setCalculatedShifts(shifts);
    setHasCalculated(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    // Allow empty string for better typing experience, but pass 0 to logic 
    // which is now safely handled in utils/subLogic.ts
    onConfigChange({ ...config, [name]: isNaN(numValue) ? 0 : numValue });
  };

  const isInvalid = config.periodLength <= 0 || config.gameMinutes <= 0;
  const isTooManyShifts = !isInvalid && (config.gameMinutes / config.periodLength > 100);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Parameters Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden transition-all">
        <button 
          onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
        >
          <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <Clock className="w-4 h-4 text-white" /> Rotation Parameters
          </h3>
          {isConfigExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>
        
        {isConfigExpanded && (
          <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Game Minutes</label>
                <input
                  type="number"
                  name="gameMinutes"
                  min="1"
                  value={config.gameMinutes === 0 ? '' : config.gameMinutes}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl p-3 text-white text-sm font-bold focus:border-white outline-none transition-all"
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Shift Duration</label>
                <input
                  type="number"
                  name="periodLength"
                  min="1"
                  value={config.periodLength === 0 ? '' : config.periodLength}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl p-3 text-white text-sm font-bold focus:border-white outline-none transition-all"
                  placeholder="4"
                />
              </div>
            </div>

            {/* Recalculate Button Inside Parameters for context */}
            <button 
              onClick={handleCalculate}
              disabled={isInvalid || isTooManyShifts || players.length < config.playersOnCourt}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-white text-zinc-950 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              Calculate Rotation
            </button>
          </div>
        )}
      </div>

      {/* Shifts Display Area */}
      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
        <div className="flex items-center justify-between sticky top-0 bg-zinc-950 py-3 z-10">
          <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <Users className="w-4 h-4 text-white" /> Calculated Shifts
          </h3>
          {hasCalculated && (
             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
               {calculatedShifts.length} Shifts Total
             </span>
          )}
        </div>
        
        {isInvalid ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Invalid Settings</p>
            <p className="text-zinc-700 text-xs mt-2">Enter positive values for minutes and shift duration.</p>
          </div>
        ) : isTooManyShifts ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Too Many Shifts</p>
            <p className="text-zinc-700 text-xs mt-2">The calculated number of shifts is too high. Increase shift duration.</p>
          </div>
        ) : players.length < config.playersOnCourt ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
            <Users className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Insufficient Roster Size</p>
            <p className="text-zinc-700 text-xs mt-2">Add at least {config.playersOnCourt} home players in the sidebar.</p>
          </div>
        ) : !hasCalculated ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
            <RefreshCcw className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Ready to Calculate</p>
            <p className="text-zinc-700 text-xs mt-2">Click the button above to generate the rotation.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {calculatedShifts.map((shift) => (
              <div key={shift.period} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-white font-black text-sm uppercase tracking-tighter italic">
                      {shift.period === 1 ? "Starting 5" : `${(shift.period - 1) * config.periodLength} MIN`}
                    </span>
                  </div>
                  <div className="bg-zinc-800 h-px flex-1 mx-4 opacity-30" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {shift.players.map(pid => {
                    const p = players.find(player => player.id === pid);
                    return (
                      <div key={pid} className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-3 shadow-lg border border-zinc-200">
                        <span className="text-zinc-950 font-black text-sm w-6 text-center border-r border-zinc-200 pr-2">{p?.number}</span>
                        <span className="text-zinc-900 font-bold text-xs uppercase tracking-wider">{p?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubGenerator;
