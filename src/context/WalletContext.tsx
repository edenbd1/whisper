"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { COTI_TESTNET } from "@/lib/coti";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  signer: any | null;
  provider: any | null;
  isOnboarded: boolean;
  aesKey: string | null;
  isLoading: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  onboard: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
}

function getStoredWallets(): Array<{ wallet: string; aesKey: string }> {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("walletsList") || "[]");
  } catch {
    return [];
  }
}

function storeWallet(address: string, aesKey: string) {
  const wallets = getStoredWallets();
  const existing = wallets.findIndex(
    (w) => w.wallet.toLowerCase() === address.toLowerCase()
  );
  if (existing >= 0) {
    wallets[existing].aesKey = aesKey;
  } else {
    wallets.push({ wallet: address, aesKey });
  }
  localStorage.setItem("walletsList", JSON.stringify(wallets));
}

function getStoredAesKey(address: string): string | null {
  const wallets = getStoredWallets();
  const found = wallets.find(
    (w) => w.wallet.toLowerCase() === address.toLowerCase()
  );
  return found?.aesKey || null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    signer: null,
    provider: null,
    isOnboarded: false,
    aesKey: null,
    isLoading: false,
  });

  const switchToCotiNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    const chainIdHex = `0x${COTI_TESTNET.chainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: COTI_TESTNET.name,
              nativeCurrency: COTI_TESTNET.currency,
              rpcUrls: [COTI_TESTNET.rpc],
              blockExplorerUrls: [COTI_TESTNET.explorer],
            },
          ],
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setState((s) => ({ ...s, isLoading: true }));

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await switchToCotiNetwork();

      // Dynamic import to avoid SSR issues
      const { BrowserProvider } = await import("@coti-io/coti-ethers");
      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check if already onboarded
      const storedAes = getStoredAesKey(address);
      const isOnboarded = !!storedAes;

      if (isOnboarded && storedAes) {
        try {
          (signer as any).setAesKey(storedAes);
        } catch {
          // Might not be available, that's ok
        }
      }

      setState({
        isConnected: true,
        address,
        signer,
        provider,
        isOnboarded,
        aesKey: storedAes,
        isLoading: false,
      });
    } catch (err) {
      console.error("Connect failed:", err);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [switchToCotiNetwork]);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      signer: null,
      provider: null,
      isOnboarded: false,
      aesKey: null,
      isLoading: false,
    });
  }, []);

  const onboard = useCallback(async () => {
    if (!state.signer || !state.address) return;

    setState((s) => ({ ...s, isLoading: true }));

    try {
      await (state.signer as any).generateOrRecoverAes();
      const onboardInfo = (state.signer as any).getUserOnboardInfo?.();
      const aesKey = onboardInfo?.aesKey;

      if (aesKey && state.address) {
        storeWallet(state.address, aesKey);
      }

      setState((s) => ({
        ...s,
        isOnboarded: true,
        aesKey: aesKey || null,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Onboarding failed:", err);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [state.signer, state.address]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, onboard }}>
      {children}
    </WalletContext.Provider>
  );
}
