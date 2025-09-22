'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { PlayerDoc } from '@/types';

export default function usePlayers(eventId?: string | string[], uid?: string | null) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const [players, setPlayers] = useState<PlayerDoc[]>([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!eId) return;
    const colRef = collection(db, 'events', eId, 'players');
    return onSnapshot(colRef, (snap) => {
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [eId]);

  useEffect(() => {
    if (uid && players.some(p => p.id === uid)) setJoined(true);
  }, [uid, players]);

  const join = async (name: string) => {
    if (!eId || !uid || !name.trim()) return;
    const pref = doc(db, 'events', eId, 'players', uid);
    const exists = players.some(p => p.id === uid);
    // players are NOT allowed to write 'score' (rules)
    await setDoc(
      pref,
      exists ? { id: uid, name: name.trim() } : { id: uid, name: name.trim(), connectedAt: Date.now() },
      { merge: true }
    );
    setJoined(true);
  };

  const playersById = useMemo(() => Object.fromEntries(players.map(p => [p.id, p])), [players]);

  return { players, playersById, joined, join };
}
