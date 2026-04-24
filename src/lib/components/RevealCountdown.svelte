<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, triggerReveal } from '$lib/gameStore';

  let gs = $derived($gameState);
  let r = $derived(gs.lastResult!);

  // Estados de la animación
  let showP1 = $state(false);
  let showP2 = $state(false);
  let showVS = $state(false);
  let showWinner = $state(false);
  let countdown = $state(3);
  let lightningActive = $state(false);

  onMount(() => {
    // Paso 1: mostrar carta P1
    setTimeout(() => { showP1 = true; }, 400);
    // Paso 2: mostrar VS
    setTimeout(() => { showVS = true; }, 900);
    // Paso 3: mostrar carta P2
    setTimeout(() => { showP2 = true; }, 1400);
    // Cuenta regresiva 3-2-1
    setTimeout(() => { countdown = 3; lightningActive = false; }, 1800);
    setTimeout(() => { countdown = 2; }, 2400);
    setTimeout(() => { countdown = 1; }, 3000);
    // Relámpago y ganador
    setTimeout(() => {
      lightningActive = true;
      showWinner = true;
    }, 3500);
    // Transición al estado reveal
    setTimeout(() => { triggerReveal(); }, 5200);
  });

  function modeLabel(m: 'attack' | 'defense') {
    return m === 'attack' ? '⚔️ Ataque' : '🛡 Defensa';
  }
</script>

