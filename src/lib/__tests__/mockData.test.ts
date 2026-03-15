import { describe, it, expect } from "vitest";
import { formatNumber, daysUntil } from "../mockData";

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
