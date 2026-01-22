
import { Player, Shift, RotationConfig } from '../types';

export function generateRotation(players: Player[], config: RotationConfig): Shift[] {
  const { gameMinutes, playersOnCourt, periodLength } = config;
  
  // Prevent infinite loops if periodLength is 0 or negative
  if (periodLength <= 0 || gameMinutes <= 0 || players.length === 0) {
    return [];
  }

  const totalPeriods = Math.ceil(gameMinutes / periodLength);
  
  // Safety cap to prevent browser hanging if the user enters very small shift lengths (e.g. 0.001)
  if (totalPeriods > 100) {
    return []; 
  }

  const shifts: Shift[] = [];
  
  // Sort players by ID to keep rotation consistent
  const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));
  
  let playerPoolIndex = 0;

  for (let p = 1; p <= totalPeriods; p++) {
    const onCourt: string[] = [];
    for (let i = 0; i < playersOnCourt; i++) {
      onCourt.push(sortedPlayers[playerPoolIndex % sortedPlayers.length].id);
      playerPoolIndex++;
    }
    shifts.push({
      period: p,
      players: onCourt
    });
  }

  return shifts;
}
