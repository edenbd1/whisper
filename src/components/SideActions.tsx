"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/mockData";

interface SideActionsProps {
  likes: number;
  comments: number;
  shares: number;
}

export default function SideActions({ likes, comments, shares }: SideActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const ActionButton = ({ children, label, onClick }: { children: React.ReactNode; label?: string; onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/80 transition-all duration-200 group">
      <div className="transition-transform duration-200 group-hover:scale-110">
        {children}
      </div>
      {label && <span className="text-[11px] font-medium tabular-nums">{label}</span>}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <ActionButton
        label={formatNumber(likeCount)}
        onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={liked ? "y" : "n"} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#ff3040" : "none"} stroke={liked ? "#ff3040" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.div>
        </AnimatePresence>
      </ActionButton>

      <ActionButton label={formatNumber(comments)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </ActionButton>

      <ActionButton>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </ActionButton>

      <ActionButton onClick={() => setSaved(!saved)}>
        <motion.div animate={{ scale: saved ? [1, 1.15, 1] : 1 }} transition={{ duration: 0.15 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>
      </ActionButton>

      <ActionButton>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white/30">
          <circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18" r="1.5" />
        </svg>
      </ActionButton>
    </div>
  );
}
