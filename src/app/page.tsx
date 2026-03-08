"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BetFeed from "@/components/BetFeed";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PortfolioView from "@/components/PortfolioView";
import ExploreView from "@/components/ExploreView";
import CreateView from "@/components/CreateView";
export type AppTab = "feed" | "explore" | "create" | "profile";

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
      case "profile":
        return <PortfolioView />;
      default:
        return <BetFeed startIndex={feedStartIndex} />;
    }
  };

  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Header />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Spacer to reserve space for the fixed sidebar */}
      <div className="hidden lg:block flex-shrink-0 w-[68px] xl:w-[220px]" />
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

    </main>
  );
}
