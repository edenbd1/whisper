// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { saveAMMStates, loadAMMStates, savePositions, loadPositions, saveHandle, loadHandle, savePriceHistory, loadPriceHistory } from "../storage";

beforeEach(() => {
  localStorage.clear();
});

describe("storage - AMM states", () => {
  it("saves and loads AMM states", () => {
    const states = { "1": { yesShares: 100, noShares: 200 } };
    saveAMMStates(states);
    const loaded = loadAMMStates();
    expect(loaded).toEqual(states);
  });

  it("returns null when nothing stored", () => {
    expect(loadAMMStates()).toBeNull();
  });
});

describe("storage - positions", () => {
  it("saves and loads positions per address", () => {
    const positions = [{ id: "1-yes-1", marketId: "1", side: "yes" as const, shares: 50, totalCost: 25, avgEntryPrice: 0.5, timestamp: Date.now() }];
    savePositions("0xABC", positions);
    const loaded = loadPositions("0xABC");
    expect(loaded).toEqual(positions);
  });

  it("returns empty array for unknown address", () => {
    expect(loadPositions("0xNONE")).toEqual([]);
  });

  it("isolates positions between addresses", () => {
    savePositions("0xA", [{ id: "a", marketId: "1", side: "yes" as const, shares: 10, totalCost: 5, avgEntryPrice: 0.5, timestamp: 1 }]);
    savePositions("0xB", [{ id: "b", marketId: "2", side: "no" as const, shares: 20, totalCost: 10, avgEntryPrice: 0.5, timestamp: 2 }]);
    expect(loadPositions("0xA")).toHaveLength(1);
    expect(loadPositions("0xB")).toHaveLength(1);
    expect(loadPositions("0xA")[0].id).toBe("a");
    expect(loadPositions("0xB")[0].id).toBe("b");
  });

  it("is case-insensitive for addresses", () => {
    savePositions("0xABC", [{ id: "x", marketId: "1", side: "yes" as const, shares: 1, totalCost: 1, avgEntryPrice: 1, timestamp: 1 }]);
    expect(loadPositions("0xabc")).toHaveLength(1);
  });
});

describe("storage - handles", () => {
  it("saves and loads handle", () => {
    saveHandle("0xDEF", "alice");
    expect(loadHandle("0xDEF")).toBe("alice");
  });

  it("returns null for unknown handle", () => {
    expect(loadHandle("0xNONE")).toBeNull();
  });

  it("overwrites existing handle", () => {
    saveHandle("0xDEF", "alice");
    saveHandle("0xDEF", "bob");
    expect(loadHandle("0xDEF")).toBe("bob");
  });
});

describe("storage - price history", () => {
  it("saves and loads price history", () => {
    const history = { "1": [0.5, 0.52, 0.48] };
    savePriceHistory(history);
    const loaded = loadPriceHistory();
    expect(loaded).toEqual(history);
  });

  it("returns null when nothing stored", () => {
    expect(loadPriceHistory()).toBeNull();
  });
});
