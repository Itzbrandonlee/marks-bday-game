'use client';
export default function PromptCard({
  prompt, roundIndex, totalRounds,
}: { prompt: string; roundIndex: number; totalRounds: number; }) {
  return (
    <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded p-3">
      <div className="text-xs opacity-70">Round {roundIndex + 1} / {totalRounds}</div>
      <div className="mt-1 text-lg font-medium">{prompt || '…'}</div>
    </div>
  );
}
