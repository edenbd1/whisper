import { AMMState, Position } from "@/types";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

// Scope storage keys to current market contract so redeployments start fresh
const MARKET_KEY = CONTRACT_ADDRESSES.market?.slice(0, 10) || "local";

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

// AMM States (scoped to contract)
export function saveAMMStates(states: Record<string, AMMState>): void {
  safeSet(`whisper_amm_${MARKET_KEY}`, states);
}

export function loadAMMStates(): Record<string, AMMState> | null {
  return safeGet<Record<string, AMMState> | null>(`whisper_amm_${MARKET_KEY}`, null);
}

// Positions (per wallet + contract)
export function savePositions(address: string, positions: Position[]): void {
  safeSet(`whisper_pos_${MARKET_KEY}_${address.toLowerCase()}`, positions);
}

export function loadPositions(address: string): Position[] {
  return safeGet<Position[]>(`whisper_pos_${MARKET_KEY}_${address.toLowerCase()}`, []);
}

// Price history (scoped to contract)
export function savePriceHistory(history: Record<string, number[]>): void {
  safeSet(`whisper_hist_${MARKET_KEY}`, history);
}

export function loadPriceHistory(): Record<string, number[]> | null {
  return safeGet<Record<string, number[]> | null>(`whisper_hist_${MARKET_KEY}`, null);
}