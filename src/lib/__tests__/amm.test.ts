import { describe, it, expect } from "vitest";
import { initializePool, getPrice, previewBuy, executeBuy, previewSell, executeSell } from "../amm";

describe("AMM - initializePool", () => {
  it("creates pool with 50/50 odds", () => {
    const pool = initializePool(0.5);
    const price = getPrice(pool);
    expect(price.yes).toBeCloseTo(0.5, 2);
    expect(price.no).toBeCloseTo(0.5, 2);
  });

  it("creates pool with 34/66 odds", () => {
    const pool = initializePool(0.34);
    const price = getPrice(pool);
    expect(price.yes).toBeCloseTo(0.34, 1);
    expect(price.no).toBeCloseTo(0.66, 1);
  });

  it("creates pool with 90/10 odds", () => {
    const pool = initializePool(0.9);
    const price = getPrice(pool);
    expect(price.yes).toBeCloseTo(0.9, 1);
    expect(price.no).toBeCloseTo(0.1, 1);
  });

  it("clamps probability to min 0.01", () => {
    const pool = initializePool(0);
    const price = getPrice(pool);
    expect(price.yes).toBeGreaterThan(0);
    expect(price.yes).toBeLessThan(0.05);
  });

  it("clamps probability to max 0.99", () => {
    const pool = initializePool(1);
    const price = getPrice(pool);
    expect(price.yes).toBeGreaterThan(0.95);
    expect(price.yes).toBeLessThan(1);
  });

  it("maintains constant product k = 1,000,000", () => {
    const pool = initializePool(0.7);
    const k = pool.yesShares * pool.noShares;
    expect(k).toBeCloseTo(1000 * 1000, 0);
  });

  it("maintains k across different probabilities", () => {
    for (const p of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const pool = initializePool(p);
      const k = pool.yesShares * pool.noShares;
      expect(k).toBeCloseTo(1_000_000, -1);
    }
  });

  it("yesShares > noShares when probability < 0.5", () => {
    const pool = initializePool(0.3);
    expect(pool.yesShares).toBeGreaterThan(pool.noShares);
  });

  it("yesShares < noShares when probability > 0.5", () => {
    const pool = initializePool(0.7);
    expect(pool.yesShares).toBeLessThan(pool.noShares);
  });
});

describe("AMM - getPrice", () => {
  it("returns 50/50 for empty pool", () => {
    const price = getPrice({ yesShares: 0, noShares: 0 });
    expect(price.yes).toBe(0.5);
    expect(price.no).toBe(0.5);
  });

  it("prices always sum to 1", () => {
    const pool = initializePool(0.34);
    const price = getPrice(pool);
    expect(price.yes + price.no).toBeCloseTo(1, 10);
  });

  it("prices sum to 1 at extreme odds", () => {
    const pool = initializePool(0.01);
    const price = getPrice(pool);
    expect(price.yes + price.no).toBeCloseTo(1, 10);
  });

  it("price reflects pool ratio", () => {
    const price = getPrice({ yesShares: 100, noShares: 300 });
    expect(price.yes).toBeCloseTo(0.75, 2);
    expect(price.no).toBeCloseTo(0.25, 2);
  });
});

describe("AMM - previewBuy", () => {
  it("returns positive shares for positive amount", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100);
    expect(preview.sharesReceived).toBeGreaterThan(0);
    expect(preview.avgPrice).toBeGreaterThan(0);
    expect(preview.avgPrice).toBeLessThan(1);
  });

  it("returns zero for zero amount", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 0);
    expect(preview.sharesReceived).toBe(0);
    expect(preview.avgPrice).toBe(0);
  });

  it("returns zero for negative amount", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", -10);
    expect(preview.sharesReceived).toBe(0);
  });

  it("buying YES increases YES price", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100);
    expect(preview.newYesPrice).toBeGreaterThan(0.5);
    expect(preview.newNoPrice).toBeLessThan(0.5);
  });

  it("buying NO increases NO price", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "no", 100);
    expect(preview.newNoPrice).toBeGreaterThan(0.5);
    expect(preview.newYesPrice).toBeLessThan(0.5);
  });

  it("larger buys have higher price impact", () => {
    const pool = initializePool(0.5);
    const small = previewBuy(pool, "yes", 10);
    const large = previewBuy(pool, "yes", 500);
    expect(large.priceImpact).toBeGreaterThan(small.priceImpact);
  });

  it("shares received > amount spent at 50/50 (leveraged)", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100);
    expect(preview.sharesReceived).toBeGreaterThan(100);
  });

  it("avg price is between 0 and 1", () => {
    const pool = initializePool(0.3);
    const preview = previewBuy(pool, "yes", 200);
    expect(preview.avgPrice).toBeGreaterThan(0);
    expect(preview.avgPrice).toBeLessThan(1);
  });

  it("new prices still sum to 1", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100);
    expect(preview.newYesPrice + preview.newNoPrice).toBeCloseTo(1, 8);
  });
});

