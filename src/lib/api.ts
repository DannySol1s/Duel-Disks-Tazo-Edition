/**
 * Yu-Gi-Oh! API service — ygoprodeck v7
 * Fetches only Monster Cards so ATK/DEF always exist.
 */
import type { ApiResponse, YgoCard } from './types';

const BASE = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

interface FetchOptions {
  num?: number;
  offset?: number;
  attribute?: string;
}

export async function fetchMonsters(opts: FetchOptions = {}): Promise<YgoCard[]> {
  const params = new URLSearchParams({
    type: 'Normal Monster,Effect Monster,Fusion Monster,Synchro Monster,XYZ Monster,Link Monster',
    num: String(opts.num ?? 40),
    offset: String(opts.offset ?? 0),
  });

  if (opts.attribute && opts.attribute !== 'ALL') {
    params.set('attribute', opts.attribute);
  }

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);

  const json: ApiResponse = await res.json();

  // Keep only cards that have ATK defined
  return json.data.filter((c) => c.atk !== undefined && c.atk !== null);
}

export async function searchByName(name: string): Promise<YgoCard[]> {
  const params = new URLSearchParams({
    fname: name,
    type: 'Normal Monster,Effect Monster,Fusion Monster,Synchro Monster,XYZ Monster,Link Monster',
    num: '20',
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);

  const json: ApiResponse = await res.json();
  return json.data.filter((c) => c.atk !== undefined);
}

export const ATTRIBUTES = ['ALL', 'DARK', 'LIGHT', 'FIRE', 'WATER', 'WIND', 'EARTH', 'DIVINE'];

export function getFrameColor(frameType: string): string {
  const map: Record<string, string> = {
    normal:   '#c8a227',
    effect:   '#c44a00',
    fusion:   '#7040a0',
    synchro:  '#e0e0e0',
    xyz:      '#111111',
    link:     '#0050a0',
    ritual:   '#1050c0',
    spell:    '#1a7a4a',
    trap:     '#7a1a4a',
  };
  return map[frameType] ?? '#444';
}

export function getAttributeColor(attribute?: string): string {
  const map: Record<string, string> = {
    DARK:   '#9b5de5',
    LIGHT:  '#ffd166',
    FIRE:   '#ef4444',
    WATER:  '#06b6d4',
    WIND:   '#84cc16',
    EARTH:  '#a16207',
    DIVINE: '#f97316',
  };
  return map[attribute ?? ''] ?? '#64748b';
}
