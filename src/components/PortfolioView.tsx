"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { useMarket } from "@/context/MarketContext";
import { mockBets, formatNumber } from "@/lib/mockData";
import { Position, BetSide } from "@/types";
import { shortenAddress } from "@/lib/coti";
import { CONTRACT_ADDRESSES, CUSDC_ABI } from "@/lib/contracts";
import SellModal from "./SellModal";
import ResolvePanel from "./ResolvePanel";
import { SkeletonPosition } from "./Skeleton";

const BALANCE_KEY_PREFIX = `cusdc-${CONTRACT_ADDRESSES.token?.slice(0, 8)}-`;
function getStoredBalance(address: string): number {
  try {
    return parseFloat(localStorage.getItem(`${BALANCE_KEY_PREFIX}${address.toLowerCase()}`) || "0");
  } catch { return 0; }
}
function setStoredBalance(address: string, balance: number) {
  localStorage.setItem(`${BALANCE_KEY_PREFIX}${address.toLowerCase()}`, balance.toString());
}

export default function PortfolioView({ handle }: { handle: string | null }) {
  const { address, isConnected, signer } = useWallet();
  const { positions, getPositionPnL, getMarketPrice } = useMarket();
  const [sellTarget, setSellTarget] = useState<Position | null>(null);
  const [faucetState, setFaucetState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [faucetError, setFaucetError] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Load stored balance, or check on-chain if we have no record
  useEffect(() => {
    if (!address) return;
    const stored = getStoredBalance(address);
    if (stored > 0) {
      setWalletBalance(stored);
    } else if (CONTRACT_ADDRESSES.token && signer) {
      // Check if already claimed on-chain but not tracked locally
      import("@coti-io/coti-ethers").then(({ Contract }) => {
        const token = new Contract(CONTRACT_ADDRESSES.token, CUSDC_ABI, signer);
        token.hasClaimed(address).then((claimed: boolean) => {
          if (claimed) {
            setWalletBalance(1000);
            setStoredBalance(address, 1000);
          }
        }).catch(() => {});
      });
    }
  }, [address, signer]);

  const claimFaucet = useCallback(async () => {
    if (!signer || !address) return;
    if (!CONTRACT_ADDRESSES.token) {
      const newBal = walletBalance + 1000;
      setWalletBalance(newBal);
      setStoredBalance(address, newBal);
      setFaucetState("success");
      return;
    }
    setFaucetState("pending");
    setFaucetError("");
    try {
      const { Contract } = await import("@coti-io/coti-ethers");
      const token = new Contract(CONTRACT_ADDRESSES.token, CUSDC_ABI, signer);
      const tx = await token.faucet({ gasLimit: 1_000_000 });
      await tx.wait();
      const newBal = walletBalance + 1000;
      setWalletBalance(newBal);
      setStoredBalance(address, newBal);
      setFaucetState("success");
    } catch (err: any) {
      const msg = err?.reason || err?.message || "Transaction failed";
      if (msg.includes("Already claimed")) {
        setFaucetError("Already claimed. Faucet is one-time per wallet.");
        // If they already claimed but balance is 0, set it
        if (walletBalance === 0) {
          setWalletBalance(1000);
          setStoredBalance(address, 1000);
        }
      } else {
        setFaucetError(msg);
      }
      setFaucetState("error");
    }
  }, [signer, address, walletBalance]);

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
                <h2 className="text-lg font-bold text-white">{handle}<span className="text-white/20">.wispr</span></h2>
                <p className="text-xs text-white/30">{address ? shortenAddress(address) : ""}</p>
              </>
            ) : (
              <h2 className="text-lg font-bold text-white/70">{address ? shortenAddress(address) : ""}</h2>
            )}
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Wallet Balance */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="2" strokeLinecap="round" className="opacity-60">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Wallet</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{walletBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className="text-[11px] text-white/25 font-semibold">cUSDC</span>
            </div>
          </div>

          {/* Positions Value */}
          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">Positions</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{summary.totalValue.toFixed(2)}</span>
              <span className="text-[11px] text-white/25 font-semibold">cUSDC</span>
            </div>
            {summary.count > 0 && (
              <p className={`text-[11px] font-semibold mt-1 ${summary.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {summary.totalPnL >= 0 ? "+" : ""}{summary.totalPnLPercent.toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Faucet */}
        {walletBalance === 0 && (
          <div className="mb-4">
            {faucetState === "error" ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                <span className="text-xs text-red-400">{faucetError}</span>
                <button onClick={() => setFaucetState("idle")} className="text-[10px] text-white/30 hover:text-white/50 ml-auto">Retry</button>
              </div>
            ) : (
              <button
                onClick={claimFaucet}
                disabled={faucetState === "pending"}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all btn-press ${
                  faucetState === "pending"
                    ? "glass text-white/30 cursor-wait"
                    : "bg-[#005EF8]/10 text-[#005EF8] ring-1 ring-[#005EF8]/15 hover:bg-[#005EF8]/20"
                }`}
              >
                {faucetState === "pending" ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-[#005EF8]/20 border-t-[#005EF8]/60 rounded-full inline-block"
                    />
                    Claiming...
                  </span>
                ) : (
                  "Claim 1,000 cUSDC (Testnet Faucet)"
                )}
              </button>
            )}
          </div>
        )}

        {/* Positions list */}
        {loading ? (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Positions</h3>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonPosition key={i} />)}
          </div>
        ) : aggregated.length === 0 ? (
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

        {/* Resolution panel */}
        {CONTRACT_ADDRESSES.market && (
          <div className="mt-8">
            <ResolvePanel />
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
