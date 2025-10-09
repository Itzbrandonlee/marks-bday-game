'use client';
import { useState } from 'react';

export default function JudgeControls({
  show,
  isCollecting,
  isJudging,
  canStartCollecting,
  startCollecting,
  startJudging,
}:{
  show: boolean;
  isCollecting: boolean;
  isJudging: boolean;
  canStartCollecting: boolean;
  startCollecting: () => Promise<void> | void;   // ⬅️ no arg now
  startJudging: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  if (!show) return null;

  return (
    <div className="mt-2 space-y-2">
      {canStartCollecting && (
        <div className="flex gap-2">
          <div className="flex-1 bg-zinc-800 rounded px-3 py-2 text-zinc-200">
            Random prompt from your pack
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await startCollecting();       // ⬅️ no string — hook picks randomly
              } finally { setBusy(false); }
            }}
            className="bg-sky-400 text-black px-3 py-2 rounded disabled:opacity-60"
          >
            Start Round
          </button>
        </div>
      )}

      {isCollecting && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await startJudging();
            } finally { setBusy(false); }
          }}
          className="bg-sky-400 text-black px-3 py-2 rounded disabled:opacity-60"
        >
          Start Judging
        </button>
      )}
    </div>
  );
}

