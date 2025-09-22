import type { AnswerDoc } from '@/types';
export default function AnonymousAnswers({
  answers, canPick, onPick,
}:{ answers: AnswerDoc[]; canPick: boolean; onPick:(playerId:string)=>void; }) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-lg">Pick a winner:</p>
      {answers.map(a => (
        <button
          key={a.id}
          onClick={()=> canPick && onPick(a.playerId)}
          className="block w-full text-left bg-zinc-800 hover:bg-zinc-700 rounded px-3 py-2"
          disabled={!canPick}
        >
          {a.text}
        </button>
      ))}
      {!answers.length && <div className="text-sm opacity-60">Waiting for answers…</div>}
    </div>
  );
}
