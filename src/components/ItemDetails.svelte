
<script lang="ts">
    import { MapPin } from 'lucide-svelte';
    import { Sheet } from '$lib/components/ui/sheet';
    import ItemImage from '../components/ItemImage.svelte';
    import ItemActions from '../components/ItemActions.svelte';
    import LocationMap from '../components/LocationMap.svelte';
    import AddItemModal from '../components/AddItemModal.svelte';
    import EditItemModal from '../components/EditItemModal.svelte';
    import type { Item } from '$lib/types';
  
    export let open: boolean;
    export let onClose: () => void;
    export let item: Item;
    export let onEdit: (item: Item) => void;
    export let onAddItem: (item: Partial<Item>) => void;
  
    let showMap = false;
    let showAddModal = false;
    let showEditModal = false;
  </script>
  
  <Sheet {open} onOpenChange={onClose}>
    <div slot="content" class="w-full sm:max-w-lg">
      <div class="space-y-6 pt-6">
        <ItemImage image={item.image} title={item.itemName} />
  
        <div class="space-y-2">
          <h2 class="text-2xl font-semibold">{item.itemName}</h2>
          {#if item.description}
            <p class="text-muted-foreground">{item.description}</p>
          {/if}
          <div class="flex items-center text-muted-foreground">
            <MapPin class="h-4 w-4 mr-2" />
            <span>{item.itemLocation.path}</span>
          </div>
        </div>
  
        <ItemActions
          onEdit={() => (showEditModal = true)}
          onAddItem={() => (showAddModal = true)}
          onShowMap={() => (showMap = true)}
        />
      </div>
    </div>
  </Sheet>
  
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
    onSave={onEdit}
    item={{
      id: item.id,
      itemName: item.itemName,
      description: item.description,
      itemLocation: { path: item.itemLocation.path },
      image: item.image,
      itemMeasurements: item.itemMeasurements
    }}
  />