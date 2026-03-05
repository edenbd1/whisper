"use client";

import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";

export default function Header() {
  const { isConnected, address, isOnboarded, isLoading, connect, disconnect, onboard } = useWallet();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 gradient-top">
      <div className="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 max-w-lg mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 12l2 2 4-4" stroke="#00e676" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            whisper
          </span>
        </motion.div>

        {/* Wallet area */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              {!isOnboarded && (
                <button
                  onClick={onboard}
                  disabled={isLoading}
                  className="glass px-3 py-1.5 rounded-full text-xs font-semibold text-green hover:bg-white/10 transition-all"
                >
                  {isLoading ? "Setting up..." : "Onboard"}
                </button>
              )}
              <button
                onClick={disconnect}
                className="glass px-3 py-2 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${isOnboarded ? "bg-green" : "bg-yellow-400"}`} />
                {shortenAddress(address)}
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isLoading}
              className="glass px-4 py-2 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-green rounded-full" />
              {isLoading ? "Connecting..." : "Connect"}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
