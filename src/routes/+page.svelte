<script lang="ts">
  import { onMount } from 'svelte';
  import { cards, isLoading, loadError, filteredCards } from '$lib/store';
  import { gameState, startDraft } from '$lib/gameStore';
  import { fetchMonsters } from '$lib/api';
  import Tazo from '$lib/components/Tazo.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import DraftPhase from '$lib/components/DraftPhase.svelte';
  import BattlePhase from '$lib/components/BattlePhase.svelte';
  import ResultPhase from '$lib/components/ResultPhase.svelte';

  let page = 0;
  const PAGE_SIZE = 40;
  let hasMore = true;
  let loading = false;
  let sentinel: HTMLDivElement;

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    isLoading.set(true);
    loadError.set(null);
    try {
      const newCards = await fetchMonsters({ num: PAGE_SIZE, offset: page * PAGE_SIZE });
      cards.update((c) => {
        const map = new Map(c.map((card) => [card.id, card]));
        for (const card of newCards) map.set(card.id, card);
        return [...map.values()];
      });
      if (newCards.length < PAGE_SIZE) hasMore = false;
      page++;
    } catch (e: unknown) {
      loadError.set(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      loading = false;
      isLoading.set(false);
    }
  }

  onMount(() => {
    loadMore();
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) loadMore();
      },
      { rootMargin: '200px' }
    );
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  });

  let phase = $derived($gameState.phase);
  let inGame = $derived(phase !== 'idle');
</script>

<svelte:head>
  <title>Duel Disks — Tazo Edition | Yu-Gi-Oh! Duelo de Quintetos</title>
</svelte:head>

