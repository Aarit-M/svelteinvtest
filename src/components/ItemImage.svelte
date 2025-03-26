<script lang="ts">
    import { getPlaceholderImage } from '$lib/utils';
    export let image: string | undefined;
    export let title: string;
</script>
  
<div class="aspect-square overflow-hidden rounded-md">
  {#if image}
    <img 
      src={image} 
      alt={title} 
      class="h-full w-full object-cover transition-all"
      on:error={() => image = getPlaceholderImage('item', title)}
    />
  {:else}
    <img
      src={getPlaceholderImage('item', title)}
      alt={title}
      class="h-full w-full object-cover transition-all"
    />
  {/if}
</div>