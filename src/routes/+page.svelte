<script lang="ts">
  import { gameState, startGame, resetGame } from '$lib/gameStore';
  import BattlePhase from '$lib/components/BattlePhase.svelte';
  import ResultPhase from '$lib/components/ResultPhase.svelte';

  let gs = $derived($gameState);
  let phase = $derived(gs.phase);
  let inBattle = $derived(phase === 'p1-select' || phase === 'p2-select' || phase === 'reveal');
</script>

<svelte:head>
  <title>Duelo de Quintetos — YGO Tazo Edition</title>
</svelte:head>

<!-- ════ FONDO ════ -->
<div class="stars-bg" aria-hidden="true"></div>

<!-- ════ LAYOUT ════ -->
<div class="app-shell">

  <!-- Header mínimo -->
  <header class="app-header">
    <div class="header-title">⚔️ <span>Duelo de Quintetos</span></div>
    {#if inBattle || phase === 'result'}
      <button class="btn-exit" onclick={resetGame}>✕ Salir</button>
    {/if}
  </header>

  <!-- Contenido principal -->
  <main class="main-content">

    <!-- PANTALLA DE INICIO -->
    {#if phase === 'idle'}
      <section class="idle-screen">
        <h1 class="game-title">⚔️ Duelo de Quintetos</h1>
        <p class="game-subtitle">5 rondas · Selección ciega · Ataque vs Defensa</p>

        <!-- Reglas rápidas -->
        <div class="rules-grid">
          <div class="rule-card">
            <span class="rule-icon">⚔️ vs ⚔️</span>
            <span class="rule-text">Gana mayor ATK</span>
          </div>
          <div class="rule-card">
            <span class="rule-icon">⚔️ vs 🛡</span>
            <span class="rule-text">ATK debe superar DEF</span>
          </div>
          <div class="rule-card">
            <span class="rule-icon">🛡 vs ⚔️</span>
            <span class="rule-text">DEF ≥ ATK → defiende</span>
          </div>
          <div class="rule-card">
            <span class="rule-icon">🛡 vs 🛡</span>
            <span class="rule-text">Gana mayor Nivel ★</span>
          </div>
        </div>

        {#if gs.error}
          <div class="error-box">⚠️ {gs.error}</div>
        {/if}

        <button class="btn-start" onclick={startGame} disabled={gs.isLoading}>
          {#if gs.isLoading}
            <span class="spinner"></span> Cargando cartas...
          {:else}
            🎮 Iniciar Duelo
          {/if}
        </button>
      </section>

    <!-- FASE DE BATALLA -->
    {:else if inBattle}
      <section class="game-section">
        <BattlePhase />
      </section>

    <!-- RESULTADOS -->
    {:else if phase === 'result'}
      <section class="game-section">
        <ResultPhase />
      </section>
    {/if}

  </main>
</div>

<style>
  /* ─── Shell ──────────────────────────────────────────────────── */
  .app-shell {
    height: 100%; display: flex; flex-direction: column;
    position: relative; z-index: 1;
    overflow: hidden;
  }

  /* ─── Header ─────────────────────────────────────────────────── */
  .app-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.9rem 1.5rem;
    background: rgba(7,9,15,0.8);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .header-title {
    font-family: var(--font-title, serif); font-size: 0.9rem;
    color: #e8a020; letter-spacing: 0.05em;
  }
  .header-title span { color: #e2e8f0; }
  .btn-exit {
    font-size: 0.75rem; background: none; border: 1px solid rgba(255,255,255,0.15);
    color: #64748b; border-radius: 8px; padding: 4px 10px; cursor: pointer;
    transition: all 0.2s;
  }
  .btn-exit:hover { border-color: #ef4444; color: #ef4444; }

  /* ─── Main content ────────────────────────────────────────────── */
  .main-content {
    flex: 1; display: flex; justify-content: center;
    padding: 0.5rem; overflow: hidden;
  }
  .game-section {
    width: 100%; max-width: 700px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* ─── Idle / Start screen ─────────────────────────────────────── */
  .idle-screen {
    max-width: 480px; width: 100%;
    display: flex; flex-direction: column; align-items: center;
    gap: 1.5rem; padding-top: 2rem; text-align: center;
  }
  .game-title {
    font-family: var(--font-title, serif); font-size: 1.6rem;
    color: #f5c842; line-height: 1.3;
    text-shadow: 0 0 40px rgba(245,200,66,0.3);
  }
  .game-subtitle { color: #64748b; font-size: 0.85rem; }

  .rules-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.75rem; width: 100%;
  }
  .rule-card {
    display: flex; flex-direction: column; gap: 4px; align-items: center;
    padding: 0.9rem; border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .rule-icon { font-size: 1rem; }
  .rule-text { font-size: 0.72rem; color: #94a3b8; }

  .error-box {
    padding: 0.75rem 1.25rem; border-radius: 10px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #fc8181; font-size: 0.82rem; width: 100%;
  }

  .btn-start {
    font-family: var(--font-title, serif); font-size: 1rem; letter-spacing: 0.08em;
    border: none; border-radius: 50px; cursor: pointer;
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #f5c842, #e8a020);
    color: #000; font-weight: 700;
    box-shadow: 0 4px 24px rgba(232,160,32,0.4);
    transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  }
  .btn-start:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(232,160,32,0.6); }
  .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Spinner */
  .spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.3); border-top-color: #000;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
