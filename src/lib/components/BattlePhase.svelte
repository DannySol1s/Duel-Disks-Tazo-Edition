<script lang="ts">
  import { gameState, p1Confirm, p2Confirm, nextRound } from '$lib/gameStore';
  import type { YgoCard, CardMode, PlayerSelection } from '$lib/types';

  let gs = $derived($gameState);

  // ─── Estado local de selección ─────────────────────────────────────────
  let selectedCard: YgoCard | null = $state(null);
  let selectedMode: CardMode | null = $state(null);

  // Resetear selección local al cambiar de fase
  $effect(() => {
    if (gs.phase === 'p1-select' || gs.phase === 'p2-select') {
      selectedCard = null;
      selectedMode = null;
    }
  });

  function confirmSelection() {
    if (!selectedCard || !selectedMode) return;
    const sel: PlayerSelection = { card: selectedCard, mode: selectedMode };
    if (gs.phase === 'p1-select') p1Confirm(sel);
    else if (gs.phase === 'p2-select') p2Confirm(sel);
  }

  const isP1Turn = $derived(gs.phase === 'p1-select');
  const hand = $derived(isP1Turn ? gs.p1Hand : gs.p2Hand);
  const playerLabel = $derived(isP1Turn ? 'Duelista 1' : 'Duelista 2');
  const playerColor = $derived(isP1Turn ? 'gold' : 'violet');
  const canConfirm = $derived(!!selectedCard && !!selectedMode);

  function modeLabel(m: CardMode) { return m === 'attack' ? '⚔️ Ataque' : '🛡 Defensa'; }
  function statForMode(card: YgoCard, mode: CardMode) {
    return mode === 'attack' ? `ATK ${card.atk}` : `DEF ${card.def}`;
  }
</script>

<!-- ════════════════════════════════════════════════════════
     CABECERA DE RONDA (común a todas las sub-fases)
     ════════════════════════════════════════════════════════ -->
