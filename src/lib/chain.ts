import { Bet } from "@/types";

const RPC = "https://testnet.coti.io/rpc";
const MARKET = "0xD6Cf8bd3991443b94Bcb1520DCb475e767cF5252";

// marketCount() selector
const MARKET_COUNT_SEL = "0xec979082";
// getMarket(uint256) selector
const GET_MARKET_SEL = "0xeb44fdd3";

async function rpcCall(to: string, data: string): Promise<string> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"],
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

// Decode a string from ABI-encoded data. slotIndex = which 32-byte slot has the pointer.
function decodeString(raw: string, slotIndex: number): string {
  const dataOffset = parseInt(raw.slice(slotIndex * 64, slotIndex * 64 + 64), 16) * 2;
  const length = parseInt(raw.slice(dataOffset, dataOffset + 64), 16);
  const bytes = raw.slice(dataOffset + 64, dataOffset + 64 + length * 2);
  let str = "";
  for (let i = 0; i < bytes.length; i += 2) {
    str += String.fromCharCode(parseInt(bytes.slice(i, i + 2), 16));
  }
  return decodeURIComponent(escape(str));
}

function decodeUint(raw: string, slotIndex: number): number {
  return parseInt(raw.slice(slotIndex * 64, slotIndex * 64 + 64), 16);
}

// Themed background videos for each market (Pexels HD, matching each bet)
const MARKET_VIDEOS: Record<number, string> = {
  0: "https://videos.pexels.com/video-files/7579969/7579969-hd_1920_1080_25fps.mp4", // Bitcoin – crypto coins & tiles
  1: "https://videos.pexels.com/video-files/856356/856356-hd_1920_1080_25fps.mp4",   // Iran war – rotating Earth globe
  2: "https://videos.pexels.com/video-files/7579971/7579971-hd_1920_1080_25fps.mp4", // ETH – crypto overhead colorful
  3: "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4", // AI – digital network nodes
  4: "https://videos.pexels.com/video-files/18080395/18080395-hd_1080_1920_24fps.mp4", // France WC – football players
  5: "https://videos.pexels.com/video-files/19147672/19147672-hd_1080_1920_30fps.mp4", // Tesla – Tesla car driving
  6: "https://videos.pexels.com/video-files/2499611/2499611-hd_1080_1920_30fps.mp4", // Jesus – cross at sunset
  7: "https://videos.pexels.com/video-files/1851190/1851190-hd_1920_1080_25fps.mp4", // Aliens – earth from space
};

export async function fetchMarketsFromChain(): Promise<Bet[]> {
  if (!MARKET) return [];

  const countHex = await rpcCall(MARKET, MARKET_COUNT_SEL);
  const count = parseInt(countHex, 16);
  if (count === 0) return [];

  const rawResults = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      rpcCall(MARKET, GET_MARKET_SEL + i.toString(16).padStart(64, "0"))
    )
  );

  // Parse each getMarket response:
  // slot 0: question (string pointer)
  // slot 1: category (string pointer)
  // slot 2: imageUrl (string pointer)
  // slot 3: endTime (uint256)
  // slot 4: totalYes (uint64)
  // slot 5: totalNo (uint64)
  // slot 6: totalParticipants (uint256)
  // slot 7: resolved (bool)
  // slot 8: outcome (bool)
  const markets = rawResults.map((hex, i) => {
    const raw = hex.slice(2); // remove 0x

    const question = decodeString(raw, 0);
    const category = decodeString(raw, 1);
    const imageUrl = decodeString(raw, 2);
    const endTime = decodeUint(raw, 3);
    const totalYes = decodeUint(raw, 4);
    const totalNo = decodeUint(raw, 5);
    const totalParticipants = decodeUint(raw, 6);
    const resolved = decodeUint(raw, 7) !== 0;

    const total = totalYes + totalNo;
    const yesPercentage = total > 0 ? Math.round((totalYes / total) * 100) : 50;
    const endTimeMs = endTime * 1000;

    return {
      i,
      question,
      category,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
      yesPercentage,
      poolSize: total / 1e6,
      participants: totalParticipants,
      endsAt: new Date(endTimeMs).toISOString().split("T")[0],
      isLive: !resolved && Date.now() < endTimeMs,
    };
  });

  // Trending = top 4 by participants (only those with >0)
  const ranked = markets
    .filter((m) => m.participants > 0)
    .sort((a, b) => b.participants - a.participants);
  const trendingMap = new Map<number, number>();
  ranked.slice(0, 4).forEach((m, rank) => trendingMap.set(m.i, rank + 1));

  return markets.map((m) => ({
    id: String(m.i),
    question: m.question,
    category: m.category,
    image: m.imageUrl,
    video: MARKET_VIDEOS[m.i],
    yesPercentage: m.yesPercentage,
    poolSize: m.poolSize,
    participants: m.participants,
    endsAt: m.endsAt,
    trending: trendingMap.get(m.i) ?? null,
    isLive: m.isLive,
  }));
}
