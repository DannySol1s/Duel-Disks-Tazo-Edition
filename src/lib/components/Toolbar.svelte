<script lang="ts">
  import { searchQuery, filterAttribute } from '$lib/store';
  import { ATTRIBUTES } from '$lib/api';
</script>

<div class="toolbar">
  <div class="search-box">
    <span class="search-icon">🔍</span>
    <input
      id="search-cards"
      type="text"
      bind:value={$searchQuery}
      placeholder="Buscar monstruo..."
      autocomplete="off"
      spellcheck="false"
    />
    {#if $searchQuery}
      <button class="clear-btn" onclick={() => ($searchQuery = '')} aria-label="Limpiar">✕</button>
    {/if}
  </div>

  <div class="filter-group">
    {#each ATTRIBUTES as attr}
      <button
        class="attr-btn"
        class:active={$filterAttribute === attr}
        id="filter-{attr.toLowerCase()}"
        onclick={() => ($filterAttribute = attr)}
      >
        {attr === 'ALL' ? '⭐ Todo' : attr}
      </button>
    {/each}
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    padding: 0.45rem 1rem;
    flex: 1;
    min-width: 200px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .search-box:focus-within {
    border-color: rgba(124,58,237,0.5);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
  }

  .search-icon { font-size: 0.85rem; opacity: 0.5; }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: var(--font-body, sans-serif);
    font-size: 0.85rem;
    color: #e2e8f0;
  }
  input::placeholder { color: rgba(100,116,139,0.7); }

  .clear-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1;
    padding: 0;
    transition: color 0.2s ease;
  }
  .clear-btn:hover { color: #e2e8f0; }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .attr-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    color: #94a3b8;
    font-family: var(--font-body, sans-serif);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 4px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .attr-btn:hover {
    background: rgba(124,58,237,0.15);
    border-color: rgba(124,58,237,0.4);
    color: #c084fc;
  }
  .attr-btn.active {
    background: rgba(124,58,237,0.25);
    border-color: #7c3aed;
    color: #e9d5ff;
    box-shadow: 0 0 10px rgba(124,58,237,0.3);
  }
</style>