<div class="round-bar">
  <div class="round-info">Ronda <strong>{gs.phase === 'reveal' ? gs.round : gs.round}</strong> / 5</div>
  <div class="score-row">
    <span class="score gold">{gs.p1Score}</span>
    <span class="score-sep">—</span>
    <span class="score violet">{gs.p2Score}</span>
  </div>
  <div class="dots">
    {#each gs.roundHistory as r}
      <span class="dot {r.winner}" title="Ronda {r.round}"></span>
    {/each}
    {#each Array(5 - gs.roundHistory.length) as _}
      <span class="dot empty"></span>
    {/each}
  </div>
</div>

<!-- ════════════════════════════════════════════════════════
     SELECCIÓN (p1-select / p2-select)
     ════════════════════════════════════════════════════════ -->
{#if gs.phase === 'p1-select' || gs.phase === 'p2-select'}

  <!-- Aviso de pasar dispositivo antes de mostrar la mano de P2 -->
  {#if gs.phase === 'p2-select'}
    <div class="pass-notice">
      <div class="pass-icon">🔒</div>
      <p>Pasa el dispositivo al <strong class="violet">Duelista 2</strong></p>
      <p class="sub">Duelista 1 ya confirmó su elección en secreto.</p>
    </div>
  {/if}

  <div class="select-header {playerColor}">
    <h2>{isP1Turn ? '⚔️' : '🛡'} {playerLabel} — Elige una carta</h2>
  </div>

  <!-- Mano del jugador activo -->
  <div class="hand-grid">
    {#each hand as card (card.id)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="card-slot"
        class:selected={selectedCard?.id === card.id}
        onclick={() => { selectedCard = card; selectedMode = null; }}
      >
        <img src={card.card_images[0].image_url_small} alt={card.name} class="card-img" loading="lazy" />
        <div class="card-name">{card.name}</div>
        <div class="card-stats">
          <span class="stat atk">⚔ {card.atk}</span>
          <span class="stat def">🛡 {card.def}</span>
          <span class="stat lvl">★{card.level}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Modo de batalla (aparece tras elegir carta) -->
  {#if selectedCard}
    <div class="mode-picker">
      <p class="mode-label">Carta: <strong>{selectedCard.name}</strong></p>
      <div class="mode-btns">
        <button
          class="mode-btn {playerColor}"
          class:active={selectedMode === 'attack'}
          onclick={() => selectedMode = 'attack'}
        >⚔️ Modo Ataque<span class="mode-stat">ATK {selectedCard.atk}</span>
        </button>
        <button
          class="mode-btn {playerColor}"
          class:active={selectedMode === 'defense'}
          onclick={() => selectedMode = 'defense'}
        >🛡 Modo Defensa<span class="mode-stat">DEF {selectedCard.def}</span>
        </button>
      </div>
    </div>
  {/if}

  <div class="action-row">
    <button class="btn-confirm {playerColor}" disabled={!canConfirm} onclick={confirmSelection}>
      ✅ Confirmar elección
    </button>
  </div>

<!-- ════════════════════════════════════════════════════════
     REVELACIÓN
     ════════════════════════════════════════════════════════ -->
{:else if gs.phase === 'reveal' && gs.lastResult}
  {@const r = gs.lastResult}

  <div class="reveal-title">⚡ ¡Revelación!</div>

  <div class="reveal-arena">
    <!-- Jugador 1 -->
    <div class="reveal-slot" class:winner={r.winner === 'p1'} class:loser={r.winner === 'p2'}>
      <div class="rs-label gold">Duelista 1</div>
      <img src={r.p1Card.card_images[0].image_url_small} alt={r.p1Card.name} class="rs-img" />
      <div class="rs-name">{r.p1Card.name}</div>
      <div class="rs-mode">{modeLabel(r.p1Mode)}</div>
      <div class="rs-value">{statForMode(r.p1Card, r.p1Mode)}</div>
      {#if r.winner === 'p1'}<div class="crown">👑 Ganador</div>{/if}
    </div>

    <!-- VS -->
    <div class="vs-col">
      <div class="vs-orb">VS</div>
      <div class="result-badge {r.winner}">
        {r.winner === 'p1' ? '¡D1 gana!' : r.winner === 'p2' ? '¡D2 gana!' : '¡Empate!'}
      </div>
      <div class="reason">{r.reason}</div>
    </div>

    <!-- Jugador 2 -->
    <div class="reveal-slot" class:winner={r.winner === 'p2'} class:loser={r.winner === 'p1'}>
      <div class="rs-label violet">Duelista 2</div>
      <img src={r.p2Card.card_images[0].image_url_small} alt={r.p2Card.name} class="rs-img" />
      <div class="rs-name">{r.p2Card.name}</div>
      <div class="rs-mode">{modeLabel(r.p2Mode)}</div>
      <div class="rs-value">{statForMode(r.p2Card, r.p2Mode)}</div>
      {#if r.winner === 'p2'}<div class="crown">👑 Ganador</div>{/if}
    </div>
  </div>

  <div class="action-row">
    <button class="btn-confirm violet" onclick={nextRound}>
      {(gs.p1Score >= 3 || gs.p2Score >= 3 || gs.round >= 5) ? '🏆 Ver resultados' : `➡️ Ronda ${gs.round + 1}`}
    </button>
  </div>
{/if}

<style>
  /* ─── Round bar ─────────────────────────────────────────────── */
  .round-bar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 0.5rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 0.4rem 1rem;
    margin-bottom: 0.75rem;
  }
  .round-info { font-size: 0.85rem; color: #94a3b8; }
  .round-info strong { color: #a855f7; font-size: 1rem; }
  .score-row { display: flex; align-items: center; gap: 10px; }
  .score { font-family: var(--font-title, serif); font-size: 1.6rem; line-height: 1; }
  .score.gold { color: #f5c842; }
  .score.violet { color: #a855f7; }
  .score-sep { color: #334155; font-size: 1.2rem; }
  .dots { display: flex; gap: 6px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .dot.empty { background: #1e293b; border: 1px solid #334155; }
  .dot.p1 { background: #f5c842; }
  .dot.p2 { background: #a855f7; }
  .dot.draw { background: #475569; }

  /* ─── Pass notice ────────────────────────────────────────────── */
  .pass-notice {
    text-align: center; padding: 0.8rem;
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 12px; margin-bottom: 0.75rem;
  }
  .pass-icon { font-size: 2rem; margin-bottom: 0.25rem; }
  .pass-notice p { font-size: 1rem; color: #e2e8f0; }
  .pass-notice .sub { font-size: 0.78rem; color: #64748b; margin-top: 4px; }

  /* ─── Select header ──────────────────────────────────────────── */
  .select-header { text-align: center; margin-bottom: 0.5rem; }
  .select-header h2 { font-family: var(--font-title, serif); font-size: 0.9rem; }
  .select-header.gold h2 { color: #f5c842; }
  .select-header.violet h2 { color: #a855f7; }

  /* ─── Hand grid ──────────────────────────────────────────────── */
  .hand-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.8rem; margin-bottom: 0.75rem;
  }
  .card-slot {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 8px; border-radius: 10px; cursor: pointer;
    background: rgba(255,255,255,0.02);
    border: 2px solid rgba(255,255,255,0.06);
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .card-slot:hover { transform: translateY(-3px); background: rgba(255,255,255,0.05); }
  .card-slot.selected {
    border-color: #f5c842;
    box-shadow: 0 0 12px rgba(245,200,66,0.4);
    background: rgba(245,200,66,0.06);
  }
  .card-img { width: 100%; max-height: 220px; object-fit: contain; border-radius: 6px; }
  .card-name {
    font-size: 0.85rem; font-weight: 600; color: #e2e8f0;
    text-align: center; width: 100%;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .card-stats { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .stat {
    font-size: 0.75rem; font-weight: 700; padding: 2px 6px;
    border-radius: 4px;
  }
  .stat.atk { background: rgba(239,68,68,0.2); color: #fc8181; border: 1px solid rgba(239,68,68,0.3); }
  .stat.def { background: rgba(99,179,237,0.2); color: #90cdf4; border: 1px solid rgba(99,179,237,0.3); }
  .stat.lvl { background: rgba(245,200,66,0.15); color: #f5c842; border: 1px solid rgba(245,200,66,0.3); }

  /* ─── Mode picker ────────────────────────────────────────────── */
  .mode-picker {
    text-align: center; margin-bottom: 1rem;
    padding: 1rem; border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .mode-label { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem; }
  .mode-label strong { color: #e2e8f0; }
  .mode-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .mode-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 0.75rem 1.5rem; border: 2px solid rgba(255,255,255,0.1);
    border-radius: 12px; cursor: pointer; font-family: var(--font-body, sans-serif);
    font-size: 0.9rem; font-weight: 600; background: transparent; color: #94a3b8;
    transition: all 0.2s; min-width: 130px;
  }
  .mode-btn .mode-stat { font-size: 0.7rem; font-weight: 400; opacity: 0.7; }
  .mode-btn.gold.active { border-color: #f5c842; color: #f5c842; background: rgba(245,200,66,0.1); }
  .mode-btn.violet.active { border-color: #a855f7; color: #a855f7; background: rgba(168,85,247,0.1); }
  .mode-btn:hover:not(.active) { border-color: rgba(255,255,255,0.25); color: #e2e8f0; }

  /* ─── Action row ─────────────────────────────────────────────── */
  .action-row { display: flex; justify-content: center; padding-top: 0.5rem; }
  .btn-confirm {
    font-family: var(--font-title, serif); font-size: 0.9rem;
    letter-spacing: 0.06em; border: none; border-radius: 50px;
    padding: 0.8rem 2.5rem; cursor: pointer; transition: all 0.2s;
  }
  .btn-confirm.gold { background: linear-gradient(135deg,#f5c842,#e8a020); color: #000; box-shadow: 0 4px 20px rgba(232,160,32,0.4); }
  .btn-confirm.gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,160,32,0.6); }
  .btn-confirm.violet { background: linear-gradient(135deg,#a855f7,#7c3aed); color: #fff; box-shadow: 0 4px 20px rgba(124,58,237,0.4); }
  .btn-confirm.violet:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.6); }
  .btn-confirm:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ─── Reveal ─────────────────────────────────────────────────── */
  .reveal-title {
    text-align: center; font-family: var(--font-title, serif);
    font-size: 1.1rem; color: #f5c842; margin-bottom: 0.5rem;
    letter-spacing: 0.1em;
  }
  .reveal-arena {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;
  }
  @media (max-width: 540px) {
    .reveal-arena { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
  }
  .reveal-slot {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 0.75rem; border-radius: 12px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    transition: all 0.4s;
  }
  .reveal-slot.winner { border-color: rgba(245,200,66,0.5); box-shadow: 0 0 16px rgba(245,200,66,0.25); }
  .reveal-slot.loser { opacity: 0.45; filter: grayscale(0.6); }
  .rs-label { font-size: 0.65rem; letter-spacing: 0.15em; font-weight: 700; }
  .rs-label.gold { color: #e8a020; }
  .rs-label.violet { color: #a855f7; }
  .rs-img { width: 100%; max-width: 180px; max-height: 250px; object-fit: contain; border-radius: 8px; }
  .rs-name {
    font-size: 0.85rem; font-weight: 600; color: #e2e8f0; text-align: center;
    max-width: 180px; overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical;
  }
  .rs-mode { font-size: 0.85rem; color: #94a3b8; }
  .rs-value { font-size: 0.95rem; font-weight: 700; color: #e2e8f0; }
  .crown { font-size: 0.7rem; color: #f5c842; letter-spacing: 0.08em; }

  /* ─── VS column ──────────────────────────────────────────────── */
  .vs-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .vs-orb {
    width: 50px; height: 50px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.4), rgba(7,9,15,0.8));
    border: 2px solid rgba(124,58,237,0.4);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-title, serif); font-size: 0.8rem; color: #a855f7;
  }
  .result-badge {
    font-family: var(--font-title, serif); font-size: 0.7rem;
    padding: 4px 10px; border-radius: 8px; text-align: center;
  }
  .result-badge.p1 { color: #f5c842; background: rgba(245,200,66,0.15); }
  .result-badge.p2 { color: #a855f7; background: rgba(168,85,247,0.15); }
  .result-badge.draw { color: #64748b; background: rgba(100,116,139,0.15); }
  .reason { font-size: 0.65rem; color: #64748b; text-align: center; max-width: 80px; }
</style>
