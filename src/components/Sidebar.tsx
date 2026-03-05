"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type NavItem = "feed" | "explore" | "create" | "likes" | "profile";

function WhisperLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M8 12l2 2 4-4" stroke="#00e676" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "2.5" : "1.5"}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={active ? "2.5" : "1.5"}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "2.5" : "1.5"}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "2.5" : "1.5"}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Sidebar() {
  const [active, setActive] = useState<NavItem>("feed");

  const items: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: "feed", label: "Home", icon: <HomeIcon active={active === "feed"} /> },
    { id: "explore", label: "Explore", icon: <ExploreIcon active={active === "explore"} /> },
    { id: "create", label: "Create", icon: <CreateIcon /> },
    { id: "likes", label: "Likes", icon: <HeartIcon active={active === "likes"} /> },
    { id: "profile", label: "Profile", icon: <ProfileIcon active={active === "profile"} /> },
  ];

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] xl:w-[220px] flex-col border-r border-white/10 bg-black z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-8">
        <WhisperLogo />
        <span className="hidden xl:block text-lg font-bold tracking-tight">whisper</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative flex items-center gap-4 px-3 py-3 rounded-lg transition-all hover:bg-white/5 ${
              active === item.id ? "font-bold" : "font-normal"
            }`}
          >
            {item.icon}
            <span className="hidden xl:block text-sm">{item.label}</span>
            {active === item.id && (
              <motion.div
                layoutId="sidebarActive"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Menu at bottom */}
      <div className="px-3 pb-8">
        <button className="flex items-center gap-4 px-3 py-3 rounded-lg transition-all hover:bg-white/5 w-full">
          <MenuIcon />
          <span className="hidden xl:block text-sm">More</span>
        </button>
      </div>
    </div>
  );
}
