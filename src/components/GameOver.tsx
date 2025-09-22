import type { PlayerDoc } from '@/types';
export default function GameOver({ players }:{ players: PlayerDoc[] }) {
  const sorted = players.slice().sort((a,b)=> (b.score ?? 0) - (a.score ?? 0));
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">🏁 Game Over</h2>
      <ol className="mt-2 space-y-1">
        {sorted.map(p => (
          <li key={p.id}>{p.name}: <b>{p.score ?? 0}</b></li>
        ))}
      </ol>
    </div>
  );
}
