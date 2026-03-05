"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";
import type { AppTab } from "@/app/page";

type NavItem = { id: AppTab; label: string; icon: string };

const navItems: NavItem[] = [
  { id: "feed", label: "Home", icon: "home" },
  { id: "explore", label: "Explore", icon: "search" },
  { id: "create", label: "Create", icon: "plus" },
  { id: "profile", label: "Profile", icon: "user" },
];

const iconPaths: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
};

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  handle: string | null;
}

export default function Sidebar({ activeTab, onTabChange, handle }: SidebarProps) {
  const { isConnected, address, connect, disconnect, isLoading, isOnboarded, onboard } = useWallet();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [mouseY, setMouseY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      setMouseY(e.clientY - el.getBoundingClientRect().top);
    };
    const onEnter = () => setIsHovering(true);
    const onLeave = () => setIsHovering(false);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[68px] xl:w-[220px] flex-col z-50"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-[#070707]" />

      {/* Cursor spotlight — follows mouse vertically */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(300px circle at 50% ${mouseY}px, rgba(0,230,118,0.035), transparent 70%)`,
        }}
      />

      {/* Right edge — animated gradient line */}
      <div className="absolute right-0 top-0 bottom-0 w-px overflow-hidden">
        <div className="sidebar-edge-line absolute inset-0" />
      </div>

      {/* Noise */}
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* ── Logo ── */}
      <div className="relative flex items-center gap-3 px-4 xl:px-5 pt-7 pb-8">
        <div className="relative group">
          <div className="absolute -inset-1.5 rounded-xl bg-green-500/20 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-9 h-9 rounded-[10px] bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <span className="text-black font-black text-sm">W</span>
          </div>
        </div>
        <span className="hidden xl:block text-[16px] font-bold tracking-[-0.04em] text-gradient">
          whisper
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="relative flex-1 flex flex-col gap-0.5 px-2 xl:px-2.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl"
            >
              {/* Animated active background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-xl bg-white/[0.05] border border-white/[0.06]"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}

              {/* Hover background */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-transparent group-hover:bg-white/[0.03] transition-colors duration-200" />
              )}

              {/* Glowing left indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-glow-indicator"
                  className="absolute -left-2 xl:-left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-green-400 to-emerald-500"
                  style={{
                    boxShadow: "0 0 8px rgba(0,230,118,0.5), 0 0 20px rgba(0,230,118,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {item.id === "create" ? (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25"
                      : "bg-white/[0.06] group-hover:bg-white/[0.1]"
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "black" : "white"} strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={isActive ? "white" : "none"}
                    stroke={isActive ? "white" : "currentColor"}
                    strokeWidth={isActive ? "2.5" : "1.5"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-200 ${
                      isActive ? "text-white" : "text-white/35 group-hover:text-white/70"
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
                  : "font-medium text-white/35 group-hover:text-white/70"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Separator ── */}
      <div className="relative mx-4 mb-3">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ── Wallet ── */}
      <div className="relative px-2 xl:px-2.5 pb-5 space-y-2">
        {isConnected && address ? (
          <>
            {!isOnboarded && (
              <button
                onClick={onboard}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-green-400 transition-all duration-200 bg-green-500/[0.06] border border-green-500/[0.08] hover:bg-green-500/[0.1] hover:border-green-500/[0.15]"
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
              className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.03] transition-all duration-200"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-40 blur-[4px] group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center ring-1 ring-white/10">
                  <span className="text-[11px] font-bold text-white">
                    {(handle || address.slice(2, 4)).slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="hidden xl:block text-left min-w-0">
                <div className="text-[12px] font-semibold text-white/80 truncate">
                  {handle ? `${handle}.whisper` : shortenAddress(address)}
                </div>
                <div className="text-[10px] text-white/25 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isOnboarded
                      ? "bg-green-400 shadow-[0_0_4px_rgba(0,230,118,0.6)]"
                      : "bg-yellow-400"
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
            className="group w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden relative bg-white/[0.03] border border-white/[0.06] hover:border-green-500/[0.15]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/[0.06] to-green-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <span className="relative flex items-center gap-2 text-white/60 group-hover:text-white/90 transition-colors">
              <span className="w-2 h-2 bg-green-400 rounded-full pulse-soft shadow-[0_0_6px_rgba(0,230,118,0.4)]" />
              <span className="hidden xl:inline">{isLoading ? "..." : "Connect"}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
