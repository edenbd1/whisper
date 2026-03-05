"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/mockData";

interface SideActionsProps {
  likes: number;
  comments: number;
  shares: number;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#ff1744" : "none"} stroke={filled ? "#ff1744" : "white"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function SideActions({ likes, comments, shares }: SideActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        onClick={() => {
          setLiked(!liked);
          setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        }}
        className="flex flex-col items-center gap-1"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={liked ? "liked" : "not-liked"}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <HeartIcon filled={liked} />
          </motion.div>
        </AnimatePresence>
        <span className="text-xs font-semibold">{formatNumber(likeCount)}</span>
      </button>

      <button className="flex flex-col items-center gap-1">
        <CommentIcon />
        <span className="text-xs font-semibold">{formatNumber(comments)}</span>
      </button>

      <button className="flex flex-col items-center gap-1">
        <ShareIcon />
        <span className="text-xs font-semibold">{formatNumber(shares)}</span>
      </button>

      <button
        onClick={() => setSaved(!saved)}
        className="flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ scale: saved ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <BookmarkIcon filled={saved} />
        </motion.div>
        <span className="text-xs font-semibold">Save</span>
      </button>
    </div>
  );
}
