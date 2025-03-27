<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Sun, Moon } from 'lucide-svelte';

  let theme = 'light';

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
    }
    applyTheme();
  });
</script>

<Button 
  variant="ghost" 
  size="icon" 
  on:click={toggleTheme}
  class="hover:bg-base-300 transition-colors duration-200"
  aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
>
  {#if theme === 'light'}
    <Moon class="h-5 w-5" />
  {:else}
    <Sun class="h-5 w-5" />
  {/if}
</Button> 