<!-- ─── IN-GAME PHASES ─── -->
{#if phase === 'draft'}
  <DraftPhase />
{:else if phase === 'p1-select' || phase === 'p2-select' || phase === 'reveal'}
  <BattlePhase />
{:else if phase === 'result'}
  <ResultPhase />

<!-- ─── HOME (IDLE) ─── -->
{:else}
  <div class="home-layout">
    <!-- LEFT: Collection -->
    <section class="collection-panel" aria-label="Colección de Tazos">
      <div class="panel-header">
        <h2 class="panel-title">
          <span>⚡</span> Colección
          <span class="count-badge">{$filteredCards.length}</span>
        </h2>
        <p class="panel-hint">Explora las cartas disponibles. ¡Pronto verás cuáles te tocan en el draft!</p>
      </div>

      <Toolbar />

      {#if $loadError}
        <div class="error-box">⚠ {$loadError} <button onclick={loadMore}>Reintentar</button></div>
      {/if}

      {#if $filteredCards.length === 0 && !$isLoading}
        <div class="empty-state">🔮 No se encontraron monstruos con esos filtros.</div>
      {:else}
        <div class="tazo-grid">
          {#each $filteredCards as card (card.id)}
            <Tazo {card} size="md" />
          {/each}
        </div>
      {/if}

      <div bind:this={sentinel} class="sentinel"></div>

      {#if $isLoading}
        <div class="loading-dots" aria-label="Cargando...">
          <span></span><span></span><span></span>
        </div>
      {/if}
    </section>

    <!-- RIGHT: Start panel -->
    <aside class="start-panel">
      <div class="start-card glass">
        <div class="start-icon">⚔️</div>
        <h2 class="start-title">Duelo de Quintetos</h2>
        <p class="start-desc">
          Dos duelistas, 10 cartas aleatorias, un draft a serpiente.<br/>
          Elige 5 cartas, combate en 5 rondas con bonificadores elementales.
        </p>

        <div class="mode-rules">
          <div class="rule-item">
            <span class="rule-icon">🎯</span>
            <span>Draft serpiente: P1→P2→P2→P1…</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">⚔</span>
            <span>Mejor de 5 rondas (3 victorias)</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">💧</span>
            <span>Agua &gt; Fuego &gt; Tierra &gt; Agua (+500 ATK)</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">🛡</span>
            <span>Empate ATK → DEF → Nivel</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">🙈</span>
            <span>Elección a ciegas (pasa el dispositivo)</span>
          </div>
        </div>

        <button id="btn-start-draft" class="btn-start" onclick={startDraft}>
          <span>⚡</span> ¡INICIAR DUELO!
          <span>⚡</span>
        </button>
      </div>

      <!-- Elemental guide -->
      <div class="elemental-card glass">
        <h3>🌐 Triángulo Elemental</h3>
        <div class="triangle">
          <div class="tri-row">
            <div class="tri-item water">💧 AGUA</div>
            <div class="tri-arrow">→ vence →</div>
            <div class="tri-item fire">🔥 FUEGO</div>
          </div>
          <div class="tri-row">
            <div class="tri-item fire">🔥 FUEGO</div>
            <div class="tri-arrow">→ vence →</div>
            <div class="tri-item earth">⛰ TIERRA</div>
          </div>
          <div class="tri-row">
            <div class="tri-item earth">⛰ TIERRA</div>
            <div class="tri-arrow">→ vence →</div>
            <div class="tri-item water">💧 AGUA</div>
          </div>
          <p class="tri-note">El elemento ganador recibe +500 ATK en el duelo.</p>
        </div>
      </div>
    </aside>
  </div>
{/if}

<style>
  /* ── Home layout ── */
  .home-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2rem;
    align-items: start;
  }
  @media (max-width: 1024px) {
    .home-layout { grid-template-columns: 1fr; }
    .start-panel { order: -1; }
  }

  /* ── Collection ── */
  .collection-panel { display:flex; flex-direction:column; gap:1.25rem; }
  .panel-header { display:flex; flex-direction:column; gap:4px; }
  .panel-title { font-family:var(--font-title,serif); font-size:1.1rem; color:#e2e8f0; display:flex; align-items:center; gap:10px; }
  .count-badge { font-family:var(--font-body,sans-serif); font-size:0.7rem; font-weight:700; background:rgba(124,58,237,0.2); color:#c084fc; border:1px solid rgba(124,58,237,0.35); padding:1px 8px; border-radius:50px; }
  .panel-hint { font-size:0.72rem; color:#475569; }
  .tazo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:1rem; }
  .sentinel { height:1px; }
  .loading-dots { display:flex; justify-content:center; gap:8px; padding:1.5rem; }
  .loading-dots span { width:8px; height:8px; border-radius:50%; background:#7c3aed; animation:dot-bounce 1.2s ease infinite; }
  .loading-dots span:nth-child(2) { animation-delay:0.2s; }
  .loading-dots span:nth-child(3) { animation-delay:0.4s; }
  .empty-state { text-align:center; padding:3rem; color:#475569; font-size:0.9rem; }
  .error-box { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:1rem; color:#fc8181; font-size:0.85rem; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .error-box button { margin-left:auto; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:#fc8181; border-radius:6px; padding:4px 12px; font-size:0.8rem; cursor:pointer; }

  /* ── Start panel ── */
  .start-panel { position:sticky; top:90px; display:flex; flex-direction:column; gap:1rem; }
  .start-card { border-radius:20px; padding:2rem; display:flex; flex-direction:column; align-items:center; gap:1rem; text-align:center; }
  .start-icon { font-size:3rem; }
  .start-title { font-family:var(--font-title,serif); font-size:1.3rem; background:linear-gradient(135deg,#f5c842,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .start-desc { font-size:0.8rem; color:#64748b; line-height:1.6; }

  .mode-rules { display:flex; flex-direction:column; gap:8px; width:100%; text-align:left; }
  .rule-item { display:flex; align-items:flex-start; gap:10px; font-size:0.78rem; color:#94a3b8; }
  .rule-icon { font-size:0.9rem; flex-shrink:0; }

  .btn-start {
    display:flex; align-items:center; gap:10px;
    background:linear-gradient(135deg,#a855f7,#7c3aed); color:#fff;
    font-family:var(--font-title,serif); font-size:1rem; letter-spacing:0.08em;
    border:none; border-radius:50px; padding:0.9rem 2.5rem; cursor:pointer;
    box-shadow:0 4px 20px rgba(124,58,237,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    width:100%;
    justify-content:center;
  }
  .btn-start:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(124,58,237,0.6); }

  /* ── Elemental card ── */
  .elemental-card { border-radius:16px; padding:1.25rem; }
  .elemental-card h3 { font-family:var(--font-title,serif); font-size:0.8rem; color:#94a3b8; letter-spacing:0.1em; margin-bottom:0.75rem; }
  .triangle { display:flex; flex-direction:column; gap:8px; }
  .tri-row { display:flex; align-items:center; gap:8px; font-size:0.75rem; }
  .tri-item { padding:3px 10px; border-radius:8px; font-weight:700; font-size:0.7rem; }
  .tri-item.water { background:rgba(6,182,212,0.15); color:#06b6d4; border:1px solid rgba(6,182,212,0.3); }
  .tri-item.fire  { background:rgba(239,68,68,0.15);  color:#ef4444; border:1px solid rgba(239,68,68,0.3); }
  .tri-item.earth { background:rgba(161,98,7,0.2);    color:#ca8a04; border:1px solid rgba(161,98,7,0.4); }
  .tri-arrow { color:#334155; font-size:0.7rem; white-space:nowrap; }
  .tri-note { font-size:0.65rem; color:#475569; margin-top:4px; }

  @keyframes dot-bounce {
    0%, 100% { transform:translateY(0); opacity:0.4; }
    50%       { transform:translateY(-8px); opacity:1; }
  }
</style>
