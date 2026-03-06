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
 * Mint-and-swap model: user mints `amount` complete sets (YES + NO),
 * then swaps the unwanted side into the pool for more of the wanted side.
 * Total shares = amount (minted) + delta (from swap).
 */
export function previewBuy(
  state: AMMState,
  side: BetSide,
  amount: number
): TradePreview {
  if (amount <= 0) return { sharesReceived: 0, avgPrice: 0, priceImpact: 0, newYesPrice: 0.5, newNoPrice: 0.5 };
  const k = state.yesShares * state.noShares;
  if (k <= 0) return { sharesReceived: 0, avgPrice: 0, priceImpact: 0, newYesPrice: 0.5, newNoPrice: 0.5 };
  const oldPrice = getPrice(state);

  let newYes: number, newNo: number, sharesReceived: number;

  if (side === "yes") {
    // Swap amount NO into pool, get delta YES out
    newNo = state.noShares + amount;
    newYes = k / newNo;
    const deltaYes = state.yesShares - newYes;
    sharesReceived = amount + deltaYes; // minted + swapped
  } else {
    // Swap amount YES into pool, get delta NO out
    newYes = state.yesShares + amount;
    newNo = k / newYes;
    const deltaNo = state.noShares - newNo;
    sharesReceived = amount + deltaNo; // minted + swapped
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
 * Uses mint-and-swap: shares = amount (minted) + delta (from swap).
 */
export function executeBuy(
  state: AMMState,
  side: BetSide,
  amount: number
): { newState: AMMState; sharesReceived: number; avgPrice: number } {
  if (amount <= 0) return { newState: state, sharesReceived: 0, avgPrice: 0 };
  const k = state.yesShares * state.noShares;
  if (k <= 0) return { newState: state, sharesReceived: 0, avgPrice: 0 };

  let newYes: number, newNo: number, sharesReceived: number;

  if (side === "yes") {
    newNo = state.noShares + amount;
    newYes = k / newNo;
    sharesReceived = amount + (state.yesShares - newYes);
  } else {
    newYes = state.yesShares + amount;
    newNo = k / newYes;
    sharesReceived = amount + (state.noShares - newNo);
  }

  return {
    newState: { yesShares: newYes, noShares: newNo },
    sharesReceived,
    avgPrice: sharesReceived > 0 ? amount / sharesReceived : 0,
  };
}

/**
 * Solve for COTI received when selling shares (burn-and-swap model).
 * User splits S shares: swap (S - C) into pool for C of the opposite side,
 * then burn C complete sets → C COTI.
 * Quadratic: C² - C·(Y + N + S) + oppositePool·S = 0
 */
function solveSellCoti(yesShares: number, noShares: number, side: BetSide, sharesToSell: number): number {
  const S = sharesToSell;
  const Y = yesShares;
  const N = noShares;
  const opposite = side === "yes" ? N : Y;

  const b = Y + N + S;
  const discriminant = b * b - 4 * opposite * S;
  if (discriminant < 0) return 0;
  return (b - Math.sqrt(discriminant)) / 2;
}

/**
 * Preview selling shares back to the pool.
 * Burn-and-swap: user gets COTI by burning complete sets.
 */
export function previewSell(
  state: AMMState,
  side: BetSide,
  sharesToSell: number
): SellResult {
  if (sharesToSell <= 0) return { cotiReceived: 0, avgSellPrice: 0, priceImpact: 0 };
  const oldPrice = getPrice(state);
  const cotiReceived = solveSellCoti(state.yesShares, state.noShares, side, sharesToSell);
  const avgSellPrice = sharesToSell > 0 ? cotiReceived / sharesToSell : 0;
  const currentPrice = side === "yes" ? oldPrice.yes : oldPrice.no;
  const priceImpact = Math.abs(avgSellPrice - currentPrice);

  return { cotiReceived, avgSellPrice, priceImpact };
}

/**
 * Execute a sell and return the new pool state.
 * Pool absorbs (S - C) shares on the sold side, releases C from the opposite side.
 */
export function executeSell(
  state: AMMState,
  side: BetSide,
  sharesToSell: number
): { newState: AMMState; cotiReceived: number } {
  if (sharesToSell <= 0) return { newState: state, cotiReceived: 0 };
  const cotiReceived = solveSellCoti(state.yesShares, state.noShares, side, sharesToSell);

  let newYes: number, newNo: number;

  if (side === "yes") {
    newYes = state.yesShares + sharesToSell - cotiReceived;
    newNo = state.noShares - cotiReceived;
  } else {
    newYes = state.yesShares - cotiReceived;
    newNo = state.noShares + sharesToSell - cotiReceived;
  }

  return {
    newState: { yesShares: newYes, noShares: newNo },
    cotiReceived,
  };
}
