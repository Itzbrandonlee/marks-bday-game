'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, doc, getDocs, increment,
  onSnapshot, updateDoc, writeBatch
} from 'firebase/firestore';
import type { EventDoc } from '@/types';

export default function useEvent(eventId?: string | string[], uid?: string | null) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [isJudge, setIsJudge] = useState(false);

  // Event listener
  useEffect(() => {
    if (!eId) return;
    const ref = doc(db, 'events', eId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setEvent({ id: snap.id, ...(snap.data() as any) });
    });
  }, [eId]);

  // Judge = your uid matches event.judgeAuthId
  useEffect(() => {
    setIsJudge(Boolean(event && uid && event.judgeAuthId === uid));
  }, [event?.judgeAuthId, uid]);

  // UX helper: remember the key locally (not used by rules)
  const saveJudgeKey = (key: string) => { if (eId) localStorage.setItem(`judgeKey-${eId}`, key); };
  const clearJudgeKey = () => { if (eId) localStorage.removeItem(`judgeKey-${eId}`); };

  // Claim judge when unclaimed (rules gate this)
  const claimJudge = async (key: string) => {
    if (!eId || !uid || !key.trim()) return;
    await updateDoc(doc(db, 'events', eId), { judgeAuthId: uid, judgeKey: key.trim() });
    saveJudgeKey(key.trim());
  };

  // Leave judge (clear fields on event)
  const leaveJudge = async () => {
    if (!eId || !uid) return;
    await updateDoc(doc(db, 'events', eId), { judgeAuthId: null, judgeKey: null });
    clearJudgeKey();
  };

  // Round flow
  const startCollecting = async (prompt: string) => {
    if (!eId || !isJudge) return;
    await updateDoc(doc(db, 'events', eId), { prompt, status: 'collecting', winnerId: '' });
  };

  const startJudging = async () => {
    if (!eId || !isJudge) return;
    await updateDoc(doc(db, 'events', eId), { status: 'judging' });
  };

  const pickWinner = async (winnerPlayerId: string) => {
    if (!eId || !isJudge || !event) return;
    const b = writeBatch(db);
    b.update(doc(db, 'events', eId), { status: 'reveal', winnerId: winnerPlayerId });

    const isFinal = (event.roundIndex + 1) >= event.roundsTotal;
    const delta = isFinal ? (event.pointsPerWin * event.finalRoundMultiplier) : event.pointsPerWin;
    b.update(doc(db, 'events', eId, 'players', winnerPlayerId), { score: increment(delta) });

    await b.commit();
  };

  const nextRound = async () => {
    if (!eId || !isJudge || !event) return;
    const nextIndex = (event.roundIndex || 0) + 1;
    const payload: any = (nextIndex >= event.roundsTotal)
      ? { status: 'gameOver', gameOver: true }
      : { status: 'judging', winnerId: '', prompt: '', roundIndex: nextIndex };
    await updateDoc(doc(db, 'events', eId), payload);
  };

  // Play again: wipe players & answers, reset event
  const playAgain = async () => {
    if (!eId || !isJudge || !event) return;

    // delete all players
    const playersSnap = await getDocs(collection(db, 'events', eId, 'players'));
    for (let i = 0; i < playersSnap.docs.length; i += 400) {
      const b = writeBatch(db);
      playersSnap.docs.slice(i, i + 400).forEach(d => b.delete(d.ref));
      await b.commit();
    }

    // delete answers for all known rounds
    const total = Math.max(event.roundsTotal || 0, (event.roundIndex || 0) + 1);
    for (let r = 0; r < total; r++) {
      const ansSnap = await getDocs(collection(db, 'events', eId, 'rounds', `r-${r}`, 'answers'));
      for (let i = 0; i < ansSnap.docs.length; i += 400) {
        const b = writeBatch(db);
        ansSnap.docs.slice(i, i + 400).forEach(d => b.delete(d.ref));
        await b.commit();
      }
    }

    // reset event last
    await updateDoc(doc(db, 'events', eId), {
      roundIndex: 0,
      status: 'judging',
      prompt: '',
      winnerId: '',
      gameOver: false,
    });
  };

  return {
    event,
    isJudge,
    actions: { claimJudge, leaveJudge, startCollecting, startJudging, pickWinner, nextRound, playAgain },
  };
}
