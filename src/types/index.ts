export interface Bet {
  id: string;
  question: string;
  category: string;
  image: string;
  yesPercentage: number;
  poolSize: number;
  participants: number;
  endsAt: string;
  trending: number | null;
  isLive: boolean;
  description?: string;
}

export type BetSide = "yes" | "no";

export interface UserBet {
  betId: string;
  side: BetSide;
  amount: number;
  timestamp: number;
}

// AMM types
export interface AMMState {
  yesShares: number;
  noShares: number;
}

export interface MarketPrice {
  yes: number; // 0-1
  no: number;  // 0-1
}

export interface TradePreview {
  sharesReceived: number;
  avgPrice: number;
  priceImpact: number;
  newYesPrice: number;
  newNoPrice: number;
}

export interface SellResult {
  cotiReceived: number;
  avgSellPrice: number;
  priceImpact: number;
}

// Position types
export interface Position {
  id: string;
  marketId: string;
  side: BetSide;
  shares: number;
  totalCost: number;
  avgEntryPrice: number;
  timestamp: number;
  txHash?: string;
}

export interface PnLInfo {
  currentValue: number;
  costBasis: number;
  unrealizedPnL: number;
  percentChange: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  positionCount: number;
}