<div class="countdown-wrapper">
  <!-- Relámpago de fondo -->
  {#if lightningActive}
    <div class="lightning-bg"></div>
  {/if}

  <!-- Titulo -->
  <div class="reveal-header">⚡ ¡Revelación!</div>

  <!-- Arena de cartas -->
  <div class="arena">
    <!-- Carta P1 -->
    <div class="card-reveal" class:visible={showP1} class:winner-glow={showWinner && r.winner === 'p1'} class:loser-fade={showWinner && r.winner === 'p2'}>
      <div class="player-label gold">DUELISTA 1</div>
      {#if showP1}
        <div class="card-flip">
          <img src={r.p1Card.card_images[0].image_url_small} alt={r.p1Card.name} class="reveal-img" />
        </div>
        <div class="card-mode">{modeLabel(r.p1Mode)}</div>
        <div class="card-stat">{r.p1Mode === 'attack' ? `ATK ${r.p1Card.atk}` : `DEF ${r.p1Card.def}`}</div>
        {#if showWinner && r.winner === 'p1'}<div class="crown">👑 GANADOR</div>{/if}
      {:else}
        <div class="card-back">?</div>
      {/if}
    </div>

    <!-- Centro: VS + countdown -->
    <div class="vs-center">
      {#if showVS}
        <div class="vs-orb">VS</div>
      {/if}
      {#if !showWinner && showVS && showP2}
        <div class="count-number">{countdown}</div>
      {/if}
      {#if showWinner}
        <div class="result-label {r.winner}">
          {r.winner === 'p1' ? '¡D1 GANA!' : r.winner === 'p2' ? '¡D2 GANA!' : '¡EMPATE!'}
        </div>
        <div class="reason-txt">{r.reason}</div>
      {/if}
    </div>

    <!-- Carta P2 -->
    <div class="card-reveal" class:visible={showP2} class:winner-glow={showWinner && r.winner === 'p2'} class:loser-fade={showWinner && r.winner === 'p1'}>
      <div class="player-label violet">DUELISTA 2</div>
      {#if showP2}
        <div class="card-flip">
          <img src={r.p2Card.card_images[0].image_url_small} alt={r.p2Card.name} class="reveal-img" />
        </div>
        <div class="card-mode">{modeLabel(r.p2Mode)}</div>
        <div class="card-stat">{r.p2Mode === 'attack' ? `ATK ${r.p2Card.atk}` : `DEF ${r.p2Card.def}`}</div>
        {#if showWinner && r.winner === 'p2'}<div class="crown">👑 GANADOR</div>{/if}
      {:else}
        <div class="card-back">?</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .countdown-wrapper {
    display: flex; flex-direction: column;
    align-items: center; gap: 1.5rem;
    position: relative; overflow: hidden;
    padding: 1rem 0;
  }

  .lightning-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse at 50% 40%, rgba(245,200,66,0.18) 0%, transparent 70%);
    animation: lightning-flash 0.3s ease-in-out 3;
  }

  @keyframes lightning-flash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  .reveal-header {
    font-family: var(--font-title, serif);
    font-size: 1.6rem; color: #f5c842;
    letter-spacing: 0.12em;
    text-shadow: 0 0 30px rgba(245,200,66,0.6);
    animation: pulse-glow 1s ease infinite;
    position: relative; z-index: 1;
  }

  @keyframes pulse-glow {
    0%, 100% { text-shadow: 0 0 20px rgba(245,200,66,0.4); }
    50% { text-shadow: 0 0 60px rgba(245,200,66,0.9), 0 0 120px rgba(245,200,66,0.4); }
  }

  .arena {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 1.5rem; align-items: center; width: 100%;
    position: relative; z-index: 1;
  }

  .card-reveal {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 1rem; border-radius: 16px;
    background: rgba(255,255,255,0.02);
    border: 2px solid rgba(255,255,255,0.08);
    opacity: 0; transform: scale(0.7);
    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .card-reveal.visible {
    opacity: 1; transform: scale(1);
  }
  .card-reveal.winner-glow {
    border-color: rgba(245,200,66,0.6);
    box-shadow: 0 0 40px rgba(245,200,66,0.4), 0 0 80px rgba(245,200,66,0.2);
    animation: winner-pulse 0.6s ease infinite alternate;
  }
  .card-reveal.loser-fade {
    opacity: 0.3; filter: grayscale(0.8);
  }

  @keyframes winner-pulse {
    from { box-shadow: 0 0 30px rgba(245,200,66,0.3); }
    to   { box-shadow: 0 0 60px rgba(245,200,66,0.7), 0 0 100px rgba(245,200,66,0.3); }
  }

  .player-label {
    font-size: 0.65rem; letter-spacing: 0.15em; font-weight: 700;
  }
  .player-label.gold { color: #e8a020; }
  .player-label.violet { color: #a855f7; }

  .card-flip {
    animation: flip-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes flip-in {
    from { transform: rotateY(90deg) scale(0.8); opacity: 0; }
    to   { transform: rotateY(0deg) scale(1); opacity: 1; }
  }

  .reveal-img {
    width: 100%; max-width: 160px; max-height: 230px;
    object-fit: contain; border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }
  .card-back {
    width: 120px; height: 175px; border-radius: 8px;
    background: linear-gradient(135deg, #1a0a3b, #3b1877);
    border: 2px solid rgba(124,58,237,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 3rem; color: rgba(168,85,247,0.4);
  }
  .card-mode { font-size: 0.8rem; color: #94a3b8; }
  .card-stat { font-size: 1rem; font-weight: 700; color: #e2e8f0; }
  .crown {
    font-size: 0.85rem; font-weight: 700; color: #f5c842;
    letter-spacing: 0.1em; animation: bounce-crown 0.4s ease infinite alternate;
  }
  @keyframes bounce-crown {
    from { transform: translateY(0); }
    to   { transform: translateY(-4px); }
  }

  /* Centro */
  .vs-center {
    display: flex; flex-direction: column;
    align-items: center; gap: 10px; min-width: 90px;
  }
  .vs-orb {
    width: 60px; height: 60px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.5), rgba(7,9,15,0.9));
    border: 2px solid rgba(124,58,237,0.5);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-title, serif); font-size: 0.9rem; color: #a855f7;
    animation: orb-spin 3s linear infinite;
    box-shadow: 0 0 20px rgba(124,58,237,0.4);
  }
  @keyframes orb-spin {
    0%   { box-shadow: 0 0 20px rgba(124,58,237,0.4); }
    50%  { box-shadow: 0 0 40px rgba(124,58,237,0.8), 0 0 60px rgba(124,58,237,0.3); }
    100% { box-shadow: 0 0 20px rgba(124,58,237,0.4); }
  }

  .count-number {
    font-family: var(--font-title, serif);
    font-size: 4rem; font-weight: 900;
    color: #f5c842;
    text-shadow: 0 0 40px rgba(245,200,66,0.8);
    animation: count-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes count-pop {
    from { transform: scale(2); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .result-label {
    font-family: var(--font-title, serif);
    font-size: 0.9rem; font-weight: 700;
    padding: 6px 12px; border-radius: 10px;
    text-align: center;
    animation: result-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes result-pop {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .result-label.p1 { color: #f5c842; background: rgba(245,200,66,0.15); border: 1px solid rgba(245,200,66,0.3); }
  .result-label.p2 { color: #a855f7; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); }
  .result-label.draw { color: #64748b; background: rgba(100,116,139,0.15); border: 1px solid rgba(100,116,139,0.3); }

  .reason-txt { font-size: 0.65rem; color: #64748b; text-align: center; max-width: 80px; }
</style>
