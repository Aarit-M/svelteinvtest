import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'dark' | 'light';

// Initialize theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (browser) {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  }
  return 'light'; // Default for SSR
};

// Create theme store
export const theme = writable<Theme>(getInitialTheme());

// Update theme in localStorage and apply to document
export function setTheme(newTheme: Theme) {
  if (browser) {
    theme.set(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

// Toggle theme
export function toggleTheme() {
  theme.update(current => {
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
  });
}

// Initialize theme on client-side
if (browser) {
  theme.subscribe(value => {
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
}
