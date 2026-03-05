"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockBets } from "@/lib/mockData";
import BetCard from "./BetCard";
import SideActions from "./SideActions";

function NavArrow({ direction, onClick, disabled }: { direction: "up" | "down"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 btn-press ${
        disabled
          ? "bg-white/[0.02] text-white/10 cursor-default"
          : "glass text-white/50 hover:text-white hover:bg-white/[0.08]"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={direction === "up" ? "" : "rotate-180"}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

export default function BetFeed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setCardRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) cardRefs.current.set(id, node);
    else cardRefs.current.delete(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = mockBets.findIndex((bet) => cardRefs.current.get(bet.id) === entry.target);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { threshold: 0.5, root: containerRef.current }
    );
    cardRefs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, mockBets.length - 1));
    const node = cardRefs.current.get(mockBets[clamped].id);
    node?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); scrollTo(activeIndex + 1); }
      else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); scrollTo(activeIndex - 1); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, scrollTo]);

  const activeBet = mockBets[activeIndex];

  return (
    <div className="flex items-center justify-center h-full gap-6">
      {/* Card column */}
      <div className="relative h-full w-full lg:w-[min(420px,calc(100vh*9/16))] lg:h-[calc(100vh-48px)] lg:my-6">
        {/* Desktop: animated gradient border */}
        <div className="hidden lg:block absolute -inset-[1px] rounded-2xl gradient-border z-0" />

        {/* Desktop: outer glow */}
        <div className="hidden lg:block absolute -inset-2 rounded-3xl bg-green-500/[0.02] blur-xl z-0" />

        <div
          ref={containerRef}
          className="feed-container relative h-full lg:rounded-2xl lg:overflow-hidden z-10 bg-[#050505]"
        >
          {mockBets.map((bet, index) => (
            <div key={bet.id} ref={(node) => setCardRef(bet.id, node)} className="bet-card">
              <BetCard bet={bet} isActive={index === activeIndex} />
            </div>
          ))}
        </div>

        {/* Scroll indicator dots - mobile */}
        <div className="lg:hidden absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
          {mockBets.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: i === activeIndex ? 16 : 4,
                opacity: i === activeIndex ? 0.7 : 0.15,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-1 rounded-full bg-white"
            />
          ))}
        </div>

        {/* Counter - desktop */}
        <div className="hidden lg:block absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <div className="glass px-3 py-1 rounded-full text-[11px] text-white/40 font-medium tabular-nums">
            {activeIndex + 1} / {mockBets.length}
          </div>
        </div>
      </div>

      {/* Right panel: side actions + nav (desktop only) */}
      <div className="hidden lg:flex flex-col items-center justify-end gap-5 pb-28 h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SideActions
              likes={Math.floor(activeBet.participants * 0.3)}
              comments={Math.floor(activeBet.participants * 0.05)}
              shares={Math.floor(activeBet.participants * 0.02)}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-1.5 mt-4">
          <NavArrow direction="up" onClick={() => scrollTo(activeIndex - 1)} disabled={activeIndex === 0} />
          <NavArrow direction="down" onClick={() => scrollTo(activeIndex + 1)} disabled={activeIndex === mockBets.length - 1} />
        </div>
      </div>
    </div>
  );
}
