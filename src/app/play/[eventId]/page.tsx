'use client';

import { useParams } from 'next/navigation';
import useAnonAuth from '@/hooks/useAnonAuth';
import useEvent from '@/hooks/useEvent';
import usePlayers from '@/hooks/usePlayers';
import useAnswers from '@/hooks/useAnswers';

import JoinForm from '@/components/JoinForm';
import PlayersList from '@/components/PlayersList';
import JudgeToggle from '@/components/JudgeToggle';
import JudgeControls from '@/components/JudgeControls';
import PromptCard from '@/components/PromptCard';
import AnswerInput from '@/components/AnswerInput';
import AnonymousAnswers from '@/components/AnonymousAnswers';
import WinnerReveal from '@/components/WinnerReveal';
import GameOver from '@/components/GameOver';
import GameHeader from '@/components/GameHeader';

import { useState } from 'react';

export default function PlayPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { uid, error } = useAnonAuth();
  const { event, isJudge, actions } = useEvent(eventId, uid);
  const { players, playersById, joined, join } = usePlayers(eventId, uid);
  const { answers, submitAnswer, submitted } = useAnswers(eventId, event?.roundIndex, uid);

  const [name, setName] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [judgeKey, setJudgeKey] = useState('');

  if (error) return <div className="p-4 text-red-400">Auth error: {error}</div>;
  if (!event) return <div className="p-4">Loading event…</div>;

  const isCollecting = event.status === 'collecting';
  const isJudging = event.status === 'judging';
  const isReveal = event.status === 'reveal';
  const isGameOver = event.status === 'gameOver' || event.gameOver;

  return (
    <div className="p-4">
      <GameHeader
        eventId={String(event.id)}
        status={event.status}
        roundIndex={event.roundIndex}
        roundsTotal={event.roundsTotal}
        isJudge={isJudge}
      />

      {!joined && uid && (
        <JoinForm name={name} setName={setName} onJoin={() => { join(name); localStorage.setItem('quip-name', name); }} />
      )}

      <PlayersList players={players} />

      <JudgeToggle
        isJudge={isJudge}
        judgeKey={judgeKey}
        setJudgeKey={setJudgeKey}
        onClaim={() => {
          actions.claimJudge(judgeKey);
          // 👇 This line is essential
          localStorage.setItem(`judgeKey-${eventId}`, judgeKey);
        }}
        onLeave={actions.leaveJudge} // leaveJudge now handles removing from localStorage
      />

      <JudgeControls
        show={isJudge && !isGameOver}
        isCollecting={isCollecting}
        isJudging={isJudging}
        startCollecting={(p) => actions.startCollecting(p)}
        startJudging={actions.startJudging}
      />

      {isCollecting && !isGameOver && (
        <>
          <PromptCard prompt={event.prompt} roundIndex={event.roundIndex} totalRounds={event.roundsTotal} />
          <AnswerInput
            value={myAnswer}
            onChange={setMyAnswer}
            onSubmit={() => { submitAnswer(myAnswer, event.status); setMyAnswer(''); }}
            submitted={submitted}
            disabled={!joined}
          />
        </>
      )}

      {event.status === 'judging' && !isGameOver && (
        <section className="mt-4">
          <PromptCard prompt={event.prompt} roundIndex={event.roundIndex} totalRounds={event.roundsTotal} />
          <AnonymousAnswers answers={answers} canPick={isJudge} onPick={(pid) => actions.pickWinner(pid)} />
        </section>
      )}

      {isReveal && !isGameOver && (
        <WinnerReveal
          winnerId={event.winnerId}
          answers={answers}
          playersById={playersById}
          onNext={actions.nextRound}
          showNext={isJudge}
        />
      )}

      {isGameOver && (
        <GameOver players={players} isJudge={isJudge} onPlayAgain={actions.playAgain} />
      )}
    </div>
  );
}
