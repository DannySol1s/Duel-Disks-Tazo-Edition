<script lang="ts">
  import { gameState, resetGame } from '$lib/gameStore';

  let gs = $derived($gameState);
  let winner = $derived(gs.p1Score > gs.p2Score ? 'p1' : gs.p2Score > gs.p1Score ? 'p2' : 'draw');
</script>

<div class="result-screen">
  <!-- Trophy header -->
  <div class="trophy-section">
    {#if winner === 'p1'}
      <div class="trophy gold">🏆</div>
      <h2 class="result-title gold">¡DUELISTA 1 GANA EL MATCH!</h2>
    {:else if winner === 'p2'}
      <div class="trophy violet">🏆</div>
      <h2 class="result-title violet">¡DUELISTA 2 GANA EL MATCH!</h2>
    {:else}
      <div class="trophy">🤝</div>
      <h2 class="result-title">¡EMPATE TOTAL!</h2>
    {/if}
    <div class="final-score">
      <span class="fs p1">{gs.p1Score}</span>
      <span class="fs-sep">—</span>
      <span class="fs p2">{gs.p2Score}</span>
    </div>
  </div>

  <!-- Round history -->
  <div class="history-section">
    <h3 class="history-title">📋 Resumen de Rondas</h3>
    <div class="history-list">
      {#each gs.roundHistory as r (r.round)}
        <div class="history-row" class:p1win={r.winner === 'p1'} class:p2win={r.winner === 'p2'}>
          <span class="hr-round">R{r.round}</span>
          <div class="hr-card p1-side">
            <img src={r.p1Card.card_images[0].image_url_small} alt={r.p1Card.name} class="hr-img" />
            <span class="hr-name">{r.p1Card.name}</span>
            <span class="hr-atk">{r.p1Effective}</span>
          </div>
          <div class="hr-vs" class:p1win={r.winner === 'p1'} class:p2win={r.winner === 'p2'}>
            {#if r.winner === 'p1'}🏆{:else if r.winner === 'p2'}🏆{:else}🤝{/if}
          </div>
          <div class="hr-card p2-side">
            <span class="hr-atk">{r.p2Effective}</span>
            <span class="hr-name">{r.p2Card.name}</span>
            <img src={r.p2Card.card_images[0].image_url_small} alt={r.p2Card.name} class="hr-img" />
          </div>
          {#if r.bonusText}
            <div class="hr-bonus">{r.bonusText}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Actions -->
  <div class="result-actions">
    <button class="btn-play-again" onclick={resetGame}>
      🔄 Nuevo Duelo de Quintetos
    </button>
  </div>
</div>

<style>
  .result-screen { display:flex; flex-direction:column; gap:2rem; }

  /* ── Trophy ── */
  .trophy-section { text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; }
  .trophy { font-size:4rem; animation:trophy-bounce 1s ease infinite alternate; }
  .trophy.gold { filter:drop-shadow(0 0 16px rgba(232,160,32,0.7)); }
  .trophy.violet { filter:drop-shadow(0 0 16px rgba(168,85,247,0.7)); }
  .result-title { font-family:var(--font-title,serif); font-size:1.4rem; }
  .result-title.gold { color:#f5c842; }
  .result-title.violet { color:#c084fc; }
  .final-score { display:flex; align-items:center; gap:16px; }
  .fs { font-family:var(--font-title,serif); font-size:3rem; line-height:1; }
  .fs.p1 { color:#e8a020; }
  .fs.p2 { color:#a855f7; }
  .fs-sep { color:#334155; font-size:2rem; }

  /* ── History ── */
  .history-section { display:flex; flex-direction:column; gap:10px; }
  .history-title { font-family:var(--font-title,serif); font-size:0.85rem; color:#94a3b8; letter-spacing:0.1em; }
  .history-list { display:flex; flex-direction:column; gap:8px; }

  .history-row {
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
    border-radius:14px; padding:10px 14px;
    position:relative;
  }
  .history-row.p1win { border-color:rgba(232,160,32,0.3); }
  .history-row.p2win { border-color:rgba(168,85,247,0.3); }

  .hr-round { font-family:var(--font-title,serif); font-size:0.7rem; color:#475569; min-width:24px; }
  .hr-card { display:flex; align-items:center; gap:6px; flex:1; }
  .hr-card.p2-side { flex-direction:row-reverse; }
  .hr-img { width:36px; height:50px; object-fit:cover; border-radius:5px; border:1px solid rgba(255,255,255,0.1); }
  .hr-name { font-size:0.65rem; color:#94a3b8; flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .hr-atk { font-family:var(--font-title,serif); font-size:0.85rem; color:#e2e8f0; white-space:nowrap; }
  .hr-vs { font-size:1rem; flex-shrink:0; }
  .hr-bonus {
    width:100%; font-size:0.6rem; color:#f5c842;
    background:rgba(232,160,32,0.1); border-radius:6px; padding:2px 8px; text-align:center;
  }

  /* ── Actions ── */
  .result-actions { display:flex; justify-content:center; }
  .btn-play-again {
    background:linear-gradient(135deg,#a855f7,#7c3aed); color:#fff;
    font-family:var(--font-title,serif); font-size:0.95rem; letter-spacing:0.08em;
    border:none; border-radius:50px; padding:0.85rem 2.5rem; cursor:pointer;
    box-shadow:0 4px 20px rgba(124,58,237,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-play-again:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(124,58,237,0.6); }

  @keyframes trophy-bounce {
    from { transform:translateY(0) scale(1); }
    to   { transform:translateY(-8px) scale(1.05); }
  }
</style>
