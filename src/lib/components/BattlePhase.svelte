<script lang="ts">
  import { gameState, p1SelectCard, p2SelectAndReveal, nextRound } from '$lib/gameStore';
  import { getFrameColor, getAttributeColor } from '$lib/api';
  import { getElementalEmoji } from '$lib/gameStore';
  import type { YgoCard } from '$lib/types';

  let gs = $derived($gameState);
  let phase = $derived(gs.phase);

  // P1 selected card (highlighted) before confirming
  let p1Pending: YgoCard | null = $state(null);
  let p2Pending: YgoCard | null = $state(null);

  function confirmP1() {
    if (!p1Pending) return;
    p1SelectCard(p1Pending);
    p1Pending = null;
  }

  function confirmP2() {
    if (!p2Pending) return;
    p2SelectAndReveal(p2Pending);
    p2Pending = null;
  }

  function cardBorder(card: YgoCard, pending: YgoCard | null) {
    if (pending?.id === card.id) return 'border: 2px solid #f5c842; box-shadow: 0 0 14px rgba(232,160,32,0.5);';
    return '';
  }

  let result = $derived(gs.lastResult);
</script>

<div class="battle-screen">
  <!-- Round tracker -->
  <div class="round-bar">
    <div class="round-info">
      Ronda <span class="rnum">{gs.round}</span> de 5
    </div>
    <div class="scores">
      <span class="sc p1">{gs.p1Score}</span>
      <span class="sc-sep">·</span>
      <span class="sc p2">{gs.p2Score}</span>
    </div>
    <div class="round-history">
      {#each gs.roundHistory as r (r.round)}
        <div class="hist-dot" class:p1={r.winner === 'p1'} class:p2={r.winner === 'p2'} class:draw={r.winner === 'draw'} title="Ronda {r.round}: {r.winner}"></div>
      {/each}
    </div>
  </div>

  <!-- Elemental legend -->
  <div class="elemental-legend">
    <span>💧 AGUA &gt; 🔥 FUEGO</span>
    <span>🔥 FUEGO &gt; ⛰️ TIERRA</span>
    <span>⛰️ TIERRA &gt; 💧 AGUA</span>
    <span class="bonus-tag">+500 ATK</span>
  </div>

  <!-- ─── P1 SELECT ─── -->
  {#if phase === 'p1-select'}
    <div class="phase-header gold">
      <h2>⚔️ DUELISTA 1 — Elige tu carta</h2>
      <p class="phase-hint">Selecciona y pulsa Confirmar. P2 no verá tu elección.</p>
    </div>
    <div class="hand-grid">
      {#each gs.p1Hand as card (card.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="hand-card"
          onclick={() => (p1Pending = card)}
          style="--accent: {getFrameColor(card.frameType)}; {cardBorder(card, p1Pending)}"
        >
          <div class="hc-ring">
            <div class="hc-circle">
              <img src={card.card_images[0].image_url_small} alt={card.name} class="hc-img" loading="lazy" />
              <div class="hc-gloss"></div>
            </div>
          </div>
          <div class="hc-name">{card.name}</div>
          <div class="hc-stats">
            <span class="hs atk">⚔ {card.atk ?? '?'}</span>
            <span class="hs def">🛡 {card.def ?? '?'}</span>
            {#if card.attribute}
              <span class="hs attr" style="color:{getAttributeColor(card.attribute)}">{getElementalEmoji(card.attribute)} {card.attribute}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
    <div class="action-row">
      <button class="btn-confirm gold" disabled={!p1Pending} onclick={confirmP1}>
        ✅ Confirmar elección
      </button>
    </div>

  <!-- ─── PASS DEVICE ─── -->
  {:else if phase === 'p2-select'}
    <div class="pass-device">
      <div class="pass-icon">🛡</div>
      <h2>Pasa el dispositivo al <span class="violet">Duelista 2</span></h2>
      <p>Duelista 1 ya eligió. Duelista 2, es tu turno.</p>
      <div class="hand-grid" style="margin-top: 1.5rem;">
        {#each gs.p2Hand as card (card.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="hand-card"
            onclick={() => (p2Pending = card)}
            style="--accent: {getFrameColor(card.frameType)}; {cardBorder(card, p2Pending)}"
          >
            <div class="hc-ring">
              <div class="hc-circle">
                <img src={card.card_images[0].image_url_small} alt={card.name} class="hc-img" loading="lazy" />
                <div class="hc-gloss"></div>
              </div>
            </div>
            <div class="hc-name">{card.name}</div>
            <div class="hc-stats">
              <span class="hs atk">⚔ {card.atk ?? '?'}</span>
              <span class="hs def">🛡 {card.def ?? '?'}</span>
              {#if card.attribute}
                <span class="hs attr" style="color:{getAttributeColor(card.attribute)}">{getElementalEmoji(card.attribute)} {card.attribute}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      <div class="action-row">
        <button class="btn-confirm violet" disabled={!p2Pending} onclick={confirmP2}>
          ⚡ ¡Revelar!
        </button>
      </div>
    </div>

  <!-- ─── REVEAL ─── -->
  {:else if phase === 'reveal'}
    <div class="reveal-area">
      {#if gs.isAnimating}
        <div class="clash-animation">
          <span class="clash-icon">⚡</span>
          <p>¡Calculando resultado!</p>
        </div>
      {:else if result}
        <!-- Elemental bonus -->
        {#if result.bonusText}
          <div class="bonus-banner">{result.bonusText}</div>
        {/if}
        <!-- Cards side by side -->
        <div class="reveal-cards">
          <div class="reveal-slot" class:winner={result.winner === 'p1'} class:loser={result.winner === 'p2'}>
            <div class="rs-label gold">DUELISTA 1</div>
            <div class="rs-ring" style="--accent: {getFrameColor(result.p1Card.frameType)};">
              <div class="rs-circle">
                <img src={result.p1Card.card_images[0].image_url} alt={result.p1Card.name} class="rs-img" />
                <div class="rs-gloss"></div>
              </div>
            </div>
            <div class="rs-name">{result.p1Card.name}</div>
            <div class="rs-eff" class:boosted={result.p1Effective > result.p1Base}>
              ⚔ {result.p1Effective}
              {#if result.p1Effective > result.p1Base}
                <span class="boost-tag">+{result.p1Effective - result.p1Base}</span>
              {/if}
            </div>
            {#if result.winner === 'p1'}
              <div class="winner-crown">👑 ¡VICTORIOSO!</div>
            {:else if result.winner === 'p2'}
              <div class="loser-tag">DERROTADO</div>
            {/if}
          </div>

          <div class="vs-center">
            <div class="vs-orb">VS</div>
            <div class="reason-text">{result.reason}</div>
          </div>

          <div class="reveal-slot" class:winner={result.winner === 'p2'} class:loser={result.winner === 'p1'}>
            <div class="rs-label violet">DUELISTA 2</div>
            <div class="rs-ring" style="--accent: {getFrameColor(result.p2Card.frameType)};">
              <div class="rs-circle">
                <img src={result.p2Card.card_images[0].image_url} alt={result.p2Card.name} class="rs-img" />
                <div class="rs-gloss"></div>
              </div>
            </div>
            <div class="rs-name">{result.p2Card.name}</div>
            <div class="rs-eff" class:boosted={result.p2Effective > result.p2Base}>
              ⚔ {result.p2Effective}
              {#if result.p2Effective > result.p2Base}
                <span class="boost-tag">+{result.p2Effective - result.p2Base}</span>
              {/if}
            </div>
            {#if result.winner === 'p2'}
              <div class="winner-crown">👑 ¡VICTORIOSO!</div>
            {:else if result.winner === 'p1'}
              <div class="loser-tag">DERROTADO</div>
            {/if}
          </div>
        </div>

        <div class="action-row">
          {#if gs.p1Score < 3 && gs.p2Score < 3 && gs.round < 5}
            <button class="btn-confirm violet" onclick={nextRound}>
              ➡️ Siguiente Ronda ({gs.round + 1}/5)
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .battle-screen { display: flex; flex-direction: column; gap: 1.25rem; }

  /* ── Round bar ── */
  .round-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
    padding: 0.75rem 1.25rem;
  }
  .round-info { font-family: var(--font-title,serif); font-size: 0.9rem; color: #94a3b8; }
  .rnum { color: #a855f7; font-size: 1.2rem; }
  .scores { display: flex; align-items: center; gap: 10px; }
  .sc { font-family: var(--font-title,serif); font-size: 1.6rem; line-height:1; }
  .sc.p1 { color: #e8a020; }
  .sc.p2 { color: #a855f7; }
  .sc-sep { color: #334155; }
  .round-history { display: flex; gap: 6px; }
  .hist-dot { width: 12px; height: 12px; border-radius: 50%; background: #1e293b; border: 1px solid #334155; }
  .hist-dot.p1 { background: #e8a020; border-color: #f5c842; }
  .hist-dot.p2 { background: #a855f7; border-color: #c084fc; }
  .hist-dot.draw { background: #475569; border-color: #64748b; }

  /* ── Elemental legend ── */
  .elemental-legend {
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    font-size: 0.7rem; color: #64748b;
    background: rgba(255,255,255,0.02); border-radius: 10px; padding: 6px 16px;
  }
  .bonus-tag { color: #e8a020; font-weight: 700; }

  /* ── Phase header ── */
  .phase-header { text-align: center; }
  .phase-header h2 { font-family: var(--font-title,serif); font-size: 1.1rem; }
  .phase-header.gold h2 { color: #f5c842; }
  .phase-hint { font-size: 0.75rem; color: #475569; margin-top: 4px; }

  /* ── Hand grid ── */
  .hand-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.25rem;
  }
  .hand-card {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    cursor: pointer; user-select: none;
    transition: transform 0.2s;
    border-radius: 16px; padding: 10px;
    background: rgba(255,255,255,0.02);
    border: 2px solid transparent;
  }
  .hand-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }

  .hc-ring {
    width: 120px; height: 120px;
    border-radius: 50%; padding: 4px;
    background: conic-gradient(var(--accent) 0deg,#c8c8c8 90deg,var(--accent) 180deg,#c8c8c8 270deg,var(--accent) 360deg);
    box-shadow: 0 0 0 2px rgba(0,0,0,0.5), 0 4px 14px rgba(0,0,0,0.6);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .hand-card:hover .hc-ring { transform: rotate(8deg); box-shadow: 0 0 0 2px rgba(0,0,0,0.5), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent); }
  .hc-circle { width:100%; height:100%; border-radius:50%; overflow:hidden; background:#0a0c14; position:relative; }
  .hc-img { width:100%; height:100%; object-fit:cover; object-position:center; }
  .hc-gloss { position:absolute; inset:0; border-radius:50%; background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 50%); pointer-events:none; }
  .hc-name { font-size:0.65rem; font-weight:600; color:#e2e8f0; text-align:center; max-width:140px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; text-overflow:ellipsis; }
  .hc-stats { display:flex; gap:5px; flex-wrap:wrap; justify-content:center; }
  .hs { font-size:0.58rem; font-weight:700; padding:1px 5px; border-radius:4px; }
  .hs.atk { background:rgba(239,68,68,0.2); color:#fc8181; border:1px solid rgba(239,68,68,0.3); }
  .hs.def { background:rgba(99,179,237,0.2); color:#90cdf4; border:1px solid rgba(99,179,237,0.3); }
  .hs.attr { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); }

  /* ── Action row ── */
  .action-row { display:flex; justify-content:center; padding-top: 0.5rem; }
  .btn-confirm {
    display:flex; align-items:center; gap:8px;
    font-family:var(--font-title,serif); font-size:0.9rem; letter-spacing:0.08em;
    border:none; border-radius:50px; padding:0.75rem 2.5rem; cursor:pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-confirm.gold { background:linear-gradient(135deg,#f5c842,#e8a020); color:#000; box-shadow:0 4px 20px rgba(232,160,32,0.4); }
  .btn-confirm.gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(232,160,32,0.6); }
  .btn-confirm.violet { background:linear-gradient(135deg,#a855f7,#7c3aed); color:#fff; box-shadow:0 4px 20px rgba(124,58,237,0.4); }
  .btn-confirm.violet:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(124,58,237,0.6); }
  .btn-confirm:disabled { opacity:0.35; cursor:not-allowed; }

  /* ── Pass device ── */
  .pass-device { text-align:center; display:flex; flex-direction:column; align-items:center; gap: 0.5rem; }
  .pass-icon { font-size:3rem; }
  .pass-device h2 { font-family:var(--font-title,serif); font-size:1.2rem; }
  .violet { color:#c084fc; }
  .pass-device p { color:#64748b; font-size:0.85rem; }

  /* ── Reveal ── */
  .reveal-area { display:flex; flex-direction:column; align-items:center; gap:1.25rem; }
  .clash-animation { display:flex; flex-direction:column; align-items:center; gap:12px; padding:3rem; }
  .clash-icon { font-size:3rem; animation:clash-pulse 0.5s ease infinite alternate; }
  .clash-animation p { font-family:var(--font-title,serif); color:#a855f7; letter-spacing:0.1em; }

  .bonus-banner {
    background:rgba(232,160,32,0.15); border:1px solid rgba(232,160,32,0.4);
    border-radius:12px; padding:8px 20px; color:#f5c842; font-size:0.8rem;
    font-weight:700; text-align:center;
  }

  .reveal-cards { display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; justify-content:center; width:100%; }

  .reveal-slot {
    display:flex; flex-direction:column; align-items:center; gap:8px;
    flex:1; min-width:200px; max-width:260px;
    border-radius:20px; padding:1.25rem;
    background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06);
    transition:all 0.4s; position:relative;
  }
  .reveal-slot.winner { border-color:rgba(232,160,32,0.5); box-shadow:0 0 30px rgba(232,160,32,0.3); animation:winner-pop 0.5s ease; }
  .reveal-slot.loser { opacity:0.45; filter:grayscale(0.5); }

  .rs-label { font-family:var(--font-title,serif); font-size:0.65rem; letter-spacing:0.15em; font-weight:700; }
  .rs-label.gold { color:#e8a020; }
  .rs-label.violet { color:#a855f7; }

  .rs-ring {
    width:180px; height:180px; border-radius:50%; padding:5px;
    background: conic-gradient(var(--accent) 0deg,#c8c8c8 90deg,var(--accent) 180deg,#c8c8c8 270deg,var(--accent) 360deg);
    box-shadow:0 0 0 3px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.7);
  }
  .rs-circle { width:100%; height:100%; border-radius:50%; overflow:hidden; background:#0a0c14; position:relative; }
  .rs-img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
  .rs-gloss { position:absolute; inset:0; border-radius:50%; background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 50%); pointer-events:none; }
  .rs-name { font-size:0.75rem; font-weight:600; color:#e2e8f0; text-align:center; max-width:200px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; }
  .rs-eff { font-family:var(--font-title,serif); font-size:1.1rem; color:#94a3b8; display:flex; align-items:center; gap:6px; }
  .rs-eff.boosted { color:#f5c842; }
  .boost-tag { font-size:0.7rem; background:rgba(232,160,32,0.2); color:#f5c842; border:1px solid rgba(232,160,32,0.4); padding:1px 7px; border-radius:6px; }

  .winner-crown { font-family:var(--font-title,serif); font-size:0.7rem; letter-spacing:0.1em; color:#f5c842; }
  .loser-tag { font-size:0.65rem; color:#64748b; }

  .vs-center { display:flex; flex-direction:column; align-items:center; gap:8px; }
  .vs-orb {
    width:56px; height:56px; border-radius:50%;
    background:radial-gradient(circle,rgba(124,58,237,0.4),rgba(7,9,15,0.8));
    border:2px solid rgba(124,58,237,0.4); display:flex; align-items:center; justify-content:center;
    font-family:var(--font-title,serif); font-size:0.85rem; color:#a855f7;
  }
  .reason-text { font-size:0.7rem; color:#64748b; text-align:center; max-width:80px; }

  @keyframes clash-pulse { from { transform:scale(1); opacity:0.7; } to { transform:scale(1.3); opacity:1; } }
  @keyframes winner-pop { 0% { transform:scale(0.97); } 60% { transform:scale(1.03); } 100% { transform:scale(1); } }
</style>
