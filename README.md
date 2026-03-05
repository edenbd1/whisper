# Whisper

**Confidential prediction markets with a TikTok-style UX, powered by COTI's privacy layer.**

Swipe through full-screen prediction cards. Buy YES or NO shares at dynamic AMM prices. Your positions stay encrypted on-chain. Built for the [COTI Vibe Code Challenge](https://stay.coti.io/vibe-coding).

> **Live on COTI Testnet** | [WhisperToken](https://testnet.cotiscan.io/address/0xA6fC08A750dC00e6f613e2aabaB5a54949D8B356) | [WhisperMarket](https://testnet.cotiscan.io/address/0xBb4c3A08E108465b305205D92C089cd1a63976b6)

---

## What Makes Whisper Different

Most prediction markets feel like spreadsheets. Whisper feels like scrolling TikTok.

- **Vertical swipe feed** — full-screen cards with cinematic backgrounds, swipe to browse
- **Polymarket-style trading** — shares priced in cents (34c/66c), not percentages. Buy low, sell high before resolution
- **Real AMM engine** — Constant Product Market Maker with mint-and-swap pricing, price impact preview, and position P&L tracking
- **Confidential by default** — token balances encrypted via COTI's garbled circuits (MPC). Nobody sees your position size
- **Mobile-first** — designed for phones, scales to desktop with sidebar navigation

---

## COTI Privacy Technology

Whisper uses COTI's garbled circuits at every layer:

| What | How |
|------|-----|
| **Token balances** | `WhisperToken` extends `PrivateERC20` — balances stored as `utUint64`, encrypted with network + user AES keys |
| **Transfers** | Amounts are `itUint64` encrypted inputs — transfer values never appear in plaintext on-chain |
| **Computation** | Addition, comparison, minting all happen on `gtUint64` garbled values inside the gcEVM |
| **User decryption** | Only the account holder can decrypt their balance after AES key onboarding via `generateOrRecoverAes()` |

### Account Onboarding Flow

```typescript
import { BrowserProvider } from "@coti-io/coti-ethers";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
await signer.generateOrRecoverAes(); // One-time MPC key generation
const aesKey = signer.getUserOnboardInfo()?.aesKey;
```

AES keys are persisted per wallet in `localStorage` so users only onboard once.

---

## Smart Contracts (Deployed on COTI Testnet)

### WhisperToken — `0xA6fC08A750dC00e6f613e2aabaB5a54949D8B356`

Confidential ERC20 token extending COTI's `PrivateERC20`.

```solidity
contract WhisperToken is PrivateERC20 {
    uint64 public constant FAUCET_AMOUNT = 1000 * 1e6;

    constructor() PrivateERC20("Whisper", "WHISP") {}

    function faucet() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, MpcCore.setPublic64(FAUCET_AMOUNT));
    }
}
```

- **Name:** Whisper | **Symbol:** WHISP | **Decimals:** 6
- Faucet: 1,000 WHISP per address (testnet)
- All balances encrypted on-chain

### WhisperMarket — `0xBb4c3A08E108465b305205D92C089cd1a63976b6`

On-chain prediction markets using native COTI.

- Create markets with question, category, image, end time
- Bet YES or NO by sending COTI
- Resolution by owner, proportional payouts to winners
- Events: `BetPlaced`, `MarketResolved`, `WinningsClaimed`

---

## AMM Engine

Whisper uses a **Constant Product Market Maker** (same model as Polymarket and Uniswap) with a **mint-and-swap** model for correct prediction market pricing.

**Pricing:** Each market has a virtual pool of YES and NO shares. `price_yes = noShares / (yesShares + noShares)`.

**Buying:** When you buy YES shares for 1 COTI:
1. Mint 1 complete set (1 YES + 1 NO)
2. Swap the 1 NO into the pool for additional YES shares
3. You receive `1 + delta` YES shares at an average price close to the displayed price
4. The pool invariant `k = yesShares * noShares` is preserved

**Selling:** Reverse process using burn-and-swap with a quadratic solver to determine exact COTI returned. Round-trip trades preserve the pool invariant perfectly.

```
Example — Market: "Will BTC hit $200K?" at YES 34c / NO 66c

Buy 5 COTI of YES → 14.64 shares at avg 34.2c
Price moves: 34.0c → 34.3c (0.31% impact)

Sell 14.64 shares → ~5 COTI back
Pool returns to original state
```

---

## Prompt Packs Completed

### Part 1 — Vibe Code Your App

- Full vertical-swipe prediction feed (TikTok/Reels UX)
- Framer Motion animations, glassmorphism, dark theme
- Mobile-first layout with desktop sidebar
- CPMM engine with position trading and P&L tracking
- Handle system (`username.whisper` identity)
- Portfolio view with unrealized gains

### Part 2 — Create a Private Token

- `WhisperToken.sol` extending COTI's `PrivateERC20`
- Deployed on COTI Testnet with encrypted balances
- Faucet for testnet distribution (1,000 WHISP per address)
- Uses `MpcCore.setPublic64()` for garbled circuit minting

### Part 3 — Connect Your App & Token

- MetaMask wallet connection with automatic COTI chain switching
- AES key generation via `generateOrRecoverAes()` (MPC onboarding)
- `localStorage` persistence of AES keys per wallet
- On-chain betting through `WhisperMarket` contract
- Full `@coti-io/coti-ethers` integration (no wagmi/viem)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| AMM | CPMM with mint-and-swap (pure functions) |
| Blockchain | COTI Testnet (gcEVM, Chain ID `7082400`) |
| Contracts | Solidity 0.8.19, Hardhat 2 |
| Privacy | `@coti-io/coti-contracts` (MpcCore, PrivateERC20) |
| Wallet | `@coti-io/coti-ethers` (ethers.js v6 + COTI extensions) |

---

## Run Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Deploy Contracts

```bash
cd contracts
npm install
npx hardhat compile
node scripts/deploy.js
```

### Network Config

| Property | Value |
|----------|-------|
| Network | COTI Testnet |
| RPC | `https://testnet.coti.io/rpc` |
| Chain ID | `7082400` |
| Explorer | `https://testnet.cotiscan.io` |
| Faucet | [Discord](https://discord.coti.io) — `testnet <address>` |

---

## Architecture

```
src/
  app/page.tsx              # App shell, tab routing, handle system
  components/
    BetFeed.tsx             # Vertical swipe container + keyboard nav
    BetCard.tsx             # Full-screen card with AMM prices
    BetModal.tsx            # Trade placement with price impact
    SellModal.tsx           # Position selling interface
    PortfolioView.tsx       # P&L tracking + position management
    HandleSetup.tsx         # username.whisper creation
    Header.tsx / Sidebar.tsx / BottomNav.tsx
  context/
    WalletContext.tsx        # COTI wallet + AES onboarding
    MarketContext.tsx        # AMM state + positions + persistence
  lib/
    amm.ts                  # CPMM math (pure functions)
    storage.ts              # localStorage layer
    coti.ts                 # Network config
    contracts.ts            # ABIs + addresses
contracts/
  WhisperToken.sol          # PrivateERC20 (encrypted balances)
  WhisperMarket.sol         # Prediction market (native COTI bets)
```

---

## License

MIT
