export type EventStatus = 'judging' | 'collecting' | 'reveal' | 'gameOver';

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
  judgeKey?: string;
}

export interface PlayerDoc {
  id: string;
  name: string;
  score?: number;
  connectedAt?: number;
}

export interface AnswerDoc {
  id: string;        // uid
  playerId: string;  // uid
  text: string;
  createdAt: number; // ms
}