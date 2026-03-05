"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";

type NavItem = "feed" | "explore" | "create" | "likes" | "profile";

const navItems: { id: NavItem; label: string; path: string }[] = [
  { id: "feed", label: "Home", path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { id: "explore", label: "Explore", path: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" },
  { id: "create", label: "Create", path: "M12 5v14M5 12h14" },
  { id: "likes", label: "Likes", path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { id: "profile", label: "Profile", path: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" },
];

export default function Sidebar() {
  const [active, setActive] = useState<NavItem>("feed");
  const { isConnected, address, connect, disconnect, isLoading, isOnboarded, onboard } = useWallet();

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] xl:w-[244px] flex-col border-r border-white/[0.06] bg-black z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-10">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm">W</span>
        </div>
        <span className="hidden xl:block text-[17px] font-bold tracking-tight">Whisper</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`group relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-white/[0.06]"
                  : "hover:bg-white/[0.03]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isActive && item.id !== "create" ? "white" : "none"}
                stroke="white"
                strokeWidth={isActive ? "2.5" : "1.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                {item.path.split(" M").map((d, i) => (
                  <path key={i} d={i === 0 ? d : `M${d}`} />
                ))}
              </svg>
              <span className={`hidden xl:block text-[14px] transition-all ${
                isActive ? "font-bold text-white" : "font-normal text-white/60 group-hover:text-white/80"
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Wallet section at bottom */}
      <div className="px-3 pb-6 space-y-2">
        {isConnected && address ? (
          <>
            {!isOnboarded && (
              <button
                onClick={onboard}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/10 text-green-400 text-xs font-semibold hover:bg-green-500/15 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <span className="hidden xl:inline">{isLoading ? "Setting up..." : "Onboard"}</span>
              </button>
            )}
            <button
              onClick={disconnect}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-white">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-white/80">{shortenAddress(address)}</div>
                <div className="text-[10px] text-white/30 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnboarded ? "bg-green-400" : "bg-yellow-400"}`} />
                  {isOnboarded ? "Ready" : "Not onboarded"}
                </div>
              </div>
            </button>
          </>
        ) : (
          <button
            onClick={connect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="hidden xl:inline">{isLoading ? "..." : "Connect Wallet"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
