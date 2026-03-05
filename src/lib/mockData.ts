import { Bet } from "@/types";

export const mockBets: Bet[] = [
  {
    id: "1",
    question: "Will Bitcoin hit $200K before July 2026?",
    category: "Crypto",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
    yesPercentage: 34,
    poolSize: 185200,
    participants: 12847,
    endsAt: "2026-07-01",
    trending: 1,
    isLive: true,
  },
  {
    id: "2",
    question: "Will the Iran war end within 4 weeks?",
    category: "Geopolitics",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    yesPercentage: 12,
    poolSize: 342100,
    participants: 28934,
    endsAt: "2026-04-02",
    trending: 2,
    isLive: true,
  },
  {
    id: "3",
    question: "Will Ethereum flip Bitcoin's market cap in 2026?",
    category: "Crypto",
    image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80",
    yesPercentage: 8,
    poolSize: 89400,
    participants: 5621,
    endsAt: "2026-12-31",
    trending: 3,
    isLive: true,
  },
  {
    id: "4",
    question: "Will AI pass the Turing test by end of 2026?",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    yesPercentage: 67,
    poolSize: 156700,
    participants: 19203,
    endsAt: "2026-12-31",
    trending: null,
    isLive: true,
  },
  {
    id: "5",
    question: "Will France win the 2026 World Cup?",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    yesPercentage: 22,
    poolSize: 267800,
    participants: 34102,
    endsAt: "2026-07-19",
    trending: null,
    isLive: true,
  },
  {
    id: "6",
    question: "Will Elon Musk step down as CEO of Tesla?",
    category: "Business",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    yesPercentage: 41,
    poolSize: 198300,
    participants: 15678,
    endsAt: "2026-12-31",
    trending: null,
    isLive: true,
  },
  {
    id: "7",
    question: "Will a meme coin reach $100B market cap?",
    category: "Crypto",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    yesPercentage: 19,
    poolSize: 445000,
    participants: 52341,
    endsAt: "2026-12-31",
    trending: 4,
    isLive: true,
  },
  {
    id: "8",
    question: "Will there be confirmed alien contact by 2027?",
    category: "Conspiracy",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    yesPercentage: 3,
    poolSize: 523400,
    participants: 67890,
    endsAt: "2027-01-01",
    trending: null,
    isLive: true,
  },
];

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  const end = new Date(dateStr);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
