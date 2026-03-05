"use client";

import BetFeed from "@/components/BetFeed";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";

function DesktopHeader() {
  const { isConnected, address, isOnboarded, isLoading, connect, disconnect, onboard } = useWallet();

  return (
    <div className="hidden lg:flex fixed top-0 right-0 z-50 items-center gap-3 p-4">
      {isConnected && address ? (
        <>
          {!isOnboarded && (
            <button
              onClick={onboard}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors"
            >
              {isLoading ? "Setting up..." : "Onboard"}
            </button>
          )}
          <button
            onClick={disconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white/80 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${isOnboarded ? "bg-green-400" : "bg-yellow-400"}`} />
            {shortenAddress(address)}
          </button>
        </>
      ) : (
        <button
          onClick={connect}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden">
      {/* Desktop: sidebar */}
      <Sidebar />

      {/* Desktop: wallet button top-right */}
      <DesktopHeader />

      {/* Mobile: header + bottom nav */}
      <Header />
      <BottomNav />

      {/* Feed content - offset by sidebar on desktop */}
      <div className="h-full lg:pl-[72px] xl:pl-[220px]">
        <BetFeed />
      </div>
    </main>
  );
}
