"use client";

import { motion } from "framer-motion";
import type { AppTab } from "@/app/page";

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

type BottomTab = "feed" | "create" | "ranking" | "profile";

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: BottomTab; appTab: AppTab; label: string; icon: (isActive: boolean) => React.ReactNode }[] = [
    {
      id: "feed",
      appTab: "feed",
      label: "Home",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "white" : "none"} stroke="white" strokeWidth={a ? "2.5" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "create",
      appTab: "create",
      label: "",
      icon: () => (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      ),
    },
    {
      id: "ranking",
      appTab: "explore",
      label: "Explore",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={a ? "2.5" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: "profile",
      appTab: "profile",
      label: "Profile",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "white" : "none"} stroke="white" strokeWidth={a ? "2.5" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-4">
        <div className="flex items-center justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.appTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.appTab)}
                className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 btn-press"
              >
                {tab.icon(isActive)}
                {tab.label && (
                  <span className={`text-[10px] mt-0.5 transition-colors ${isActive ? "text-white font-semibold" : "text-white/30"}`}>
                    {tab.label}
                  </span>
                )}
                {isActive && tab.id !== "create" && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
