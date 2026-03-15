import { COTI_TESTNET } from "./coti";
import { CONTRACT_ADDRESSES, WISPR_MARKET_ABI } from "./contracts";
import { Bet } from "@/types";

export async function fetchMarketsFromChain(): Promise<Bet[]> {
  if (!CONTRACT_ADDRESSES.market) return [];

  const { JsonRpcProvider, Contract } = await import("@coti-io/coti-ethers");
  const provider = new JsonRpcProvider(COTI_TESTNET.rpc);
  const market = new Contract(CONTRACT_ADDRESSES.market, WISPR_MARKET_ABI, provider);

  const count = Number(await market.marketCount());
  if (count === 0) return [];

  const results = await Promise.all(
    Array.from({ length: count }, (_, i) => market.getMarket(i))
  );

  // Trending = top 4 by participants (only those with >0)
  const ranked = results
    .map((m, i) => ({ i, p: Number(m.totalParticipants) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p);
  const trendingMap = new Map<number, number>();
  ranked.slice(0, 4).forEach((x, rank) => trendingMap.set(x.i, rank + 1));

  return results.map((m, i) => {
    const totalYes = Number(m.totalYes);
    const totalNo = Number(m.totalNo);
    const total = totalYes + totalNo;
    const yesPercentage = total > 0 ? Math.round((totalYes / total) * 100) : 50;
    const endTime = Number(m.endTime) * 1000;

    return {
      id: String(i),
      question: m.question,
      category: m.category,
      image:
        m.imageUrl ||
        "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
      yesPercentage,
      poolSize: total / 1e6,
      participants: Number(m.totalParticipants),
      endsAt: new Date(endTime).toISOString().split("T")[0],
      trending: trendingMap.get(i) ?? null,
      isLive: !m.resolved && Date.now() < endTime,
    };
  });
}
