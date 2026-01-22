
import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Layout, RefreshCw, Shield, ShieldAlert, Save, PlayCircle, History, X, Users, Settings2, UserRoundPlus, Anchor, Check } from 'lucide-react';
import Court from './components/Court';
import SubGenerator from './components/SubGenerator';
import RosterManager from './components/RosterManager';
import { Player, RotationConfig, Play } from './types';

const INITIAL_PLAYERS: Player[] = [
  // Home Team (1-5)
  { id: 'h1', name: 'Jordan', number: '1', position: { x: 50, y: 75 }, team: 'home', available: true },
  { id: 'h2', name: 'LeBron', number: '2', position: { x: 25, y: 60 }, team: 'home', available: true },
  { id: 'h3', name: 'Steph', number: '3', position: { x: 75, y: 60 }, team: 'home', available: true },
  { id: 'h4', name: 'Kobe', number: '4', position: { x: 35, y: 45 }, team: 'home', available: true },
  { id: 'h5', name: 'Shaq', number: '5', position: { x: 65, y: 45 }, team: 'home', available: true },
  // Away Team (1-5)
  { id: 'a1', name: 'Away 1', number: '1', position: { x: 50, y: 82 }, team: 'away', available: true },
  { id: 'a2', name: 'Away 2', number: '2', position: { x: 29, y: 65 }, team: 'away', available: true },
  { id: 'a3', name: 'Away 3', number: '3', position: { x: 71, y: 65 }, team: 'away', available: true },
  { id: 'a4', name: 'Away 4', number: '4', position: { x: 38, y: 52 }, team: 'away', available: true },
  { id: 'a5', name: 'Away 5', number: '5', position: { x: 62, y: 52 }, team: 'away', available: true },
];

const STORAGE_KEYS = {
  PLAYERS: 'coach_pro_players',
  PLAYS: 'coach_pro_plays',
  DEFAULT_LAYOUT: 'coach_pro_default_layout'
};

