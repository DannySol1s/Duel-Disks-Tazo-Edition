<script lang="ts">
  import { gameState, resetGame } from '$lib/gameStore';
  import type { RoundResult } from '$lib/types';

  let gs = $derived($gameState);
  let winner = $derived(
    gs.p1Score > gs.p2Score ? 'p1' : gs.p2Score > gs.p1Score ? 'p2' : 'draw'
  );

  function modeLabel(m: 'attack' | 'defense') { return m === 'attack' ? '⚔️ Ataque' : '🛡 Defensa'; }
  function winLabel(r: RoundResult) {
    if (r.winner === 'p1') return '🥇 D1';
    if (r.winner === 'p2') return '🥇 D2';
    return '🤝';
  }
</script>

<div class="result-screen">
  <!-- Trophy -->
  <div class="trophy-area">
    {#if winner === 'p1'}
      <div class="trophy">🏆</div>
      <h2 class="winner-text gold">¡Duelista 1 Ganó!</h2>
    {:else if winner === 'p2'}
      <div class="trophy">🏆</div>
      <h2 class="winner-text violet">¡Duelista 2 Ganó!</h2>
    {:else}
      <div class="trophy">🤝</div>
      <h2 class="winner-text muted">¡Empate!</h2>
    {/if}
    <div class="final-score">
      <span class="fscore gold">{gs.p1Score}</span>
      <span class="fsep">—</span>
      <span class="fscore violet">{gs.p2Score}</span>
    </div>
  </div>

  <!-- Round history table -->
  <div class="history-section">
    <h3 class="history-title">Historial de rondas</h3>
    <div class="history-table">
      <div class="ht-header">
        <span>#</span>
        <span class="gold-txt">Duelista 1</span>
        <span>Modo</span>
        <span></span>
        <span class="violet-txt">Duelista 2</span>
        <span>Modo</span>
        <span>Resultado</span>
      </div>
      {#each gs.roundHistory as r}
        <div class="ht-row {r.winner}">
          <span class="rnd">{r.round}</span>
          <span class="rcard">{r.p1Card.name}</span>
          <span class="rmode">{modeLabel(r.p1Mode)}</span>
          <span class="rvs">⚡</span>
          <span class="rcard">{r.p2Card.name}</span>
          <span class="rmode">{modeLabel(r.p2Mode)}</span>
          <span class="rwinner">{winLabel(r)}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="action-row">
    <button class="btn-reset" onclick={resetGame}>🔄 Nueva Partida</button>
  </div>
</div>

<style>
  .result-screen { display: flex; flex-direction: column; gap: 0.75rem; }

  .trophy-area { text-align: center; padding: 0.5rem 0; }
  .trophy { font-size: 3rem; animation: bounce 1s ease infinite alternate; }
  .winner-text { font-family: var(--font-title, serif); font-size: 1.2rem; margin-top: 0.25rem; }
  .winner-text.gold { color: #f5c842; }
  .winner-text.violet { color: #a855f7; }
  .winner-text.muted { color: #64748b; }
  .final-score { display: flex; align-items: center; gap: 14px; justify-content: center; margin-top: 0.25rem; }
  .fscore { font-family: var(--font-title, serif); font-size: 2.5rem; }
  .fscore.gold { color: #f5c842; }
  .fscore.violet { color: #a855f7; }
  .fsep { color: #334155; font-size: 1.5rem; }

  /* History */
  .history-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 0.75rem; }
  .history-title { font-family: var(--font-title, serif); font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem; letter-spacing: 0.1em; }
  .ht-header, .ht-row {
    display: grid;
    grid-template-columns: 24px 1fr 72px 20px 1fr 72px 60px;
    gap: 4px; align-items: center; font-size: 0.65rem;
    padding: 4px 6px;
  }
  .ht-header { color: #475569; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px; margin-bottom: 2px; }
  .ht-row { border-radius: 8px; }
  .ht-row.p1 { background: rgba(245,200,66,0.06); }
  .ht-row.p2 { background: rgba(168,85,247,0.06); }
  .ht-row.draw { background: rgba(100,116,139,0.05); }
  .gold-txt { color: #e8a020; }
  .violet-txt { color: #a855f7; }
  .rnd { color: #64748b; text-align: center; }
  .rcard { color: #e2e8f0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .rmode { color: #64748b; font-size: 0.62rem; }
  .rvs { color: #334155; text-align: center; }
  .rwinner { font-weight: 700; text-align: center; }
  .ht-row.p1 .rwinner { color: #f5c842; }
  .ht-row.p2 .rwinner { color: #a855f7; }
  .ht-row.draw .rwinner { color: #64748b; }

  /* Reset button */
  .action-row { display: flex; justify-content: center; }
  .btn-reset {
    font-family: var(--font-title, serif); font-size: 0.9rem; letter-spacing: 0.06em;
    border: 2px solid rgba(255,255,255,0.15); border-radius: 50px;
    padding: 0.8rem 2.5rem; cursor: pointer; color: #e2e8f0;
    background: rgba(255,255,255,0.04); transition: all 0.2s;
  }
  .btn-reset:hover { border-color: #f5c842; color: #f5c842; background: rgba(245,200,66,0.08); }

  @keyframes bounce { from { transform: scale(1) translateY(0); } to { transform: scale(1.08) translateY(-6px); } }

  /* Responsive history table */
  @media (max-width: 560px) {
    .ht-header, .ht-row { grid-template-columns: 20px 1fr 60px 18px 1fr 60px 50px; gap: 4px; font-size: 0.6rem; }
  }
</style>
