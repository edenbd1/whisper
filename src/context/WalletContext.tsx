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
  decryptBalance: () => Promise<number | null>;
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

    const chainIdHex = COTI_TESTNET.chainIdHex;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // 4902 = chain not added yet, any other error = try adding too
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

    // Verify the chain actually switched (compare lowercase - wallets return mixed case)
    const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
    if (currentChainId.toLowerCase() !== chainIdHex.toLowerCase()) {
      throw new Error(`Please switch to COTI Testnet in your wallet. Current chain: ${currentChainId}`);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("No wallet detected. Please install MetaMask or Rabby.");
      return;
    }

    setState((s) => ({ ...s, isLoading: true }));

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await switchToCotiNetwork();

      // Small delay to let wallet settle after chain switch
      await new Promise((r) => setTimeout(r, 500));

      // Dynamic import to avoid SSR issues
      const { BrowserProvider } = await import("@coti-io/coti-ethers");
      const provider = new BrowserProvider(window.ethereum as any);
      const network = await provider.getNetwork();
      console.log("Connected to chain:", network.chainId.toString());

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
    } catch (err: any) {
      console.error("Connect failed:", err);
      const msg = err?.message || "Connection failed";
      alert(msg);
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
      // Check native COTI balance first (needed for gas)
      const balance = await state.provider.getBalance(state.address);
      if (balance === BigInt(0)) {
        alert("You need native COTI for gas. Get testnet COTI from the faucet first.");
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      // Use the standalone onboard function for better error visibility
      const { onboard: cotiOnboard } = await import("@coti-io/coti-ethers");
      const onboardInfo = await cotiOnboard(
        "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095", // AccountOnboard contract
        state.signer as any
      );

      const aesKey = onboardInfo?.aesKey;
      if (aesKey) {
        (state.signer as any).setUserOnboardInfo?.(onboardInfo);
        storeWallet(state.address, aesKey);
      }

      setState((s) => ({
        ...s,
        isOnboarded: true,
        aesKey: aesKey || null,
        isLoading: false,
      }));
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      const msg = err?.message || "Unknown error";
      if (msg.includes("user rejected") || msg.includes("denied")) {
        alert("Signature request was rejected. Please approve the signing to complete onboarding.");
      } else if (msg.includes("balance is 0")) {
        alert("You need native COTI for gas. Get testnet COTI from the faucet first.");
      } else {
        alert(`Onboarding failed: ${msg}`);
      }
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [state.signer, state.address, state.provider]);

  const decryptBalance = useCallback(async (): Promise<number | null> => {
    if (!state.signer || !state.address || !state.isOnboarded) return null;
    try {
      const { Contract } = await import("@coti-io/coti-ethers");
      const { CONTRACT_ADDRESSES, CUSDC_ABI } = await import("@/lib/contracts");
      if (!CONTRACT_ADDRESSES.token) return null;

      const tokenContract = new Contract(CONTRACT_ADDRESSES.token, CUSDC_ABI, state.signer);
      const encryptedBalance = await tokenContract.balanceOf(state.address);

      // Use COTI signer's decryptValue to decrypt the ctUint64
      const decrypted = await (state.signer as any).decryptValue(encryptedBalance);
      // Convert from 6 decimals
      return Number(decrypted) / 1e6;
    } catch (err) {
      console.error("Failed to decrypt balance:", err);
      return null;
    }
  }, [state.signer, state.address, state.isOnboarded]);

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
    <WalletContext.Provider value={{ ...state, connect, disconnect, onboard, decryptBalance }}>
      {children}
    </WalletContext.Provider>
  );
}
