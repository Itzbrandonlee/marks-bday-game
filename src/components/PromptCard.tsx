export default function PromptCard({ prompt, roundIndex, totalRounds }:{
  prompt: string; roundIndex: number; totalRounds: number;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4">
      <div className="text-xs opacity-60">Round {roundIndex + 1} / {totalRounds}</div>
      <div className="mt-1 text-lg font-semibold">{prompt || "…"}</div>
    </div>
  );
}
