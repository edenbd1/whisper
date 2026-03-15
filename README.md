# Whisper

**Confidential prediction markets with a TikTok-style UX, powered by COTI's privacy layer.**

Swipe through full-screen prediction cards. Buy YES or NO shares at dynamic AMM prices. Your positions stay encrypted on-chain. Built for the [COTI Vibe Code Challenge](https://stay.coti.io/vibe-coding).

> **Live on COTI Testnet** | [App](https://whisper-coti.vercel.app) | [ConfidentialUSDC](https://testnet.cotiscan.io/address/0x0340Cdbb0915a70a8784df9e3df51346440F9dc7) | [WisprMarket](https://testnet.cotiscan.io/address/0x34a1AC33E686E61d114912c8C25095426CDC7F93)

---

## What Makes Whisper Different

Most prediction markets feel like spreadsheets. Whisper feels like scrolling TikTok.

- **Vertical swipe feed** — full-screen cards with cinematic backgrounds, swipe to browse
- **Polymarket-style trading** — shares priced in cents (34c/66c), not percentages
- **Real AMM engine** — CPMM with mint-and-swap pricing, price impact preview, P&L tracking
- **100% on-chain** — all markets, images, and prices fetched directly from the COTI blockchain
- **Confidential by default** — individual bets encrypted via COTI's garbled circuits (MPC)
- **On-chain leaderboard** — ranking page built from `BetPlaced` event logs
- **Mobile-first** — designed for phones, scales to desktop with sidebar navigation

---

## How Privacy Works

### The Problem

On Polymarket, everyone can see: *"0xABC bet $50,000 on YES"*. Whales get front-run, copied, and targeted.

### Whisper's Solution

On Whisper, observers can see *that* you bet and *which side* — but **never how much**.

### What's Encrypted vs. What's Public

```
┌─────────────────────────────────────────────────────────────────┐
│                        ON-CHAIN DATA                            │
├─────────────────────────┬───────────────────────────────────────┤
│     🔒 ENCRYPTED        │        🌐 PUBLIC                      │
│     (COTI MPC)          │        (needed for pricing)           │
├─────────────────────────┼───────────────────────────────────────┤
│ Your cUSDC balance      │ Market questions & images             │
│ Your individual bet     │ totalYes / totalNo (aggregate pools)  │
│ Transfer amounts        │ Number of participants                │
│ Position size           │ Who bet and which side (YES/NO)       │
│ Payout amounts          │ Market end times & resolution status  │
└─────────────────────────┴───────────────────────────────────────┘
```

### Why Aggregates Are Public

`totalYes` and `totalNo` **must** be public — without them, there's no way to calculate prices. This is the fundamental trade-off of a prediction market: you need aggregate data for price discovery, but individual positions can stay private.

### The Encryption Flow

```
                    ┌──────────────┐
                    │   User bets  │
                    │  100 cUSDC   │
                    │   on YES     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ MpcCore      │
                    │ .setPublic64 │──── 100 becomes a garbled value (gtUint64)
                    │ (amount)     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐  ┌─▼──────┐  ┌──▼──────────┐
       │  Encrypted   │  │ Public │  │  Encrypted   │
       │  storage     │  │ update │  │  transfer    │
       │              │  │        │  │              │
       │ _yesBets     │  │ total  │  │ cUSDC moves  │
       │ [market]     │  │ Yes    │  │ from user    │
       │ [user]       │  │ += 100 │  │ to contract  │
       │ = ctUint64   │  │        │  │ (amount      │
       │ (only user   │  │        │  │  hidden)     │
       │  can decrypt) │  │        │  │              │
       └──────────────┘  └────────┘  └──────────────┘
```

### COTI Encryption Types

| Type | Meaning | Where Used |
|------|---------|------------|
| `gtUint64` | **Garbled** — exists only during computation inside gcEVM | Addition, comparison operations |
| `ctUint64` | **Ciphertext** — encrypted at rest, stored on-chain | Per-user bet mappings |
| `utUint64` | **User-encrypted** — only the owner's AES key can decrypt | Token balances (PrivateERC20) |
| `itUint64` | **Input** — encrypted value submitted by user in a transaction | Approve amounts |

### Account Onboarding

Before a user can interact with encrypted values, they must generate an AES key via COTI's MPC protocol:

```typescript
import { BrowserProvider, onboard } from "@coti-io/coti-ethers";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
await onboard(signer); // One-time MPC key generation
```

This is a one-time operation. The AES key is stored in `localStorage` per wallet address.

---

## User Flow

```
1. Connect MetaMask
   └─→ Auto-switch to COTI Testnet (Chain ID 7082400)

2. Onboard (one-time)
   └─→ MPC key generation → AES key stored in localStorage

3. Claim cUSDC from faucet (one-time)
   └─→ 1,000 cUSDC minted → balance encrypted on-chain

4. Browse markets
   └─→ Swipe feed / Explore grid — data fetched from chain via JSON-RPC

5. Place a bet
   ├─→ First bet: approve cUSDC (1 tx) + place bet (1 tx)
   └─→ Subsequent bets: place bet only (1 tx)

6. Check portfolio
   └─→ Positions tracked locally, P&L calculated from AMM prices

7. View ranking
   └─→ Leaderboard built from on-chain BetPlaced event logs
```

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
- All balances encrypted on-chain via `utUint64`

### WisprMarket — `0x34a1AC33E686E61d114912c8C25095426CDC7F93`

On-chain prediction markets with encrypted bet storage.

```solidity
// Encrypted per-user bet storage
mapping(uint256 => mapping(address => ctUint64)) private _yesBets;
mapping(uint256 => mapping(address => ctUint64)) private _noBets;

function bet(uint256 marketId, bool isYes, uint64 amount) external {
    // Encrypt and accumulate
    gtUint64 gtAmount = MpcCore.setPublic64(amount);
    gtUint64 current = _safeOnboard(_yesBets[marketId][msg.sender]);
    _yesBets[marketId][msg.sender] = MpcCore.offBoard(MpcCore.add(current, gtAmount));

    // Public aggregate for pricing
    m.totalYes += amount;

    // Transfer (encrypted amount)
    token.transferFrom(msg.sender, address(this), gtAmount);
}
```

- `_safeOnboard()` pattern: checks `ctUint64.unwrap(value) == 0` before `MpcCore.onBoard()` to prevent crash on uninitialized slots
- Resolution by owner, proportional payouts to winners
- Cancel + refund support
- Events: `BetPlaced`, `MarketResolved`, `WinningsClaimed`, `MarketCancelled`, `RefundClaimed`

---

## On-Chain Data Fetching

**Zero mock data.** All market data comes from the blockchain.

Markets are fetched using raw JSON-RPC calls directly to the COTI Testnet RPC — no ethers.js dependency for reads:

```
Browser → fetch("https://testnet.coti.io/rpc")
       → eth_call: marketCount()         → 8 markets
       → eth_call: getMarket(0..7)       → questions, images, prices
       → eth_getLogs: BetPlaced events    → leaderboard data
```

- `marketCount()` + `getMarket(i)` to enumerate all markets
- Prices derived from on-chain `totalYes` / `totalNo` ratios
- Leaderboard built from `BetPlaced` event logs
- After each bet or market creation, the UI refetches from chain
- ABI decoding done manually (no library dependency in browser)

---

## AMM Engine

Whisper uses a **Constant Product Market Maker** (same model as Polymarket and Uniswap) with a **mint-and-swap** model for correct prediction market pricing.

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
| Testing | Vitest 4 (52 tests) |
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
  app/page.tsx              # App shell, 5-tab routing
  components/
    BetFeed.tsx             # Vertical swipe container + keyboard nav
    BetCard.tsx             # Full-screen card with AMM prices
    BetModal.tsx            # Trade placement with price impact
    SellModal.tsx           # Position selling interface
    PortfolioView.tsx       # P&L tracking + position management
    ExploreView.tsx         # Grid view with category filters
    CreateView.tsx          # On-chain market creation
    RankingView.tsx         # On-chain leaderboard from BetPlaced events
    ResolvePanel.tsx        # Market resolution + claim winnings
    Header.tsx / Sidebar.tsx / BottomNav.tsx
  context/
    WalletContext.tsx        # COTI wallet + AES onboarding
    MarketContext.tsx        # AMM state + on-chain fetch + positions
  lib/
    amm.ts                  # CPMM math (pure functions)
    chain.ts                # Raw JSON-RPC market fetching (no ethers)
    leaderboard.ts          # On-chain event log aggregation
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
