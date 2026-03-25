"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/coti";

interface Comment {
  id: string;
  address: string;
  text: string;
  timestamp: number;
}

function getComments(marketId: string): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`whisper-comments-${marketId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComments(marketId: string, comments: Comment[]) {
  localStorage.setItem(`whisper-comments-${marketId}`, JSON.stringify(comments));
}

// Generate a consistent color from an address
function addressColor(addr: string): string {
  const colors = ["#FE2C55", "#25F4EE", "#FF6F61", "#A855F7", "#22C55E", "#F59E0B", "#3B82F6", "#EC4899"];
  let hash = 0;
  for (let i = 0; i < addr.length; i++) hash = addr.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function Comments({ marketId }: { marketId: string }) {
  const { isConnected, address } = useWallet();
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setComments(getComments(marketId));
  }, [marketId]);

  const handleSend = () => {
    if (!input.trim() || !address) return;
    const newComment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      address,
      text: input.trim(),
      timestamp: Date.now(),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    saveComments(marketId, updated);
    setInput("");
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-col h-full bg-black border-l border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center border-b border-white/[0.06] px-4 h-[52px] flex-shrink-0">
        <span className="text-[15px] font-bold text-white">Comments</span>
        <span className="ml-2 text-[13px] text-white/30">{comments.length}</span>
      </div>

      {/* Comments list */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/10 mb-3">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-[13px] text-white/20">No comments yet</p>
            <p className="text-[11px] text-white/10 mt-1">Be the first to comment</p>
          </div>
        )}
        {comments.map((c) => (
          <div key={c.id} className="group">
            <div className="flex items-start gap-2.5">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                style={{ backgroundColor: addressColor(c.address) + "30", border: `1px solid ${addressColor(c.address)}40` }}
              >
                {c.address.slice(2, 4).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-white/60">{shortenAddress(c.address)}</span>
                  <span className="text-[10px] text-white/20">{timeAgo(c.timestamp)}</span>
                </div>
                <p className="text-[13px] text-white/80 mt-0.5 break-words leading-[1.4]">{c.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/[0.06] px-3 py-3">
        {isConnected && address ? (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white"
              style={{ backgroundColor: addressColor(address) + "30", border: `1px solid ${addressColor(address)}40` }}
            >
              {address.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1 flex items-center bg-white/[0.06] rounded-full border border-white/[0.06] px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/20 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="ml-2 text-[#FE2C55] disabled:text-white/15 text-[13px] font-semibold transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-[12px] text-white/25">Connect wallet to comment</p>
          </div>
        )}
      </div>
    </div>
  );
}
