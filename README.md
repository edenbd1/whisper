# Whisper - Confidential Prediction Markets

A TikTok-style prediction market platform built on **COTI's confidential network**. Bet on real-world events with privacy-preserving technology. Swipe through predictions, place confidential bets, and earn rewards.

**Live on COTI Testnet** | Built for the [COTI Vibe Code Challenge](https://stay.coti.io/vibe-coding)

---

## Overview

Whisper reimagines prediction markets with a mobile-first, vertical-swipe UX (like TikTok/Instagram Reels) combined with COTI's garbled circuits privacy layer. Users scroll through prediction cards, bet YES or NO on outcomes, and their individual bet amounts remain confidential on-chain.

### Key Features

- **Vertical Swipe Feed** -- Full-screen prediction cards, swipe to browse (mobile + desktop)
- **Confidential Betting** -- Bet amounts encrypted via COTI's garbled circuits (MPC)
- **WhisperToken (WHISP)** -- Custom PrivateERC20 token with encrypted balances
- **On-Chain Markets** -- Prediction markets deployed as smart contracts on COTI Testnet
- **COTI Wallet Integration** -- MetaMask connection with COTI onboarding (AES key generation)
- **Testnet Faucet** -- Built-in faucet to claim 1000 WHISP tokens

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| Blockchain | COTI Testnet (gcEVM - Garbled Circuits EVM) |
| Smart Contracts | Solidity 0.8.19, Hardhat 2 |
| Privacy Layer | `@coti-io/coti-contracts` (MpcCore, PrivateERC20) |
| Wallet SDK | `@coti-io/coti-ethers` (ethers.js v6 + COTI extensions) |
| Chain | COTI Testnet (Chain ID: 7082400) |

---

## Architecture

```
whisper/
  src/
    app/              # Next.js App Router pages
    components/       # React components
      BetCard.tsx     # Full-screen prediction card
      BetFeed.tsx     # Vertical swipe feed container
      BetModal.tsx    # Bet placement modal (with on-chain tx)
      BottomNav.tsx   # Tab navigation
      Header.tsx      # Logo + wallet connection
      SideActions.tsx # TikTok-style side buttons
    context/
      WalletContext.tsx # COTI wallet + onboarding state
    lib/
      coti.ts         # COTI network config
      contracts.ts    # ABIs + contract addresses
      mockData.ts     # Mock prediction data
    types/            # TypeScript types
  contracts/
    contracts/
      WhisperToken.sol   # PrivateERC20 confidential token
      WhisperMarket.sol  # Prediction market contract
    scripts/
      deploy.ts          # Deployment + market creation script
    hardhat.config.ts    # COTI Testnet Hardhat config
```

---

## Smart Contracts

### WhisperToken.sol (PrivateERC20)

Extends COTI's `PrivateERC20` -- all balances are encrypted on-chain using garbled circuits.

- **Name:** Whisper
- **Symbol:** WHISP
- **Decimals:** 6
- **Privacy:** Balances stored as `utUint64` (dual-encrypted with network + user AES keys)
- **Faucet:** Each address can claim 1000 WHISP once (testnet only)
- **Mint:** Owner can mint additional tokens

### WhisperMarket.sol

Simple prediction market using native COTI for betting:

- **Create markets** with question, category, image, end time
- **Bet YES/NO** by sending COTI
- **Resolution** by owner (manual oracle)
- **Proportional payouts** to winning side

---

## COTI Privacy Technology Used

### Garbled Circuits (MPC)

COTI extends the EVM with **garbled circuits** -- a cryptographic technique that enables computation on encrypted data. This means:

1. **Encrypted Balances** -- Token balances are never visible on-chain in plaintext
2. **Private Transfers** -- Transfer amounts are encrypted inputs (`itUint64`)
3. **Secure Computation** -- Addition, subtraction, comparison all happen on encrypted values
4. **User Decryption** -- Only the account holder (with their AES key) can decrypt their balance

### Data Types

| Type | Description |
|------|-------------|
| `ctUint64` | Ciphertext -- encrypted with network key (storage) |
| `utUint64` | Usertext -- dual-encrypted with network + user key (storage) |
| `itUint64` | Inputtext -- encrypted transaction input (calldata) |
| `gtUint64` | Garbledtext -- temporary in-memory value for computation |

### Account Onboarding

Each user must complete a one-time onboarding to generate their AES encryption key:

```typescript
import { BrowserProvider } from "@coti-io/coti-ethers"

const provider = new BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
await signer.generateOrRecoverAes() // Generates AES key via MPC
const aesKey = signer.getUserOnboardInfo()?.aesKey
```

---

## COTI Prompt Packs Reference

This project was built following COTI's official Vibe Coding prompt packs. Here's what each pack covers and how we used them:

### Part 1 -- Vibe Code Your App

**Source:** [Google Doc](https://docs.google.com/document/d/1-7nno5dK61_dqbuxrMAWVBOgSO6t8_wuDwl3pVuvfsQ)

**What it covers:** Building a frontend-only web app prototype with modern UX/UI, layout, motion, and visual hierarchy using React + Framer Motion.

**How we used it:**
- Built the full vertical-swipe prediction feed UI
- Used Framer Motion for all animations (card transitions, button feedback, modal slides)
- Clean dark theme design system with glass morphism effects
- Mobile-first responsive layout that works identically on desktop

### Part 2 -- Create a Private Token

**Source:** [Google Doc](https://docs.google.com/document/d/1ygnCDHfeD1DLRXG7rqyb7z5YXuvrQ-IGJST41WlZsIY)

**What it covers:** Creating a private token on COTI using the COTI MCP server via Smithery.AI.

**How we used it:**
- Created `WhisperToken.sol` extending COTI's `PrivateERC20`
- Token deployed on COTI Testnet with confidential balances
- Added faucet function for testnet distribution
- Used `@coti-io/coti-contracts` for MpcCore and PrivateERC20 base

### Part 3 -- Connect Your App & Token

**Source:** [Google Doc](https://docs.google.com/document/d/1Mm2i93N06sFWPB9O0JoWeFPVtBlW9VNQgxoud1QjVgM)

**What it covers:** Four prompts for wallet connection, onboarding, prize claiming, and balance display.

**How we used it:**

| Prompt | Feature | Our Implementation |
|--------|---------|-------------------|
| Prompt 1: Connect Wallet | MetaMask + COTI chain | `WalletContext.tsx` -- uses `@coti-io/coti-ethers` BrowserProvider, chain switching, address display |
| Prompt 2: Onboarding | AES key generation | `WalletContext.tsx` -- `generateOrRecoverAes()`, localStorage persistence of AES keys |
| Prompt 3: Claim | Server-side token minting | Adapted for market bet placement via smart contract |
| Prompt 4: Show Balance | Encrypted balance decryption | Ready for integration with `signer.decryptValue()` |

### Additional Prompts

**Private Backend Guide** ([Google Doc](https://docs.google.com/document/d/1_SHC_qnDXqyE333DNa5Iw9aYcec37DLH))
- Server-side validation, reward calculation, anti-cheat logic
- Applied to market resolution and payout calculation

**COTI MCP Studio** ([Google Doc](https://docs.google.com/document/d/1JITR-6CDoBkNXtmRY-a7vRMslsNn8sfMlTB82cA2Gzw))
- MCP server connection protocol (JSON-RPC 2.0 over SSE)
- Account management, ERC20 operations, transaction management
- Referenced for understanding the full COTI MCP toolchain

---

## Network Configuration

### COTI Testnet

| Property | Value |
|----------|-------|
| Network Name | COTI Testnet |
| RPC URL | `https://testnet.coti.io/rpc` |
| WebSocket | `wss://testnet.coti.io/ws` |
| Chain ID | `7082400` |
| Currency | COTI (18 decimals) |
| Block Explorer | `https://testnet.cotiscan.io` |
| Faucet | [Discord Bot](https://discord.coti.io) -- `testnet <address>` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- COTI testnet tokens (from Discord faucet)

### Install & Run

```bash
# Clone the repo
cd whisper

# Install frontend dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy Contracts

```bash
cd contracts

# Install dependencies
npm install

# Set your private key in .env
echo "PRIVATE_KEY=0x..." > .env

# Compile
npx hardhat compile

# Deploy to COTI Testnet
npx hardhat run scripts/deploy.ts --network coti-testnet
```

After deployment, update `.env.local` with the contract addresses:

```
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_MARKET_ADDRESS=0x...
```

---

## How It Works

1. **Connect Wallet** -- Click "Connect" in the header, MetaMask switches to COTI Testnet
2. **Onboard** -- One-time AES key generation for confidential operations
3. **Browse Markets** -- Swipe through full-screen prediction cards
4. **Place Bets** -- Tap YES or NO, choose your amount, confirm the transaction
5. **Win** -- When a market resolves, winning side claims proportional payouts

---

## Design Decisions

- **Vertical feed** over traditional grid -- maximizes engagement, proven by TikTok/Reels
- **Native COTI for bets** -- simplifies UX (no token approval flow needed)
- **WhisperToken for rewards** -- demonstrates COTI's PrivateERC20 with encrypted balances
- **Dark theme** -- matches the "confidential/secret" branding, reduces eye strain for scrolling
- **Glass morphism** -- modern, premium feel without heavy UI elements
- **No wagmi/viem** -- follows COTI's recommended approach using `@coti-io/coti-ethers` directly

---

## License

MIT
