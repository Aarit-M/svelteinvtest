<script lang="ts">
    import { X, Edit, Plus, Map, MapPin, Hash, Camera, ArrowUpToLine } from 'lucide-svelte';
    import type { Item } from '$lib/types';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import LocationMap from '../components/LocationMap.svelte';
    import AddItemModal from '../components/AddItemModal.svelte';
    import EditItemModal from '../components/EditItemModal.svelte';
    import { Card } from '$lib/components/ui/card';
    import { Separator } from '$lib/components/ui/separator';
    import { toast } from '$lib/components/ui/use-toast';
  
    export let open: boolean;
    export let onClose: () => void;
    export let item: Item | null;
    export let onEdit: (updatedItem: Item) => void;
    export let onAddItem: (newItem: Partial<Item>) => void;
  
    let showMap = false;
    let showAddModal = false;
    let showEditModal = false;
    let showFullImage = false;
    
    function handleTakePhoto() {
      // Placeholder function for camera functionality
      toast({
        title: "Camera",
        description: "Camera functionality would be implemented here."
      });
    }
    
    function handleUploadImage() {
      // Placeholder function for image upload
      toast({
        title: "Upload",
        description: "Upload functionality would be implemented here."
      });
    }
    
    function formatMeasurement(item: Item) {
      if (!item.itemMeasurements) return '';
      
      const { size, unit } = item.itemMeasurements;
      
      const unitMap: Record<string, string> = {
        'ft': 'feet',
        'lbs': 'pounds',
        'oz': 'ounces',
        'V': 'volts',
        'pcs': 'pieces'
      };
      
      return `${size} ${unitMap[unit] || unit}`;
    }
</script>
  
{#if item}
  <Dialog.Root bind:open onOpenChange={onClose}>
    <Dialog.Content class="sm:max-w-md animate-fade-in">
      <Dialog.Header>
        <Dialog.Title class="text-xl font-semibold flex items-center">
          <span class="truncate">{item.itemName}</span>
        </Dialog.Title>
      </Dialog.Header>
      <button 
        on:click={onClose} 
        class="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <X class="h-4 w-4" />
      </button>
      
      <div class="space-y-6 pt-2">
        <Card class="overflow-hidden border shadow-sm">
          <div class="relative p-0">
            {#if item.image}
              <div 
                class="aspect-video bg-black flex items-center justify-center cursor-pointer overflow-hidden"
                on:click={() => showFullImage = true}
                on:keydown={(e) => e.key === 'Enter' && (showFullImage = true)}
                tabindex="0"
                role="button"
                aria-label="View full image"
              >
                <img 
                  src={item.image} 
                  alt={item.itemName} 
                  class="max-h-full max-w-full object-contain"
                />
                <div class="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ArrowUpToLine class="h-8 w-8 text-white drop-shadow-md" />
                </div>
              </div>
            {:else}
              <div class="aspect-video bg-muted flex flex-col items-center justify-center gap-4 p-4">
                <span class="text-muted-foreground text-sm">No image available</span>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" on:click={handleTakePhoto} class="text-xs">
                    <Camera class="h-3 w-3 mr-1" />
                    Take Photo
                  </Button>
                  <Button variant="outline" size="sm" on:click={handleUploadImage} class="text-xs">
                    <Plus class="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                </div>
              </div>
            {/if}
          </div>
        </Card>

        <div class="space-y-4">
          {#if item.description}
            <div class="bg-muted/50 p-3 rounded-md text-sm text-foreground/90">
              {item.description}
            </div>
          {/if}
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2 col-span-2">
              <div class="flex items-center text-muted-foreground">
                <MapPin class="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                <span class="truncate text-sm">{item.itemLocation.path}</span>
              </div>
              
              {#if item.itemMeasurements}
                <div class="flex items-center text-muted-foreground">
                  <Hash class="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                  <span class="text-sm">{formatMeasurement(item)}</span>
                </div>
              {/if}
            </div>
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
            class="col-span-8 bg-primary hover:bg-primary-hover"
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
    </Dialog.Content>
  </Dialog.Root>
  
  <!-- Full Image Modal -->
  {#if item.image}
    <Dialog.Root bind:open={showFullImage}>
      <Dialog.Content class="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
        <div class="relative">
          <button 
            on:click={() => showFullImage = false} 
            class="absolute right-2 top-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
          >
            <X class="h-5 w-5" />
          </button>
          <div class="flex items-center justify-center max-h-[90vh]">
            <img 
              src={item.image} 
              alt={item.itemName} 
              class="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  {/if}

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
    onEdit={onEdit}
  />
{/if}
  