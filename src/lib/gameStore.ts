import { writable, get } from 'svelte/store';
import type { YgoCard, GameState, PlayerSelection, RoundResult, CardMode } from './types';

// ─── Estado inicial ────────────────────────────────────────────────────────
const initial: GameState = {
  phase: 'idle',
  p1Hand: [], p2Hand: [],
  p1Selection: null, p2Selection: null,
  round: 1, p1Score: 0, p2Score: 0,
  roundHistory: [], lastResult: null,
  isLoading: false, error: null,
};

export const gameState = writable<GameState>({ ...initial });

// ─── Inicio: obtiene 10 cartas y reparte 5/5 ──────────────────────────────
export async function startGame(): Promise<void> {
  gameState.update(s => ({ ...s, isLoading: true, error: null }));
  try {
    const url =
      'https://db.ygoprodeck.com/api/v7/cardinfo.php' +
      '?type=Normal%20Monster%2CEffect%20Monster&num=100&sort=random';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status} de la API`);

    const json = await res.json();
    const all: YgoCard[] = json.data ?? [];

    // Filtrar: atk > 0 e imagen disponible
    const valid = all.filter(c => c.atk > 0 && c.card_images?.length > 0);
    if (valid.length < 10) throw new Error('No hay suficientes cartas válidas');

    // Barajar y tomar 10, repartir 5/5
    const ten = [...valid].sort(() => Math.random() - 0.5).slice(0, 10);

    gameState.set({
      ...initial,
      phase: 'p1-select',
      p1Hand: ten.slice(0, 5),
      p2Hand: ten.slice(5, 10),
      isLoading: false,
    });
  } catch (err) {
    gameState.update(s => ({
      ...s, isLoading: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }));
  }
}

// ─── Jugador 1 confirma ────────────────────────────────────────────────────
export function p1Confirm(sel: PlayerSelection): void {
  gameState.update(s => ({ ...s, phase: 'p2-select', p1Selection: sel }));
}

// ─── Jugador 2 confirma → resolver ronda ──────────────────────────────────
export function p2Confirm(sel: PlayerSelection): void {
  const s = get(gameState);
  if (!s.p1Selection) return;

  const result = resolveRound(s.round, s.p1Selection, sel);
  const p1Score = s.p1Score + (result.winner === 'p1' ? 1 : 0);
  const p2Score = s.p2Score + (result.winner === 'p2' ? 1 : 0);

  // Eliminar cartas usadas de las manos
  const p1Hand = s.p1Hand.filter(c => c.id !== s.p1Selection!.card.id);
  const p2Hand = s.p2Hand.filter(c => c.id !== sel.card.id);

  gameState.update(() => ({
    ...s, phase: 'reveal',
    p2Selection: sel, p1Hand, p2Hand,
    p1Score, p2Score,
    roundHistory: [...s.roundHistory, result],
    lastResult: result,
  }));
}

// ─── Avanzar a la siguiente ronda o terminar ──────────────────────────────
export function nextRound(): void {
  gameState.update(s => {
    const next = s.round + 1;
    const over = next > 5 || s.p1Score >= 3 || s.p2Score >= 3;
    return {
      ...s,
      phase: over ? 'result' : 'p1-select',
      round: over ? s.round : next,
      p1Selection: null,
      p2Selection: null,
    };
  });
}

export function resetGame(): void {
  gameState.set({ ...initial });
}

// ─── Lógica de resolución de batalla ──────────────────────────────────────
/**
 * Reglas:
 * ⚔️ vs ⚔️  → Gana mayor ATK
 * ⚔️ vs 🛡  → ATK atacante vs DEF defensor; si DEF ≥ ATK gana defensor
 * 🛡 vs ⚔️  → igual pero invertido
 * 🛡 vs 🛡  → Gana mayor Nivel (★)
 */
function resolveRound(
  round: number,
  p1: PlayerSelection,
  p2: PlayerSelection
): RoundResult {
  const { card: c1, mode: m1 } = p1;
  const { card: c2, mode: m2 } = p2;

  let winner: 'p1' | 'p2' | 'draw';
  let reason: string;
  let p1Value: number, p2Value: number;

  if (m1 === 'attack' && m2 === 'attack') {
    p1Value = c1.atk; p2Value = c2.atk;
    if (p1Value > p2Value)       { winner = 'p1'; reason = `ATK ${p1Value} > ATK ${p2Value}`; }
    else if (p2Value > p1Value)  { winner = 'p2'; reason = `ATK ${p2Value} > ATK ${p1Value}`; }
    else                         { winner = 'draw'; reason = `ATK igualados (${p1Value})`; }

  } else if (m1 === 'attack' && m2 === 'defense') {
    p1Value = c1.atk; p2Value = c2.def;
    if (p1Value > p2Value)  { winner = 'p1'; reason = `ATK ${p1Value} penetra DEF ${p2Value}`; }
    else                    { winner = 'p2'; reason = `DEF ${p2Value} resiste ATK ${p1Value}`; }

  } else if (m1 === 'defense' && m2 === 'attack') {
    p1Value = c1.def; p2Value = c2.atk;
    if (p2Value > p1Value)  { winner = 'p2'; reason = `ATK ${p2Value} penetra DEF ${p1Value}`; }
    else                    { winner = 'p1'; reason = `DEF ${p1Value} resiste ATK ${p2Value}`; }

  } else {
    // Ambos en defensa → nivel
    p1Value = c1.level; p2Value = c2.level;
    if (p1Value > p2Value)       { winner = 'p1'; reason = `★${p1Value} > ★${p2Value}`; }
    else if (p2Value > p1Value)  { winner = 'p2'; reason = `★${p2Value} > ★${p1Value}`; }
    else                         { winner = 'draw'; reason = `★${p1Value} igualados`; }
  }

  return { round, p1Card: c1, p1Mode: m1, p1Value, p2Card: c2, p2Mode: m2, p2Value, winner, reason };
}
