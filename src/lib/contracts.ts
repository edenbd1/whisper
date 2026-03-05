export const COTI_TESTNET_CHAIN_ID = 7082400;

// These will be updated after deployment
export const CONTRACT_ADDRESSES = {
  token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "",
  market: process.env.NEXT_PUBLIC_MARKET_ADDRESS || "",
};

export const WHISPER_TOKEN_ABI = [
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
    inputs: [{ name: "", type: "address" }],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const WHISPER_MARKET_ABI = [
  {
    inputs: [],
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
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      { name: "question", type: "string" },
      { name: "category", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "endTime", type: "uint256" },
      { name: "totalYes", type: "uint256" },
      { name: "totalNo", type: "uint256" },
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
    ],
    name: "bet",
    outputs: [],
    stateMutability: "payable",
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
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    name: "yesBets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    name: "noBets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "bettor", type: "address" },
      { indexed: false, name: "isYes", type: "bool" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "BetPlaced",
    type: "event",
  },
] as const;
