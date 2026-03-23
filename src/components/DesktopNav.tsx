"use client";

import { WhisperIcon } from "./WhisperLogo";
import type { AppTab } from "@/app/page";

interface DesktopNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const navItems: { id: AppTab; label: string }[] = [
  { id: "feed", label: "Home" },
  { id: "explore", label: "Search" },
  { id: "create", label: "Create" },
  { id: "ranking", label: "Ranking" },
  { id: "profile", label: "Profile" },
];

function NavIcon({ id, isActive }: { id: AppTab; isActive: boolean }) {
  const sw = isActive ? "2.5" : "1.8";

  switch (id) {
    case "feed":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "white" : "none"} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "explore":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "create":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "ranking":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "white" : "none"} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      );
    case "profile":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "white" : "none"} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      );
  }
}

export default function DesktopNav({ activeTab, onTabChange }: DesktopNavProps) {
  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[48px] flex-col items-center z-50">
      {/* Logo at top — exact IG position */}
      <button onClick={() => onTabChange("feed")} aria-label="Home" className="group mt-[25px] mb-10">
        <WhisperIcon size={28} className="text-white group-hover:text-[#005EF8] transition-colors duration-200" />
      </button>

      {/* Nav icons — centered vertically */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/[0.06] ${
                isActive ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              <NavIcon id={item.id} isActive={isActive} />
            </button>
          );
        })}
      </nav>

      {/* Menu icon at bottom */}
      <button
        aria-label="Menu"
        className="p-2 mb-5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
    </div>
  );
}
