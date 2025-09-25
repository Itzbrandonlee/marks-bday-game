'use client';
import type { AnswerDoc, PlayerDoc } from '@/types';

export default function WinnerReveal({
  winnerId, answers, playersById, onNext, showNext,
}:{
  winnerId?: string;
  answers: AnswerDoc[];
  playersById: Record<string, PlayerDoc>;
  onNext: () => void;
  showNext?: boolean;
}) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-lg">
        Winner: <b>{winnerId ? (playersById[winnerId]?.name ?? 'Unknown') : 'TBA'}</b>
      </p>
      <ul className="list-disc pl-5">
        {answers.map((a) => (
          <li key={a.id} className={a.playerId === winnerId ? 'font-bold' : ''}>
            {(playersById[a.playerId]?.name) ?? 'Anon'}: <i>{a.text}</i>
          </li>
        ))}
      </ul>
      {showNext && (
        <button onClick={onNext} className="bg-purple-400 text-black px-3 py-2 rounded">
          Next Round
        </button>
      )}
    </div>
  );
}

