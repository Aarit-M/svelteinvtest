
<script lang="ts">
    import { X, Edit, Plus, Map, MapPin, Hash } from 'lucide-svelte';
    import type { Item } from '$lib/types';
    import { Dialog } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import LocationMap from '../components/LocationMap.svelte';
    import AddItemModal from '../components/AddItemModal.svelte';
    import EditItemModal from '../components/EditItemModal.svelte';
    import { Card } from '$lib/components/ui/card';
    import { Separator } from '$lib/components/ui/separator';
  
    export let open: boolean;
    export let onClose: () => void;
    export let item: Item | null;
    export let onEdit: (updatedItem: Item) => void;
    export let onAddItem: (newItem: Partial<Item>) => void;
  
    let showMap = false;
    let showAddModal = false;
    let showEditModal = false;
  </script>
  
  {#if item}
    <Dialog {open} onOpenChange={onClose}>
      <div slot="content" class="sm:max-w-md animate-slide-in-right">
        <div slot="header">
          <div slot="title" class="text-xl font-semibold">Item Details</div>
        </div>
        <button 
          on:click={onClose} 
          class="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <X class="h-4 w-4" />
        </button>
        
        <div class="space-y-6 pt-2">
          <Card class="overflow-hidden">
            <div class="p-0">
              {#if item.image}
                <img 
                  src={item.image} 
                  alt={item.itemName} 
                  class="w-full aspect-square object-cover"
                />
              {:else}
                <div class="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span class="text-gray-400">No image available</span>
                </div>
              {/if}
            </div>
          </Card>
  
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold">{item.itemName}</h2>
            
            {#if item.description}
              <p class="text-gray-600 dark:text-gray-400">{item.description}</p>
            {/if}
            
            <div class="space-y-2">
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin class="h-4 w-4 mr-2 flex-shrink-0" />
                <span class="truncate">{item.itemLocation.path}</span>
              </div>
              
              {#if item.itemMeasurements}
                <div class="flex items-center text-gray-600 dark:text-gray-400">
                  <Hash class="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{item.itemMeasurements.size} {item.itemMeasurements.unit}</span>
                </div>
              {/if}
            </div>
          </div>
  
          <Separator />
  
          <div class="grid grid-cols-12 gap-4">
            <Button 
              variant="outline" 
              class="col-span-12"
              on:click={() => (showEditModal = true)}
            >
              <Edit class="mr-2 h-4 w-4" /> Edit Item
            </Button>
            
            <Button 
              class="col-span-8"
              on:click={() => (showAddModal = true)}
            >
              <Plus class="mr-2 h-4 w-4" /> Add Similar Item
            </Button>
            
            <Button 
              variant="outline" 
              class="col-span-4"
              on:click={() => (showMap = true)}
            >
              <Map class="mr-2 h-4 w-4" /> Map
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  
    <LocationMap
      showMap={showMap}
      onClose={() => (showMap = false)}
      location={item.itemLocation.path}
    />
  
    <AddItemModal
      open={showAddModal}
      onClose={() => (showAddModal = false)}
      onAddItem={onAddItem}
      defaultLocation={item.itemLocation.path}
    />
  
    <EditItemModal
      open={showEditModal}
      onClose={() => (showEditModal = false)}
      item={item}
      onSave={onEdit}
    />
  {/if}
  