"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { useMarket } from "@/context/MarketContext";
import { mockBets, formatNumber } from "@/lib/mockData";
import { Position, BetSide } from "@/types";
import { shortenAddress } from "@/lib/coti";
import SellModal from "./SellModal";

export default function PortfolioView({ handle }: { handle: string | null }) {
  const { address, isConnected } = useWallet();
  const { positions, getPositionPnL, getMarketPrice } = useMarket();
  const [sellTarget, setSellTarget] = useState<Position | null>(null);

  // Aggregate positions by market+side
  const aggregated = useMemo(() => {
    const map = new Map<string, { marketId: string; side: BetSide; shares: number; totalCost: number }>();
    for (const pos of positions) {
      const key = `${pos.marketId}-${pos.side}`;
      const existing = map.get(key);
      if (existing) {
        existing.shares += pos.shares;
        existing.totalCost += pos.totalCost;
      } else {
        map.set(key, { marketId: pos.marketId, side: pos.side, shares: pos.shares, totalCost: pos.totalCost });
      }
    }
    return Array.from(map.values());
  }, [positions]);

  const summary = useMemo(() => {
    let totalValue = 0, totalCost = 0;
    for (const pos of aggregated) {
      const price = getMarketPrice(pos.marketId);
      const currentPrice = pos.side === "yes" ? price.yes : price.no;
      totalValue += pos.shares * currentPrice;
      totalCost += pos.totalCost;
    }
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalPnL, totalPnLPercent, count: aggregated.length };
  }, [aggregated, getMarketPrice]);

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-20">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">Connect wallet to view portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 lg:pb-8">
      <div className="max-w-lg mx-auto px-5 pt-20 lg:pt-8">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center ring-2 ring-white/[0.06]">
            <span className="text-lg font-bold text-white">
              {(handle || address?.slice(2, 4) || "??").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            {handle ? (
              <>
                <h2 className="text-lg font-bold text-white">{handle}<span className="text-white/20">.whisper</span></h2>
                <p className="text-xs text-white/30">{address ? shortenAddress(address) : ""}</p>
              </>
            ) : (
              <h2 className="text-lg font-bold text-white/70">{address ? shortenAddress(address) : ""}</h2>
            )}
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="glass rounded-2xl p-5 mb-6">
          <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold mb-1">Portfolio Value</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">{summary.totalValue.toFixed(2)}</span>
            <span className="text-sm text-white/30 font-medium">COTI</span>
          </div>
          {summary.count > 0 && (
            <div className={`flex items-center gap-1.5 mt-2 text-sm font-semibold ${summary.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
              <span>{summary.totalPnL >= 0 ? "+" : ""}{summary.totalPnL.toFixed(2)} COTI</span>
              <span className="text-white/20">·</span>
              <span>{summary.totalPnL >= 0 ? "+" : ""}{summary.totalPnLPercent.toFixed(1)}%</span>
            </div>
          )}
          <p className="text-[11px] text-white/20 mt-2">{summary.count} active position{summary.count !== 1 ? "s" : ""}</p>
        </div>

        {/* Positions list */}
        {aggregated.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/20 text-sm mb-1">No positions yet</p>
            <p className="text-white/10 text-xs">Swipe through markets and place bets to build your portfolio</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Positions</h3>
            <AnimatePresence>
              {aggregated.map((pos) => {
                const market = mockBets.find(b => b.id === pos.marketId);
                if (!market) return null;
                const price = getMarketPrice(pos.marketId);
                const currentPrice = pos.side === "yes" ? price.yes : price.no;
                const currentValue = pos.shares * currentPrice;
                const pnl = currentValue - pos.totalCost;
                const pnlPercent = pos.totalCost > 0 ? (pnl / pos.totalCost) * 100 : 0;

                return (
                  <motion.div
                    key={`${pos.marketId}-${pos.side}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-semibold text-white/80 truncate">{market.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pos.side === "yes" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {pos.side.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-white/25">{pos.shares.toFixed(1)} shares</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white/80">{currentValue.toFixed(2)}</p>
                        <p className={`text-[11px] font-semibold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} ({pnlPercent.toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/20">
                      <span>Entry {(pos.totalCost / pos.shares * 100).toFixed(0)}¢ · Now {Math.round(currentPrice * 100)}¢</span>
                      <button
                        onClick={() => setSellTarget({ id: `${pos.marketId}-${pos.side}`, marketId: pos.marketId, side: pos.side, shares: pos.shares, totalCost: pos.totalCost, avgEntryPrice: pos.totalCost / pos.shares, timestamp: Date.now() })}
                        className="px-3 py-1 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-colors font-semibold"
                      >
                        Sell
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {sellTarget && (
        <SellModal
          isOpen={!!sellTarget}
          onClose={() => setSellTarget(null)}
          position={sellTarget}
        />
      )}
    </div>
  );
}
