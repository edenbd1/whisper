const RPC = "https://testnet.coti.io/rpc";
const MARKET = "0x34a1AC33E686E61d114912c8C25095426CDC7F93";

// keccak256("BetPlaced(uint256,address,bool)")
const BET_PLACED_TOPIC = "0x33c65b946c0ea6ac285a37d6cc603f46002718bc959723973487890e29a3bce3";

export interface LeaderboardEntry {
  address: string;
  totalBets: number;
  uniqueMarkets: number;
  yesBets: number;
  noBets: number;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getLogs",
      params: [{
        address: MARKET,
        topics: [BET_PLACED_TOPIC],
        fromBlock: "0x0",
        toBlock: "latest",
      }],
    }),
  });

  const json = await res.json();
  if (json.error) throw new Error(json.error.message);

  const logs: { topics: string[]; data: string }[] = json.result;

  // Aggregate per address
  const map = new Map<string, { markets: Set<number>; yes: number; no: number }>();

  for (const log of logs) {
    // topics[1] = marketId (indexed uint256), topics[2] = bettor (indexed address)
    const marketId = parseInt(log.topics[1], 16);
    const address = "0x" + log.topics[2].slice(26);
    // data = isYes (bool, 32 bytes)
    const isYes = parseInt(log.data, 16) !== 0;

    let entry = map.get(address);
    if (!entry) {
      entry = { markets: new Set(), yes: 0, no: 0 };
      map.set(address, entry);
    }
    entry.markets.add(marketId);
    if (isYes) entry.yes++;
    else entry.no++;
  }

  // Convert to sorted array
  const entries: LeaderboardEntry[] = [];
  for (const [address, data] of map) {
    entries.push({
      address,
      totalBets: data.yes + data.no,
      uniqueMarkets: data.markets.size,
      yesBets: data.yes,
      noBets: data.no,
    });
  }

  // Sort by total bets desc, then unique markets desc
  entries.sort((a, b) => b.totalBets - a.totalBets || b.uniqueMarkets - a.uniqueMarkets);

  return entries;
}
