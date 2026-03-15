# Wispr

**Confidential prediction markets with a TikTok-style UX, powered by COTI's privacy layer.**

Swipe through full-screen prediction cards. Buy YES or NO shares at dynamic AMM prices. Your positions stay encrypted on-chain. Built for the [COTI Vibe Code Challenge](https://stay.coti.io/vibe-coding).

> **Live on COTI Testnet** | [App](https://whisper-coti.vercel.app) | [ConfidentialUSDC](https://testnet.cotiscan.io/address/0x0340Cdbb0915a70a8784df9e3df51346440F9dc7) | [WisprMarket](https://testnet.cotiscan.io/address/0x34a1AC33E686E61d114912c8C25095426CDC7F93)

---

## What Makes Wispr Different

Most prediction markets feel like spreadsheets. Wispr feels like scrolling TikTok.

- **Vertical swipe feed** — full-screen cards with cinematic backgrounds, swipe to browse
- **Polymarket-style trading** — shares priced in cents (34c/66c), not percentages. Buy low, sell high before resolution
- **Real AMM engine** — Constant Product Market Maker with mint-and-swap pricing, price impact preview, and position P&L tracking
- **On-chain prices** — market data fetched from the WisprMarket contract in real-time, prices reflect actual bets
- **Confidential by default** — individual bets encrypted via COTI's garbled circuits (MPC). Nobody sees your position size
- **Mobile-first** — designed for phones, scales to desktop with sidebar navigation

---

## COTI Privacy Technology

Wispr uses COTI's garbled circuits at every layer:

| What | How |
|------|-----|
| **Token balances** | `ConfidentialUSDC` extends `PrivateERC20` — balances stored as `utUint64`, encrypted with network + user AES keys |
| **Individual bets** | Per-user bets stored as `ctUint64` in contract mappings — only the bettor can decrypt their own position |
| **Aggregate totals** | `totalYes` / `totalNo` are public for price discovery; individual contributions stay encrypted |
| **Transfers** | Amounts are encrypted inputs — transfer values never appear in plaintext on-chain |
| **Computation** | Addition, comparison, minting all happen on `gtUint64` garbled values inside the gcEVM |
| **User decryption** | Only the account holder can decrypt their balance after AES key onboarding |

### Account Onboarding Flow

```typescript
import { BrowserProvider } from "@coti-io/coti-ethers";
import { onboard } from "@coti-io/coti-ethers";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
await onboard(signer); // One-time MPC key generation via AccountOnboard contract
```

AES keys are persisted per wallet in `localStorage` so users only onboard once.

---

## Smart Contracts (Deployed on COTI Testnet)

### ConfidentialUSDC (cUSDC) — `0x0340Cdbb0915a70a8784df9e3df51346440F9dc7`

Confidential ERC20 token extending COTI's `PrivateERC20`.

```solidity
contract ConfidentialUSDC is PrivateERC20 {
    uint64 public constant FAUCET_AMOUNT = 1000 * 1e6;

    constructor() PrivateERC20("Confidential USDC", "cUSDC") {}

    function faucet() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, MpcCore.setPublic64(FAUCET_AMOUNT));
    }
}
```

- **Name:** Confidential USDC | **Symbol:** cUSDC | **Decimals:** 6
- Faucet: 1,000 cUSDC per address (testnet)
- All balances encrypted on-chain

### WisprMarket — `0x34a1AC33E686E61d114912c8C25095426CDC7F93`

On-chain prediction markets with encrypted bet storage.

- Create markets with question, category, image, end time
- Bet YES or NO using cUSDC — individual bets stored encrypted as `ctUint64`
- `_safeOnboard()` pattern: checks `ctUint64.unwrap(value) == 0` before `MpcCore.onBoard()` to prevent crash on uninitialized slots
- Resolution by owner, proportional payouts to winners
- Cancel + refund support
- Events: `BetPlaced`, `MarketResolved`, `WinningsClaimed`, `MarketCancelled`, `RefundClaimed`

---

## AMM Engine

Wispr uses a **Constant Product Market Maker** (same model as Polymarket and Uniswap) with a **mint-and-swap** model for correct prediction market pricing.

**Pricing:** Each market has a virtual pool of YES and NO shares. `price_yes = noShares / (yesShares + noShares)`.

**Buying:** When you buy YES shares for 1 cUSDC:
1. Mint 1 complete set (1 YES + 1 NO)
2. Swap the 1 NO into the pool for additional YES shares
3. You receive `1 + delta` YES shares at an average price close to the displayed price
4. The pool invariant `k = yesShares * noShares` is preserved

**Selling:** Reverse process using burn-and-swap with a quadratic solver to determine exact cUSDC returned. Round-trip trades preserve the pool invariant perfectly.

```
Example — Market: "Will BTC hit $200K?" at YES 34c / NO 66c

Buy 5 cUSDC of YES → 14.64 shares at avg 34.2c
Price moves: 34.0c → 34.3c (0.31% impact)

Sell 14.64 shares → ~5 cUSDC back
Pool returns to original state
```

---

## On-Chain Data Fetching

Markets are fetched directly from the WisprMarket contract using a read-only `JsonRpcProvider`:

- `marketCount()` + `getMarket(i)` to enumerate all markets
- Prices derived from on-chain `totalYes` / `totalNo` ratios
- After each bet or market creation, the UI refetches from chain
- Price history tracks actual trade data, not simulated values
- `mockBets` used only as offline fallback

---

## Prompt Packs Completed

### Part 1 — Vibe Code Your App

- Full vertical-swipe prediction feed (TikTok/Reels UX)
- Framer Motion animations, glassmorphism, dark theme
- Mobile-first layout with desktop sidebar
- CPMM engine with position trading and P&L tracking
- Portfolio view with unrealized gains

### Part 2 — Create a Private Token

- `ConfidentialUSDC.sol` extending COTI's `PrivateERC20`
- Deployed on COTI Testnet with encrypted balances
- Faucet for testnet distribution (1,000 cUSDC per address)
- Uses `MpcCore.setPublic64()` for garbled circuit minting

### Part 3 — Connect Your App & Token

- MetaMask wallet connection with automatic COTI chain switching
- AES key generation via standalone `onboard()` (MPC onboarding)
- `localStorage` persistence of AES keys per wallet
- On-chain betting through `WisprMarket` contract with encrypted bet storage
- Full `@coti-io/coti-ethers` integration (no wagmi/viem)
- `approvePublic()` for infinite approval pattern (1 tx after first bet)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| AMM | CPMM with mint-and-swap (pure functions, 38 tests) |
| Blockchain | COTI Testnet (gcEVM, Chain ID `7082400`) |
| Contracts | Solidity 0.8.19, Hardhat 2 |
| Privacy | `@coti-io/coti-contracts` (MpcCore, PrivateERC20) |
| Wallet | `@coti-io/coti-ethers` (ethers.js v6 + COTI extensions) |
| Testing | Vitest 4 (57 tests) |
| Deployment | Vercel |

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
node scripts/deploy-market.js   # Market-only redeploy (keeps cUSDC token)
node scripts/deploy-direct.js   # Full deploy (token + market)
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
  app/page.tsx              # App shell, tab routing
  components/
    BetFeed.tsx             # Vertical swipe container + keyboard nav
    BetCard.tsx             # Full-screen card with AMM prices
    BetModal.tsx            # Trade placement with price impact
    SellModal.tsx           # Position selling interface
    PortfolioView.tsx       # P&L tracking + position management
    CreateView.tsx          # On-chain market creation
    ResolvePanel.tsx        # Market resolution + claim winnings
    Header.tsx / Sidebar.tsx / BottomNav.tsx
  context/
    WalletContext.tsx        # COTI wallet + AES onboarding
    MarketContext.tsx        # AMM state + on-chain fetch + positions
  lib/
    amm.ts                  # CPMM math (pure functions)
    chain.ts                # Read-only on-chain market fetching
    storage.ts              # localStorage layer (scoped to contract)
    coti.ts                 # Network config
    contracts.ts            # ABIs + addresses
contracts/
  ConfidentialUSDC.sol      # PrivateERC20 (encrypted balances, faucet)
  WisprMarket.sol           # Prediction market (encrypted bets via MPC)
```

---

## License

MIT
