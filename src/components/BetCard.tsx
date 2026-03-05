"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bet, BetSide } from "@/types";
import { formatNumber, daysUntil } from "@/lib/mockData";
import BetModal from "./BetModal";

interface BetCardProps {
  bet: Bet;
  isActive: boolean;
}

export default function BetCard({ bet, isActive }: BetCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSide, setSelectedSide] = useState<BetSide>("yes");
  const [hasVoted, setHasVoted] = useState(false);
  const [votedSide, setVotedSide] = useState<BetSide | null>(null);

  const noPercentage = 100 - bet.yesPercentage;
  const days = daysUntil(bet.endsAt);

  const handleBet = (side: BetSide) => {
    setSelectedSide(side);
    setModalOpen(true);
  };

  const handleConfirm = (amount: number) => {
    setHasVoted(true);
    setVotedSide(selectedSide);
    setModalOpen(false);
  };

  return (
    <>
      <div className="relative w-full h-full overflow-hidden bg-black">
        {/* Background image - full bleed */}
        <img
          src={bet.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105"
          loading="lazy"
        />

        {/* Overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-[200px]" />

        {/* Noise texture */}
        <div className="absolute inset-0 noise" />

        {/* ---- Content ---- */}
        <div className="relative h-full flex flex-col justify-between p-5 pb-6 z-10">

          {/* Top: Badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center gap-2 flex-wrap"
          >
            {bet.trending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-xl text-[11px] font-semibold text-white border border-white/[0.06]">
                <span className="text-[10px] text-green-400">&#9650;</span>
                #{bet.trending} Trending
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-xl text-[11px] font-medium text-white/60 border border-white/[0.06]">
              {bet.category}
            </span>
            {bet.isLive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 backdrop-blur-xl text-[11px] font-bold text-red-400 border border-red-500/10">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full pulse-live" />
                LIVE
              </span>
            )}
          </motion.div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: Question + stats + buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="space-y-4 max-w-[380px]"
          >
            {/* Confidential badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[10px] font-semibold text-green-400 tracking-wider uppercase">
                Confidential Market
              </span>
            </div>

            {/* Question */}
            <h2 className="text-[22px] sm:text-[26px] font-extrabold text-white leading-[1.2] tracking-[-0.02em]">
              {bet.question}
            </h2>

            {/* Stats */}
            <div className="flex items-center gap-4 text-[12px] text-white/40 font-medium">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {days}d left
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                {formatNumber(bet.participants)}
              </span>
              <span className="flex items-center gap-1 text-green-400/70">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                {formatNumber(bet.poolSize)} COTI
              </span>
            </div>

            {/* Progress bar with glow */}
            <div className="relative">
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full progress-glow"
                  initial={{ width: 0 }}
                  animate={isActive ? { width: `${bet.yesPercentage}%` } : { width: 0 }}
                  transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                />
              </div>
              {/* Percentage labels */}
              <div className="flex justify-between mt-1.5 text-[11px] font-semibold">
                <span className="text-green-400">{bet.yesPercentage}% Yes</span>
                <span className="text-red-400">{noPercentage}% No</span>
              </div>
            </div>

            {/* YES / NO buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => handleBet("yes")}
                className={`flex-1 relative py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.97] ${
                  hasVoted && votedSide === "yes"
                    ? "bg-green-500 text-black glow-green ring-2 ring-green-400/30"
                    : "bg-green-500 text-black glow-green hover:bg-green-400"
                }`}
              >
                <span className="relative z-10">YES &middot; {bet.yesPercentage}%</span>
              </button>
              <button
                onClick={() => handleBet("no")}
                className={`flex-1 relative py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.97] ${
                  hasVoted && votedSide === "no"
                    ? "bg-red-500 text-white glow-red ring-2 ring-red-400/30"
                    : "bg-red-500 text-white glow-red hover:bg-red-400"
                }`}
              >
                <span className="relative z-10">NO &middot; {noPercentage}%</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <BetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        side={selectedSide}
        question={bet.question}
        marketId={parseInt(bet.id) - 1}
        onConfirm={handleConfirm}
      />
    </>
  );
}
