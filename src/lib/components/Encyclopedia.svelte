<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { searchQuery, filterAttribute } from '$lib/store';
  import { searchMonsters, getAttributeColor } from '$lib/api';
  import type { YgoCard } from '$lib/types';
  import Toolbar from './Toolbar.svelte';

  let { onClose } = $props<{ onClose: () => void }>();

  let allCards = $state<YgoCard[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let offset = $state(0);
  let hasMore = $state(true);
  let searchTimeout: any;

  // Estado para el detalle de la carta
  let selectedCard = $state<YgoCard | null>(null);

  async function loadCards(reset = false) {
    if (isLoading || (!hasMore && !reset)) return;
    
    isLoading = true;
    error = null;
    
    if (reset) {
      allCards = [];
      offset = 0;
      hasMore = true;
    }

    try {
      const newCards = await searchMonsters({
        query: $searchQuery,
        attribute: $filterAttribute,
        offset: offset,
        num: 50
      });

      if (newCards.length < 50) hasMore = false;
      
      const existingIds = new Set(allCards.map(c => c.id));
      const uniqueNew = newCards.filter(c => !existingIds.has(c.id));
      
      allCards = [...allCards, ...uniqueNew];
      offset += 50;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al cargar cartas';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    const q = $searchQuery;
    const a = $filterAttribute;
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadCards(true);
    }, 300);
  });

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    const threshold = 200;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + threshold;
    
    if (isNearBottom && !isLoading && hasMore) {
      loadCards();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="modal-overlay" transition:fade={{ duration: 200 }} onclick={onClose} role="dialog" aria-modal="true">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-content" transition:fly={{ y: 50, duration: 300 }} onclick={(e) => e.stopPropagation()}>
    <header class="modal-header">
      <div class="header-info">
        <h2>📖 Enciclopedia Global</h2>
        <span class="count-badge">{allCards.length} monstruos</span>
      </div>
      <button class="btn-close" onclick={onClose}>✕</button>
    </header>

    <div class="toolbar-container">
      <Toolbar />
    </div>

    <div class="cards-body" onscroll={handleScroll}>
      {#if error}
        <div class="error">⚠️ {error}</div>
      {/if}

      <div class="cards-grid">
        {#each allCards as card (card.id)}
          <div 
            class="encyclopedia-card" 
            style="--attr-color: {getAttributeColor(card.attribute)}"
            onclick={() => selectedCard = card}
          >
            <div class="card-image-wrapper">
              <img src={card.card_images[0].image_url} alt={card.name} loading="lazy" />
            </div>
            <div class="card-info">
              <h3>{card.name}</h3>
              <div class="stats">
                <span title="Ataque">⚔️ {card.atk}</span>
                <span title="Defensa">🛡 {card.def}</span>
                <span title="Nivel">★ {card.level}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if isLoading}
        <div class="loading-more">
          <span class="spinner"></span> Buscando en la base de datos...
        </div>
      {:else if !hasMore && allCards.length > 0}
        <div class="end-of-list">Has llegado al final de los resultados.</div>
      {:else if !isLoading && allCards.length === 0}
        <div class="empty">No se encontraron monstruos con esos criterios.</div>
      {/if}
    </div>

    <!-- PANEL DE DETALLE (Curiosidades) -->
    {#if selectedCard}
      <div class="detail-overlay" transition:fade={{ duration: 200 }} onclick={() => selectedCard = null}>
        <div class="detail-panel" transition:fly={{ x: 100, duration: 300 }} onclick={(e) => e.stopPropagation()}>
          <button class="btn-close-detail" onclick={() => selectedCard = null}>✕</button>
          
          <div class="detail-content">
            <div class="detail-image">
              <img src={selectedCard.card_images[0].image_url} alt={selectedCard.name} />
            </div>
            
            <div class="detail-text">
              <span class="detail-attr" style="background: {getAttributeColor(selectedCard.attribute)}">{selectedCard.attribute}</span>
              <h2 class="detail-title">{selectedCard.name}</h2>
              <p class="detail-type">{selectedCard.type} | {selectedCard.race}</p>
              
              <div class="detail-stats-large">
                <div class="stat-item"><span>ATK</span> <strong>{selectedCard.atk}</strong></div>
                <div class="stat-item"><span>DEF</span> <strong>{selectedCard.def}</strong></div>
                <div class="stat-item"><span>LVL</span> <strong>{selectedCard.level}</strong></div>
              </div>

              <div class="curiosidades-section">
                <h3>✨ Curiosidades y Lore</h3>
                <div class="curiosidades-grid">
                  {#if selectedCard.archetype}
                    <div class="curio-card">
                      <strong>Arquetipo:</strong>
                      <span>{selectedCard.archetype}</span>
                    </div>
                  {/if}
                  
                  <div class="curio-card">
                    <strong>Raza:</strong>
                    <span>{selectedCard.race}</span>
                  </div>

                  {#if selectedCard.card_sets && selectedCard.card_sets.length > 0}
                    <div class="curio-card">
                      <strong>Primera Aparición:</strong>
                      <span>{selectedCard.card_sets[0].set_name}</span>
                    </div>
                  {/if}
                </div>

                <div class="lore-box">
                  <strong>Descripción:</strong>
                  <p>{selectedCard.desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 2rem;
  }

  .modal-content {
    background: #07090f;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    width: 100%;
    max-width: 1200px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.02);
    position: relative;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .header-info { display: flex; align-items: center; gap: 1rem; }
  
  .modal-header h2 {
    margin: 0;
    font-family: var(--font-title, serif);
    font-size: 1.6rem;
    color: #f5c842;
    text-shadow: 0 0 15px rgba(245, 200, 66, 0.3);
  }

  .count-badge {
    background: rgba(245, 200, 66, 0.15);
    color: #f5c842;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid rgba(245, 200, 66, 0.2);
  }

  .btn-close {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8;
    width: 32px; height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .btn-close:hover { background: #ef4444; color: white; border-color: #ef4444; }

  .toolbar-container {
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .cards-body {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    scroll-behavior: smooth;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  .encyclopedia-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--attr-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    position: relative;
    cursor: pointer;
  }

  .encyclopedia-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5), 0 0 20px var(--attr-color, transparent);
    border-color: white;
    z-index: 10;
  }

  .card-image-wrapper {
    width: 100%;
    aspect-ratio: 0.68;
    overflow: hidden;
    background: #000;
  }

  .card-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  .encyclopedia-card:hover img { transform: scale(1.1); }

  .card-info {
    padding: 0.75rem;
    background: linear-gradient(to top, #000, transparent);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #f8fafc;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.4rem;
    border-radius: 6px;
    font-weight: 500;
  }

  /* DETALLE PANEL */
  .detail-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    justify-content: flex-end;
  }

  .detail-panel {
    width: 100%;
    max-width: 500px;
    background: #0f172a;
    height: 100%;
    box-shadow: -10px 0 30px rgba(0,0,0,0.5);
    border-left: 1px solid rgba(255,255,255,0.1);
    position: relative;
    overflow-y: auto;
    padding: 3rem 2rem;
  }

  .btn-close-detail {
    position: absolute;
    top: 1.5rem; right: 1.5rem;
    background: none; border: none; color: #94a3b8;
    font-size: 1.2rem; cursor: pointer;
  }

  .detail-image {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    margin-bottom: 2rem;
  }
  .detail-image img { width: 100%; display: block; }

  .detail-attr {
    font-size: 0.7rem; font-weight: 800; color: #000;
    padding: 2px 12px; border-radius: 4px;
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  .detail-title {
    font-family: var(--font-title, serif);
    font-size: 2rem; color: #f8fafc;
    margin: 0.5rem 0;
  }

  .detail-type { color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }

  .detail-stats-large {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem; margin-bottom: 2rem;
  }
  .stat-item {
    background: rgba(255,255,255,0.03); padding: 1rem;
    border-radius: 12px; text-align: center;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .stat-item span { display: block; font-size: 0.7rem; color: #64748b; margin-bottom: 4px; }
  .stat-item strong { font-size: 1.2rem; color: #f5c842; }

  .curiosidades-section h3 {
    font-size: 1rem; color: #f5c842; border-bottom: 1px solid rgba(245,200,66,0.2);
    padding-bottom: 0.5rem; margin-bottom: 1rem;
  }

  .curiosidades-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    margin-bottom: 2rem;
  }
  .curio-card {
    background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px;
  }
  .curio-card strong { display: block; font-size: 0.65rem; color: #64748b; text-transform: uppercase; }
  .curio-card span { color: #e2e8f0; font-size: 0.85rem; }

  .lore-box {
    background: rgba(245,200,66,0.03); padding: 1rem; border-radius: 12px;
    border: 1px dashed rgba(245,200,66,0.2);
  }
  .lore-box strong { font-size: 0.8rem; color: #f5c842; display: block; margin-bottom: 0.5rem; }
  .lore-box p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; font-style: italic; margin: 0; }

  .loading-more, .error, .empty, .end-of-list {
    text-align: center;
    padding: 2rem;
    font-size: 1rem;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }
  .error { color: #ef4444; }
  .end-of-list { opacity: 0.5; font-style: italic; }

  .spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.05); border-top-color: #f5c842;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .modal-overlay { padding: 0; }
    .modal-content { height: 100vh; border-radius: 0; border: none; }
    .cards-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
    .detail-panel { max-width: 100%; }
  }
</style>
