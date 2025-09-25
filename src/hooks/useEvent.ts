'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, deleteDoc, doc, getDocs, increment,
  onSnapshot, setDoc, updateDoc, writeBatch
} from 'firebase/firestore';
import type { EventDoc } from '@/types';

export default function useEvent(eventId?: string | string[], uid?: string | null) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [isJudge, setIsJudge] = useState(false);

  // --- Main event listener (no changes here) ---
  useEffect(() => {
    if (!eId) return;
    const ref = doc(db, 'events', eId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setEvent({ id: snap.id, ...(snap.data() as any) });
    });
  }, [eId]);

  // --- 💡 CHANGED: Judge status is now checked from localStorage, not a separate DB listener ---
  useEffect(() => {
    if (!eId || !event) return;
    const savedJudgeKey = localStorage.getItem(`judgeKey-${eId}`);
    // Check if the saved key is not null/empty and matches the key on the event document
    if (savedJudgeKey && event.judgeKey && savedJudgeKey === event.judgeKey) {
      setIsJudge(true);
    } else {
      setIsJudge(false);
    }
  }, [eId, event]); // This now runs whenever the event data changes

  // --- 💡 NEW: Helper function to get the judge key from localStorage ---
  const getJudgeKey = () => {
    const key = eId ? localStorage.getItem(`judgeKey-${eId}`) : null;
    if (!key) throw new Error("Judge key not found in localStorage!");
    return key;
  };

  // --- 💡 UPDATED: claimJudge and leaveJudge now also handle setting the judge on the main event doc ---
  const claimJudge = async (key: string) => {
    if (!eId || !uid || !key.trim()) return;
    // The main event document now stores the judge's UID and the secret key
    await updateDoc(doc(db, 'events', eId), { judgeAuthId: uid, judgeKey: key.trim() });
    // Note: The `judgeSessions` subcollection is no longer needed for security,
    // but can be useful for seeing who is "present" as a judge. We'll leave it.
    await setDoc(doc(db, 'events', eId, 'judgeSessions', uid), { key: key.trim() });
  };

  const leaveJudge = async () => {
    if (eId && uid) {
      // Clear the judge info from the main event doc and localStorage
      await updateDoc(doc(db, 'events', eId), { judgeAuthId: null, judgeKey: null });
      localStorage.removeItem(`judgeKey-${eId}`);
      await deleteDoc(doc(db, 'events', eId, 'judgeSessions', uid));
    }
  };

  // --- 👇 All actions below are updated to send the judgeKey for validation ---

  const startCollecting = async (prompt: string) => {
    if (!eId || !isJudge) return;
    await updateDoc(doc(db, 'events', eId), {
      prompt,
      status: 'collecting',
      winnerId: '',
      judgeKey: getJudgeKey(), // ✅ Validation
    });
  };

  const startJudging = async () => {
    if (!eId || !isJudge) return;
    await updateDoc(doc(db, 'events', eId), {
      status: 'judging',
      judgeKey: getJudgeKey(), // ✅ Validation
    });
  };

  const pickWinner = async (winnerPlayerId: string) => {
    if (!eId || !isJudge || !event) return;
    const batch = writeBatch(db);
    const eventRef = doc(db, 'events', eId);
    const playerRef = doc(db, 'events', eId, 'players', winnerPlayerId);

    // Update event status
    batch.update(eventRef, {
      status: 'reveal',
      winnerId: winnerPlayerId,
      judgeKey: getJudgeKey(), // ✅ Validation
    });

    // Update player score
    const isFinal = (event.roundIndex + 1) >= event.roundsTotal;
    const delta = isFinal ? (event.pointsPerWin * event.finalRoundMultiplier) : event.pointsPerWin;
    batch.update(playerRef, { score: increment(delta) });

    await batch.commit();
  };

  const nextRound = async () => {
    if (!eId || !isJudge || !event) return;
    const nextIndex = (event.roundIndex || 0) + 1;
    const eRef = doc(db, 'events', eId);
    const updatePayload: any = { judgeKey: getJudgeKey() }; // ✅ Validation

    if (nextIndex >= event.roundsTotal) {
      updatePayload.status = 'gameOver';
      updatePayload.gameOver = true;
    } else {
      updatePayload.status = 'judging';
      updatePayload.winnerId = '';
      updatePayload.prompt = '';
      updatePayload.roundIndex = nextIndex;
    }
    await updateDoc(eRef, updatePayload);
  };

  // --- 💡 UPDATED: Play again function no longer needs complex try/catch blocks ---
  const playAgain = async () => {
    if (!eId || !isJudge || !event) return;

    // This Cloud Function is the recommended, most robust way.
    // However, the rules below will allow the client-side delete to work for your game.
    console.log("Attempting to reset the game...");

    const batch = writeBatch(db);

    // 1. Reset the main event document
    const eventRef = doc(db, 'events', eId);
    batch.update(eventRef, {
      roundIndex: 0,
      status: 'judging', // Go back to the judging screen to start a new round
      prompt: '',
      winnerId: '',
      gameOver: false,
      judgeKey: getJudgeKey(), // ✅ The key that validates this whole operation
    });

    // 2. Delete all players
    const playersSnap = await getDocs(collection(db, 'events', eId, 'players'));
    playersSnap.forEach(playerDoc => batch.delete(playerDoc.ref));

    // 3. Delete all answers from all rounds
    const totalRounds = Math.max(event.roundsTotal, event.roundIndex + 1);
    for (let i = 0; i < totalRounds; i++) {
      const answersRef = collection(db, 'events', eId, 'rounds', `r-${i}`, 'answers');
      const answersSnap = await getDocs(answersRef);
      answersSnap.forEach(answerDoc => batch.delete(answerDoc.ref));
    }
    
    await batch.commit();
    console.log("Game reset successfully!");
  };

  return {
    event,
    isJudge,
    actions: { claimJudge, leaveJudge, startCollecting, startJudging, pickWinner, nextRound, playAgain },
  };
}
