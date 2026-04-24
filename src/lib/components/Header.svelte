<script lang="ts">
  import { gameState, resetGame } from '$lib/gameStore';
  let phase = $derived($gameState.phase);
  let inGame = $derived(phase !== 'idle');
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

  {#if inGame}
    <div class="header-right">
      <div class="phase-pill">
        {#if phase === 'draft'}🎯 Draft{:else if phase === 'p1-select'}⚔️ P1 elige{:else if phase === 'p2-select'}🛡 P2 elige{:else if phase === 'reveal'}⚡ Revelando{:else if phase === 'result'}🏆 Resultado{/if}
      </div>
      <button class="btn-exit" onclick={resetGame} title="Salir del duelo">✕ Salir</button>
    </div>
  {/if}
</header>

<style>
  .app-header {
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap;
    gap:1rem; padding:1.25rem 2rem;
    border-bottom:1px solid rgba(255,255,255,0.06);
    position:sticky; top:0; z-index:100;
    background:rgba(7,9,15,0.85);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  }

  .brand { display:flex; align-items:center; gap:14px; }
  .brand-icon { width:44px; height:44px; position:relative; }
  .icon-inner {
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    font-family:var(--font-title,serif); font-size:0.8rem; font-weight:900; color:#e8a020;
    background:radial-gradient(circle,rgba(232,160,32,0.2),transparent 70%);
    border-radius:50%; z-index:1;
  }
  .icon-ring {
    position:absolute; inset:0; border-radius:50%;
    border:2px solid transparent;
    background:conic-gradient(#e8a020,#f5c842,#7a5510,#e8a020) border-box;
    -webkit-mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:destination-out;
    mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);
    mask-composite:exclude;
    animation:spin-slow 6s linear infinite;
  }

  .brand-text { display:flex; flex-direction:column; line-height:1; }
  h1 {
    font-family:var(--font-title,serif); font-size:1.3rem;
    background:linear-gradient(135deg,#f5c842,#e8a020);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    letter-spacing:0.05em;
  }
  .subtitle { font-family:var(--font-body,sans-serif); font-size:0.65rem; letter-spacing:0.2em; color:#64748b; text-transform:uppercase; }

  .header-right { display:flex; align-items:center; gap:12px; }

  .phase-pill {
    font-family:var(--font-body,sans-serif); font-size:0.75rem; font-weight:600;
    background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3);
    color:#c084fc; border-radius:50px; padding:4px 14px; letter-spacing:0.05em;
  }

  .btn-exit {
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
    color:#64748b; font-size:0.78rem; border-radius:50px; padding:4px 14px;
    cursor:pointer; transition:all 0.2s;
  }
  .btn-exit:hover { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3); color:#fc8181; }

  @keyframes spin-slow { to { transform:rotate(360deg); } }
</style>
