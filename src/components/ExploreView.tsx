"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockBets, formatNumber, daysUntil } from "@/lib/mockData";
import { useMarket } from "@/context/MarketContext";
import { Bet } from "@/types";

const categories = ["All", "Crypto", "Geopolitics", "Technology", "Sports", "Business", "Science", "Conspiracy"];

interface ExploreViewProps {
  onSelectMarket: (index: number) => void;
}

export default function ExploreView({ onSelectMarket }: ExploreViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const { getMarketPrice } = useMarket();

  const filtered = activeCategory === "All"
    ? mockBets
    : mockBets.filter(b => b.category === activeCategory);

  return (
    <div className="h-full overflow-y-auto pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-5 pt-20 lg:pt-8">
        <h1 className="text-2xl font-black text-white mb-1">Explore</h1>
        <p className="text-sm text-white/30 mb-6">Browse all prediction markets</p>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all btn-press ${
                activeCategory === cat
                  ? "bg-white text-black"
                  : "glass text-white/50 hover:text-white/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Market grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/20 text-sm mb-1">No markets in this category</p>
            <button onClick={() => setActiveCategory("All")} className="text-[#005EF8]/60 text-xs hover:text-[#005EF8] transition-colors">
              Show all markets
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {filtered.map((bet, i) => {
            const price = getMarketPrice(bet.id);
            const yesPrice = Math.round(price.yes * 100);
            const noPrice = Math.round(price.no * 100);
            const days = daysUntil(bet.endsAt);
            const originalIndex = mockBets.findIndex(b => b.id === bet.id);

            return (
              <motion.button
                key={bet.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelectMarket(originalIndex)}
                className="text-left glass rounded-2xl overflow-hidden group hover:bg-white/[0.06] transition-all btn-press"
              >
                {/* Image header */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={bet.image}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="glass px-2 py-0.5 rounded-full text-[10px] font-semibold text-white/70">
                      {bet.category}
                    </span>
                    {bet.trending && (
                      <span className="glass px-2 py-0.5 rounded-full text-[10px] font-bold text-[#005EF8]">
                        #{bet.trending}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 pt-1">
                  <p className="text-[13px] font-bold text-white/90 leading-snug mb-3 line-clamp-2">
                    {bet.question}
                  </p>

                  {/* Prices */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black text-green-400">{yesPrice}</span>
                      <span className="text-[10px] font-bold text-green-400/40">¢ YES</span>
                    </div>
                    <div className="h-4 w-px bg-white/[0.06]" />
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black text-red-400">{noPrice}</span>
                      <span className="text-[10px] font-bold text-red-400/40">¢ NO</span>
                    </div>
                  </div>

                  {/* Odds bar */}
                  <div className="odds-bar mb-2.5">
                    <div className="odds-bar-yes" style={{ width: `${yesPrice}%` }} />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-[10px] text-white/25 font-medium">
                    <span>{formatNumber(bet.poolSize)} vol</span>
                    <span>{formatNumber(bet.participants)} traders</span>
                    <span>{days}d left</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
