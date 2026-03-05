import { AMMState, MarketPrice, TradePreview, SellResult, BetSide } from "@/types";

const INITIAL_LIQUIDITY = 1000;

/**
 * Initialize AMM pool from an initial yes probability (0-1).
 * Sets shares so that yesShares * noShares = INITIAL_LIQUIDITY^2
 * and price_yes = p.
 */
export function initializePool(yesProbability: number): AMMState {
  const p = Math.max(0.01, Math.min(0.99, yesProbability));
  const yesShares = INITIAL_LIQUIDITY * Math.sqrt((1 - p) / p);
  const noShares = INITIAL_LIQUIDITY * Math.sqrt(p / (1 - p));
  return { yesShares, noShares };
}

/**
 * Get current prices from pool state.
 * price_yes = noShares / (yesShares + noShares)
 */
export function getPrice(state: AMMState): MarketPrice {
  const total = state.yesShares + state.noShares;
  if (total === 0) return { yes: 0.5, no: 0.5 };
  return {
    yes: state.noShares / total,
    no: state.yesShares / total,
  };
}

/**
 * Preview buying shares on a given side.
 * CPMM: when buying YES, user adds COTI to the NO pool, and receives YES shares.
 * Invariant: yesShares * noShares = k (constant)
 */
export function previewBuy(
  state: AMMState,
  side: BetSide,
  amount: number
): TradePreview {
  const k = state.yesShares * state.noShares;
  const oldPrice = getPrice(state);

  let newYes: number, newNo: number, sharesReceived: number;

  if (side === "yes") {
    // Buying YES: add amount to NO pool, remove YES from pool
    newNo = state.noShares + amount;
    newYes = k / newNo;
    sharesReceived = state.yesShares - newYes;
  } else {
    // Buying NO: add amount to YES pool, remove NO from pool
    newYes = state.yesShares + amount;
    newNo = k / newYes;
    sharesReceived = state.noShares - newNo;
  }

  const newState = { yesShares: newYes, noShares: newNo };
  const newPrice = getPrice(newState);
  const avgPrice = sharesReceived > 0 ? amount / sharesReceived : 0;
  const priceImpact = side === "yes"
    ? Math.abs(newPrice.yes - oldPrice.yes)
    : Math.abs(newPrice.no - oldPrice.no);

  return {
    sharesReceived,
    avgPrice,
    priceImpact,
    newYesPrice: newPrice.yes,
    newNoPrice: newPrice.no,
  };
}

/**
 * Execute a buy and return the new pool state.
 */
export function executeBuy(
  state: AMMState,
  side: BetSide,
  amount: number
): { newState: AMMState; sharesReceived: number; avgPrice: number } {
  const k = state.yesShares * state.noShares;

  let newYes: number, newNo: number, sharesReceived: number;

  if (side === "yes") {
    newNo = state.noShares + amount;
    newYes = k / newNo;
    sharesReceived = state.yesShares - newYes;
  } else {
    newYes = state.yesShares + amount;
    newNo = k / newYes;
    sharesReceived = state.noShares - newNo;
  }

  return {
    newState: { yesShares: newYes, noShares: newNo },
    sharesReceived,
    avgPrice: sharesReceived > 0 ? amount / sharesReceived : 0,
  };
}

/**
 * Preview selling shares back to the pool.
 * Selling YES: add YES shares back, receive COTI from NO pool.
 */
export function previewSell(
  state: AMMState,
  side: BetSide,
  sharesToSell: number
): SellResult {
  const k = state.yesShares * state.noShares;
  const oldPrice = getPrice(state);

  let cotiReceived: number;

  if (side === "yes") {
    const newYes = state.yesShares + sharesToSell;
    const newNo = k / newYes;
    cotiReceived = state.noShares - newNo;
  } else {
    const newNo = state.noShares + sharesToSell;
    const newYes = k / newNo;
    cotiReceived = state.yesShares - newYes;
  }

  const avgSellPrice = sharesToSell > 0 ? cotiReceived / sharesToSell : 0;
  const currentPrice = side === "yes" ? oldPrice.yes : oldPrice.no;
  const priceImpact = Math.abs(avgSellPrice - currentPrice);

  return { cotiReceived, avgSellPrice, priceImpact };
}

/**
 * Execute a sell and return the new pool state.
 */
export function executeSell(
  state: AMMState,
  side: BetSide,
  sharesToSell: number
): { newState: AMMState; cotiReceived: number } {
  const k = state.yesShares * state.noShares;

  let newYes: number, newNo: number, cotiReceived: number;

  if (side === "yes") {
    newYes = state.yesShares + sharesToSell;
    newNo = k / newYes;
    cotiReceived = state.noShares - newNo;
  } else {
    newNo = state.noShares + sharesToSell;
    newYes = k / newNo;
    cotiReceived = state.yesShares - newYes;
  }

  return {
    newState: { yesShares: newYes, noShares: newNo },
    cotiReceived,
  };
}
