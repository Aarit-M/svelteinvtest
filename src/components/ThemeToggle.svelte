<script>
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

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
    // Get saved theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme = savedTheme;
    } else {
      // Check for system dark mode preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
    }
    applyTheme();
  });
</script>

<button
  class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-primary-foreground"
  on:click={toggleTheme}
  aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
>
  {#if theme === 'light'}
    <Icon icon="material-symbols:dark-mode" class="h-5 w-5" />
  {:else}
    <Icon icon="material-symbols:light-mode" class="h-5 w-5" />
  {/if}
</button> 