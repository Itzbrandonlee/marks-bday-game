'use client';
export default function GameHeader({
  eventId, status, roundIndex, roundsTotal, isJudge,
}:{
  eventId: string;
  status: string;
  roundIndex: number;
  roundsTotal: number;
  isJudge: boolean;
}) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
  };
  return (
    <header className="mb-4 pb-3 border-b border-zinc-800 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">🎉 Quip-Off — {eventId}</h1>
        <div className="text-sm text-zinc-400">Round {roundIndex + 1} / {roundsTotal}</div>
      </div>
      <div className="flex items-center gap-2">
        {isJudge && <span className="text-xs rounded px-2 py-1 border border-zinc-700 text-zinc-300">Judge</span>}
        <span className="text-xs rounded px-2 py-1 bg-amber-400 text-black">{status}</span>
        <button onClick={copy} className="text-xs bg-zinc-800 px-2 py-1 rounded">Copy link</button>
      </div>
    </header>
  );
}
