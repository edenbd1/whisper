"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { fetchMarketsFromChain } from "@/lib/chain";
import { initializePool, getPrice, executeBuy, previewBuy, previewSell, executeSell as ammExecuteSell } from "@/lib/amm";
import { saveAMMStates, loadAMMStates, savePositions, loadPositions, savePriceHistory, loadPriceHistory } from "@/lib/storage";
import { AMMState, Bet, BetSide, MarketPrice, Position, TradePreview, SellResult, PnLInfo } from "@/types";
import { useWallet } from "./WalletContext";

interface MarketContextType {
  markets: Bet[];
  loading: boolean;
  getMarketPrice: (marketId: string) => MarketPrice;
  previewTrade: (marketId: string, side: BetSide, amount: number) => TradePreview;
  executeTrade: (marketId: string, side: BetSide, amount: number, txHash?: string) => void;
  previewSellPosition: (marketId: string, side: BetSide, shares: number) => SellResult;
  sellPosition: (marketId: string, side: BetSide, shares: number) => void;
  positions: Position[];
  getPositionPnL: (position: Position) => PnLInfo;
  getPriceHistory: (marketId: string) => number[];
  refreshMarkets: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | null>(null);

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be inside MarketProvider");
  return ctx;
}

function buildPools(bets: Bet[]): Record<string, AMMState> {
  const pools: Record<string, AMMState> = {};
  for (const bet of bets) {
    pools[bet.id] = initializePool(bet.yesPercentage / 100);
  }
  return pools;
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const [markets, setMarkets] = useState<Bet[]>([]);
  const [ammStates, setAmmStates] = useState<Record<string, AMMState>>({});
  const [positions, setPositions] = useState<Position[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);

  // Fetch markets from chain on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const chainMarkets = await fetchMarketsFromChain();
        if (cancelled || chainMarkets.length === 0) return;
        setMarkets(chainMarkets);
        initPools(chainMarkets);
        initHistory(chainMarkets);
      } catch {
        // Chain unavailable
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function initPools(bets: Bet[]) {
      const stored = loadAMMStates();
      // Use stored AMM states if keys match current market IDs
      if (stored && bets.every((b) => b.id in stored)) {
        setAmmStates(stored);
        return;
      }
      setAmmStates(buildPools(bets));
    }

    function initHistory(bets: Bet[]) {
      const stored = loadPriceHistory();
      if (stored && Object.keys(stored).length > 0) {
        setPriceHistory(stored);
        return;
      }
      // Initialize with a single price point per market (actual probability)
      const history: Record<string, number[]> = {};
      for (const bet of bets) {
        history[bet.id] = [bet.yesPercentage / 100];
      }
      setPriceHistory(history);
    }

    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load positions when wallet changes
  useEffect(() => {
    if (address) {
      setPositions(loadPositions(address));
    } else {
      setPositions([]);
    }
  }, [address]);

  // Persist AMM states
  useEffect(() => {
    if (Object.keys(ammStates).length > 0) {
      saveAMMStates(ammStates);
    }
  }, [ammStates]);

  // Persist positions
  useEffect(() => {
    if (address && positions.length > 0) {
      savePositions(address, positions);
    }
  }, [address, positions]);

  // Persist price history
  useEffect(() => {
    if (Object.keys(priceHistory).length > 0) {
      savePriceHistory(priceHistory);
    }
  }, [priceHistory]);

  // Refresh markets from chain (call after trades / market creation)
  const refreshMarkets = useCallback(async () => {
    try {
      const chainMarkets = await fetchMarketsFromChain();
      if (chainMarkets.length === 0) return;
      setMarkets(chainMarkets);
      // Reinitialize AMM pools from on-chain probabilities
      setAmmStates(buildPools(chainMarkets));
    } catch {
      // Keep current state on error
    }
  }, []);

  const getMarketPrice = useCallback((marketId: string): MarketPrice => {
    const state = ammStates[marketId];
    if (!state) return { yes: 0.5, no: 0.5 };
    return getPrice(state);
  }, [ammStates]);

  const previewTrade = useCallback((marketId: string, side: BetSide, amount: number): TradePreview => {
    const state = ammStates[marketId];
    if (!state) return { sharesReceived: 0, avgPrice: 0, priceImpact: 0, newYesPrice: 0.5, newNoPrice: 0.5 };
    return previewBuy(state, side, amount);
  }, [ammStates]);

  const executeTrade = useCallback((marketId: string, side: BetSide, amount: number, txHash?: string) => {
    setAmmStates(prev => {
      const state = prev[marketId];
      if (!state) return prev;
      const { newState, sharesReceived, avgPrice } = executeBuy(state, side, amount);

      // Add position
      const newPosition: Position = {
        id: `${marketId}-${side}-${Date.now()}`,
        marketId,
        side,
        shares: sharesReceived,
        totalCost: amount,
        avgEntryPrice: avgPrice,
        timestamp: Date.now(),
        txHash,
      };
      setPositions(prev => [...prev, newPosition]);

      // Record price point
      const newPrice = getPrice(newState);
      setPriceHistory(prev => ({
        ...prev,
        [marketId]: [...(prev[marketId] || []), newPrice.yes],
      }));

      return { ...prev, [marketId]: newState };
    });
  }, []);

  const previewSellPosition = useCallback((marketId: string, side: BetSide, shares: number): SellResult => {
    const state = ammStates[marketId];
    if (!state) return { cotiReceived: 0, avgSellPrice: 0, priceImpact: 0 };
    return previewSell(state, side, shares);
  }, [ammStates]);

  const sellPosition = useCallback((marketId: string, side: BetSide, shares: number) => {
    setAmmStates(prev => {
      const state = prev[marketId];
      if (!state) return prev;
      const { newState } = ammExecuteSell(state, side, shares);

      // Remove/reduce positions
      setPositions(prevPositions => {
        let remaining = shares;
        return prevPositions.reduce<Position[]>((acc, pos) => {
          if (pos.marketId === marketId && pos.side === side && remaining > 0) {
            if (pos.shares <= remaining) {
              remaining -= pos.shares;
              return acc;
            } else {
              const toSell = remaining;
              const fraction = toSell / pos.shares;
              remaining = 0;
              return [...acc, {
                ...pos,
                shares: pos.shares - toSell,
                totalCost: pos.totalCost * (1 - fraction),
              }];
            }
          }
          return [...acc, pos];
        }, []);
      });

      return { ...prev, [marketId]: newState };
    });
  }, []);

  const getPriceHistory = useCallback((marketId: string): number[] => {
    return priceHistory[marketId] || [];
  }, [priceHistory]);

  const getPositionPnL = useCallback((position: Position): PnLInfo => {
    const price = getMarketPrice(position.marketId);
    const currentPrice = position.side === "yes" ? price.yes : price.no;
    const currentValue = position.shares * currentPrice;
    const costBasis = position.totalCost;
    const unrealizedPnL = currentValue - costBasis;
    const percentChange = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;
    return { currentValue, costBasis, unrealizedPnL, percentChange };
  }, [getMarketPrice]);

  return (
    <MarketContext.Provider value={{
      markets,
      loading,
      getMarketPrice,
      previewTrade,
      executeTrade,
      previewSellPosition,
      sellPosition,
      positions,
      getPositionPnL,
      getPriceHistory,
      refreshMarkets,
    }}>
      {children}
    </MarketContext.Provider>
  );
}
