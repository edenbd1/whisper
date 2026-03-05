"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Bet, BetSide } from "@/types";
import { formatNumber, daysUntil } from "@/lib/mockData";
import { useMarket } from "@/context/MarketContext";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const { getMarketPrice } = useMarket();

  const price = getMarketPrice(bet.id);
  const yesPrice = Math.round(price.yes * 100);
  const noPrice = Math.round(price.no * 100);
  const days = daysUntil(bet.endsAt);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  const handleBet = (side: BetSide) => {
    setSelectedSide(side);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    setHasVoted(true);
    setVotedSide(selectedSide);
    setModalOpen(false);
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-full overflow-hidden bg-[#050505]"
      >
        {/* Background image */}
        <motion.img
          src={bet.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={isActive ? { scale: 1.02, opacity: 1 } : { scale: 1.1, opacity: 0.6 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          loading="lazy"
        />

        {/* Overlays */}
        <div className="card-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="vignette absolute inset-0" />
        <div className="absolute inset-0 noise" />
        <div className="spotlight absolute inset-0 pointer-events-none hidden lg:block" />

        {/* Top badges */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-16 lg:top-5 left-5 right-5 flex items-center gap-2 flex-wrap z-20"
        >
          <span className="glass px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/70">
            {bet.category}
          </span>
          {bet.trending && (
            <span className="glass px-3 py-1.5 rounded-full text-[11px] font-bold text-white/80">
              <span className="text-green-400 mr-1">#{bet.trending}</span>
              Trending
            </span>
          )}
          {bet.isLive && (
            <span className="glass px-3 py-1.5 rounded-full text-[11px] font-bold text-red-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="pulse-live absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
              </span>
              LIVE
            </span>
          )}
        </motion.div>

        {/* Bottom content - absolute positioned above bottom nav */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-[100px] lg:bottom-6 left-5 right-5 lg:right-5 z-10 space-y-3"
        >
          {/* Privacy badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-500/[0.08] border border-green-500/[0.1]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[10px] font-bold text-green-400/80 tracking-[0.08em] uppercase">
              Confidential
            </span>
          </div>

          {/* Question */}
          <h2 className="text-[22px] sm:text-[26px] font-black text-white leading-[1.15] tracking-[-0.03em] max-w-[380px]">
            {bet.question}
          </h2>

          {/* Odds + Stats row */}
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-5">
              <div>
                <span className="text-[10px] font-semibold text-green-400/50 uppercase tracking-wider">Yes</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[28px] font-black text-green-400 leading-none">{yesPrice}</span>
                  <span className="text-[12px] font-bold text-green-400/40">¢</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-red-400/50 uppercase tracking-wider">No</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[28px] font-black text-red-400 leading-none">{noPrice}</span>
                  <span className="text-[12px] font-bold text-red-400/40">¢</span>
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] text-white/30 font-medium space-y-0.5 pb-1">
              <div>{formatNumber(bet.poolSize)} vol</div>
              <div>{formatNumber(bet.participants)} traders · {days}d</div>
            </div>
          </div>

          {/* Odds bar */}
          <div className="odds-bar">
            <motion.div
              className="odds-bar-yes progress-glow"
              initial={{ width: 0 }}
              animate={isActive ? { width: `${yesPrice}%` } : { width: 0 }}
              transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleBet("yes")}
              className={`btn-press flex-1 py-3 rounded-xl font-bold text-[14px] transition-all duration-300 ${
                hasVoted && votedSide === "yes"
                  ? "bg-green-500 text-black glow-green ring-2 ring-green-400/30"
                  : "bg-green-500/90 text-black hover:bg-green-400 glow-green"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                Yes
                <span className="text-black/50 text-[12px] font-semibold">{yesPrice}¢</span>
              </span>
            </button>
            <button
              onClick={() => handleBet("no")}
              className={`btn-press flex-1 py-3 rounded-xl font-bold text-[14px] transition-all duration-300 ${
                hasVoted && votedSide === "no"
                  ? "bg-red-500 text-white glow-red ring-2 ring-red-400/30"
                  : "bg-red-500/90 text-white hover:bg-red-400 glow-red"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                No
                <span className="text-white/50 text-[12px] font-semibold">{noPrice}¢</span>
              </span>
            </button>
          </div>

          {/* Powered by COTI */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[9px] text-white/15 font-medium tracking-wider uppercase">Powered by COTI</span>
          </div>
        </motion.div>
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
