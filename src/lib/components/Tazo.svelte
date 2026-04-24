<script lang="ts">
  import type { YgoCard } from '$lib/types';
  import { getFrameColor, getAttributeColor } from '$lib/api';
  import { duelState, selectFighter } from '$lib/store';

  let { card, size = 'md', animate = false }: {
    card: YgoCard;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
  } = $props();

  let accentColor = $derived(getFrameColor(card.frameType));
  let isFighter1 = $derived($duelState.fighter1?.id === card.id);
  let isFighter2 = $derived($duelState.fighter2?.id === card.id);
  let isSelected = $derived(isFighter1 || isFighter2);
  let slotLabel = $derived(isFighter1 ? 'P1' : isFighter2 ? 'P2' : null);

  function handleClick() {
    selectFighter(card);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="tazo-wrapper size-{size}"
  class:selected={isSelected}
  class:p1={isFighter1}
  class:p2={isFighter2}
  class:animate
  onclick={handleClick}
  style="--accent: {accentColor};"
  title="{card.name} — ATK: {card.atk ?? '?'} / DEF: {card.def ?? '?'}"
>
  <!-- Outer ring -->
  <div class="tazo-ring">
    <!-- Inner circle -->
    <div class="tazo-circle">
      <!-- Card image -->
      <img
        class="tazo-img"
        src={card.card_images[0].image_url_small}
        alt={card.name}
        loading="lazy"
      />

      <!-- Gloss overlay -->
      <div class="tazo-gloss"></div>

      <!-- Selection badge -->
      {#if slotLabel}
        <div class="slot-badge">{slotLabel}</div>
      {/if}
    </div>
  </div>

  <!-- Name plate -->
  <div class="tazo-name">{card.name}</div>

  <!-- Stats row -->
  <div class="tazo-stats">
    <span class="stat atk">⚔ {card.atk ?? '—'}</span>
    {#if card.def !== undefined}
      <span class="stat def">🛡 {card.def}</span>
    {/if}
  </div>
</div>

<style>
  .tazo-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.25s ease;
  }
  .tazo-wrapper:hover {
    transform: translateY(-6px) scale(1.04);
  }
  .tazo-wrapper.animate {
    animation: tazo-flip 0.6s ease;
  }

  .size-sm .tazo-ring { width: 80px;  height: 80px; }
  .size-md .tazo-ring { width: 120px; height: 120px; }
  .size-lg .tazo-ring { width: 160px; height: 160px; }

  .tazo-ring {
    border-radius: 50%;
    padding: 4px;
    background: conic-gradient(
      var(--accent) 0deg,
      #c8c8c8 90deg,
      var(--accent) 180deg,
      #c8c8c8 270deg,
      var(--accent) 360deg
    );
    box-shadow:
      0 0 0 2px rgba(0,0,0,0.6),
      0 4px 16px rgba(0,0,0,0.7),
      inset 0 1px 0 rgba(255,255,255,0.25);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .tazo-wrapper:hover .tazo-ring {
    box-shadow:
      0 0 0 2px rgba(0,0,0,0.6),
      0 8px 24px rgba(0,0,0,0.8),
      0 0 20px color-mix(in srgb, var(--accent) 60%, transparent),
      inset 0 1px 0 rgba(255,255,255,0.3);
    transform: rotate(10deg);
  }

  .tazo-wrapper.selected .tazo-ring {
    animation: spin-slow 4s linear infinite;
  }
  .tazo-wrapper.p1 .tazo-ring {
    box-shadow: 0 0 0 3px #e8a020, 0 0 20px rgba(232,160,32,0.6);
  }
  .tazo-wrapper.p2 .tazo-ring {
    box-shadow: 0 0 0 3px #a855f7, 0 0 20px rgba(168,85,247,0.6);
  }

  .tazo-circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    background: #0a0c14;
  }

  .tazo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }

  .tazo-gloss {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.25) 0%,
      transparent 45%,
      rgba(0,0,0,0.2) 100%
    );
    pointer-events: none;
  }

  .slot-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #e8a020;
    color: #000;
    font-family: var(--font-body, sans-serif);
    font-weight: 900;
    font-size: 0.6rem;
    padding: 1px 5px;
    border-radius: 6px;
    line-height: 1.4;
    letter-spacing: 0.05em;
  }
  .tazo-wrapper.p2 .slot-badge {
    background: #a855f7;
    color: #fff;
  }

  .tazo-name {
    font-family: var(--font-body, sans-serif);
    font-size: 0.65rem;
    font-weight: 600;
    text-align: center;
    color: #e2e8f0;
    max-width: 120px;
    line-height: 1.2;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }
  .size-sm .tazo-name { font-size: 0.55rem; max-width: 80px; }
  .size-lg .tazo-name { font-size: 0.75rem; max-width: 160px; }

  .tazo-stats {
    display: flex;
    gap: 8px;
  }
  .stat {
    font-family: var(--font-body, sans-serif);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
  }
  .stat.atk {
    background: rgba(239,68,68,0.2);
    color: #fc8181;
    border: 1px solid rgba(239,68,68,0.3);
  }
  .stat.def {
    background: rgba(99,179,237,0.2);
    color: #90cdf4;
    border: 1px solid rgba(99,179,237,0.3);
  }
  .size-sm .tazo-stats { display: none; }

  @keyframes tazo-flip {
    0%   { transform: rotateY(0) scale(1); }
    50%  { transform: rotateY(90deg) scale(0.8); }
    100% { transform: rotateY(0) scale(1); }
  }
  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }
</style>
