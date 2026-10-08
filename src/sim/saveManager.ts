import { AirportSimState, createInitialSimState } from './airportState';

const SAVE_KEY = 'airport_boss_2d_save_v1';

export function saveGameState(state: AirportSimState): boolean {
  try {
    const serialized = JSON.stringify({
      ...state,
      // Clear non-persistent active animations or previews
      selectedBuildingDefId: null,
      buildModeActive: false,
    });
    localStorage.setItem(SAVE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save game state to LocalStorage:', err);
    return false;
  }
}

export function loadGameState(): AirportSimState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AirportSimState;
    return parsed;
  } catch (err) {
    console.error('Failed to load game state from LocalStorage:', err);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error('Failed to clear game state:', err);
  }
}
