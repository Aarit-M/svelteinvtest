<script lang="ts">
    import { X } from 'lucide-svelte';
    import type { Item } from '$lib/types';
    import * as Dialog from '$lib/components/ui/dialog';
    import { getPlaceholderImage } from '$lib/utils';
  
    export let open: boolean;
    export let onClose: () => void;
    export let item: Item | null = null;
    
    function getItemImage(): string {
      if (!item) return getPlaceholderImage('item');
      return item.image || getPlaceholderImage('item', item.itemName);
    }
</script>
  
<Dialog.Root bind:open onOpenChange={onClose}>
  <Dialog.Content class="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
    <div class="relative">
      <button 
        on:click={onClose} 
        class="absolute right-2 top-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
      >
        <X class="h-5 w-5" />
      </button>
      {#if item}
        <div class="flex flex-col items-center">
          <div class="flex items-center justify-center max-h-[90vh]">
            <img 
              src={getItemImage()} 
              alt={item.itemName} 
              class="max-w-full max-h-[90vh] object-contain"
            />
          </div>
          <div class="bg-black/80 text-white p-3 w-full text-center">
            <h3 class="text-lg font-medium">{item.itemName}</h3>
            {#if item.description}
              <p class="text-sm text-gray-300 mt-1 max-w-lg mx-auto">{item.description}</p>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex items-center justify-center h-64">
          <p class="text-white">No image available</p>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root> 