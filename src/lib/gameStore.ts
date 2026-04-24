import { writable, get } from 'svelte/store';
import type { YgoCard, GameState, GamePhase, RoundResult } from './types';
import { fetchMonsters } from './api';

// ── Elemental system ───────────────────────────────────────────────────────────
const BEATS: Record<string, string> = {
  WATER: 'FIRE',
  FIRE: 'EARTH',
  EARTH: 'WATER',
};
const ELEMENTAL_BONUS = 500;

export function getElementalBonus(myAttr: string, theirAttr: string): number {
  return BEATS[myAttr] === theirAttr ? ELEMENTAL_BONUS : 0;
}

export function getElementalEmoji(attr: string): string {
  const map: Record<string, string> = {
    DARK: '🌑', LIGHT: '✨', FIRE: '🔥', WATER: '💧',
    WIND: '🌀', EARTH: '⛰️', DIVINE: '⚡',
  };
  return map[attr] ?? '❓';
}

// ── Round resolution ───────────────────────────────────────────────────────────
function resolveRound(p1Card: YgoCard, p2Card: YgoCard, round: number): RoundResult {
  const a1 = p1Card.attribute ?? '';
  const a2 = p2Card.attribute ?? '';
  const b1 = getElementalBonus(a1, a2);
  const b2 = getElementalBonus(a2, a1);

  const p1Eff = (p1Card.atk ?? 0) + b1;
  const p2Eff = (p2Card.atk ?? 0) + b2;

  let bonusText = '';
  if (b1 > 0) bonusText = `${getElementalEmoji(a1)} ${a1} vence a ${a2} → +${b1} ATK (P1)`;
  if (b2 > 0) bonusText = `${getElementalEmoji(a2)} ${a2} vence a ${a1} → +${b2} ATK (P2)`;

  let winner: 'p1' | 'p2' | 'draw';
  let reason: string;

  if (p1Eff > p2Eff) {
    winner = 'p1'; reason = `ATK ${p1Eff} > ${p2Eff}`;
  } else if (p2Eff > p1Eff) {
    winner = 'p2'; reason = `ATK ${p2Eff} > ${p1Eff}`;
  } else {
    const d1 = p1Card.def ?? 0;
    const d2 = p2Card.def ?? 0;
    if (d1 > d2) {
      winner = 'p1'; reason = `¡Empate ATK! DEF ${d1} > ${d2}`;
    } else if (d2 > d1) {
      winner = 'p2'; reason = `¡Empate ATK! DEF ${d2} > ${d1}`;
    } else {
      const l1 = p1Card.level ?? 0;
      const l2 = p2Card.level ?? 0;
      if (l1 > l2) {
        winner = 'p1'; reason = `¡Empate DEF! Nivel ${l1} > ${l2}`;
      } else if (l2 > l1) {
        winner = 'p2'; reason = `¡Empate DEF! Nivel ${l2} > ${l1}`;
      } else {
        winner = 'draw'; reason = '¡EMPATE TOTAL!';
      }
    }
  }

  return {
    round, p1Card, p2Card,
    p1Base: p1Card.atk ?? 0, p2Base: p2Card.atk ?? 0,
    p1Effective: p1Eff, p2Effective: p2Eff,
    bonusText, winner, reason,
  };
}

// ── Snake draft order: P1,P2,P2,P1,P1,P2,P2,P1,P1,P2 ─────────────────────────
const PICK_ORDER: ('p1' | 'p2')[] = [
  'p1', 'p2', 'p2', 'p1', 'p1', 'p2', 'p2', 'p1', 'p1', 'p2',
];

const initial: GameState = {
  phase: 'idle',
  pool: [], p1Deck: [], p2Deck: [], pickOrder: [...PICK_ORDER],
  isDraftLoading: false,
  p1Hand: [], p2Hand: [],
  round: 1, p1Choice: null, p2Choice: null,
  isAnimating: false, lastResult: null,
  p1Score: 0, p2Score: 0, roundHistory: [],
};

export const gameState = writable<GameState>({ ...initial });

// ── Actions ────────────────────────────────────────────────────────────────────
export async function startDraft() {
  gameState.update(s => ({ ...s, phase: 'draft', isDraftLoading: true, pool: [] }));
  try {
    // Random offset so we get different cards each time
    const offset = Math.floor(Math.random() * 300) * 5;
    const batch = await fetchMonsters({ num: 60, offset });
    const pool = batch.filter(c => c.atk !== undefined && c.atk !== null).slice(0, 10);
    gameState.update(s => ({
      ...s,
      pool,
      p1Deck: [], p2Deck: [], pickOrder: [...PICK_ORDER],
      isDraftLoading: false,
    }));
  } catch {
    gameState.update(s => ({ ...s, isDraftLoading: false, phase: 'idle' }));
  }
}

export function pickCard(card: YgoCard) {
  gameState.update(s => {
    if (s.phase !== 'draft' || s.pickOrder.length === 0) return s;
    const [current, ...rest] = s.pickOrder;
    const newPool = s.pool.filter(c => c.id !== card.id);
    const p1Deck = current === 'p1' ? [...s.p1Deck, card] : s.p1Deck;
    const p2Deck = current === 'p2' ? [...s.p2Deck, card] : s.p2Deck;

    if (rest.length === 0) {
      // Draft done → start battle
      return {
        ...s, pool: newPool, p1Deck, p2Deck, pickOrder: rest,
        phase: 'p1-select',
        p1Hand: [...p1Deck], p2Hand: [...p2Deck],
        round: 1, p1Choice: null, p2Choice: null,
        p1Score: 0, p2Score: 0, roundHistory: [], lastResult: null,
      };
    }
    return { ...s, pool: newPool, p1Deck, p2Deck, pickOrder: rest };
  });
}

export function p1SelectCard(card: YgoCard) {
  gameState.update(s => ({ ...s, p1Choice: card, phase: 'p2-select' }));
}

export async function p2SelectAndReveal(card: YgoCard) {
  gameState.update(s => ({ ...s, p2Choice: card, isAnimating: true, phase: 'reveal' }));
  await new Promise(r => setTimeout(r, 1600));

  const s = get(gameState);
  if (!s.p1Choice || !s.p2Choice) return;

  const result = resolveRound(s.p1Choice, s.p2Choice, s.round);
  const p1Score = s.p1Score + (result.winner === 'p1' ? 1 : 0);
  const p2Score = s.p2Score + (result.winner === 'p2' ? 1 : 0);
  const roundHistory = [...s.roundHistory, result];
  const p1Hand = s.p1Hand.filter(c => c.id !== s.p1Choice!.id);
  const p2Hand = s.p2Hand.filter(c => c.id !== s.p2Choice!.id);

  const gameOver = p1Score >= 3 || p2Score >= 3 || s.round >= 5;

  gameState.update(st => ({
    ...st, isAnimating: false, lastResult: result,
    p1Score, p2Score, roundHistory, p1Hand, p2Hand,
    phase: gameOver ? 'result' : 'reveal',
  }));
}

export function nextRound() {
  gameState.update(s => ({
    ...s, round: s.round + 1,
    p1Choice: null, p2Choice: null, lastResult: null,
    phase: 'p1-select',
  }));
}

export function resetGame() {
  gameState.set({ ...initial });
}
