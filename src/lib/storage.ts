import { AMMState, Position } from "@/types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or blocked
  }
}

// AMM States
export function saveAMMStates(states: Record<string, AMMState>): void {
  safeSet("whisper_amm_states", states);
}

export function loadAMMStates(): Record<string, AMMState> | null {
  const data = safeGet<Record<string, AMMState> | null>("whisper_amm_states", null);
  return data;
}

// Positions (per wallet)
export function savePositions(address: string, positions: Position[]): void {
  safeSet(`whisper_positions_${address.toLowerCase()}`, positions);
}

export function loadPositions(address: string): Position[] {
  return safeGet<Position[]>(`whisper_positions_${address.toLowerCase()}`, []);
}

// Price history (per market)
export function savePriceHistory(history: Record<string, number[]>): void {
  safeSet("whisper_price_history", history);
}

export function loadPriceHistory(): Record<string, number[]> | null {
  return safeGet<Record<string, number[]> | null>("whisper_price_history", null);
}

// Handle (per wallet)
export function saveHandle(address: string, handle: string): void {
  safeSet(`whisper_handle_${address.toLowerCase()}`, handle);
}

export function loadHandle(address: string): string | null {
  return safeGet<string | null>(`whisper_handle_${address.toLowerCase()}`, null);
}
