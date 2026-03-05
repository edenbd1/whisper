"use client";

import BetFeed from "@/components/BetFeed";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <main className="h-[100dvh] w-full bg-[#050505] overflow-hidden">
      <Sidebar />
      <Header />
      <BottomNav />
      <div className="h-full lg:pl-[72px] xl:pl-[244px]">
        <BetFeed />
      </div>
    </main>
  );
}
