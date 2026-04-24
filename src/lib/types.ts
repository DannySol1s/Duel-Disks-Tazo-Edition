// ── Card types ─────────────────────────────────────────────────────────────────
export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export interface YgoCard {
  id: number;
  name: string;
  type: string;
  humanReadableCardType: string;
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  card_images: CardImage[];
}

export interface ApiResponse {
  data: YgoCard[];
  meta: {
    total_rows: number;
    current_rows: number;
    rows_remaining: number;
    next_page?: string;
  };
}

// ── Game types ─────────────────────────────────────────────────────────────────
export type GamePhase = 'idle' | 'draft' | 'p1-select' | 'p2-select' | 'reveal' | 'result';
export type Picker = 'p1' | 'p2';

export interface RoundResult {
  round: number;
  p1Card: YgoCard;
  p2Card: YgoCard;
  p1Base: number;
  p2Base: number;
  p1Effective: number;
  p2Effective: number;
  bonusText: string;
  winner: 'p1' | 'p2' | 'draw';
  reason: string;
}

export interface GameState {
  phase: GamePhase;
  // Draft
  pool: YgoCard[];
  p1Deck: YgoCard[];
  p2Deck: YgoCard[];
  pickOrder: Picker[];
  isDraftLoading: boolean;
  // Battle
  p1Hand: YgoCard[];
  p2Hand: YgoCard[];
  round: number;
  p1Choice: YgoCard | null;
  p2Choice: YgoCard | null;
  isAnimating: boolean;
  lastResult: RoundResult | null;
  // Scores
  p1Score: number;
  p2Score: number;
  roundHistory: RoundResult[];
}
