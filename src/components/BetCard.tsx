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
    console.log(`Bet ${amount} on ${selectedSide} for "${bet.question}"`);
    setHasVoted(true);
    setVotedSide(selectedSide);
    setModalOpen(false);
  };

  return (
    <>
      <div className="relative w-full h-full rounded-none lg:rounded-lg overflow-hidden bg-black">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={bet.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Gradient overlay - stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
        </div>

        {/* Top badges */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            {bet.trending && (
              <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-semibold text-white/90">
                #{bet.trending} Trending
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-medium text-white/70">
              {bet.category}
            </span>
            {bet.isLive && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-sm text-[11px] font-bold text-red-400">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full pulse-live" />
                LIVE
              </span>
            )}
          </motion.div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-3"
          >
            {/* Question */}
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight pr-2">
              {bet.question}
            </h2>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-[13px] text-white/50">
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {days}d left
              </span>
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                {formatNumber(bet.participants)}
              </span>
              <span className="flex items-center gap-1 text-green-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                {formatNumber(bet.poolSize)} COTI
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={isActive ? { width: `${bet.yesPercentage}%` } : { width: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* YES / NO buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={() => handleBet("yes")}
                className={`flex-1 py-3 rounded-xl font-bold text-[15px] transition-all ${
                  hasVoted && votedSide === "yes"
                    ? "bg-green-500 text-black ring-2 ring-green-400/50"
                    : "bg-green-500 text-black hover:bg-green-400 active:scale-[0.98]"
                }`}
              >
                YES &middot; {bet.yesPercentage}%
              </button>
              <button
                onClick={() => handleBet("no")}
                className={`flex-1 py-3 rounded-xl font-bold text-[15px] transition-all ${
                  hasVoted && votedSide === "no"
                    ? "bg-red-500 text-white ring-2 ring-red-400/50"
                    : "bg-red-500 text-white hover:bg-red-400 active:scale-[0.98]"
                }`}
              >
                NO &middot; {noPercentage}%
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bet modal */}
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
