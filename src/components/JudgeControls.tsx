export default function JudgeControls({
  show, isCollecting, isJudging, startCollecting, startJudging, nextRound, resetGame,
}:{
  show: boolean;
  isCollecting: boolean;
  isJudging: boolean;
  startCollecting: (prompt:string)=>void;
  startJudging: ()=>void;
  nextRound: ()=>void;
  resetGame: ()=>void;
}) {
  if (!show) return null;
  return (
    <div className="mt-2 space-y-2">
      {(!isCollecting && !isJudging) && (
        <div className="flex gap-2">
          <input className="flex-1 bg-zinc-800 rounded px-3 py-2" value={"What’s the worst gift for Mark?"} readOnly />
          <button onClick={()=>startCollecting("What’s the worst gift for Mark?")} className="bg-sky-400 text-black px-3 py-2 rounded">
            Start Collecting
          </button>
        </div>
      )}
      {isCollecting && (
        <button onClick={startJudging} className="bg-sky-400 text-black px-3 py-2 rounded">
          Start Judging
        </button>
      )}
      <button onClick={resetGame} className="mt-2 bg-red-500 text-white px-3 py-2 rounded">
        New Game (reset)
      </button>
    </div>
  );
}
