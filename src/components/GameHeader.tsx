'use client';

import clsx from "clsx";

type Props = {
  eventId: string;
  status: "judging" | "collecting" | "reveal" | "gameOver";
  roundIndex: number;
  roundsTotal: number;
  /** optional: show a countdown if you add a timer later */
  secondsLeft?: number;
  /** optional: show a small "Judge" chip when true */
  isJudge?: boolean;
};

export default function GameHeader({
  eventId,
  status,
  roundIndex,
  roundsTotal,
  secondsLeft,
  isJudge,
}: Props) {
  const statusLabel = {
    judging: "Judging",
    collecting: "Collecting",
    reveal: "Reveal",
    gameOver: "Game Over",
  }[status];

  const statusClass = {
    judging: "bg-amber-400 text-black",
    collecting: "bg-sky-400 text-black",
    reveal: "bg-emerald-500 text-black",
    gameOver: "bg-zinc-700 text-white",
  }[status];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // (optional) toast/snackbar could go here
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
      <div>
        <h1 className="text-2xl font-bold">🎉 Quip-Off — {eventId}</h1>
        <div className="text-sm text-zinc-400">
          Round {roundIndex + 1} / {roundsTotal}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {typeof secondsLeft === "number" && status === "collecting" && (
          <span className="text-sm">⏱️ {secondsLeft}s</span>
        )}

        {isJudge && (
          <span className="text-xs rounded px-2 py-1 border border-zinc-700 text-zinc-300">
            Judge
          </span>
        )}

        <span className={clsx("text-xs rounded px-2 py-1", statusClass)}>
          {statusLabel}
        </span>

        <button
          onClick={copyLink}
          className="ml-2 text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
          title="Copy join link"
        >
          Copy link
        </button>
      </div>
    </div>
  );
}