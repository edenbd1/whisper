export const COTI_TESTNET_CHAIN_ID = 7082400;

export const CONTRACT_ADDRESSES = {
  token: "0xB49173f0bd6548C82AABB67D7B615015e25bb807",
  market: "0x6D46E1b5791a7F564d538229EA5e9b64D49B00D4",
};

export const CUSDC_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint64" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint64" },
    ],
    name: "approvePublic",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "setAccountEncryptionAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const WHISPER_MARKET_ABI = [
  {
    inputs: [{ name: "_token", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "marketCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "question", type: "string" },
      { name: "category", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "endTime", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "outcome", type: "bool" },
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      { name: "question", type: "string" },
      { name: "category", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "endTime", type: "uint256" },
      { name: "totalYes", type: "uint64" },
      { name: "totalNo", type: "uint64" },
      { name: "totalParticipants", type: "uint256" },
      { name: "resolved", type: "bool" },
      { name: "outcome", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "isYes", type: "bool" },
      { name: "amount", type: "uint64" },
    ],
    name: "bet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "getMyBet",
    outputs: [
      { name: "yesBet", type: "uint256" },
      { name: "noBet", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "cancelMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "claimRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "bettor", type: "address" },
      { indexed: false, name: "isYes", type: "bool" },
    ],
    name: "BetPlaced",
    type: "event",
  },
] as const;
