"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BetFeed from "@/components/BetFeed";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import DesktopNav from "@/components/DesktopNav";
import PortfolioView from "@/components/PortfolioView";
import ExploreView from "@/components/ExploreView";
import CreateView from "@/components/CreateView";
import RankingView from "@/components/RankingView";
export type AppTab = "feed" | "explore" | "create" | "ranking" | "profile";
const BUILD_VERSION = "v5";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("feed");
  const [feedStartIndex, setFeedStartIndex] = useState(0);
  const handleSelectMarket = useCallback((index: number) => {
    setFeedStartIndex(index);
    setActiveTab("feed");
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "explore":
        return <ExploreView onSelectMarket={handleSelectMarket} />;
      case "create":
        return <CreateView />;
      case "ranking":
        return <RankingView />;
      case "profile":
        return <PortfolioView />;
      default:
        return <BetFeed startIndex={feedStartIndex} />;
    }
  };

  return (
    <main className="h-[100dvh] w-full bg-[#1a1d21] overflow-hidden flex">
      <DesktopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Header />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 h-full min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-1 right-1 text-[9px] text-white/10 z-[100] pointer-events-none">{BUILD_VERSION}</div>
    </main>
  );
}
