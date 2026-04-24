<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';

  let { children } = $props();
</script>

<div class="stars-bg"></div>
<Header />
<main>
  {@render children()}
</main>

<style>
  main {
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
</style>
