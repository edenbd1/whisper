"use client";

import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";

export default function Header() {
  const { isConnected, address, isOnboarded, isLoading, connect, disconnect, onboard } = useWallet();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 12l2 2 4-4" stroke="#00e676" />
            </svg>
            <span className="text-base font-bold tracking-tight text-white">whisper</span>
          </motion.div>

          {/* Wallet */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              {!isOnboarded && (
                <button
                  onClick={onboard}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-semibold text-green-400"
                >
                  {isLoading ? "..." : "Onboard"}
                </button>
              )}
              <button
                onClick={disconnect}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-medium text-white/80"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnboarded ? "bg-green-400" : "bg-yellow-400"}`} />
                {shortenAddress(address)}
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-semibold text-white/80"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              {isLoading ? "..." : "Connect"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
