<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="stars-bg"></div>
<main>
  {@render children()}
</main>

<style>
  main {
    position: relative;
    z-index: 1;
    height: 100vh;
    max-width: 1400px;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
