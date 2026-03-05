# Whisper - Confidential Prediction Markets

A TikTok-style prediction market platform built on **COTI's confidential network**. Bet on real-world events with privacy-preserving technology. Swipe through predictions, place confidential bets, trade positions, and earn rewards.

**Live on COTI Testnet** | Built for the [COTI Vibe Code Challenge](https://stay.coti.io/vibe-coding)

---

## Overview

Whisper reimagines prediction markets with a mobile-first, vertical-swipe UX (like TikTok/Instagram Reels) combined with COTI's garbled circuits privacy layer. Users scroll through prediction cards, buy YES or NO shares at dynamic prices powered by an AMM, and their individual positions remain confidential on-chain.

### Key Features

- **Vertical Swipe Feed** -- Full-screen prediction cards, swipe to browse (mobile + desktop)
- **CPMM Market Maker** -- Constant Product AMM with dynamic pricing (prices move with volume)
- **Position Trading** -- Buy/sell shares like Polymarket (entry price, P&L tracking, sell positions)
- **Confidential Betting** -- Bet amounts encrypted via COTI's garbled circuits (MPC)
- **Handle System** -- Choose a `username.whisper` identity on first connect
- **Portfolio View** -- Track all positions, unrealized P&L, and portfolio value
- **Price Impact Preview** -- See shares received, avg price, and market impact before trading
- **WhisperToken (WHISP)** -- Custom PrivateERC20 token with encrypted balances
- **On-Chain Markets** -- Prediction markets deployed as smart contracts on COTI Testnet
- **COTI Wallet Integration** -- MetaMask connection with COTI onboarding (AES key generation)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| AMM Engine | Constant Product Market Maker (CPMM) |
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
    components/
      BetCard.tsx     # Full-screen prediction card with AMM prices
      BetFeed.tsx     # Vertical swipe feed container
      BetModal.tsx    # Bet placement with price impact preview
      BottomNav.tsx   # Mobile tab navigation
      Header.tsx      # Logo + wallet + handle display
      Sidebar.tsx     # Desktop navigation with handle display
      SideActions.tsx # TikTok-style side buttons
      PortfolioView.tsx  # Position tracking + P&L
      SellModal.tsx      # Sell position interface
      HandleSetup.tsx    # Username.whisper creation flow
    context/
      WalletContext.tsx  # COTI wallet + onboarding state
      MarketContext.tsx  # AMM state + position management
    lib/
      amm.ts          # CPMM math engine (pure functions)
      storage.ts      # localStorage persistence layer
      coti.ts         # COTI network config
      contracts.ts    # ABIs + contract addresses
      mockData.ts     # Mock prediction data
    types/            # TypeScript types (AMM, Position, Handle)
  contracts/
    contracts/
      WhisperToken.sol   # PrivateERC20 confidential token
      WhisperMarket.sol  # Prediction market contract
    scripts/
      deploy.js          # Deployment + market creation script
    hardhat.config.ts    # COTI Testnet Hardhat config
```

---

## How the AMM Works

Whisper uses a **Constant Product Market Maker (CPMM)** -- the same model used by Polymarket and Uniswap.

### Pricing

Each market has a virtual pool of YES and NO shares:
- **Price of YES** = `noShares / (yesShares + noShares)`
- **Price of NO** = `yesShares / (yesShares + noShares)`
- **Invariant** = `yesShares * noShares = k` (constant)

### Trading

When you buy YES shares:
1. You add COTI to the NO pool
2. You receive YES shares from the pool
3. YES price increases, NO price decreases
4. The invariant `k` is preserved

### Position Selling

Like Polymarket, you can sell positions before resolution:
- Sell YES shares back to the pool at the current market price
- Realize profit if price has moved in your favor
- Price impact shown before executing the sell

### Example
```
Initial: YES 34¢ / NO 66¢
Buy 1 COTI of YES -> Receive ~2.5 YES shares at avg 40¢
New price: YES 38¢ / NO 62¢ (price moved up from buying pressure)
```

---

## Smart Contracts

### WhisperToken.sol (PrivateERC20)

Extends COTI's `PrivateERC20` -- all balances are encrypted on-chain using garbled circuits.

- **Name:** Whisper | **Symbol:** WHISP | **Decimals:** 6
- **Privacy:** Balances stored as `utUint64` (dual-encrypted with network + user AES keys)
- **Faucet:** Each address can claim 1000 WHISP once (testnet only)

### WhisperMarket.sol

Prediction market using native COTI for betting:

- **Create markets** with question, category, image, end time
- **Bet YES/NO** by sending COTI
- **Resolution** by owner (manual oracle)
- **Proportional payouts** to winning side

---

## COTI Privacy Technology Used

### Garbled Circuits (MPC)

COTI extends the EVM with **garbled circuits** -- enabling computation on encrypted data:

1. **Encrypted Balances** -- Token balances are never visible on-chain in plaintext
2. **Private Transfers** -- Transfer amounts are encrypted inputs (`itUint64`)
3. **Secure Computation** -- Addition, subtraction, comparison happen on encrypted values
4. **User Decryption** -- Only the account holder (with their AES key) can decrypt their balance

### Data Types

| Type | Description |
|------|-------------|
| `ctUint64` | Ciphertext -- encrypted with network key (storage) |
| `utUint64` | Usertext -- dual-encrypted with network + user key (storage) |
| `itUint64` | Inputtext -- encrypted transaction input (calldata) |
| `gtUint64` | Garbledtext -- temporary in-memory value for computation |

### Account Onboarding

```typescript
import { BrowserProvider } from "@coti-io/coti-ethers"

const provider = new BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
await signer.generateOrRecoverAes() // Generates AES key via MPC
const aesKey = signer.getUserOnboardInfo()?.aesKey
```

---

## COTI Prompt Packs Reference

This project was built following COTI's official Vibe Coding prompt packs:

### Part 1 -- Vibe Code Your App
- Built the full vertical-swipe prediction feed UI
- Framer Motion animations, glass morphism, dark theme design system
- Mobile-first responsive layout identical on desktop

### Part 2 -- Create a Private Token
- Created `WhisperToken.sol` extending COTI's `PrivateERC20`
- Token deployed on COTI Testnet with confidential balances
- Faucet function for testnet distribution

### Part 3 -- Connect Your App & Token
- MetaMask wallet connection with COTI chain switching
- AES key generation via `generateOrRecoverAes()`
- localStorage persistence of AES keys per wallet

---

## Network Configuration

| Property | Value |
|----------|-------|
| Network Name | COTI Testnet |
| RPC URL | `https://testnet.coti.io/rpc` |
| Chain ID | `7082400` |
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
cd whisper
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy Contracts

```bash
cd contracts
npm install
npx hardhat compile
node scripts/deploy.js
```

---

## How It Works

1. **Connect Wallet** -- Click "Connect", MetaMask switches to COTI Testnet
2. **Choose Handle** -- Pick your `username.whisper` identity
3. **Onboard** -- One-time AES key generation for confidential operations
4. **Browse Markets** -- Swipe through full-screen prediction cards
5. **Buy Shares** -- Tap YES or NO, see price impact, confirm the trade
6. **Track Portfolio** -- View positions, P&L, current value in the Profile tab
7. **Sell Positions** -- Sell shares back at market price to realize profits
8. **Win** -- When a market resolves, winning side claims proportional payouts

---

## Design Decisions

- **CPMM over parimutuel** -- Dynamic pricing creates a real trading experience like Polymarket
- **Vertical feed** over traditional grid -- maximizes engagement, proven by TikTok/Reels
- **Polymarket-style pricing** -- Shares priced in cents (34¢/66¢) instead of percentages
- **Client-side AMM** -- Instant price updates, no block confirmation wait for UI responsiveness
- **Position trading** -- Buy low, sell high before resolution (not just wait-and-win)
- **Handle system** -- Human-readable identity (username.whisper) instead of hex addresses
- **Native COTI for bets** -- Simplifies UX (no token approval flow needed)
- **Dark theme + glassmorphism** -- Premium feel matching the confidential/private brand
- **No wagmi/viem** -- Follows COTI's recommended approach using `@coti-io/coti-ethers`

---

## License

MIT
