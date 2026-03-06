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

  it("clamps extreme probabilities", () => {
    const pool = initializePool(0);
    const price = getPrice(pool);
    expect(price.yes).toBeGreaterThan(0);
    expect(price.yes).toBeLessThan(0.05);
  });

  it("maintains constant product k", () => {
    const pool = initializePool(0.7);
    const k = pool.yesShares * pool.noShares;
    expect(k).toBeCloseTo(1000 * 1000, 0);
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
});

describe("AMM - previewBuy", () => {
  it("returns positive shares for positive amount", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100);
    expect(preview.sharesReceived).toBeGreaterThan(0);
    expect(preview.avgPrice).toBeGreaterThan(0);
    expect(preview.avgPrice).toBeLessThan(1);
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

  it("shares received > amount spent (leveraged via AMM)", () => {
    const pool = initializePool(0.5);
    const preview = previewBuy(pool, "yes", 100);
    // At 50¢, you get ~2x shares (minus slippage)
    expect(preview.sharesReceived).toBeGreaterThan(100);
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
});

describe("AMM - sell", () => {
  it("previewSell returns positive COTI received", () => {
    const pool = initializePool(0.5);
    const result = previewSell(pool, "yes", 50);
    expect(result.cotiReceived).toBeGreaterThan(0);
    expect(result.avgSellPrice).toBeGreaterThan(0);
    expect(result.avgSellPrice).toBeLessThan(1);
  });

  it("selling YES decreases YES price", () => {
    const pool = initializePool(0.7);
    const priceBefore = getPrice(pool);
    const { newState } = executeSell(pool, "yes", 50);
    const priceAfter = getPrice(newState);
    expect(priceAfter.yes).toBeLessThan(priceBefore.yes);
  });

  it("round-trip buy then sell is reversible (no-fee CPMM)", () => {
    const pool = initializePool(0.5);
    const buyResult = executeBuy(pool, "yes", 100);
    const sellResult = executeSell(buyResult.newState, "yes", buyResult.sharesReceived);
    // In a no-fee CPMM, buy+sell of the same shares restores the original state
    expect(sellResult.cotiReceived).toBeCloseTo(100, 6);
  });

  it("round-trip at skewed odds loses to spread", () => {
    const pool = initializePool(0.7);
    const buyResult = executeBuy(pool, "no", 200);
    // Sell fewer shares than received → still profitable
    const sellResult = executeSell(buyResult.newState, "no", buyResult.sharesReceived * 0.5);
    expect(sellResult.cotiReceived).toBeGreaterThan(0);
    expect(sellResult.cotiReceived).toBeLessThan(200);
  });
});
