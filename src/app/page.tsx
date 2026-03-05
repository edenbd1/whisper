"use client";

import BetFeed from "@/components/BetFeed";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="h-[100dvh] w-full bg-[#050505] overflow-hidden">
      <Header />
      <BetFeed />
      <BottomNav />
    </main>
  );
}
