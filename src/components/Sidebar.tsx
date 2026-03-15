"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";
import { WisprIcon, WisprWordmark } from "./WisprLogo";
import type { AppTab } from "@/app/page";

type NavItem = { id: AppTab; label: string; icon: string };

const navItems: NavItem[] = [
  { id: "feed", label: "Home", icon: "home" },
  { id: "explore", label: "Explore", icon: "search" },
  { id: "create", label: "Create", icon: "plus" },
  { id: "ranking", label: "Ranking", icon: "trophy" },
  { id: "profile", label: "Profile", icon: "user" },
];

const iconPaths: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22 M18 2H6v7a6 6 0 0 0 12 0V2Z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
};

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { isConnected, address, connect, disconnect, isLoading, isOnboarded, onboard } = useWallet();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [mouseY, setMouseY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    let rafId = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMouseY(e.clientY - el.getBoundingClientRect().top);
      });
    };
    const onEnter = () => setIsHovering(true);
    const onLeave = () => { setIsHovering(false); setHoveredItem(null); };
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[68px] xl:w-[220px] flex-col z-50 overflow-visible"
    >
      {/* Base */}
      <div className="absolute inset-0 bg-black" />

      {/* Cursor spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(250px circle at 50% ${mouseY}px, rgba(0,94,248,0.04), transparent 70%)`,
        }}
      />

      {/* Right edge glow */}
      <div className="absolute right-0 top-0 bottom-0 w-px overflow-hidden">
        <div className="sidebar-edge-line absolute inset-0" />
      </div>

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-4 xl:px-5 pt-7 pb-9">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 rounded-2xl bg-[#005EF8]/15 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <WisprIcon size={32} className="relative text-[#005EF8] drop-shadow-[0_0_8px_rgba(0,94,248,0.3)]" />
        </div>
        <div className="hidden xl:flex flex-col">
          <WisprWordmark className="text-gradient" />
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 flex flex-col gap-0.5 px-2 xl:px-2.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCreate = item.id === "create";
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onTabChange(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="group relative w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl"
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.06]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                {/* Hover background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-transparent group-hover:bg-white/[0.04] transition-colors duration-200" />
                )}

                {/* Active left indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-glow-bar"
                    className="absolute -left-2 xl:-left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                    style={{
                      background: "linear-gradient(180deg, #3B82F6 0%, #005EF8 100%)",
                      boxShadow: "0 0 10px rgba(0,94,248,0.6), 0 0 25px rgba(0,94,248,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {isCreate ? (
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-[#005EF8] shadow-lg shadow-[#005EF8]/30"
                        : "bg-white/[0.06] group-hover:bg-white/[0.12]"
                    }`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "white" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" className={isActive ? "" : "text-white/40 group-hover:text-white/70"}>
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isActive ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={isActive ? "2.5" : "1.5"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-all duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-white/30 group-hover:text-white/70"
                      }`}
                    >
                      {iconPaths[item.icon]?.split(" M").map((d, i) => (
                        <path key={i} d={i === 0 ? d : `M${d}`} />
                      ))}
                    </svg>
                  )}
                </div>

                {/* Label */}
                <span className={`hidden xl:block relative z-10 text-[13px] tracking-[-0.01em] transition-all duration-200 ${
                  isActive
                    ? "font-semibold text-white"
                    : "font-medium text-white/30 group-hover:text-white/70"
                }`}>
                  {item.label}
                </span>
              </button>

              {/* Tooltip for collapsed mode */}
              <AnimatePresence>
                {hoveredItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="xl:hidden absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60] pointer-events-none"
                  >
                    <div className="px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-white/[0.08] text-[11px] font-medium text-white/80 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="relative mx-4 mb-3">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Network badge */}
      <div className="relative mx-2.5 mb-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#005EF8] shadow-[0_0_6px_rgba(0,94,248,0.5)] pulse-soft" />
          <span className="hidden xl:block text-[10px] font-medium text-white/25 tracking-wide">COTI Testnet</span>
          <span className="xl:hidden text-[8px] font-bold text-white/20">COTI</span>
        </div>
      </div>

      {/* Wallet */}
      <div className="relative px-2 xl:px-2.5 pb-5 space-y-2">
        {isConnected && address ? (
          <>
            {!isOnboarded && (
              <button
                onClick={onboard}
                disabled={isLoading}
                aria-label="Onboard wallet for confidential transactions"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#005EF8] transition-all duration-200 bg-[#005EF8]/[0.08] border border-[#005EF8]/[0.12] hover:bg-[#005EF8]/[0.14] hover:border-[#005EF8]/[0.2]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="hidden xl:inline">{isLoading ? "Setting up..." : "Onboard"}</span>
              </button>
            )}
            <button
              onClick={disconnect}
              aria-label="Disconnect wallet"
              className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#005EF8] to-[#3B82F6] opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#005EF8] to-[#3B82F6] flex items-center justify-center ring-1 ring-white/10">
                  <span className="text-[11px] font-bold text-white">
                    {address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="hidden xl:block text-left min-w-0">
                <div className="text-[12px] font-semibold text-white/80 truncate">
                  {shortenAddress(address)}
                </div>
                <div className="text-[10px] text-white/20 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isOnboarded
                      ? "bg-[#22C55E] shadow-[0_0_4px_rgba(34,197,94,0.6)]"
                      : "bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.4)]"
                  }`} />
                  {isOnboarded ? "Ready" : "Not onboarded"}
                </div>
              </div>
            </button>
          </>
        ) : (
          <button
            onClick={connect}
            disabled={isLoading}
            aria-label="Connect wallet"
            className="group w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden relative bg-white/[0.03] border border-white/[0.06] hover:border-[#005EF8]/[0.3]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#005EF8]/0 via-[#005EF8]/[0.08] to-[#005EF8]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <span className="relative flex items-center gap-2 text-white/50 group-hover:text-white/90 transition-colors">
              <span className="w-2 h-2 bg-[#005EF8] rounded-full pulse-soft shadow-[0_0_8px_rgba(0,94,248,0.5)]" />
              <span className="hidden xl:inline">{isLoading ? "..." : "Connect"}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
