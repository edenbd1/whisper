"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { useMarket } from "@/context/MarketContext";
import { CONTRACT_ADDRESSES, WISPR_MARKET_ABI } from "@/lib/contracts";
import { getExplorerTxUrl } from "@/lib/coti";

export default function CreateView() {
  const { isConnected, signer, connect } = useWallet();
  const { refreshMarkets } = useMarket();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Crypto");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const categories = ["Crypto", "Geopolitics", "Technology", "Sports", "Business", "Science", "Conspiracy"];
  const isValid = question.length >= 10 && endDate;

  const handleSubmit = async () => {
    if (!isValid || !signer) return;

    if (!CONTRACT_ADDRESSES.market) {
      setSubmitted(true);
      return;
    }

    setPending(true);
    setError("");
    try {
      const { Contract } = await import("@coti-io/coti-ethers");
      const market = new Contract(CONTRACT_ADDRESSES.market, WISPR_MARKET_ABI, signer);
      const endTime = Math.floor(new Date(endDate).getTime() / 1000);
      const img = imageUrl || `https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80`;
      const tx = await market.createMarket(question, category, img, endTime, { gasLimit: 2_000_000 });
      setTxHash(tx.hash);
      await tx.wait();
      await refreshMarkets();
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.reason || err?.message || "Transaction failed";
      setError(msg.includes("user rejected") ? "Transaction rejected" : msg.length > 100 ? msg.slice(0, 100) + "..." : msg);
    } finally {
      setPending(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#005EF8]/10 to-[#005EF8]/10 flex items-center justify-center mx-auto ring-1 ring-[#005EF8]/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="1.5" strokeLinecap="round" className="opacity-60">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">Connect your wallet to create markets</p>
          <button
            onClick={connect}
            className="glass px-6 py-2.5 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/[0.06] transition-colors btn-press"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#005EF8]/10 flex items-center justify-center mx-auto ring-1 ring-[#005EF8]/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Market Created</h3>
          <p className="text-sm text-white/30">{question}</p>
          {txHash && (
            <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
              className="text-[#005EF8]/60 text-xs hover:text-[#005EF8] transition-colors underline decoration-[#005EF8]/20 underline-offset-2">
              View on CotiScan
            </a>
          )}
          <button
            onClick={() => { setSubmitted(false); setQuestion(""); setEndDate(""); setImageUrl(""); setTxHash(""); }}
            className="glass px-6 py-2.5 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/[0.06] transition-colors btn-press"
          >
            Create Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 lg:pb-8">
      <div className="max-w-md mx-auto px-5 pt-20 lg:pt-8">
        <h1 className="text-2xl font-black text-white mb-1">Create Market</h1>
        <p className="text-sm text-white/30 mb-8">Launch a new prediction market on COTI</p>

        <div className="space-y-5">
          {/* Question */}
          <div>
            <label className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2 block">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will Bitcoin hit $200K before July 2026?"
              rows={3}
              className="w-full glass rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-[#005EF8]/20 transition-all resize-none"
            />
            <p className="text-[10px] text-white/15 mt-1">{question.length}/200 characters</p>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all btn-press ${
                    category === cat
                      ? "bg-[#005EF8]/10 text-[#005EF8] ring-1 ring-[#005EF8]/10"
                      : "glass text-white/40 hover:text-white/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* End date */}
          <div>
            <label className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2 block">
              Resolution Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full glass rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#005EF8]/20 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Image URL (optional) */}
          <div>
            <label className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2 block">
              Image URL <span className="text-white/15 normal-case">(optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full glass rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-[#005EF8]/20 transition-all"
            />
          </div>

          {/* Initial odds info */}
          <div className="glass rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-white/30">Starting odds</span>
              <span className="text-white/60 font-semibold">50c / 50c</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-white/30">AMM model</span>
              <span className="text-white/60 font-semibold">CPMM (Constant Product)</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-white/30">Network</span>
              <span className="text-white/60 font-semibold">COTI Testnet</span>
            </div>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#005EF8]/[0.03] border border-[#005EF8]/[0.06]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#005EF8" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 opacity-60">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[11px] text-white/20 leading-relaxed">Markets are deployed on COTI with confidential betting.</span>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || pending}
            className={`w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 btn-press ${
              pending
                ? "glass text-white/30 cursor-wait"
                : isValid
                ? "bg-[#005EF8] text-white glow-accent hover:bg-[#3B82F6]"
                : "bg-white/[0.03] text-white/10 cursor-not-allowed"
            }`}
          >
            {pending ? "Creating on COTI..." : !isValid ? "Fill in all fields" : "Create Market"}
          </button>
        </div>
      </div>
    </div>
  );
}
