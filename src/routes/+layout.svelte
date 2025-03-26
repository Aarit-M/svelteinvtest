<script>
import { setTheme, theme } from '$lib/stores/theme';
import { onMount } from 'svelte';
import '../app.postcss';

onMount(() => {
  // Set data-theme attribute on body for theming
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
  return () => observer.disconnect();
});</script>
  
  <div class="transition-colors duration-300">
	<slot></slot>
  </div>
