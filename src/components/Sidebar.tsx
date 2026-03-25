"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";
import { WhisperLogoFull } from "./WhisperLogo";
import type { AppTab } from "@/app/page";

type NavItem = { id: AppTab; label: string; icon: string };

const navItems: NavItem[] = [
  { id: "feed", label: "For You", icon: "home" },
  { id: "explore", label: "Explore", icon: "compass" },
  { id: "create", label: "Upload", icon: "plus-square" },
  { id: "ranking", label: "Ranking", icon: "trophy" },
  { id: "profile", label: "Profile", icon: "user" },
];

const iconPaths: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  compass: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z",
  "plus-square": "M3 3h18v18H3z M12 8v8 M8 12h8",
  trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22 M18 2H6v7a6 6 0 0 0 12 0V2Z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  more: "M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0 M12 5m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0 M12 19m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0",
};

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { isConnected, address, connect, disconnect, isLoading, isOnboarded, onboard } = useWallet();

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col z-50 bg-black border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-6 pt-5 pb-6">
        <WhisperLogoFull height={28} />
      </div>

      {/* Search */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.06]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/30 flex-shrink-0">
            {iconPaths.search.split(" M").map((d, i) => (
              <path key={i} d={i === 0 ? d : `M${d}`} />
            ))}
          </svg>
          <span className="text-[14px] text-white/30">Search</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="group relative flex items-center gap-3.5 px-4 py-3 rounded-lg transition-colors duration-150 hover:bg-white/[0.04]"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[#FE2C55]"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={isActive ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isActive ? "2" : "1.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-colors duration-150 ${
                  isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                }`}
              >
                {iconPaths[item.icon]?.split(" M").map((d, i) => (
                  <path key={i} d={i === 0 ? d : `M${d}`} />
                ))}
              </svg>
              <span className={`text-[16px] transition-colors duration-150 ${
                isActive ? "font-bold text-white" : "font-medium text-white/50 group-hover:text-white/80"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More */}
        <button className="group flex items-center gap-3.5 px-4 py-3 rounded-lg hover:bg-white/[0.04] transition-colors duration-150">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/50 group-hover:text-white/80 transition-colors">
            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
          <span className="text-[16px] font-medium text-white/50 group-hover:text-white/80 transition-colors">More</span>
        </button>
      </nav>

      {/* Separator */}
      <div className="mx-5 my-2">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* Network badge */}
      <div className="mx-3 mb-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55] shadow-[0_0_6px_rgba(254,44,85,0.5)]" />
          <span className="text-[12px] font-medium text-white/25 tracking-wide">COTI Testnet</span>
        </div>
      </div>

      {/* Wallet */}
      <div className="px-3 pb-5">
        {isConnected && address ? (
          <div className="space-y-2">
            {!isOnboarded && (
              <button
                onClick={onboard}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-[#FE2C55] bg-[#FE2C55]/10 border border-[#FE2C55]/20 hover:bg-[#FE2C55]/15 transition-colors"
              >
                {isLoading ? "Setting up..." : "Onboard"}
              </button>
            )}
            <button
              onClick={disconnect}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FE2C55] to-[#FF6F61] flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">{address.slice(2, 4).toUpperCase()}</span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-[13px] font-semibold text-white/80 truncate">{shortenAddress(address)}</div>
                <div className="text-[10px] text-white/25 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnboarded ? "bg-[#22C55E]" : "bg-yellow-400"}`} />
                  {isOnboarded ? "Ready" : "Not onboarded"}
                </div>
              </div>
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-[15px] font-bold text-white bg-[#FE2C55] hover:bg-[#FE2C55]/90 transition-colors"
          >
            {isLoading ? "..." : "Log in"}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-white/15">
        <span>Whisper</span>
        <span>Terms</span>
        <span>Privacy</span>
        <span>© 2026</span>
      </div>
    </div>
  );
}
