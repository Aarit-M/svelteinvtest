
<script lang="ts">
    import { Edit, Plus, Map } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';
  
    export let onEdit: () => void;
    export let onAddItem: () => void;
    export let onShowMap: () => void;
  </script>
  
  <div class="grid grid-cols-3 gap-4">
    <Button 
      variant="secondary" 
      class="w-full col-span-3"
      on:click={onEdit}
    >
      <Edit class="mr-2" /> Edit Item
    </Button>
    <Button 
      class="w-full bg-primary col-span-2"
      on:click={onAddItem}
    >
      <Plus class="mr-2" /> Add Item
    </Button>
    <Button 
      variant="secondary" 
      class="w-full"
      on:click={onShowMap}
    >
      <Map class="mr-2" /> Map
    </Button>
  </div>
  