const App: React.FC = () => {
  // Persistence Initialization
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [plays, setPlays] = useState<Play[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYS);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'court' | 'subs' | 'roster'>('court');
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');
  const [rotationConfig, setRotationConfig] = useState<RotationConfig>({
    gameMinutes: 20,
    playersOnCourt: 5,
    periodLength: 4
  });

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNum, setNewPlayerNum] = useState('');
  const [isSavingPlay, setIsSavingPlay] = useState(false);
  const [playName, setPlayName] = useState('');
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  // Auto-persist players to local storage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  // Persist plays to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYS, JSON.stringify(plays));
  }, [plays]);

  const handleSaveRoster = () => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  };

  const setAsDefaultLayout = () => {
    setIsSettingDefault(true);
    const layout = players.map(p => ({
      playerId: p.id,
      playerNumber: p.number,
      x: p.position.x,
      y: p.position.y
    }));
    localStorage.setItem(STORAGE_KEYS.DEFAULT_LAYOUT, JSON.stringify(layout));
    setTimeout(() => setIsSettingDefault(false), 2000);
  };

  const addPlayer = (team: 'home' | 'away') => {
    if (newPlayerNum && newPlayerName) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName,
        number: newPlayerNum,
        position: { x: 50, y: 50 },
        team,
        available: true
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setNewPlayerNum('');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, available: !p.available } : p));
  };

  const updatePlayerPosition = useCallback((id: string, x: number, y: number) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, position: { x, y } } : p));
  }, []);

  const saveCurrentPlay = () => {
    if (!playName.trim()) return;
    const newPlay: Play = {
      id: Date.now().toString(),
      name: playName,
      timestamp: Date.now(),
      snapshots: players.map(p => ({ 
        playerId: p.id, 
        playerNumber: p.number, 
        x: p.position.x, 
        y: p.position.y 
      }))
    };
    setPlays([newPlay, ...plays]);
    setPlayName('');
    setIsSavingPlay(false);
  };

  const loadPlay = (play: Play) => {
    const updatedPlayers = players.map(p => {
      const snap = play.snapshots.find(s => s.playerId === p.id) || 
                   play.snapshots.find(s => s.playerNumber === p.number && p.team === (s.playerId.startsWith('h') ? 'home' : 'away'));
      
      if (snap) {
        return { ...p, position: { x: snap.x, y: snap.y } };
      }
      return p;
    });
    setPlayers(updatedPlayers);
  };

  const deletePlay = (id: string) => {
    setPlays(plays.filter(p => p.id !== id));
  };

  const resetCourt = () => {
    const savedLayout = localStorage.getItem(STORAGE_KEYS.DEFAULT_LAYOUT);
    
    if (savedLayout) {
      const layoutData = JSON.parse(savedLayout);
      const updatedPlayers = players.map(p => {
        const snap = layoutData.find((s: any) => s.playerId === p.id) || 
                     layoutData.find((s: any) => s.playerNumber === p.number && p.team === (s.playerId.startsWith('h') ? 'home' : 'away'));
        if (snap) {
          return { ...p, position: { x: snap.x, y: snap.y } };
        }
        return p;
      });
      setPlayers(updatedPlayers);
    } else {
      const homePlayers = players.filter(p => p.team === 'home');
      const awayPlayers = players.filter(p => p.team === 'away');
      
      const newPositions = [
        ...homePlayers.map((p, i) => ({
          ...p,
          position: { x: 20 + (i % 5) * 15, y: 65 + Math.floor(i / 5) * 10 }
        })),
        ...awayPlayers.map((p, i) => ({
          ...p,
          position: { x: 20 + (i % 5) * 15, y: 25 + Math.floor(i / 5) * 10 }
        }))
      ];
      setPlayers(newPositions);
    }
  };

  const homeTeam = players.filter(p => p.team === 'home');
  const awayTeam = players.filter(p => p.team === 'away');
  const availableHomePlayers = homeTeam.filter(p => p.available);

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Layout className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Coach <span className="opacity-40">Pro</span></h1>
          </div>
        </div>
        
        <div className="flex gap-1 bg-zinc-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('court')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'court' ? 'bg-white text-zinc-950 shadow-lg' : 'hover:bg-zinc-700 text-zinc-400'}`}
          >
            Tactics
          </button>
          <button 
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'roster' ? 'bg-white text-zinc-950 shadow-lg' : 'hover:bg-zinc-700 text-zinc-400'}`}
          >
            Roster
          </button>
          <button 
            onClick={() => setActiveTab('subs')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'subs' ? 'bg-white text-zinc-950 shadow-lg' : 'hover:bg-zinc-700 text-zinc-400'}`}
          >
            Rotation
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6 z-10 hidden lg:flex overflow-hidden">
          {activeTab === 'court' ? (
             <div className="flex flex-col h-full overflow-hidden">
               <div className="flex items-center gap-3 mb-6">
                  <History className="w-4 h-4 text-zinc-600" />
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Plays Library</h3>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                  {plays.length === 0 ? (
                    <div className="text-zinc-700 text-[10px] font-black uppercase tracking-widest p-8 border border-zinc-800 rounded-3xl border-dashed text-center">
                      Capture snapshots to build your library
                    </div>
                  ) : (
                    plays.map(play => (
                      <div 
                        key={play.id} 
                        className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-white transition-all shadow-lg active:scale-95"
                        onClick={() => loadPlay(play)}
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePlay(play.id); }}
                          className="absolute top-2 right-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                             <PlayCircle className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-tighter truncate leading-none mb-1">{play.name}</span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(play.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-zinc-800">
                   <div className="flex items-center gap-3 mb-4">
                     <Settings2 className="w-3 h-3 text-zinc-600" />
                     <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Team Display</span>
                   </div>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => setActiveTeam('home')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activeTeam === 'home' ? 'bg-white text-zinc-950 border-white' : 'border-zinc-800 text-zinc-500'}`}
                     >
                       Home
                     </button>
                     <button 
                        onClick={() => setActiveTeam('away')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activeTeam === 'away' ? 'bg-white text-zinc-950 border-white' : 'border-zinc-800 text-zinc-500'}`}
                     >
                       Away
                     </button>
                   </div>
                </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setActiveTeam('home')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider ${activeTeam === 'home' ? 'bg-white text-zinc-950 border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <Shield className="w-3 h-3" /> Home
                </button>
                <button 
                  onClick={() => setActiveTeam('away')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider ${activeTeam === 'away' ? 'bg-white text-zinc-950 border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <ShieldAlert className="w-3 h-3" /> Away
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                  <span>Current Team Roster ({activeTeam === 'home' ? homeTeam.length : awayTeam.length})</span>
                </h2>
                <div className="space-y-3">
                  {(activeTeam === 'home' ? homeTeam : awayTeam).map(p => (
                    <div key={p.id} className={`group border rounded-2xl p-4 flex items-center justify-between transition-all ${p.available ? 'bg-zinc-950/40 border-zinc-800' : 'bg-black/20 border-zinc-900 opacity-40'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${p.team === 'home' ? 'bg-white text-zinc-950 border-zinc-300' : 'bg-zinc-800 text-white border-zinc-600'}`}>
                          {p.number}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold tracking-tight">{p.name}</span>
                          {!p.available && <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Bench / Out</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleAvailability(p.id)}
                        title={p.available ? "Mark as unavailable" : "Mark as available"}
                        className={`p-2 rounded-lg transition-colors ${p.available ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-zinc-700 hover:text-white hover:bg-zinc-800'}`}
                      >
                        <UserRoundPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-zinc-950 flex flex-col p-4 md:p-8 overflow-hidden">
          {activeTab === 'court' && (
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">Whiteboard</h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">Free-form Tactial Planning</p>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center min-h-0 relative">
                <div className="w-full max-h-full aspect-[15/14]">
                  <Court players={players} onPlayerMove={updatePlayerPosition} />
                </div>

                {isSavingPlay && (
                  <div className="absolute inset-0 bg-black/80 z-50 rounded-2xl flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic text-white">Name this Play</h3>
                        <button onClick={() => setIsSavingPlay(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
                      </div>
                      <input 
                        autoFocus
                        placeholder="e.g. Flare Screen Away" 
                        value={playName}
                        onChange={e => setPlayName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveCurrentPlay()}
                        className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl p-4 text-sm font-bold focus:border-white outline-none transition-all placeholder:text-zinc-700 mb-6 text-white"
                      />
                      <button 
                        onClick={saveCurrentPlay}
                        className="w-full bg-white text-zinc-950 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl"
                      >
                        Capture Snapshot
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 shadow-2xl backdrop-blur-md">
                 <div className="flex items-center gap-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-white border border-zinc-400"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Home</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-600"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Away</span>
                        </div>
                    </div>
                    <div className="h-4 w-px bg-zinc-800 hidden md:block"></div>
                    <p className="text-[10px] font-bold text-zinc-700 italic hidden md:block">Drag players to plan moves and screens.</p>
                 </div>

                 <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={setAsDefaultLayout}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-6 py-3 rounded-xl border ${isSettingDefault ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                    >
                      {isSettingDefault ? <><Check className="w-3 h-3" /> Default Set</> : <><Anchor className="w-3 h-3" /> Set Default</>}
                    </button>
                    <button 
                      onClick={resetCourt}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all bg-zinc-800 border border-zinc-700 px-6 py-3 rounded-xl hover:bg-zinc-700"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Court
                    </button>
                    <button 
                      onClick={() => setIsSavingPlay(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.1em] text-zinc-950 transition-all bg-white px-8 py-3 rounded-xl hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                      <Save className="w-4 h-4" /> Save Play
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'roster' && (
            <div className="w-full max-w-4xl mx-auto h-full">
              <RosterManager
                players={players}
                team={activeTeam}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
                onToggleAvailability={toggleAvailability}
                onSaveRoster={handleSaveRoster}
                newName={newPlayerName}
                setNewName={setNewPlayerName}
                newNum={newPlayerNum}
                setNewNum={setNewPlayerNum}
              />
            </div>
          )}

          {activeTab === 'subs' && (
            <div className="w-full max-w-2xl mx-auto h-full overflow-y-auto no-scrollbar py-4">
              <SubGenerator 
                players={availableHomePlayers} 
                config={rotationConfig} 
                onConfigChange={setRotationConfig} 
              />
            </div>
          )}
        </div>
      </main>

      {activeTab === 'roster' && (
        <footer className="lg:hidden bg-zinc-900 border-t border-zinc-800 p-4">
          <div className="flex gap-3">
            <input 
              placeholder="Name" 
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-bold text-white"
            />
            <input 
              placeholder="#" 
              value={newPlayerNum}
              onChange={e => setNewPlayerNum(e.target.value)}
              className="w-16 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-bold text-white"
            />
            <button onClick={() => addPlayer(activeTeam)} className="bg-white text-zinc-950 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
              Add
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
