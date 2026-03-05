"use client";

import { useState, useEffect } from "react";
import BetFeed from "@/components/BetFeed";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PortfolioView from "@/components/PortfolioView";
import HandleSetup from "@/components/HandleSetup";
import { useWallet } from "@/context/WalletContext";
import { saveHandle, loadHandle } from "@/lib/storage";

export type AppTab = "feed" | "explore" | "create" | "ranking" | "likes" | "profile";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("feed");
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

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <PortfolioView handle={handle} />;
      default:
        return <BetFeed />;
    }
  };

  return (
    <main className="h-[100dvh] w-full bg-[#050505] overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} handle={handle} />
      <Header handle={handle} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="h-full lg:pl-[72px] xl:pl-[244px]">
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
