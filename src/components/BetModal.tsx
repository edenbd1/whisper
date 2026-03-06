"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BetSide } from "@/types";
import { useWallet } from "@/context/WalletContext";
import { useMarket } from "@/context/MarketContext";
import { CONTRACT_ADDRESSES, CUSDC_ABI, WISPR_MARKET_ABI } from "@/lib/contracts";
import { getExplorerTxUrl } from "@/lib/coti";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  side: BetSide;
  question: string;
  marketId?: number;
  onConfirm: () => void;
}

const presetAmounts = [10, 50, 100, 500];

type TxState = "idle" | "pending" | "success" | "error";

export default function BetModal({ isOpen, onClose, side, question, marketId, onConfirm }: BetModalProps) {
  const [amount, setAmount] = useState<string>("50");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const { isConnected, signer, connect } = useWallet();
  const { previewTrade, executeTrade, getMarketPrice } = useMarket();

  const isYes = side === "yes";
  const numAmount = parseFloat(amount) || 0;
  const betId = String((marketId ?? 0) + 1);

  const currentPrice = getMarketPrice(betId);
  const preview = useMemo(() => {
    if (numAmount <= 0) return null;
    return previewTrade(betId, side, numAmount);
  }, [betId, side, numAmount, previewTrade]);

  const handleBet = async () => {
    if (!isConnected || !signer) { await connect(); return; }
    if (numAmount <= 0) return;

    if (!CONTRACT_ADDRESSES.market || !CONTRACT_ADDRESSES.token) {
      // No contract deployed - simulate locally
      executeTrade(betId, side, numAmount);
      onConfirm();
      setTxState("success");
      return;
    }

    setTxState("pending");
    setError("");
    try {
      const { Contract } = await import("@coti-io/coti-ethers");
      const amountRaw = BigInt(Math.round(numAmount * 1e6)); // 6 decimals
      const tokenContract = new Contract(CONTRACT_ADDRESSES.token, CUSDC_ABI, signer);

      // 1. Approve market to spend cUSDC (max uint64, only if not already approved)
      const approvedKey = `approved-${CONTRACT_ADDRESSES.market}`;
      if (!localStorage.getItem(approvedKey)) {
        const maxUint64 = BigInt("18446744073709551615");
        const approveTx = await tokenContract.approvePublic(CONTRACT_ADDRESSES.market, maxUint64, { gasLimit: 500_000 });
        await approveTx.wait();
        localStorage.setItem(approvedKey, "1");
      }

      // 2. Place bet
      const marketContract = new Contract(CONTRACT_ADDRESSES.market, WISPR_MARKET_ABI, signer);
      const tx = await marketContract.bet(marketId ?? 0, isYes, amountRaw, { gasLimit: 1_000_000 });
      setTxHash(tx.hash);
      await tx.wait();
      executeTrade(betId, side, numAmount, tx.hash);
      setTxState("success");
      onConfirm();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Transaction failed");
      setTxState("error");
    }
  };

  const resetAndClose = () => {
    setTxState("idle");
    setTxHash("");
    setError("");
    onClose();
  };

  const sidePrice = isYes ? currentPrice.yes : currentPrice.no;

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

              {txState === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#005EF8]/10 flex items-center justify-center mx-auto mb-5 ring-1 ring-[#005EF8]/20">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1.5">Position Opened</h3>
                  <p className="text-sm text-white/30 mb-1">
                    {preview ? `${preview.sharesReceived.toFixed(1)} shares` : `${numAmount} cUSDC`} on <span className={isYes ? "text-green-400" : "text-red-400"}>{isYes ? "YES" : "NO"}</span>
                  </p>
                  <p className="text-xs text-white/20 mb-5">
                    Avg price: {preview ? `${(preview.avgPrice * 100).toFixed(1)}¢` : `${Math.round(sidePrice * 100)}¢`}
                  </p>
                  {txHash && (
                    <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                      className="text-[#005EF8]/60 text-xs hover:text-[#005EF8] transition-colors underline decoration-[#005EF8]/20 underline-offset-2">
                      View on CotiScan
                    </a>
                  )}
                  <button onClick={resetAndClose} className="w-full mt-8 py-3.5 rounded-xl glass text-white/80 text-sm font-semibold hover:bg-white/[0.08] transition-colors btn-press">
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Side indicator */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      isYes ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/10" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/10"
                    }`}>
                      {isYes ? "YES" : "NO"} · {Math.round(sidePrice * 100)}¢
                    </span>
                    <div className="flex items-center gap-1.5 text-white/20">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="text-[11px] font-medium">Confidential</span>
                    </div>
                  </div>

                  <p className="text-white font-bold text-[16px] mb-5 leading-snug tracking-[-0.01em]">{question}</p>

                  {/* Amount input */}
                  <div className="relative mb-3">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full glass rounded-xl px-4 py-4 text-2xl font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/15 text-sm font-semibold">cUSDC</span>
                  </div>

                  {/* Presets */}
                  <div className="flex gap-2 mb-4">
                    {presetAmounts.map((p) => (
                      <button
                        key={p}
                        onClick={() => setAmount(p.toString())}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all btn-press ${
                          amount === p.toString()
                            ? "glass text-white ring-1 ring-white/10"
                            : "bg-white/[0.02] text-white/25 hover:bg-white/[0.04] hover:text-white/40"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Price impact preview */}
                  {preview && numAmount > 0 && (
                    <div className="mb-4 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/30">Shares received</span>
                        <span className="text-white/70 font-semibold">{preview.sharesReceived.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/30">Avg price</span>
                        <span className="text-white/70 font-semibold">{(preview.avgPrice * 100).toFixed(1)}¢</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/30">Price impact</span>
                        <span className={`font-semibold ${preview.priceImpact > 0.05 ? "text-red-400" : preview.priceImpact > 0.01 ? "text-yellow-400" : "text-green-400"}`}>
                          {(preview.priceImpact * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/30">New price</span>
                        <span className="text-white/70 font-semibold">
                          {isYes ? Math.round(preview.newYesPrice * 100) : Math.round(preview.newNoPrice * 100)}¢
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Privacy note */}
                  <div className="flex items-center gap-2.5 mb-5 px-3 py-2.5 rounded-xl bg-[#005EF8]/[0.03] border border-[#005EF8]/[0.06]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 opacity-60">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-[11px] text-white/20 leading-relaxed">Encrypted on COTI. Your position stays confidential.</span>
                  </div>

                  {/* Error */}
                  {txState === "error" && error && (
                    <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleBet}
                    disabled={numAmount <= 0 || txState === "pending"}
                    className={`w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 btn-press ${
                      txState === "pending"
                        ? "glass text-white/30 cursor-wait"
                        : numAmount <= 0
                        ? "bg-white/[0.02] text-white/10 cursor-not-allowed"
                        : !isConnected
                        ? "glass text-white hover:bg-white/[0.08]"
                        : isYes
                        ? "bg-green-500 text-black glow-green hover:bg-green-400"
                        : "bg-red-500 text-white glow-red hover:bg-red-400"
                    }`}
                  >
                    {txState === "pending" ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full inline-block"
                        />
                        Confirming...
                      </span>
                    ) : !isConnected ? (
                      "Connect Wallet"
                    ) : numAmount <= 0 ? (
                      "Enter amount"
                    ) : (
                      `Buy ${isYes ? "Yes" : "No"} · ${preview ? preview.sharesReceived.toFixed(1) : "0"} shares`
                    )}
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
