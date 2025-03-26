<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search, X } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';

  export let value = '';
  export let placeholder = 'Search items...';
  export let className = '';

  const dispatch = createEventDispatcher();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', target.value);
  }

  function handleClear() {
    value = '';
    dispatch('clear');
    dispatch('change', '');
  }
</script>

<div class="relative w-full {className}">
  <div class="absolute left-2.5 top-2.5 text-muted-foreground">
    <Search class="h-4 w-4" />
  </div>
  
  <Input 
    type="text"
    {placeholder}
    {value}
    on:input={handleChange}
    class="pl-8 pr-8 w-full h-9"
  />
  
  {#if value}
    <Button 
      variant="ghost" 
      size="icon" 
      class="absolute right-1 top-1 h-7 w-7 hover:bg-base-300" 
      on:click={handleClear}
      type="button"
      aria-label="Clear search"
    >
      <X class="h-3.5 w-3.5" />
    </Button>
  {/if}
</div> 