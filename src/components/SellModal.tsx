"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Position } from "@/types";
import { useMarket } from "@/context/MarketContext";
import { mockBets } from "@/lib/mockData";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position;
}

export default function SellModal({ isOpen, onClose, position }: SellModalProps) {
  const [sharesToSell, setSharesToSell] = useState<string>(position.shares.toFixed(1));
  const [sold, setSold] = useState(false);
  const { previewSellPosition, sellPosition, getMarketPrice } = useMarket();

  const market = mockBets.find(b => b.id === position.marketId);
  const numShares = parseFloat(sharesToSell) || 0;
  const isYes = position.side === "yes";

  const preview = useMemo(() => {
    if (numShares <= 0 || numShares > position.shares) return null;
    return previewSellPosition(position.marketId, position.side, numShares);
  }, [position, numShares, previewSellPosition]);

  const handleSell = () => {
    if (!preview || numShares <= 0 || numShares > position.shares) return;
    sellPosition(position.marketId, position.side, numShares);
    setSold(true);
  };

  const resetAndClose = () => {
    setSold(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
            onClick={resetAndClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[70] max-w-lg mx-auto"
          >
            <div className="bg-[#0a0a0a] border-t border-white/[0.06] rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="w-10 h-1 bg-white/[0.08] rounded-full mx-auto mb-6" />

              {sold ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#005EF8]/10 flex items-center justify-center mx-auto mb-5 ring-1 ring-[#005EF8]/20">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1.5">Position Sold</h3>
                  <p className="text-sm text-white/30">
                    {numShares.toFixed(1)} shares for {preview?.cotiReceived.toFixed(2)} COTI
                  </p>
                  <button onClick={resetAndClose} className="w-full mt-8 py-3.5 rounded-xl glass text-white/80 text-sm font-semibold hover:bg-white/[0.08] transition-colors btn-press">
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isYes ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/10" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/10"}`}>
                      SELL {isYes ? "YES" : "NO"}
                    </span>
                  </div>

                  {market && (
                    <p className="text-white font-bold text-[15px] mb-5 leading-snug">{market.question}</p>
                  )}

                  <div className="mb-3">
                    <label className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2 block">Shares to sell</label>
                    <input
                      type="number"
                      value={sharesToSell}
                      onChange={(e) => setSharesToSell(e.target.value)}
                      max={position.shares}
                      step="0.1"
                      className="w-full glass rounded-xl px-4 py-3.5 text-xl font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                    />
                    <button
                      onClick={() => setSharesToSell(position.shares.toFixed(1))}
                      className="text-[11px] text-[#005EF8]/60 hover:text-[#005EF8] font-semibold mt-1.5 transition-colors"
                    >
                      Max: {position.shares.toFixed(1)} shares
                    </button>
                  </div>

                  {preview && numShares > 0 && numShares <= position.shares && (
                    <div className="mb-5 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/30">You receive</span>
                        <span className="text-white/70 font-semibold">{preview.cotiReceived.toFixed(3)} COTI</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/30">Avg sell price</span>
                        <span className="text-white/70 font-semibold">{(preview.avgSellPrice * 100).toFixed(1)}¢</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/30">Price impact</span>
                        <span className={`font-semibold ${preview.priceImpact > 0.05 ? "text-red-400" : preview.priceImpact > 0.01 ? "text-yellow-400" : "text-green-400"}`}>
                          {(preview.priceImpact * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSell}
                    disabled={numShares <= 0 || numShares > position.shares}
                    className={`w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 btn-press ${
                      numShares <= 0 || numShares > position.shares
                        ? "bg-white/[0.02] text-white/10 cursor-not-allowed"
                        : "bg-white/[0.08] text-white hover:bg-white/[0.12]"
                    }`}
                  >
                    {numShares <= 0 ? "Enter shares" : numShares > position.shares ? "Exceeds position" : `Sell ${numShares.toFixed(1)} shares`}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
