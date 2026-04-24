<script lang="ts">
  import { gameState, pickCard } from '$lib/gameStore';
  import type { YgoCard } from '$lib/types';
  import { getFrameColor, getAttributeColor } from '$lib/api';

  let phase = $derived($gameState);
  let currentPicker = $derived(phase.pickOrder[0] ?? null);
  let pickNum = $derived(10 - phase.pickOrder.length + 1);

  function cardRingStyle(card: YgoCard) {
    return `--accent: ${getFrameColor(card.frameType)}; --attr: ${getAttributeColor(card.attribute)};`;
  }
</script>

<div class="draft-screen">
  <!-- Header -->
  <div class="draft-header">
    {#if $gameState.isDraftLoading}
      <h2 class="draft-title">⏳ Generando cartas...</h2>
    {:else if currentPicker}
      <h2 class="draft-title">
        <span class="picker-badge" class:p1={currentPicker === 'p1'} class:p2={currentPicker === 'p2'}>
          {currentPicker === 'p1' ? 'DUELISTA 1' : 'DUELISTA 2'}
        </span>
        — elige tu carta ({pickNum}/10)
      </h2>
      <p class="draft-hint">¡El turno cambia en orden serpiente! (P1→P2→P2→P1…)</p>
    {:else}
      <h2 class="draft-title">✅ Draft completo — ¡comenzando duelo!</h2>
    {/if}
  </div>

  <!-- Decks progress -->
  <div class="decks-row">
    <div class="deck-preview p1">
      <div class="deck-label gold">🗡 DUELISTA 1 · {$gameState.p1Deck.length}/5</div>
      <div class="deck-mini-cards">
        {#each $gameState.p1Deck as c (c.id)}
          <img src={c.card_images[0].image_url_small} alt={c.name} class="mini-card" title={c.name} />
        {/each}
        {#each Array(5 - $gameState.p1Deck.length) as _, i (i)}
          <div class="mini-card empty">?</div>
        {/each}
      </div>
    </div>

    <div class="turn-orb" class:p1={currentPicker === 'p1'} class:p2={currentPicker === 'p2'}>
      <span>{currentPicker === 'p1' ? 'P1' : currentPicker === 'p2' ? 'P2' : '✓'}</span>
    </div>

    <div class="deck-preview p2">
      <div class="deck-label violet">🛡 DUELISTA 2 · {$gameState.p2Deck.length}/5</div>
      <div class="deck-mini-cards">
        {#each $gameState.p2Deck as c (c.id)}
          <img src={c.card_images[0].image_url_small} alt={c.name} class="mini-card" title={c.name} />
        {/each}
        {#each Array(5 - $gameState.p2Deck.length) as _, i (i)}
          <div class="mini-card empty">?</div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Card pool -->
  {#if $gameState.isDraftLoading}
    <div class="pool-loading">
      <div class="loading-dots"><span></span><span></span><span></span></div>
      <p>Consultando la API de Yu-Gi-Oh!…</p>
    </div>
  {:else}
    <div class="pool-grid">
      {#each $gameState.pool as card (card.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="pool-card"
          style={cardRingStyle(card)}
          onclick={() => pickCard(card)}
          class:can-pick={!!currentPicker}
        >
          <div class="pool-ring">
            <div class="pool-circle">
              <img
                src={card.card_images[0].image_url_small}
                alt={card.name}
                class="pool-img"
                loading="lazy"
              />
              <div class="pool-gloss"></div>
            </div>
          </div>
          <div class="pool-name">{card.name}</div>
          <div class="pool-stats">
            <span class="s atk">⚔ {card.atk ?? '?'}</span>
            {#if card.attribute}
              <span class="s attr" style="color: {getAttributeColor(card.attribute)}">
                {card.attribute}
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .draft-screen {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ── Header ── */
  .draft-header { text-align: center; }
  .draft-title {
    font-family: var(--font-title, serif);
    font-size: 1.2rem;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .picker-badge {
    padding: 4px 14px;
    border-radius: 50px;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
  }
  .picker-badge.p1 { background: rgba(232,160,32,0.2); color: #f5c842; border: 1px solid rgba(232,160,32,0.5); }
  .picker-badge.p2 { background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.5); }
  .draft-hint { font-size: 0.75rem; color: #475569; margin-top: 4px; }

  /* ── Decks row ── */
  .decks-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 1rem 1.5rem;
  }
  .deck-preview { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .deck-label { font-family: var(--font-title, serif); font-size: 0.7rem; letter-spacing: 0.12em; }
  .deck-label.gold { color: #e8a020; }
  .deck-label.violet { color: #a855f7; }
  .deck-mini-cards { display: flex; gap: 6px; flex-wrap: wrap; }
  .mini-card {
    width: 44px; height: 62px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.15);
  }
  .mini-card.empty {
    background: rgba(255,255,255,0.04);
    border: 1px dashed rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; color: #334155;
  }

  .turn-orb {
    width: 52px; height: 52px; flex-shrink: 0;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-title, serif);
    font-size: 0.85rem;
    font-weight: 700;
    border: 2px solid transparent;
    transition: all 0.3s;
  }
  .turn-orb.p1 {
    background: rgba(232,160,32,0.15);
    border-color: #e8a020;
    color: #f5c842;
    box-shadow: 0 0 16px rgba(232,160,32,0.4);
    animation: pulse-gold 1.5s ease infinite;
  }
  .turn-orb.p2 {
    background: rgba(168,85,247,0.15);
    border-color: #a855f7;
    color: #c084fc;
    box-shadow: 0 0 16px rgba(168,85,247,0.4);
    animation: pulse-violet 1.5s ease infinite;
  }

  /* ── Pool grid ── */
  .pool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1.25rem;
  }

  .pool-card {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    cursor: default;
    user-select: none;
    transition: transform 0.2s ease;
    opacity: 0.6;
  }
  .pool-card.can-pick {
    cursor: pointer;
    opacity: 1;
  }
  .pool-card.can-pick:hover { transform: translateY(-6px) scale(1.04); }

  .pool-ring {
    width: 130px; height: 130px;
    border-radius: 50%;
    padding: 4px;
    background: conic-gradient(
      var(--accent) 0deg, #c8c8c8 90deg,
      var(--accent) 180deg, #c8c8c8 270deg, var(--accent) 360deg
    );
    box-shadow: 0 0 0 2px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.6);
    transition: box-shadow 0.3s, transform 0.3s;
  }
  .pool-card.can-pick:hover .pool-ring {
    box-shadow: 0 0 0 2px rgba(0,0,0,0.5), 0 0 24px color-mix(in srgb, var(--accent) 60%, transparent);
    transform: rotate(8deg);
  }
  .pool-circle {
    width: 100%; height: 100%;
    border-radius: 50%; overflow: hidden;
    background: #0a0c14; position: relative;
  }
  .pool-img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: center;
    display: block;
  }
  .pool-gloss {
    position: absolute; inset: 0; border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 50%);
    pointer-events: none;
  }
  .pool-name {
    font-size: 0.65rem; font-weight: 600;
    color: #e2e8f0; text-align: center; max-width: 130px;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; line-clamp: 2;
    -webkit-box-orient: vertical; text-overflow: ellipsis;
  }
  .pool-stats { display: flex; gap: 6px; }
  .s {
    font-size: 0.6rem; font-weight: 700;
    padding: 1px 5px; border-radius: 4px;
  }
  .s.atk { background: rgba(239,68,68,0.2); color: #fc8181; border: 1px solid rgba(239,68,68,0.3); }

  /* ── Loading ── */
  .pool-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 3rem; color: #64748b; }
  .loading-dots { display: flex; gap: 8px; }
  .loading-dots span {
    width: 10px; height: 10px; border-radius: 50%; background: #7c3aed;
    animation: dot-bounce 1.2s ease infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot-bounce {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50%       { transform: translateY(-8px); opacity: 1; }
  }
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 8px rgba(232,160,32,0.3); }
    50%       { box-shadow: 0 0 20px rgba(232,160,32,0.7); }
  }
  @keyframes pulse-violet {
    0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.3); }
    50%       { box-shadow: 0 0 20px rgba(168,85,247,0.7); }
  }
</style>