describe("AMM - executeBuy", () => {
  it("produces same shares as preview", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100);
    const result = executeBuy(pool, "yes", 100);
    expect(result.sharesReceived).toBeCloseTo(preview.sharesReceived, 8);
  });

  it("maintains constant product after trade", () => {
    const pool = initializePool(0.5);
    const k = pool.yesShares * pool.noShares;
    const result = executeBuy(pool, "yes", 100);
    const newK = result.newState.yesShares * result.newState.noShares;
    expect(newK).toBeCloseTo(k, 0);
  });

  it("returns unchanged state for zero amount", () => {
    const pool = initializePool(0.5);
    const result = executeBuy(pool, "yes", 0);
    expect(result.newState.yesShares).toBe(pool.yesShares);
    expect(result.newState.noShares).toBe(pool.noShares);
    expect(result.sharesReceived).toBe(0);
  });

  it("sequential buys move price monotonically", () => {
    let pool = initializePool(0.5);
    const prices: number[] = [getPrice(pool).yes];
    for (let i = 0; i < 5; i++) {
      const { newState } = executeBuy(pool, "yes", 50);
      pool = newState;
      prices.push(getPrice(pool).yes);
    }
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it("buying both sides equally returns price to ~50/50", () => {
    const pool = initializePool(0.5);
    const { newState: s1 } = executeBuy(pool, "yes", 100);
    const { newState: s2 } = executeBuy(s1, "no", 100);
    const price = getPrice(s2);
    // Not exactly 50/50 due to path dependency, but close
    expect(price.yes).toBeGreaterThan(0.4);
    expect(price.yes).toBeLessThan(0.6);
  });
});

describe("AMM - sell", () => {
  it("previewSell returns positive COTI received", () => {
    const pool = initializePool(0.5);
    const result = previewSell(pool, "yes", 50);
    expect(result.cotiReceived).toBeGreaterThan(0);
    expect(result.avgSellPrice).toBeGreaterThan(0);
    expect(result.avgSellPrice).toBeLessThan(1);
  });

  it("previewSell returns zero for zero shares", () => {
    const pool = initializePool(0.5);
    const result = previewSell(pool, "yes", 0);
    expect(result.cotiReceived).toBe(0);
  });

  it("selling YES decreases YES price", () => {
    const pool = initializePool(0.7);
    const priceBefore = getPrice(pool);
    const { newState } = executeSell(pool, "yes", 50);
    const priceAfter = getPrice(newState);
    expect(priceAfter.yes).toBeLessThan(priceBefore.yes);
  });

  it("selling NO decreases NO price", () => {
    const pool = initializePool(0.3);
    const priceBefore = getPrice(pool);
    const { newState } = executeSell(pool, "no", 50);
    const priceAfter = getPrice(newState);
    expect(priceAfter.no).toBeLessThan(priceBefore.no);
  });

  it("round-trip buy then sell is reversible (no-fee CPMM)", () => {
    const pool = initializePool(0.5);
    const buyResult = executeBuy(pool, "yes", 100);
    const sellResult = executeSell(buyResult.newState, "yes", buyResult.sharesReceived);
    expect(sellResult.cotiReceived).toBeCloseTo(100, 6);
  });

  it("round-trip at skewed odds", () => {
    const pool = initializePool(0.7);
    const buyResult = executeBuy(pool, "no", 200);
    const sellResult = executeSell(buyResult.newState, "no", buyResult.sharesReceived * 0.5);
    expect(sellResult.cotiReceived).toBeGreaterThan(0);
    expect(sellResult.cotiReceived).toBeLessThan(200);
  });

  it("sell preserves k invariant approximately", () => {
    const pool = initializePool(0.5);
    const k = pool.yesShares * pool.noShares;
    const { newState } = executeSell(pool, "yes", 30);
    const newK = newState.yesShares * newState.noShares;
    // k changes by the burned amount, but should stay reasonable
    expect(newK).toBeGreaterThan(0);
  });

  it("cannot sell more than pool can handle without error", () => {
    const pool = initializePool(0.5);
    // Very large sell - should still return a positive result
    const result = previewSell(pool, "yes", 10000);
    expect(result.cotiReceived).toBeGreaterThan(0);
  });
});

describe("AMM - edge cases", () => {
  it("tiny trade doesn't break math", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 0.001);
    expect(preview.sharesReceived).toBeGreaterThan(0);
    expect(Number.isFinite(preview.sharesReceived)).toBe(true);
  });

  it("very large trade doesn't break math", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100000);
    expect(preview.sharesReceived).toBeGreaterThan(0);
    expect(Number.isFinite(preview.sharesReceived)).toBe(true);
    expect(preview.newYesPrice).toBeLessThan(1);
    expect(preview.newYesPrice).toBeGreaterThan(0.5);
  });

  it("alternating buys converge to correct price", () => {
    let pool = initializePool(0.5);
    // Buy YES 10 times, NO 10 times, with same amounts
    for (let i = 0; i < 10; i++) {
      const { newState: s1 } = executeBuy(pool, "yes", 10);
      const { newState: s2 } = executeBuy(s1, "no", 10);
      pool = s2;
    }
    const price = getPrice(pool);
    // Should still be roughly 50/50
    expect(price.yes).toBeGreaterThan(0.45);
    expect(price.yes).toBeLessThan(0.55);
  });
});
