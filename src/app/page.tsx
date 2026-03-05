"use client";

import { useState, useEffect, useCallback } from "react";
import BetFeed from "@/components/BetFeed";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PortfolioView from "@/components/PortfolioView";
import ExploreView from "@/components/ExploreView";
import CreateView from "@/components/CreateView";
import HandleSetup from "@/components/HandleSetup";
import { useWallet } from "@/context/WalletContext";
import { saveHandle, loadHandle } from "@/lib/storage";

export type AppTab = "feed" | "explore" | "create" | "profile";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("feed");
  const [feedStartIndex, setFeedStartIndex] = useState(0);
  const { isConnected, address } = useWallet();
  const [handle, setHandle] = useState<string | null>(null);
  const [showHandleSetup, setShowHandleSetup] = useState(false);
  const [handleChecked, setHandleChecked] = useState(false);

  // Load handle on wallet connect
  useEffect(() => {
    if (address) {
      const stored = loadHandle(address);
      setHandle(stored);
      setHandleChecked(true);
      if (!stored) {
        setShowHandleSetup(true);
      }
    } else {
      setHandle(null);
      setHandleChecked(false);
      setShowHandleSetup(false);
    }
  }, [address]);

  const handleSetHandle = (name: string) => {
    if (address) {
      saveHandle(address, name);
      setHandle(name);
    }
    setShowHandleSetup(false);
  };

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
        return <PortfolioView handle={handle} />;
      default:
        return <BetFeed startIndex={feedStartIndex} />;
    }
  };

  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} handle={handle} />
      <Header handle={handle} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Spacer to reserve space for the fixed sidebar */}
      <div className="hidden lg:block flex-shrink-0 w-[68px] xl:w-[220px]" />
      <div className="flex-1 h-full min-w-0">
        {renderContent()}
      </div>

      {/* Handle setup modal */}
      {isConnected && handleChecked && showHandleSetup && (
        <HandleSetup
          isOpen={true}
          onSubmit={handleSetHandle}
          onSkip={() => setShowHandleSetup(false)}
        />
      )}
    </main>
  );
}
