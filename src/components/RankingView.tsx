"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchLeaderboard, LeaderboardEntry } from "@/lib/leaderboard";
import { shortenAddress } from "@/lib/coti";
import { useWallet } from "@/context/WalletContext";

const medals = ["🥇", "🥈", "🥉"];

function RankBadge({ rank }: { rank: number }) {
  if (rank < 3) {
    return <span className="text-xl">{medals[rank]}</span>;
  }
  return (
    <span className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-sm font-bold text-white/30">
      {rank + 1}
    </span>
  );
}

export default function RankingView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet();

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const userRank = address
    ? entries.findIndex((e) => e.address.toLowerCase() === address.toLowerCase())
    : -1;

  return (
    <div className="h-full overflow-y-auto pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-5 pt-20 lg:pt-8">
        <h1 className="text-2xl font-black text-white mb-1">Ranking</h1>
        <p className="text-sm text-white/30 mb-6">
          Top bettors on Whisper — ranked by on-chain activity
        </p>

        {/* User rank highlight */}
        {userRank >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-4 py-3.5 rounded-2xl bg-[#005EF8]/[0.06] border border-[#005EF8]/[0.12]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#005EF8] to-[#3B82F6] flex items-center justify-center ring-1 ring-white/10">
                  <span className="text-xs font-bold text-white">YOU</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    #{userRank + 1} — {shortenAddress(address!)}
                  </p>
                  <p className="text-[11px] text-white/30">
                    {entries[userRank].totalBets} bets · {entries[userRank].uniqueMarkets} markets
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                <span className="text-green-400">{entries[userRank].yesBets} YES</span>
                <span className="text-red-400">{entries[userRank].noBets} NO</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats overview */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xl font-black text-white">{entries.length}</p>
              <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">Traders</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xl font-black text-white">
                {entries.reduce((s, e) => s + e.totalBets, 0)}
              </p>
              <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">Total Bets</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xl font-black text-white">
                {Math.max(...entries.map((e) => e.uniqueMarkets), 0)}
              </p>
              <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">Max Markets</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/[0.04] rounded w-32" />
                    <div className="h-2 bg-white/[0.04] rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-20">
                <path d="M8 21h8m-4-4v4m-4.5-8.65C4 11.36 2 8.28 2 6.5 2 4.02 4.02 2 6.5 2c1.74 0 3.41.99 4.5 2.54C12.09 2.99 13.76 2 15.5 2 17.98 2 20 4.02 20 6.5c0 1.78-2 4.86-5.5 5.85" />
              </svg>
            </div>
            <p className="text-white/20 text-sm">No bets placed yet</p>
            <p className="text-white/10 text-xs mt-1">Be the first to appear on the leaderboard</p>
          </div>
        ) : (
          /* Leaderboard */
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isUser = address && entry.address.toLowerCase() === address.toLowerCase();
              return (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass rounded-xl p-4 transition-all ${
                    isUser ? "ring-1 ring-[#005EF8]/20 bg-[#005EF8]/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={i} />

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black"
                        : i === 1
                        ? "bg-gradient-to-br from-slate-300 to-slate-400 text-black"
                        : i === 2
                        ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                        : "bg-white/[0.06] text-white/40"
                    }`}>
                      {entry.address.slice(2, 4).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white/90 truncate">
                          {shortenAddress(entry.address)}
                        </p>
                        {isUser && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#005EF8]/10 text-[#005EF8]">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/25">
                        {entry.uniqueMarkets} market{entry.uniqueMarkets !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-white/80">
                        {entry.totalBets} bet{entry.totalBets !== 1 ? "s" : ""}
                      </p>
                      <div className="flex gap-2 justify-end text-[10px] font-semibold">
                        <span className="text-green-400/60">{entry.yesBets}Y</span>
                        <span className="text-red-400/60">{entry.noBets}N</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Privacy note */}
        <div className="flex items-center gap-2.5 mt-6 px-3 py-2.5 rounded-xl bg-[#005EF8]/[0.03] border border-[#005EF8]/[0.06]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 opacity-60">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-[11px] text-white/20 leading-relaxed">
            Rankings based on bet count only. Individual amounts remain encrypted on COTI.
          </span>
        </div>
      </div>
    </div>
  );
}
