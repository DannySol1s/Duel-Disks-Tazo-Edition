<script lang="ts">
  import { onMount } from 'svelte';
  import { cards, isLoading, loadError, filteredCards } from '$lib/store';
  import { fetchMonsters } from '$lib/api';
  import Tazo from '$lib/components/Tazo.svelte';
  import BattleArena from '$lib/components/BattleArena.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';

  let page = 0;
  const PAGE_SIZE = 40;
  let hasMore = true;
  let loading = false; // local guard — faster than the reactive store for preventing concurrent fetches
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
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>Duel Disks — Tazo Edition | Yu-Gi-Oh! VS Battle</title>
</svelte:head>

<div class="page-layout">
  <!-- LEFT: Collection -->
  <section class="collection-panel" aria-label="Colección de Tazos">
    <div class="panel-header">
      <h2 class="panel-title">
        <span class="title-icon">⚡</span>
        Colección
        <span class="count-badge">{$filteredCards.length}</span>
      </h2>
      <p class="panel-hint">Toca un tazo para enviarlo al Battle Ring</p>
    </div>

    <Toolbar />

    {#if $loadError}
      <div class="error-box">
        <span>⚠</span> {$loadError}
        <button onclick={loadMore}>Reintentar</button>
      </div>
    {/if}

    {#if $filteredCards.length === 0 && !$isLoading}
      <div class="empty-state">
        <p>🔮 No se encontraron monstruos con esos filtros.</p>
      </div>
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

  <!-- RIGHT: Battle Arena -->
  <aside class="arena-panel">
    <BattleArena />

    <div class="instruction-card glass">
      <h3>¿Cómo jugar?</h3>
      <ol>
        <li><span class="step">1</span> Haz clic en un tazo → Jugador 1</li>
        <li><span class="step">2</span> Haz clic en otro tazo → Jugador 2</li>
        <li><span class="step">3</span> Pulsa <strong>¡INICIAR DUELO!</strong></li>
        <li><span class="step">4</span> El mayor ATK ¡gana el duelo!</li>
      </ol>
    </div>
  </aside>
</div>

<style>
  .page-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .page-layout {
      grid-template-columns: 1fr;
    }
    .arena-panel { order: -1; }
  }

  .collection-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .panel-title {
    font-family: var(--font-title, serif);
    font-size: 1.1rem;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .title-icon { font-size: 1rem; }

  .count-badge {
    font-family: var(--font-body, sans-serif);
    font-size: 0.7rem;
    font-weight: 700;
    background: rgba(124,58,237,0.2);
    color: #c084fc;
    border: 1px solid rgba(124,58,237,0.35);
    padding: 1px 8px;
    border-radius: 50px;
    vertical-align: middle;
  }

  .panel-hint {
    font-size: 0.72rem;
    color: #475569;
  }

  .tazo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
    animation: fadeInUp 0.4s ease;
  }

  .sentinel { height: 1px; }

  .loading-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 1.5rem;
  }
  .loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7c3aed;
    animation: dot-bounce 1.2s ease infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #475569;
    font-size: 0.9rem;
  }
  .error-box {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 12px;
    padding: 1rem;
    color: #fc8181;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .error-box button {
    margin-left: auto;
    background: rgba(239,68,68,0.2);
    border: 1px solid rgba(239,68,68,0.4);
    color: #fc8181;
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .arena-panel {
    position: sticky;
    top: 90px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .instruction-card {
    border-radius: 16px;
    padding: 1.25rem;
  }
  .instruction-card h3 {
    font-family: var(--font-title, serif);
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    color: #94a3b8;
    margin-bottom: 0.75rem;
  }
  .instruction-card ol {
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style: none;
    font-size: 0.8rem;
    color: #64748b;
  }
  .instruction-card li {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .step {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(124,58,237,0.2);
    color: #c084fc;
    font-size: 0.65rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(124,58,237,0.3);
  }
  .instruction-card strong { color: #a855f7; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dot-bounce {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50%       { transform: translateY(-8px); opacity: 1; }
  }
</style>
