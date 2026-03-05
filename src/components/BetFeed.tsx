"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockBets } from "@/lib/mockData";
import BetCard from "./BetCard";
import SideActions from "./SideActions";

function NavArrow({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 btn-press glass text-white/50 hover:text-white hover:bg-white/[0.08]"
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

export default function BetFeed({ startIndex = 0 }: { startIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const activeIndexRef = useRef(activeIndex);

  // Keep ref in sync
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const setCardRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) cardRefs.current.set(id, node);
    else cardRefs.current.delete(id);
  }, []);

  // Intersection observer to track current card
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

  // Scroll to a specific index with wrap-around support
  const scrollTo = useCallback((index: number) => {
    const len = mockBets.length;
    const isWrap = index < 0 || index >= len;
    const target = ((index % len) + len) % len;
    const node = cardRefs.current.get(mockBets[target].id);
    node?.scrollIntoView({ behavior: isWrap ? "instant" : "smooth" });
  }, []);

  // Keyboard navigation with wrap-around
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollTo(activeIndexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollTo(activeIndexRef.current - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollTo]);

  // Mouse wheel wrap-around at boundaries
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (e.deltaY > 0 && container.scrollTop >= maxScroll - 5) {
        // At bottom, scrolling down → wrap to first
        const node = cardRefs.current.get(mockBets[0].id);
        node?.scrollIntoView({ behavior: "instant" });
      } else if (e.deltaY < 0 && container.scrollTop <= 5) {
        // At top, scrolling up → wrap to last
        const node = cardRefs.current.get(mockBets[mockBets.length - 1].id);
        node?.scrollIntoView({ behavior: "instant" });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Touch swipe wrap-around at boundaries
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY;
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (diff > 50 && container.scrollTop >= maxScroll - 5) {
        // Swiped up at bottom → wrap to first
        const node = cardRefs.current.get(mockBets[0].id);
        node?.scrollIntoView({ behavior: "instant" });
      } else if (diff < -50 && container.scrollTop <= 5) {
        // Swiped down at top → wrap to last
        const node = cardRefs.current.get(mockBets[mockBets.length - 1].id);
        node?.scrollIntoView({ behavior: "instant" });
      }
    };

    container.addEventListener("touchstart", onStart, { passive: true });
    container.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onStart);
      container.removeEventListener("touchend", onEnd);
    };
  }, []);

  const activeBet = mockBets[activeIndex];

  return (
    <div className="flex items-center justify-center h-full gap-6">
      {/* Card column */}
      <div className="relative h-full w-full lg:w-[min(420px,calc(100vh*9/16))] lg:h-[calc(100vh-48px)] lg:my-6">
        <div
          ref={containerRef}
          className="feed-container relative h-full lg:rounded-2xl lg:overflow-hidden bg-black lg:ring-1 lg:ring-white/[0.06]"
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
          <NavArrow direction="up" onClick={() => scrollTo(activeIndex - 1)} />
          <NavArrow direction="down" onClick={() => scrollTo(activeIndex + 1)} />
        </div>
      </div>
    </div>
  );
}
