// Types for the Yu-Gi-Oh! Tazos VS App

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

export type DuelResult = 'player1' | 'player2' | 'draw' | null;

export interface DuelState {
  fighter1: YgoCard | null;
  fighter2: YgoCard | null;
  result: DuelResult;
  isAnimating: boolean;
}
