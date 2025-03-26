
<script lang="ts">
    export let image: string | undefined;
    export let title: string;
  </script>
  
  <div class="aspect-square overflow-hidden rounded-md">
    {#if image}
      <img 
        src={image} 
        alt={title} 
        class="h-full w-full object-cover transition-all"
      />
    {:else}
      <div class="flex h-full w-full items-center justify-center bg-muted">
        <p class="text-sm text-muted-foreground">No image</p>
      </div>
    {/if}
  </div>