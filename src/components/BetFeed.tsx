"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
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
  const [instant, setInstant] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isRelocating = useRef(false);
  const len = mockBets.length;

  const setItemRef = useCallback((key: string, node: HTMLDivElement | null) => {
    if (node) itemRefs.current.set(key, node);
    else itemRefs.current.delete(key);
  }, []);

  // Scroll to first real card on mount (skip the leading clone)
  useLayoutEffect(() => {
    const node = itemRefs.current.get(`real-${startIndex}`);
    node?.scrollIntoView({ behavior: "instant" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Teleport from clone to real card without visual glitch
  const teleportTo = useCallback((realIndex: number) => {
    const container = containerRef.current;
    if (!container) return;

    isRelocating.current = true;

    // 1. Disable scroll-snap to prevent browser re-snapping
    container.style.scrollSnapType = "none";

    // 2. Flush state synchronously: destination card renders as active with instant transitions
    flushSync(() => {
      setInstant(true);
      setActiveIndex(realIndex);
    });

    // 3. Jump to the real card
    const realNode = itemRefs.current.get(`real-${realIndex}`);
    if (realNode) {
      container.scrollTop = realNode.offsetTop;
    }

    // 4. Re-enable snap after browser processes the scroll position
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.style.scrollSnapType = "";
        setInstant(false);
        isRelocating.current = false;
      });
    });
  }, []);

  // Determine which card index is snapped based on scroll position
  const getSnappedIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return -1;
    const cardHeight = container.clientHeight;
    if (cardHeight === 0) return -1;
    // DOM order: clone-start(0), real-0(1), real-1(2), ..., real-N-1(N), clone-end(N+1)
    return Math.round(container.scrollTop / cardHeight);
  }, []);

  // Intersection observer for real cards only (activeIndex tracking during scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isRelocating.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
          const key = (entry.target as HTMLElement).dataset.feedKey;
          if (!key?.startsWith("real-")) continue;
          const idx = parseInt(key.slice(5));
          if (!isNaN(idx)) setActiveIndex(idx);
        }
      },
      { threshold: 0.5, root: container }
    );

    // Only observe real cards, NOT clones
    itemRefs.current.forEach((node, key) => {
      if (key.startsWith("real-")) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [len]);

  // Clone teleport: only triggers AFTER scroll has fully stopped
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceTimer: ReturnType<typeof setTimeout>;

    const checkAndTeleport = () => {
      if (isRelocating.current) return;
      const snapped = getSnappedIndex();
      if (snapped === 0) {
        // Landed on clone-start → teleport to real last card
        teleportTo(len - 1);
      } else if (snapped === len + 1) {
        // Landed on clone-end → teleport to real first card
        teleportTo(0);
      }
    };

    // scrollend fires after all scrolling (including snap) completes
    const handleScrollEnd = () => {
      clearTimeout(debounceTimer);
      checkAndTeleport();
    };

    // Debounced scroll as fallback for browsers without scrollend
    const handleScroll = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkAndTeleport, 200);
    };

    container.addEventListener("scrollend", handleScrollEnd);
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scrollend", handleScrollEnd);
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(debounceTimer);
    };
  }, [len, teleportTo, getSnappedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        container.scrollBy({ top: container.clientHeight, behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        container.scrollBy({ top: -container.clientHeight, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scrollByOne = useCallback((direction: "up" | "down") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollBy({
      top: direction === "down" ? container.clientHeight : -container.clientHeight,
      behavior: "smooth",
    });
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
          {/* Clone of last card (for upward wrap) */}
          <div
            data-feed-key="clone-start"
            ref={(node) => setItemRef("clone-start", node)}
            className="bet-card"
          >
            <BetCard bet={mockBets[len - 1]} isActive={true} instant />
          </div>

          {/* Real cards */}
          {mockBets.map((bet, index) => (
            <div
              key={bet.id}
              data-feed-key={`real-${index}`}
              ref={(node) => setItemRef(`real-${index}`, node)}
              className="bet-card"
            >
              <BetCard bet={bet} isActive={index === activeIndex} instant={instant && index === activeIndex} />
            </div>
          ))}

          {/* Clone of first card (for downward wrap) */}
          <div
            data-feed-key="clone-end"
            ref={(node) => setItemRef("clone-end", node)}
            className="bet-card"
          >
            <BetCard bet={mockBets[0]} isActive={true} instant />
          </div>
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
          <NavArrow direction="up" onClick={() => scrollByOne("up")} />
          <NavArrow direction="down" onClick={() => scrollByOne("down")} />
        </div>
      </div>
    </div>
  );
}
