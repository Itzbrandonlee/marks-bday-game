'use client';

import { useParams } from 'next/navigation';
import useAnonAuth from '@/hooks/useAnonAuth';
import useEvent from '@/hooks/useEvent';
import usePlayers from '@/hooks/usePlayers';
import useAnswers from '@/hooks/useAnswers';
import WinnerPopup from '@/components/WinnerPopup';
import RoundStartPopup from '@/components/RoundStartPopup';
import JoinForm from '@/components/JoinForm';
import PlayersList from '@/components/PlayersList';
import JudgeControls from '@/components/JudgeControls';
import PromptCard from '@/components/PromptCard';
import AnswerInput from '@/components/AnswerInput';
import AnonymousAnswers from '@/components/AnonymousAnswers';
import WinnerReveal from '@/components/WinnerReveal';
import GameOver from '@/components/GameOver';
import GameHeader from '@/components/GameHeader';
import JudgeKeyModal from '@/components/JudgeKeyModal'
import useCountdown from '@/hooks/useCountdown';
import { Progress } from '@/components/ui/progress';
import Scoreboard from '@/components/Scoreboard';
import FinalWinnerPopup from '@/components/FinalWinnerPopup';

import { useState, useEffect, useRef } from 'react';

export default function PlayPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { uid, error } = useAnonAuth();
  const { event, isJudge, actions } = useEvent(eventId, uid);
  const { players, playersById, joined, join } = usePlayers(eventId, uid);
  const { answers, submitAnswer, submitted } = useAnswers(eventId, event?.roundIndex, uid);

  const [name, setName] = useState('');
  const [myAnswer, setMyAnswer] = useState('');

  const status = event?.status;
  const isCollecting = status === 'collecting';
  const isJudging = status === 'judging';
  const isReveal = status === 'reveal';
  const isGameOver = status === 'gameOver' || Boolean(event?.gameOver);
  const canStartCollecting = isJudge && isJudging && answers.length === 0 && !isGameOver;

  const { msLeft, secondsLeft, progress /*, isRunning*/ } = useCountdown(
    event?.collectStartAt ?? null,
    event?.collectDurationSec ?? 0,
    Boolean(isCollecting)
  );

  const kickedRef = useRef<string | null>(null);

useEffect(() => {
  if (!event || !isJudge) return;
  if (event.status !== 'collecting') { kickedRef.current = null; return; }

  // ✅ Add this guard: don’t auto-advance until the server timestamp exists
  if (!event.collectStartAt || !event.collectDurationSec) return;

  const key = `${event.id}:${event.roundIndex}`;
  if (secondsLeft > 0) return;
  if (kickedRef.current === key) return;
  kickedRef.current = key;

  setTimeout(() => {
    if (event?.status === 'collecting') actions.startJudging();
  }, 0);
}, [event?.id, event?.roundIndex, event?.status, event?.collectStartAt, event?.collectDurationSec, isJudge, secondsLeft, actions]);



  if (error) return <div className="p-4 text-red-400">Auth error: {error}</div>;
  if (!event) return <div className="p-4">Loading event…</div>;

  return (
    <div className="p-4">
      <GameHeader
        eventId={String(event.id)}
        status={event.status}
        roundIndex={event.roundIndex}
        roundsTotal={event.roundsTotal}
        isJudge={isJudge}
      />

      <RoundStartPopup 
        roundIndex={event.roundIndex}
        roundsTotal={event.roundsTotal}
        status={event.status} />

      {!joined && uid && (
        <JoinForm name={name} setName={setName} onJoin={() => { join(name); localStorage.setItem('quip-name', name); }} />
      )}

      <PlayersList players={players} />
      <Scoreboard players={players} phase={event.status} compact={false} />



      <JudgeKeyModal
        isJudge={isJudge}
        onClaim={actions.claimJudge}
        onLeave={actions.leaveJudge}
      />

<JudgeControls
  show={isJudge && !isGameOver}
  isCollecting={isCollecting}
  isJudging={isJudging}
  canStartCollecting={canStartCollecting}   // ⬅️ new
  startCollecting={() => actions.startCollecting()}
  startJudging={actions.startJudging}
/>

      {isCollecting && !isGameOver && (
        <>
          <PromptCard prompt={event.prompt} roundIndex={event.roundIndex} totalRounds={event.roundsTotal} />

          {/* Timer UI */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm opacity-80 mb-1">
              <span>Time left</span>
              <span className="tabular-nums">
                {String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0')}:
                {String((secondsLeft ?? 0) % 60).padStart(2, '0')}
              </span>
            </div>
            <Progress value={progress * 100} className="h-2" />
          </div>

          {/* Players only — judge cannot submit; disable when time is up */}
          {!isJudge && (
            <AnswerInput
              value={myAnswer}
              onChange={setMyAnswer}
              onSubmit={() => { submitAnswer(myAnswer, event.status); setMyAnswer(''); }}
              submitted={submitted}
              disabled={!joined || msLeft === 0}
            />
          )}
        </>
      )}


      {event.status === 'judging' && !isGameOver && (
        <section className="mt-4">
          <PromptCard prompt={event.prompt} roundIndex={event.roundIndex} totalRounds={event.roundsTotal} />
          <AnonymousAnswers answers={answers} canPick={isJudge} onPick={(pid) => actions.pickWinner(pid)} />
        </section>
      )}

      {isReveal && !isGameOver && (
        <>
        <WinnerPopup winnerId={event.winnerId} playersById={playersById} answers={answers} />
        <WinnerReveal
          winnerId={event.winnerId}
          answers={answers}
          playersById={playersById}
          onNext={actions.nextRound}
          showNext={isJudge}
        />
        </>
      )}

      {isGameOver && (
        <>
        <FinalWinnerPopup players={players} openWhen={true} />
        <GameOver players={players} isJudge={isJudge} onPlayAgain={actions.playAgain} />
        </>
      )}
    </div>
  );
}
