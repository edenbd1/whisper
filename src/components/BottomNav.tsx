"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Tab = "feed" | "create" | "ranking" | "profile";

function FeedIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function RankingIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="2">
      <path d="M8 21V11" />
      <path d="M12 21V6" />
      <path d="M16 21V16" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function BottomNav() {
  const [active, setActive] = useState<Tab>("feed");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "feed", label: "Feed", icon: <FeedIcon active={active === "feed"} /> },
    { id: "create", label: "", icon: <PlusIcon /> },
    { id: "ranking", label: "Ranking", icon: <RankingIcon active={active === "ranking"} /> },
    { id: "profile", label: "Profile", icon: <ProfileIcon active={active === "profile"} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-strong">
        <div className="flex items-center justify-around px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-1"
            >
              {tab.id === "create" ? (
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  {tab.icon}
                </div>
              ) : (
                <>
                  <div className="relative">
                    {tab.icon}
                    {active === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className={`text-[10px] ${active === tab.id ? "text-white font-semibold" : "text-white/50"}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
