import { describe, it, expect } from "vitest";
import { mockBets, formatNumber, daysUntil } from "../mockData";

describe("mockData - mockBets", () => {
  it("has 8 markets", () => {
    expect(mockBets).toHaveLength(8);
  });

  it("all markets have unique ids", () => {
    const ids = mockBets.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all markets have yesPercentage 0-100", () => {
    for (const bet of mockBets) {
      expect(bet.yesPercentage).toBeGreaterThanOrEqual(0);
      expect(bet.yesPercentage).toBeLessThanOrEqual(100);
    }
  });

  it("all markets have positive pool size and participants", () => {
    for (const bet of mockBets) {
      expect(bet.poolSize).toBeGreaterThan(0);
      expect(bet.participants).toBeGreaterThan(0);
    }
  });

  it("all markets have future end dates", () => {
    const now = new Date("2026-03-06");
    for (const bet of mockBets) {
      expect(new Date(bet.endsAt).getTime()).toBeGreaterThan(now.getTime());
    }
  });
});

describe("formatNumber", () => {
  it("formats millions", () => {
    expect(formatNumber(1_500_000)).toBe("1.5M");
  });

  it("formats thousands", () => {
    expect(formatNumber(12_847)).toBe("12.8K");
  });

  it("formats small numbers as-is", () => {
    expect(formatNumber(42)).toBe("42");
  });

  it("formats exactly 1000 as K", () => {
    expect(formatNumber(1000)).toBe("1.0K");
  });
});

describe("daysUntil", () => {
  it("returns 0 for past dates", () => {
    expect(daysUntil("2020-01-01")).toBe(0);
  });

  it("returns positive for future dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(daysUntil(future.toISOString())).toBeGreaterThanOrEqual(9);
    expect(daysUntil(future.toISOString())).toBeLessThanOrEqual(11);
  });
});
