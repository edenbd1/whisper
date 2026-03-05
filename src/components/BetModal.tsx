"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BetSide } from "@/types";
import { useWallet } from "@/context/WalletContext";
import { CONTRACT_ADDRESSES, WHISPER_MARKET_ABI } from "@/lib/contracts";
import { getExplorerTxUrl } from "@/lib/coti";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  side: BetSide;
  question: string;
  marketId?: number;
  onConfirm: (amount: number) => void;
}

const presetAmounts = [0.1, 0.5, 1, 5];

type TxState = "idle" | "pending" | "success" | "error";

export default function BetModal({ isOpen, onClose, side, question, marketId, onConfirm }: BetModalProps) {
  const [amount, setAmount] = useState<string>("0.5");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const { isConnected, signer, connect } = useWallet();

  const isYes = side === "yes";
  const numAmount = parseFloat(amount) || 0;

  const handleBet = async () => {
    if (!isConnected || !signer) { await connect(); return; }
    if (numAmount <= 0) return;

    if (!CONTRACT_ADDRESSES.market) { onConfirm(numAmount); return; }

    setTxState("pending");
    setError("");
    try {
      const { Contract, parseEther } = await import("@coti-io/coti-ethers");
      const contract = new Contract(CONTRACT_ADDRESSES.market, WHISPER_MARKET_ABI, signer);
      const tx = await contract.bet(marketId ?? 0, isYes, {
        value: parseEther(amount),
        gasLimit: 500_000,
      });
      setTxHash(tx.hash);
      await tx.wait();
      setTxState("success");
      onConfirm(numAmount);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
            onClick={resetAndClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[70] max-w-lg mx-auto"
          >
            <div className="bg-zinc-950 border-t border-white/[0.06] rounded-t-2xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {/* Handle */}
              <div className="w-9 h-1 bg-white/10 rounded-full mx-auto mb-6" />

              {txState === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Bet Placed</h3>
                  <p className="text-sm text-white/40 mb-4">{numAmount} COTI on {isYes ? "YES" : "NO"}</p>
                  {txHash && (
                    <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                      className="text-green-400/70 text-xs hover:text-green-400 transition-colors underline decoration-green-400/20">
                      View on CotiScan
                    </a>
                  )}
                  <button onClick={resetAndClose} className="w-full mt-6 py-3 rounded-xl bg-white/[0.06] text-white/80 text-sm font-semibold hover:bg-white/[0.1] transition-colors">
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Side indicator */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      isYes ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {isYes ? "YES" : "NO"}
                    </span>
                    <span className="text-white/30 text-xs">Confidential Bet</span>
                  </div>

                  <p className="text-white font-semibold text-base mb-5 leading-snug">{question}</p>

                  {/* Amount */}
                  <div className="relative mb-3">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 text-xl font-bold text-white text-center focus:outline-none focus:border-white/[0.12] transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-semibold">COTI</span>
                  </div>

                  {/* Presets */}
                  <div className="flex gap-2 mb-5">
                    {presetAmounts.map((p) => (
                      <button
                        key={p}
                        onClick={() => setAmount(p.toString())}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                          amount === p.toString()
                            ? "bg-white/[0.1] text-white border border-white/[0.1]"
                            : "bg-white/[0.03] text-white/30 border border-transparent hover:bg-white/[0.06] hover:text-white/50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Privacy note */}
                  <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-green-500/[0.04] border border-green-500/[0.06]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <span className="text-[11px] text-white/25">Encrypted and confidential on COTI network</span>
                  </div>

                  {/* Error */}
                  {txState === "error" && error && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/[0.06] border border-red-500/[0.08]">
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleBet}
                    disabled={numAmount <= 0 || txState === "pending"}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                      txState === "pending"
                        ? "bg-white/[0.06] text-white/30 cursor-wait"
                        : numAmount <= 0
                        ? "bg-white/[0.04] text-white/15 cursor-not-allowed"
                        : !isConnected
                        ? "bg-white/[0.08] text-white hover:bg-white/[0.12]"
                        : isYes
                        ? "bg-green-500 text-black glow-green hover:bg-green-400"
                        : "bg-red-500 text-white glow-red hover:bg-red-400"
                    }`}
                  >
                    {txState === "pending" ? "Confirming..." : !isConnected ? "Connect Wallet" : numAmount <= 0 ? "Enter amount" : `Bet ${numAmount} COTI on ${isYes ? "YES" : "NO"}`}
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
