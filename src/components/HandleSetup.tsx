"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HandleSetupProps {
  isOpen: boolean;
  onSubmit: (handle: string) => void;
  onSkip: () => void;
}

const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/;

export default function HandleSetup({ isOpen, onSubmit, onSkip }: HandleSetupProps) {
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid = HANDLE_REGEX.test(handle);

  const handleSubmit = () => {
    if (!isValid) {
      setError("3-20 chars, lowercase letters, numbers, underscores only");
      return;
    }
    setSuccess(true);
    setTimeout(() => onSubmit(handle), 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/20"
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </motion.div>
                  <h2 className="text-2xl font-black text-white mb-2">Welcome!</h2>
                  <p className="text-lg text-white/40">
                    <span className="text-white font-bold">{handle}</span><span className="text-white/20">.whisper</span>
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Logo */}
                  <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                      <span className="text-black font-black text-sm">W</span>
                    </div>
                    <span className="text-lg font-bold text-gradient">whisper</span>
                  </div>

                  <h2 className="text-2xl font-black text-white text-center mb-2">Choose your handle</h2>
                  <p className="text-sm text-white/30 text-center mb-8">This is your identity on Whisper</p>

                  {/* Input */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => {
                        setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                        setError("");
                      }}
                      placeholder="username"
                      maxLength={20}
                      autoFocus
                      className="w-full glass rounded-xl px-4 py-4 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all pr-24"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/15 text-sm font-semibold">.whisper</span>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs mb-4">{error}</p>
                  )}

                  {handle && (
                    <div className={`flex items-center gap-2 mb-6 text-[12px] ${isValid ? "text-green-400/60" : "text-white/20"}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        {isValid ? (
                          <polyline points="20 6 9 17 4 12" />
                        ) : (
                          <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                        )}
                      </svg>
                      <span>{isValid ? `${handle}.whisper is available` : "3-20 chars, lowercase, numbers, underscores"}</span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className={`w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 btn-press mb-3 ${
                      isValid
                        ? "bg-green-500 text-black glow-green hover:bg-green-400"
                        : "bg-white/[0.03] text-white/10 cursor-not-allowed"
                    }`}
                  >
                    Claim Handle
                  </button>

                  <button
                    onClick={onSkip}
                    className="w-full py-3 text-sm text-white/20 hover:text-white/40 transition-colors"
                  >
                    Skip for now
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
