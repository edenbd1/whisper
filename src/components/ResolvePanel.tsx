"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { CONTRACT_ADDRESSES, WHISPER_MARKET_ABI } from "@/lib/contracts";
import { getExplorerTxUrl } from "@/lib/coti";
import { useMarket } from "@/context/MarketContext";

export default function ResolvePanel() {
  const { signer } = useWallet();
  const { markets } = useMarket();
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [resolvedMarkets, setResolvedMarkets] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem("resolved-markets");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const handleResolve = async (marketId: number, outcome: boolean) => {
    if (!signer || !CONTRACT_ADDRESSES.market) return;
    setPending(true);
    setError("");
    try {
      const { Contract } = await import("@coti-io/coti-ethers");
      const market = new Contract(CONTRACT_ADDRESSES.market, WHISPER_MARKET_ABI, signer);
      const tx = await market.resolveMarket(marketId, outcome, { gasLimit: 500_000 });
      setTxHash(tx.hash);
      await tx.wait();
      const updated = new Set(resolvedMarkets);
      updated.add(marketId);
      setResolvedMarkets(updated);
      localStorage.setItem("resolved-markets", JSON.stringify([...updated]));
      setSelectedMarket(null);
    } catch (err: any) {
      const msg = err?.reason || err?.message || "Transaction failed";
      if (msg.includes("Not owner")) {
        setError("Only the contract owner can resolve markets");
      } else if (msg.includes("user rejected")) {
        setError("Transaction rejected");
      } else {
        setError(msg.length > 100 ? msg.slice(0, 100) + "..." : msg);
      }
    } finally {
      setPending(false);
    }
  };

  const handleClaim = async (marketId: number) => {
    if (!signer || !CONTRACT_ADDRESSES.market) return;
    setPending(true);
    setError("");
    try {
      const { Contract } = await import("@coti-io/coti-ethers");
      const market = new Contract(CONTRACT_ADDRESSES.market, WHISPER_MARKET_ABI, signer);
      const tx = await market.claimWinnings(marketId, { gasLimit: 1_000_000 });
      setTxHash(tx.hash);
      await tx.wait();
    } catch (err: any) {
      const msg = err?.reason || err?.message || "Transaction failed";
      if (msg.includes("No winning bet")) {
        setError("No winning bet on this market");
      } else if (msg.includes("Already claimed")) {
        setError("Already claimed winnings");
      } else if (msg.includes("user rejected")) {
        setError("Transaction rejected");
      } else {
        setError(msg.length > 100 ? msg.slice(0, 100) + "..." : msg);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
        Market Resolution
      </h3>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/[0.04] border border-red-500/10">
          <span className="text-xs text-red-400 flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-[10px] text-white/30 hover:text-white/50 font-semibold">Dismiss</button>
        </div>
      )}

      {txHash && !error && (
        <div className="px-3 py-2.5 rounded-xl bg-[#005EF8]/[0.04] border border-[#005EF8]/[0.08]">
          <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
            className="text-[#005EF8]/60 text-xs hover:text-[#005EF8] transition-colors underline decoration-[#005EF8]/20 underline-offset-2">
            View transaction on CotiScan
          </a>
        </div>
      )}

      {markets.map((bet, i) => {
        const isResolved = resolvedMarkets.has(i);
        return (
          <div key={bet.id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/80 truncate">{bet.question}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.04] text-white/30">
                    Market #{i}
                  </span>
                  {isResolved && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              {isResolved ? (
                <button
                  onClick={() => handleClaim(i)}
                  disabled={pending}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all btn-press ${
                    pending ? "glass text-white/30 cursor-wait" : "bg-[#005EF8]/10 text-[#005EF8] ring-1 ring-[#005EF8]/15 hover:bg-[#005EF8]/20"
                  }`}
                >
                  {pending ? "Claiming..." : "Claim Winnings"}
                </button>
              ) : selectedMarket === i ? (
                <>
                  <button
                    onClick={() => handleResolve(i, true)}
                    disabled={pending}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all btn-press ${
                      pending ? "glass text-white/30 cursor-wait" : "bg-green-500/15 text-green-400 ring-1 ring-green-500/15 hover:bg-green-500/25"
                    }`}
                  >
                    {pending ? "..." : "Resolve YES"}
                  </button>
                  <button
                    onClick={() => handleResolve(i, false)}
                    disabled={pending}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all btn-press ${
                      pending ? "glass text-white/30 cursor-wait" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/10 hover:bg-red-500/20"
                    }`}
                  >
                    {pending ? "..." : "Resolve NO"}
                  </button>
                  <button
                    onClick={() => setSelectedMarket(null)}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold glass text-white/30 hover:text-white/50 btn-press"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedMarket(i)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold glass text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all btn-press"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleClaim(i)}
                    disabled={pending}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold glass text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all btn-press"
                  >
                    Claim
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
