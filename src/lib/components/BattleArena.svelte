<script lang="ts">
  import { duelState, startDuel, resetDuel } from '$lib/store';
  import Tazo from './Tazo.svelte';

  function handleDuel() {
    if ($duelState.fighter1 && $duelState.fighter2 && !$duelState.isAnimating) {
      startDuel();
    }
  }
</script>

<section class="arena" aria-label="Battle Arena">
  <div class="arena-header">
    <div class="vs-divider">
      <span class="vs-line"></span>
      <span class="vs-label">BATTLE RING</span>
      <span class="vs-line"></span>
    </div>
  </div>

  <div class="fighters-row">
    <!-- Fighter 1 -->
    <div
      class="fighter-slot"
      class:empty={!$duelState.fighter1}
      class:winner={$duelState.result === 'player1'}
      class:loser={$duelState.result === 'player2'}
    >
      {#if $duelState.fighter1}
        <div class="fighter-label gold">DUELISTA 1</div>
        <Tazo card={$duelState.fighter1} size="lg" animate={$duelState.isAnimating} />
        <div class="fighter-atk gold">{$duelState.fighter1.atk ?? '?'} ATK</div>
        {#if $duelState.result === 'player1'}
          <div class="result-badge win">¡VICTORIOSO!</div>
        {:else if $duelState.result === 'player2'}
          <div class="result-badge lose">DERROTADO</div>
        {/if}
      {:else}
        <div class="empty-slot">
          <div class="empty-icon">⚔</div>
          <p>Selecciona un monstruo</p>
        </div>
      {/if}
    </div>

    <!-- VS orb -->
    <div class="vs-orb" class:clash={$duelState.isAnimating}>
      <div class="vs-inner">
        {#if $duelState.isAnimating}
          <span class="vs-animating">⚡</span>
        {:else if $duelState.result === 'draw'}
          <span>🤝</span>
        {:else}
          <span>VS</span>
        {/if}
      </div>
    </div>

    <!-- Fighter 2 -->
    <div
      class="fighter-slot"
      class:empty={!$duelState.fighter2}
      class:winner={$duelState.result === 'player2'}
      class:loser={$duelState.result === 'player1'}
    >
      {#if $duelState.fighter2}
        <div class="fighter-label violet">DUELISTA 2</div>
        <Tazo card={$duelState.fighter2} size="lg" animate={$duelState.isAnimating} />
        <div class="fighter-atk violet">{$duelState.fighter2.atk ?? '?'} ATK</div>
        {#if $duelState.result === 'player2'}
          <div class="result-badge win">¡VICTORIOSO!</div>
        {:else if $duelState.result === 'player1'}
          <div class="result-badge lose">DERROTADO</div>
        {/if}
      {:else}
        <div class="empty-slot">
          <div class="empty-icon">🛡</div>
          <p>Selecciona un monstruo</p>
        </div>
      {/if}
    </div>
  </div>

  {#if $duelState.result === 'draw'}
    <p class="draw-text">¡EMPATE! Ambos monstruos tienen el mismo ATK</p>
  {/if}

  <div class="arena-actions">
    {#if !$duelState.result && !$duelState.isAnimating}
      <button
        id="btn-duel"
        class="btn-duel"
        disabled={!$duelState.fighter1 || !$duelState.fighter2}
        onclick={handleDuel}
      >
        <span class="btn-icon">⚡</span>
        ¡INICIAR DUELO!
        <span class="btn-icon">⚡</span>
      </button>
    {:else if $duelState.isAnimating}
      <div class="dueling-text">
        <span class="spark">✦</span> Calculando poder...
        <span class="spark">✦</span>
      </div>
    {:else}
      <button id="btn-reset" class="btn-reset" onclick={resetDuel}>
        🔄 Nuevo Duelo
      </button>
    {/if}
  </div>
</section>

<style>
  .arena {
    background: radial-gradient(ellipse at 50% 20%, rgba(30,10,70,0.8) 0%, rgba(7,9,15,0.9) 70%);
    border: 1px solid rgba(124,58,237,0.25);
    border-radius: 24px;
    padding: 2rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  .arena::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 30px,
      rgba(124,58,237,0.03) 30px,
      rgba(124,58,237,0.03) 31px
    );
    pointer-events: none;
  }

  .arena-header { width: 100%; }
  .vs-divider {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .vs-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5));
  }
  .vs-divider .vs-line:last-child {
    background: linear-gradient(90deg, rgba(124,58,237,0.5), transparent);
  }
  .vs-label {
    font-family: var(--font-title, serif);
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: rgba(168,85,247,0.8);
  }

  .fighters-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
  }

  .fighter-slot {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-height: 220px;
    border-radius: 16px;
    padding: 1rem 0.5rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    transition: box-shadow 0.4s ease;
    position: relative;
  }
  .fighter-slot.winner {
    box-shadow: 0 0 30px rgba(232,160,32,0.4);
    border-color: rgba(232,160,32,0.4);
    animation: winner-bounce 0.8s ease;
  }
  .fighter-slot.loser {
    opacity: 0.5;
    filter: grayscale(0.5);
  }

  .empty-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    color: rgba(100,116,139,0.6);
    text-align: center;
    flex: 1;
  }
  .empty-icon { font-size: 2rem; opacity: 0.4; }
  .empty-slot p { font-size: 0.7rem; }

  .fighter-label {
    font-family: var(--font-title, serif);
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    font-weight: 700;
  }
  .fighter-label.gold { color: #e8a020; }
  .fighter-label.violet { color: #a855f7; }

  .fighter-atk {
    font-family: var(--font-body, sans-serif);
    font-size: 0.85rem;
    font-weight: 900;
  }
  .fighter-atk.gold { color: #f5c842; }
  .fighter-atk.violet { color: #c084fc; }

  .result-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    font-family: var(--font-title, serif);
    font-size: 0.55rem;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 700;
  }
  .result-badge.win {
    background: rgba(232,160,32,0.2);
    color: #f5c842;
    border: 1px solid rgba(232,160,32,0.5);
  }
  .result-badge.lose {
    background: rgba(239,68,68,0.15);
    color: #fc8181;
    border: 1px solid rgba(239,68,68,0.3);
  }

  .vs-orb {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.4) 0%, rgba(7,9,15,0.8) 70%);
    border: 2px solid rgba(124,58,237,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(124,58,237,0.3);
    transition: all 0.3s ease;
  }
  .vs-orb.clash {
    animation: pulse-violet 0.6s ease infinite;
  }
  .vs-inner {
    font-family: var(--font-title, serif);
    font-size: 0.9rem;
    color: #a855f7;
    font-weight: 700;
  }
  .vs-animating {
    font-size: 1.4rem;
    animation: lightning 0.4s ease infinite;
  }

  .draw-text {
    font-size: 0.8rem;
    color: #94a3b8;
    text-align: center;
    font-style: italic;
  }

  .arena-actions { width: 100%; display: flex; justify-content: center; }

  .btn-duel {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #a855f7, #7c3aed);
    color: #fff;
    font-family: var(--font-title, serif);
    font-size: 0.9rem;
    letter-spacing: 0.08em;
    border: none;
    border-radius: 50px;
    padding: 0.75rem 2rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(124,58,237,0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-duel:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 30px rgba(124,58,237,0.6);
  }
  .btn-duel:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-icon { font-size: 1rem; }

  .btn-reset {
    background: rgba(255,255,255,0.06);
    color: #94a3b8;
    font-family: var(--font-body, sans-serif);
    font-size: 0.85rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    padding: 0.6rem 1.6rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-reset:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }

  .dueling-text {
    color: #a855f7;
    font-family: var(--font-title, serif);
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    animation: pulse-violet 1s ease infinite;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .spark { font-size: 0.7rem; }

  @keyframes winner-bounce {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.02) translateY(-4px); }
  }
  @keyframes pulse-violet {
    0%, 100% { box-shadow: 0 0 10px rgba(124,58,237,0.3); }
    50%       { box-shadow: 0 0 30px rgba(124,58,237,0.7); }
  }
  @keyframes lightning {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.2); }
  }
</style>
