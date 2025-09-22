export default function AnswerInput({
  value, onChange, onSubmit, submitted, disabled,
}:{
  value: string; onChange:(v:string)=>void; onSubmit:()=>void; submitted:boolean; disabled?:boolean;
}) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-zinc-800 rounded px-3 py-2"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder="Type your funniest answer…"
          maxLength={140}
          disabled={disabled || submitted}
        />
        <button
          onClick={onSubmit}
          className="bg-emerald-500 text-black px-3 py-2 rounded disabled:opacity-50"
          disabled={disabled || submitted}
        >
          {submitted ? "Submitted" : "Submit"}
        </button>
      </div>
      <p className="text-xs opacity-70">One answer per round.</p>
    </div>
  );
}
