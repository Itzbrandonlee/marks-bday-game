'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import type { AnswerDoc } from '@/types';

export default function useAnswers(eventId?: string | string[], roundIndex?: number, uid?: string | null) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const roundId = useMemo(() => (typeof roundIndex === 'number' ? `r-${roundIndex}` : undefined), [roundIndex]);
  const [answers, setAnswers] = useState<AnswerDoc[]>([]);

  useEffect(() => {
    if (!eId || !roundId) return;
    const colRef = collection(db, 'events', eId, 'rounds', roundId, 'answers');
    const q = query(colRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      setAnswers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [eId, roundId]);

  const submitAnswer = async (text: string, status?: string) => {
    if (!eId || !roundId || !uid || !text.trim() || status !== 'collecting') return;
    // doc id == uid to enforce one-per-round
    const aRef = doc(db, 'events', eId, 'rounds', roundId, 'answers', uid);
    if (answers.some(a => a.id === uid)) return;
    await setDoc(aRef, { id: uid, playerId: uid, text: text.trim(), createdAt: Date.now() });
  };

  const submitted = useMemo(() => answers.some(a => a.id === uid), [answers, uid]);

  return { answers, submitAnswer, submitted };
}

