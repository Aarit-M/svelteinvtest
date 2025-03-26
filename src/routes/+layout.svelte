<script>
import { onMount } from 'svelte';
import { Toaster } from 'svelte-sonner';
import '../app.postcss';

onMount(() => {
  // Check for saved theme or use system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    // Check for system dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    localStorage.setItem('theme', initialTheme);
  }
});
</script>

<div class="transition-colors duration-300 min-h-screen">
  <Toaster richColors closeButton position="bottom-right" theme="system" />
  <slot></slot>
</div>
