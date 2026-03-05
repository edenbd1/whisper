"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { mockBets } from "@/lib/mockData";
import BetCard from "./BetCard";

export default function BetFeed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setCardRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) {
      cardRefs.current.set(id, node);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = mockBets.findIndex(
              (bet) => cardRefs.current.get(bet.id) === entry.target
            );
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        threshold: 0.5,
        root: containerRef.current,
      }
    );

    cardRefs.current.forEach((node) => {
      observerRef.current?.observe(node);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, mockBets.length - 1);
        const node = cardRefs.current.get(mockBets[next].id);
        node?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        const node = cardRefs.current.get(mockBets[prev].id);
        node?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="feed-container">
      {mockBets.map((bet, index) => (
        <div
          key={bet.id}
          ref={(node) => setCardRef(bet.id, node)}
        >
          <BetCard bet={bet} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
  );
}
