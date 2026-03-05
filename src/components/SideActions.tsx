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
    <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? "#ff3040" : "none"} stroke={filled ? "#ff3040" : "currentColor"} strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  );
}

export default function SideActions({ likes, comments, shares }: SideActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      {/* Like */}
      <button
        onClick={() => {
          setLiked(!liked);
          setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        }}
        className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={liked ? "liked" : "not-liked"}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <HeartIcon filled={liked} />
          </motion.div>
        </AnimatePresence>
        <span className="text-xs font-medium">{formatNumber(likeCount)}</span>
      </button>

      {/* Comment */}
      <button className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
        <CommentIcon />
        <span className="text-xs font-medium">{formatNumber(comments)}</span>
      </button>

      {/* Share */}
      <button className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
        <ShareIcon />
      </button>

      {/* Bookmark */}
      <button
        onClick={() => setSaved(!saved)}
        className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
      >
        <motion.div
          animate={{ scale: saved ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.2 }}
        >
          <BookmarkIcon filled={saved} />
        </motion.div>
      </button>

      {/* More */}
      <button className="hover:opacity-70 transition-opacity">
        <MoreIcon />
      </button>
    </div>
  );
}
