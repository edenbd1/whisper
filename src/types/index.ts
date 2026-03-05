export interface Bet {
  id: string;
  question: string;
  category: string;
  image: string;
  yesPercentage: number;
  poolSize: number;
  participants: number;
  endsAt: string;
  trending: number | null;
  isLive: boolean;
  description?: string;
}

export type BetSide = "yes" | "no";

export interface UserBet {
  betId: string;
  side: BetSide;
  amount: number;
  timestamp: number;
}
