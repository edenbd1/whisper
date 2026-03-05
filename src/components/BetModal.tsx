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
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { isConnected, signer, connect } = useWallet();

  const isYes = side === "yes";
  const numAmount = parseFloat(amount) || 0;

  const handleBet = async () => {
    if (!isConnected || !signer) {
      await connect();
      return;
    }

    if (numAmount <= 0) return;

    // If no contract deployed yet, just do a mock confirmation
    if (!CONTRACT_ADDRESSES.market) {
      onConfirm(numAmount);
      return;
    }

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
      console.error("Bet failed:", err);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={resetAndClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl overflow-hidden"
          >
            <div className="glass-strong p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {/* Handle bar */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              {txState === "success" ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">&#10003;</div>
                  <h3 className="text-xl font-bold text-white mb-2">Bet Placed!</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Your {isYes ? "YES" : "NO"} bet of {numAmount} COTI has been confirmed
                  </p>
                  {txHash && (
                    <a
                      href={getExplorerTxUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green text-xs underline"
                    >
                      View on CotiScan
                    </a>
                  )}
                  <button
                    onClick={resetAndClose}
                    className="w-full mt-6 py-3 rounded-2xl bg-white/10 text-white font-semibold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Side badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      isYes ? "bg-green/20 text-green" : "bg-red/20 text-red"
                    }`}>
                      {isYes ? "YES" : "NO"}
                    </span>
                    <span className="text-white/60 text-sm">Confidential Bet</span>
                  </div>

                  {/* Question */}
                  <p className="text-white font-semibold text-lg mb-6 leading-snug">{question}</p>

                  {/* Amount input */}
                  <div className="relative mb-4">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-bold text-white text-center focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-semibold">
                      COTI
                    </span>
                  </div>

                  {/* Preset amounts */}
                  <div className="flex gap-2 mb-6">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset.toString())}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          amount === preset.toString()
                            ? "bg-white/20 text-white border border-white/20"
                            : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Privacy notice */}
                  <div className="flex items-center gap-2 mb-6 px-3 py-2.5 rounded-xl bg-white/5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-xs text-white/40">
                      Your bet is secured on COTI&apos;s confidential network
                    </span>
                  </div>

                  {/* Error message */}
                  {txState === "error" && error && (
                    <div className="mb-4 px-3 py-2.5 rounded-xl bg-red/10 border border-red/20">
                      <p className="text-red text-xs">{error}</p>
                    </div>
                  )}

                  {/* Confirm button */}
                  <button
                    onClick={handleBet}
                    disabled={numAmount <= 0 || txState === "pending"}
                    className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${
                      txState === "pending"
                        ? "bg-white/10 text-white/50 cursor-wait"
                        : numAmount <= 0
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : !isConnected
                        ? "bg-white/20 text-white"
                        : isYes
                        ? "btn-yes"
                        : "btn-no"
                    }`}
                  >
                    {txState === "pending"
                      ? "Confirming..."
                      : !isConnected
                      ? "Connect Wallet"
                      : numAmount <= 0
                      ? "Enter amount"
                      : `Bet ${numAmount} COTI on ${isYes ? "YES" : "NO"}`}
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
