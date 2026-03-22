"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bet } from "@/types";
import { formatNumber } from "@/lib/mockData";
import { useMarket } from "@/context/MarketContext";
import { useToast } from "./Toast";

interface SideActionsProps {
  bet: Bet;
  isActive: boolean;
  instant?: boolean;
}

export default function SideActions({ bet, isActive, instant }: SideActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(bet.participants * 0.3));
  const { getMarketPrice } = useMarket();
  const { showToast } = useToast();

  const price = getMarketPrice(bet.id);
  const yesPrice = Math.round(price.yes * 100);
  const noPrice = Math.round(price.no * 100);
  const commentCount = Math.floor(bet.participants * 0.05);

  const t = (d: number, delay = 0) => ({
    delay: instant ? 0 : delay,
    duration: instant ? 0 : d,
    ease: [0.16, 1, 0.3, 1] as const,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={t(0.5, 0.2)}
      className="hidden lg:flex flex-col items-center gap-6"
    >
      {/* Like */}
      <button
        aria-label={liked ? "Unlike" : "Like"}
        onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}
        className="flex flex-col items-center gap-1"
      >
        <AnimatePresence mode="wait">
          <motion.div key={liked ? "y" : "n"} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill={liked ? "#ff3040" : "none"} stroke={liked ? "#ff3040" : "white"} strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.div>
        </AnimatePresence>
        <span className="text-[11px] font-semibold text-white/70">{formatNumber(likeCount)}</span>
      </button>

      {/* Comment */}
      <button aria-label="Comments" className="flex flex-col items-center gap-1">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-[11px] font-semibold text-white/70">{formatNumber(commentCount)}</span>
      </button>

      {/* Share */}
      <button
        aria-label="Share"
        onClick={() => {
          const text = `${bet.question} \u2014 YES ${yesPrice}\u00A2 / NO ${noPrice}\u00A2`;
          if (navigator.share) {
            navigator.share({ title: "Whisper Market", text }).catch(() => {});
          } else {
            navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard"));
          }
        }}
        className="flex flex-col items-center gap-1"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>

      {/* Save / Bookmark */}
      <button aria-label={saved ? "Unsave" : "Save"} onClick={() => setSaved(!saved)} className="flex flex-col items-center gap-1">
        <motion.div animate={{ scale: saved ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.15 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={saved ? "white" : "none"} stroke="white" strokeWidth="1.8">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>
      </button>

      {/* More menu */}
      <button aria-label="More" className="flex flex-col items-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    </motion.div>
  );
}
