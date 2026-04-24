import { writable, derived } from 'svelte/store';
import type { YgoCard, DuelState, DuelResult } from './types';

// ── Cards Collection ──────────────────────────────────────────────────────────
export const cards = writable<YgoCard[]>([]);
export const isLoading = writable<boolean>(false);
export const loadError = writable<string | null>(null);
export const searchQuery = writable<string>('');
export const filterAttribute = writable<string>('ALL');

export const filteredCards = derived(
  [cards, searchQuery, filterAttribute],
  ([$cards, $query, $attr]) => {
    const seen = new Set<number>();
    return $cards.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      const matchName = c.name.toLowerCase().includes($query.toLowerCase());
      const matchAttr = $attr === 'ALL' || c.attribute === $attr;
      return matchName && matchAttr;
    });
  }
);

// ── Duel State ────────────────────────────────────────────────────────────────
const initialDuel: DuelState = {
  fighter1: null,
  fighter2: null,
  result: null,
  isAnimating: false
};

export const duelState = writable<DuelState>(initialDuel);

export function selectFighter(card: YgoCard) {
  duelState.update((s) => {
    // If already selected as fighter1 or 2 — deselect
    if (s.fighter1?.id === card.id) return { ...s, fighter1: null, result: null };
    if (s.fighter2?.id === card.id) return { ...s, fighter2: null, result: null };
    // Assign to empty slot
    if (!s.fighter1) return { ...s, fighter1: card, result: null };
    if (!s.fighter2) return { ...s, fighter2: card, result: null };
    // Replace fighter1 if both filled
    return { ...s, fighter1: card, result: null };
  });
}

export async function startDuel(): Promise<void> {
  let current: DuelState;
  duelState.subscribe((s) => (current = s))();

  if (!current!.fighter1 || !current!.fighter2) return;

  duelState.update((s) => ({ ...s, isAnimating: true, result: null }));

  // Suspense delay for drama
  await new Promise((r) => setTimeout(r, 1800));

  const atk1 = current!.fighter1.atk ?? 0;
  const atk2 = current!.fighter2.atk ?? 0;

  let result: DuelResult;
  if (atk1 > atk2) result = 'player1';
  else if (atk2 > atk1) result = 'player2';
  else result = 'draw';

  duelState.update((s) => ({ ...s, isAnimating: false, result }));
}

export function resetDuel() {
  duelState.set(initialDuel);
}

// ── Score ─────────────────────────────────────────────────────────────────────
export const score = writable({ p1: 0, p2: 0 });

duelState.subscribe((s) => {
  if (s.result === 'player1') score.update((sc) => ({ ...sc, p1: sc.p1 + 1 }));
  if (s.result === 'player2') score.update((sc) => ({ ...sc, p2: sc.p2 + 1 }));
});
