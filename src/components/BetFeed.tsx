"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { useMarket } from "@/context/MarketContext";
import BetCard from "./BetCard";
import SideActions from "./SideActions";

function NavArrow({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 btn-press bg-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.12]"
    >
      <svg
        width="18"
        height="18"
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
  const { markets, loading } = useMarket();
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [instant, setInstant] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isRelocating = useRef(false);
  const len = markets.length;

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
    container.style.scrollSnapType = "none";

    flushSync(() => {
      setInstant(true);
      setActiveIndex(realIndex);
    });

    const realNode = itemRefs.current.get(`real-${realIndex}`);
    if (realNode) {
      container.scrollTop = realNode.offsetTop;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.style.scrollSnapType = "";
        setInstant(false);
        isRelocating.current = false;
      });
    });
  }, []);

  const getSnappedIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return -1;
    const cardHeight = container.clientHeight;
    if (cardHeight === 0) return -1;
    return Math.round(container.scrollTop / cardHeight);
  }, []);

  // Intersection observer for activeIndex tracking
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

    itemRefs.current.forEach((node, key) => {
      if (key.startsWith("real-")) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [len]);

  // Clone teleport after scroll stops
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceTimer: ReturnType<typeof setTimeout>;

    const checkAndTeleport = () => {
      if (isRelocating.current) return;
      const snapped = getSnappedIndex();
      if (snapped === 0) teleportTo(len - 1);
      else if (snapped === len + 1) teleportTo(0);
    };

    const handleScrollEnd = () => {
      clearTimeout(debounceTimer);
      checkAndTeleport();
    };

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

  if (loading || markets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/10 border-t-[#005EF8] rounded-full mx-auto"
          />
          <p className="text-white/20 text-sm font-medium">Loading markets from COTI...</p>
        </div>
      </div>
    );
  }

  const renderPage = (bet: typeof markets[0], index: number, key: string, isActive: boolean, isInstant?: boolean) => (
    <div
      key={key}
      data-feed-key={key}
      ref={(node) => setItemRef(key, node)}
      className="bet-card"
    >
      {/* Full-page snap section — card + actions centered */}
      <div className="h-full w-full flex items-center justify-center lg:pl-[72px]">
        {/* Card + side actions wrapper */}
        <div className="relative flex items-end gap-3">
          {/* The card — IG Reels proportions */}
          <div className="relative w-[100vw] h-[100dvh] lg:w-[420px] lg:h-[calc(100vh-40px)] lg:rounded-lg overflow-hidden bg-black lg:ring-1 lg:ring-white/[0.06]">
            <BetCard bet={bet} isActive={isActive} instant={isInstant} />
          </div>

          {/* Side actions — desktop only, aligned to bottom of card */}
          <div className="hidden lg:block pb-2">
            <SideActions bet={bet} isActive={isActive} instant={isInstant} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="feed-container h-full"
    >
      {/* Clone of last card */}
      {renderPage(markets[len - 1], len - 1, "clone-start", true, true)}

      {/* Real cards */}
      {markets.map((bet, index) =>
        renderPage(bet, index, `real-${index}`, index === activeIndex, instant && index === activeIndex)
      )}

      {/* Clone of first card */}
      {renderPage(markets[0], 0, "clone-end", true, true)}

      {/* Scroll indicator dots - mobile */}
      <div className="lg:hidden fixed right-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
        {markets.map((_, i) => (
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

      {/* Nav arrows — desktop only, far right, vertically centered */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-2 z-20">
        <NavArrow direction="up" onClick={() => scrollByOne("up")} />
        <NavArrow direction="down" onClick={() => scrollByOne("down")} />
      </div>

      {/* Counter - desktop */}
      <div className="hidden lg:block fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="glass px-3 py-1 rounded-full text-[11px] text-white/40 font-medium tabular-nums">
          {activeIndex + 1} / {markets.length}
        </div>
      </div>
    </div>
  );
}
