export type EventStatus = 'collecting' | 'judging' | 'reveal' | 'gameOver';

export interface EventDoc {
  id: string;
  status: EventStatus;
  roundIndex: number;
  prompt: string;
  winnerId?: string;
  pointsPerWin: number;
  roundsTotal: number;
  finalRoundMultiplier: number;
  gameOver?: boolean;
  judgeKey?: string; // optional UI hint; rules don’t use it directly
}

export interface PlayerDoc {
  id: string;
  name: string;
  score?: number;
  connectedAt: number;
}

export interface AnswerDoc {
  id: string;        // == uid
  playerId: string;
  text: string;
  createdAt: number;
}

