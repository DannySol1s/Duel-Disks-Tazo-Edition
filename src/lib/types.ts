export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped?: string;
}

export interface YgoCard {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  atk: number;
  def: number;
  level: number;
  attribute: string;
  card_images: CardImage[];
}

export interface ApiResponse {
  data: YgoCard[];
}

/** Modo de posición de la carta */
export type CardMode = 'attack' | 'defense';

/** Fases del juego */
export type GamePhase = 'idle' | 'p1-select' | 'p2-select' | 'revealing' | 'reveal' | 'result';

export type RoundWinner = 'p1' | 'p2' | 'draw';

export interface PlayerSelection {
  card: YgoCard;
  mode: CardMode;
}

export interface RoundResult {
  round: number;
  p1Card: YgoCard;
  p1Mode: CardMode;
  p1Value: number;  // stat empleado (ATK, DEF o Nivel)
  p2Card: YgoCard;
  p2Mode: CardMode;
  p2Value: number;
  winner: RoundWinner;
  reason: string;
}

export interface GameState {
  phase: GamePhase;
  p1Hand: YgoCard[];
  p2Hand: YgoCard[];
  p1Selection: PlayerSelection | null;
  p2Selection: PlayerSelection | null;
  round: number;       // 1–5
  p1Score: number;
  p2Score: number;
  roundHistory: RoundResult[];
  lastResult: RoundResult | null;
  isLoading: boolean;
  error: string | null;
}
