"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { mockBets } from "@/lib/mockData";
import BetCard from "./BetCard";
import SideActions from "./SideActions";

function NavArrow({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
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
    if (node) {
      cardRefs.current.set(id, node);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = mockBets.findIndex(
              (bet) => cardRefs.current.get(bet.id) === entry.target
            );
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollTo(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollTo(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, scrollTo]);

  const activeBet = mockBets[activeIndex];

  return (
    <div className="flex items-center justify-center h-full gap-4">
      {/* Main card column */}
      <div className="relative h-full w-full max-w-[420px] lg:max-w-[420px] lg:h-[calc(100vh-40px)] lg:my-5">
        <div
          ref={containerRef}
          className="feed-container h-full lg:rounded-lg lg:overflow-hidden"
        >
          {mockBets.map((bet, index) => (
            <div
              key={bet.id}
              ref={(node) => setCardRef(bet.id, node)}
              className="bet-card"
            >
              <BetCard bet={bet} isActive={index === activeIndex} />
            </div>
          ))}
        </div>
      </div>

      {/* Right side: actions + nav arrows (desktop only) */}
      <div className="hidden lg:flex flex-col items-center justify-end gap-6 pb-20 h-full">
        {/* Side actions */}
        <SideActions
          likes={Math.floor(activeBet.participants * 0.3)}
          comments={Math.floor(activeBet.participants * 0.05)}
          shares={Math.floor(activeBet.participants * 0.02)}
        />

        {/* Navigation arrows */}
        <div className="flex flex-col gap-2 mt-4">
          <NavArrow direction="up" onClick={() => scrollTo(activeIndex - 1)} />
          <NavArrow direction="down" onClick={() => scrollTo(activeIndex + 1)} />
        </div>
      </div>
    </div>
  );
}
