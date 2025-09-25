export type EventStatus = 'collecting' | 'judging' | 'reveal' | 'gameOver';

export interface EventDoc {
  id: string;
  status: EventStatus;
  roundIndex: number;
  prompt: string;
  winnerId?: string;
  gameOver?: boolean;

  // scoring config
  pointsPerWin: number;
  roundsTotal: number;
  finalRoundMultiplier: number;

  // judge control
  judgeAuthId?: string | null; // UID of current judge
  judgeKey?: string | null;    // optional UX helper only
}

export interface PlayerDoc {
  id: string;          // auth uid
  name: string;
  score?: number;
  connectedAt: number;
}

export interface AnswerDoc {
  id: string;          // == uid (per rules)
  playerId: string;
  text: string;
  createdAt: number;
}


