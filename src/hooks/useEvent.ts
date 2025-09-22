'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import type { EventDoc } from '@/types';

export default function useEvent(eventId?: string | string[], uid?: string | null) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [isJudge, setIsJudge] = useState(false);

  // Event doc
  useEffect(() => {
    if (!eId) return;
    const ref = doc(db, 'events', eId);
    return onSnapshot(ref, (snap) => {
      setEvent(snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null);
    });
  }, [eId]);

  // Judge session live
  useEffect(() => {
    if (!eId || !uid) return;
    const jsRef = doc(db, 'events', eId, 'judgeSessions', uid);
    return onSnapshot(jsRef, (snap) => setIsJudge(snap.exists()));
  }, [eId, uid]);

  // Actions
  const claimJudge = async (key: string) => {
    if (!eId || !uid || !key.trim()) return;
    const jsRef = doc(db, 'events', eId, 'judgeSessions', uid);
    await setDoc(jsRef, { key: key.trim(), at: serverTimestamp() }, { merge: true });
  };

  const leaveJudge = async () => {
    if (!eId || !uid) return;
    await deleteDoc(doc(db, 'events', eId, 'judgeSessions', uid));
  };

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
    const eRef = doc(db, 'events', eId);
    await updateDoc(eRef, { status: 'reveal', winnerId: winnerPlayerId });

    // award points
    const isFinal = (event.roundIndex + 1) >= event.roundsTotal;
    const delta = isFinal ? (event.pointsPerWin * event.finalRoundMultiplier) : event.pointsPerWin;

    const pRef = doc(db, 'events', eId, 'players', winnerPlayerId);
    const snap = await getDoc(pRef);
    const curr = (snap.exists() ? (snap.data() as any).score : 0) as number;
    await updateDoc(pRef, { score: curr + (delta || 0) });
  };

  const nextRound = async () => {
    if (!eId || !isJudge || !event) return;
    const nextIndex = (event.roundIndex || 0) + 1;
    const eRef = doc(db, 'events', eId);
    if (nextIndex >= event.roundsTotal) {
      await updateDoc(eRef, { status: 'gameOver', gameOver: true });
    } else {
      await updateDoc(eRef, { status: 'judging', winnerId: '', prompt: '', roundIndex: nextIndex });
    }
  };

  const resetGame = async () => {
    if (!eId || !isJudge || !event) return;
    const batch = writeBatch(db);

    // delete players
    const playersSnap = await getDocs(collection(db, 'events', eId, 'players'));
    playersSnap.forEach((d) => batch.delete(doc(db, 'events', eId, 'players', d.id)));

    // delete answers for rounds 0..roundIndex (or roundsTotal)
    const total = Math.max(event.roundsTotal || 0, (event.roundIndex || 0) + 1);
    for (let i = 0; i < total; i++) {
      const ansSnap = await getDocs(collection(db, 'events', eId, 'rounds', `r-${i}`, 'answers'));
      ansSnap.forEach((d) => batch.delete(doc(db, 'events', eId, 'rounds', `r-${i}`, 'answers', d.id)));
    }

    // reset event base fields
    batch.update(doc(db, 'events', eId), {
      roundIndex: 0, status: 'judging', prompt: '', winnerId: '', gameOver: false,
    });

    await batch.commit();
  };

  return {
    event, isJudge,
    actions: { claimJudge, leaveJudge, startCollecting, startJudging, pickWinner, nextRound, resetGame },
  };
}