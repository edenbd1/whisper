"use client";

import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";

interface HeaderProps {
  handle: string | null;
}

export default function Header({ handle }: HeaderProps) {
  const { isConnected, address, isOnboarded, isLoading, connect, disconnect, onboard } = useWallet();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <span className="text-black font-black text-[10px]">W</span>
            </div>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-white">whisper</span>
          </motion.div>

          {/* Wallet */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              {!isOnboarded && (
                <button
                  onClick={onboard}
                  disabled={isLoading}
                  className="glass px-3 py-1.5 rounded-full text-[11px] font-semibold text-green-400"
                >
                  {isLoading ? "..." : "Onboard"}
                </button>
              )}
              <button
                onClick={disconnect}
                className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/80"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnboarded ? "bg-green-400" : "bg-yellow-400"}`} />
                {handle ? `${handle}.whisper` : shortenAddress(address)}
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isLoading}
              className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/80"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full pulse-soft" />
              {isLoading ? "..." : "Connect"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
