"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bet, BetSide } from "@/types";
import { formatNumber, daysUntil } from "@/lib/mockData";
import { useMarket } from "@/context/MarketContext";
import Sparkline from "./Sparkline";
import BetModal from "./BetModal";

interface BetCardProps {
  bet: Bet;
  isActive: boolean;
  instant?: boolean;
}

export default function BetCard({ bet, isActive, instant }: BetCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSide, setSelectedSide] = useState<BetSide>("yes");
  const [hasVoted, setHasVoted] = useState(false);
  const [votedSide, setVotedSide] = useState<BetSide | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { getMarketPrice, getPriceHistory } = useMarket();

  const price = getMarketPrice(bet.id);
  const yesPrice = Math.round(price.yes * 100);
  const noPrice = Math.round(price.no * 100);
  const days = daysUntil(bet.endsAt);
  const history = getPriceHistory(bet.id);

  const t = (d: number, delay = 0) => ({
    delay: instant ? 0 : delay,
    duration: instant ? 0 : d,
    ease: [0.16, 1, 0.3, 1] as const,
  });

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
      <div ref={cardRef} className="relative w-full h-full overflow-hidden bg-black">
        {/* Background video or image */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={isActive ? { scale: 1.02, opacity: 1 } : { scale: 1.1, opacity: 0.6 }}
          transition={t(1.2)}
        >
          {bet.video ? (
            <video
              src={bet.video}
              autoPlay
              loop
              muted
              playsInline
              poster={bet.image}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={bet.image}
              alt={bet.question}
              fill
              sizes="100vw"
              priority={true}
              className="object-cover"
            />
          )}
        </motion.div>

        {/* Overlays */}
        <div className="card-overlay absolute inset-0" />
        <div className="vignette absolute inset-0" />
        <div className="absolute inset-0 noise" />

        {/* Top: Category pill centered */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={t(0.5, 0.1)}
          className="absolute top-14 lg:top-4 left-0 right-0 flex justify-center z-20"
        >
          <div className="flex items-center gap-4">
            <span className="glass px-4 py-1.5 rounded-full text-[12px] font-semibold text-white/80">
              {bet.category}
            </span>
          </div>
        </motion.div>

        {/* Bottom content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={t(0.6, 0.05)}
          className="absolute bottom-[100px] lg:bottom-6 left-4 right-4 z-10 space-y-2.5"
        >
          {/* Trending badge */}
          {bet.trending && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/15">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Trending</span>
            </div>
          )}

          {/* Question */}
          <h2 className="text-[22px] sm:text-[26px] font-black text-white leading-[1.15] tracking-[-0.02em]">
            {bet.question}
          </h2>

          {/* Stats row: sparkline + % YES · days · participants */}
          <div className="flex items-center gap-2.5 text-[12px] text-white/40 font-medium">
            <div className="flex items-center gap-2">
              {history.length >= 2 ? (
                <Sparkline data={history} width={48} height={16} color="auto" />
              ) : (
                <div className="w-[48px] h-[3px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-green-400"
                    initial={{ width: 0 }}
                    animate={isActive ? { width: `${yesPrice}%` } : { width: 0 }}
                    transition={t(1, 0.3)}
                  />
                </div>
              )}
              <span className="text-green-400 font-bold">{yesPrice}¢ YES</span>
            </div>
            <span className="text-white/15">·</span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {days}d
            </span>
            <span className="text-white/15">·</span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              {formatNumber(bet.participants)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-0.5">
            <button
              onClick={() => handleBet("yes")}
              className={`btn-press flex-1 py-3 rounded-2xl font-bold text-[13px] transition-all duration-300 ${
                hasVoted && votedSide === "yes"
                  ? "bg-green-500 text-black ring-2 ring-green-400/30"
                  : "bg-green-500/80 text-black hover:bg-green-500"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                YES · {yesPrice}¢
              </span>
            </button>
            <button
              onClick={() => handleBet("no")}
              className={`btn-press flex-1 py-3 rounded-2xl font-bold text-[13px] transition-all duration-300 ${
                hasVoted && votedSide === "no"
                  ? "bg-red-500 text-white ring-2 ring-red-400/30"
                  : "bg-red-500/80 text-white hover:bg-red-500"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                NO · {noPrice}¢
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      <BetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        side={selectedSide}
        question={bet.question}
        marketId={parseInt(bet.id)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
