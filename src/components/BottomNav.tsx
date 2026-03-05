"use client";

import { useState } from "react";

type Tab = "feed" | "create" | "ranking" | "profile";

export default function BottomNav() {
  const [active, setActive] = useState<Tab>("feed");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "feed",
      label: "Home",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active === "feed" ? "white" : "none"} stroke="white" strokeWidth={active === "feed" ? "2.5" : "1.5"}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "create",
      label: "",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      id: "ranking",
      label: "Ranking",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={active === "ranking" ? "2.5" : "1.5"}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active === "profile" ? "white" : "none"} stroke="white" strokeWidth={active === "profile" ? "2.5" : "1.5"}>
          <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className="flex flex-col items-center gap-0.5 px-4 py-1"
          >
            {tab.icon}
            {tab.label && (
              <span className={`text-[10px] ${active === tab.id ? "text-white font-semibold" : "text-white/40"}`}>
                {tab.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
