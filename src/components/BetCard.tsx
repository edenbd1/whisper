"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bet, BetSide } from "@/types";
import { formatNumber, daysUntil } from "@/lib/mockData";
import SideActions from "./SideActions";
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
    console.log(`Bet ${amount} cUSDC on ${selectedSide} for "${bet.question}"`);
    setHasVoted(true);
    setVotedSide(selectedSide);
    setModalOpen(false);
  };

  return (
    <div className="bet-card">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={bet.image}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Overlay gradients */}
        <div className="gradient-bottom absolute inset-0" />
        <div className="gradient-top absolute inset-0 h-32" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between px-4 pt-14 pb-24">
        {/* Top section: category + trending */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2 self-start"
        >
          {bet.trending && (
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white border border-white/10">
              #{bet.trending} TRENDING
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white/80 border border-white/10">
            {bet.category}
          </span>
          {bet.isLive && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red/20 backdrop-blur-md text-xs font-bold text-red border border-red/20">
              <span className="w-1.5 h-1.5 bg-red rounded-full pulse-live" />
              LIVE
            </span>
          )}
        </motion.div>

        {/* Middle spacer + side actions */}
        <div className="flex-1 flex items-end justify-end pb-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <SideActions
              likes={Math.floor(bet.participants * 0.3)}
              comments={Math.floor(bet.participants * 0.05)}
              shares={Math.floor(bet.participants * 0.02)}
            />
          </motion.div>
        </div>

        {/* Bottom section: question + stats + buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Question */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight pr-16 drop-shadow-lg">
            {bet.question}
          </h2>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{days}d left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{formatNumber(bet.participants)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-green">{formatNumber(bet.poolSize)} cUSDC</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green to-green-dark rounded-full"
              initial={{ width: 0 }}
              animate={isActive ? { width: `${bet.yesPercentage}%` } : { width: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* YES / NO buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleBet("yes")}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-base transition-all ${
                hasVoted && votedSide === "yes"
                  ? "btn-yes ring-2 ring-green/50 ring-offset-2 ring-offset-black"
                  : "btn-yes"
              }`}
            >
              YES · {bet.yesPercentage}%
            </button>
            <button
              onClick={() => handleBet("no")}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-base transition-all ${
                hasVoted && votedSide === "no"
                  ? "btn-no ring-2 ring-red/50 ring-offset-2 ring-offset-black"
                  : "btn-no"
              }`}
            >
              NO · {noPercentage}%
            </button>
          </div>
        </motion.div>
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
    </div>
  );
}
