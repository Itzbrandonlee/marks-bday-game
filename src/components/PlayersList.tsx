import type { PlayerDoc } from '@/types';
export default function PlayersList({ players }:{ players: PlayerDoc[] }) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold">Players ({players.length})</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {players.map(p => (
          <span key={p.id} className="bg-zinc-800 text-neutral-100 px-3 py-1 rounded text-sm">
            {p.name} <span className="opacity-60">({p.score ?? 0})</span>
          </span>
        ))}
      </div>
    </div>
  );
}
