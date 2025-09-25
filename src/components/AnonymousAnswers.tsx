'use client';
import type { AnswerDoc } from '@/types';

export default function AnonymousAnswers({
  answers, canPick, onPick,
}:{
  answers: AnswerDoc[];
  canPick: boolean;
  onPick: (playerId: string) => void;
}) {
  if (!answers.length) {
    return <div className="mt-4 text-sm opacity-70">Waiting for answers…</div>;
  }
  return (
    <div className="mt-3 space-y-2">
      <p className="text-lg font-medium">Pick a winner:</p>
      {answers.map((a) => (
        <button
          key={a.id}
          onClick={() => canPick && onPick(a.playerId)}
          disabled={!canPick}
          className="block w-full text-left bg-zinc-800 hover:bg-zinc-700 rounded px-3 py-2 disabled:opacity-50"
        >
          {a.text}
        </button>
      ))}
    </div>
  );
}

