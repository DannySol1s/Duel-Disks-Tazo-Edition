<script lang="ts">
  import { score, resetDuel } from '$lib/store';

  function resetScore() {
    score.set({ p1: 0, p2: 0 });
    resetDuel();
  }
</script>

<header class="app-header">
  <div class="brand">
    <div class="brand-icon">
      <span class="icon-inner">YG</span>
      <div class="icon-ring"></div>
    </div>
    <div class="brand-text">
      <h1>Duel Disks</h1>
      <span class="subtitle">Tazo Edition</span>
    </div>
  </div>

  <div class="scoreboard glass">
    <div class="score-block p1">
      <span class="score-label">P1</span>
      <span class="score-value">{$score.p1}</span>
    </div>
    <div class="score-sep">—</div>
    <div class="score-block p2">
      <span class="score-label">P2</span>
      <span class="score-value">{$score.p2}</span>
    </div>
    <button class="reset-score" onclick={resetScore} title="Reiniciar marcador">↺</button>
  </div>
</header>

<style>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1.25rem 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(7,9,15,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .brand-icon {
    width: 44px;
    height: 44px;
    position: relative;
  }
  .icon-inner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-title, serif);
    font-size: 0.8rem;
    font-weight: 900;
    color: #e8a020;
    background: radial-gradient(circle, rgba(232,160,32,0.2), transparent 70%);
    border-radius: 50%;
    z-index: 1;
  }
  .icon-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    background: conic-gradient(#e8a020, #f5c842, #7a5510, #e8a020) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: spin-slow 6s linear infinite;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }
  h1 {
    font-family: var(--font-title, serif);
    font-size: 1.3rem;
    background: linear-gradient(135deg, #f5c842, #e8a020);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.05em;
  }
  .subtitle {
    font-family: var(--font-body, sans-serif);
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: #64748b;
    text-transform: uppercase;
  }

  .scoreboard {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px;
    border-radius: 50px;
  }

  .score-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .score-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #64748b;
  }
  .score-value {
    font-family: var(--font-title, serif);
    font-size: 1.3rem;
    line-height: 1;
  }
  .score-block.p1 .score-value { color: #e8a020; }
  .score-block.p2 .score-value { color: #a855f7; }

  .score-sep { color: #334155; font-size: 1rem; }

  .reset-score {
    background: none;
    border: none;
    color: #475569;
    font-size: 1rem;
    cursor: pointer;
    padding: 2px;
    border-radius: 50%;
    transition: color 0.2s, transform 0.3s;
  }
  .reset-score:hover { color: #94a3b8; transform: rotate(-180deg); }

  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }
</style>
