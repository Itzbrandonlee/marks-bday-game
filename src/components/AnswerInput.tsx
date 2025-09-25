'use client';
export default function AnswerInput({
  value, onChange, onSubmit, submitted, disabled,
}:{
  value: string;
  onChange: (s: string) => void;
  onSubmit: () => void;
  submitted: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-3 space-y-1">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-zinc-800 rounded px-3 py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your funniest answer…"
          maxLength={140}
          disabled={disabled}
        />
        <button onClick={onSubmit} disabled={disabled} className="bg-emerald-500 text-black px-3 py-2 rounded disabled:opacity-50">
          Submit
        </button>
      </div>
      <p className="text-xs opacity-70">Submitted: {submitted ? '✅' : '—'}</p>
    </div>
  );
}

