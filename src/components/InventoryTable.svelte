<script lang="ts">
    import Icon from '@iconify/svelte';
    import { createEventDispatcher } from 'svelte';
    import type { Item } from '$lib/types';
    import { cn, getPlaceholderImage } from '$lib/utils';
    import * as Table from "$lib/components/ui/table";
  
    export let items: Item[] = [];
    export let selectedItems: string[] = [];
  
    const dispatch = createEventDispatcher();
  
    // Sorting state
    let sortColumn: string | null = 'itemName';
    let sortDirection: 'asc' | 'desc' = 'asc';
  
    function handleSort(column: string) {
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }
    }
  
    function handleSelectItem(itemId: string, event: MouseEvent) {
      // Stop propagation to prevent row click from triggering
      event.stopPropagation();
      
      if (selectedItems.includes(itemId)) {
        selectedItems = selectedItems.filter(id => id !== itemId);
        dispatch('selectItems', selectedItems);
      } else {
        selectedItems = [...selectedItems, itemId];
        dispatch('selectItems', selectedItems);
      }
    }
  
    function handleSelectAll() {
      if (selectedItems.length === items.length) {
        selectedItems = [];
      } else {
        selectedItems = items.map(item => item.id);
      }
      dispatch('selectItems', selectedItems);
    }
  
    function viewItemDetails(item: Item) {
      dispatch('viewItem', item);
    }
    
    // Functions to view item photo
    function viewItemPhoto(item: Item, event: MouseEvent) {
      event.stopPropagation(); // Prevent row click
      dispatch('viewPhoto', item);
    }
    
    function handlePhotoKeyDown(e: KeyboardEvent, item: Item) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        dispatch('viewPhoto', item);
      }
    }
    
    // Get a placeholder image if the item doesn't have one
    function getItemImage(item: Item): string {
      if (item.image) return item.image;
      return getPlaceholderImage('item', item.itemName);
    }
  
    // Sort items based on column and direction
    $: sortedItems = [...items].sort((a, b) => {
      if (!sortColumn) return 0;
      
      let valueA, valueB;
      
      if (sortColumn === 'itemName') {
        valueA = a.itemName;
        valueB = b.itemName;
      } else if (sortColumn === 'location') {
        valueA = a.itemLocation.path;
        valueB = b.itemLocation.path;
      } else if (sortColumn === 'measurement') {
        valueA = (a.itemMeasurements?.size || 0);
        valueB = (b.itemMeasurements?.size || 0);
      } else {
        return 0;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
    function getSortIcon(column: string): string {
      if (sortColumn !== column) return '';
      return sortDirection === 'asc' ? 'material-symbols:keyboard-arrow-down' : 'material-symbols:keyboard-arrow-up';
    }
    
    // Determine checkbox state: checked, unchecked, or indeterminate
    $: allChecked = items.length > 0 && selectedItems.length === items.length;
    $: indeterminate = selectedItems.length > 0 && selectedItems.length < items.length;
    
    // Handle row click function
    function handleRowClick(item: Item) {
      viewItemDetails(item);
    }
    
    // Handle keyboard events for accessibility
    function handleKeyDown(e: KeyboardEvent, item: Item) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        viewItemDetails(item);
      }
    }
    
    // Handle image error
    function handleImageError(event: Event) {
      const imgElement = event.target as HTMLImageElement;
      if (imgElement) {
        imgElement.src = getPlaceholderImage('item');
      }
    }
</script>
  
<div class="w-full shadow-sm rounded-md overflow-hidden">
    <Table.Root>
      <Table.Header class="bg-gray-100 dark:bg-gray-800">
        <Table.Row>
          <Table.Head class="w-16 pl-4">
            <button 
              class="flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
              class:bg-primary={allChecked}
              class:text-primary-foreground={allChecked}
              class:indeterminate={indeterminate}
              on:click={handleSelectAll}
              aria-label="Select all items"
            >
              {#if allChecked}
                <Icon icon="material-symbols:check" class="h-3 w-3" />
              {:else if indeterminate}
                <Icon icon="material-symbols:horizontal-rule" class="h-3 w-3" />
              {/if}
            </button>
          </Table.Head>
          <Table.Head 
            class="font-medium cursor-pointer" 
            on:click={() => handleSort('itemName')}
          >
            <div class="flex items-center">
              Item
              {#if getSortIcon('itemName')}
                <Icon icon={getSortIcon('itemName')} class="h-4 w-4 ml-1" />
              {/if}
            </div>
          </Table.Head>
          <Table.Head 
            class="font-medium cursor-pointer"
            on:click={() => handleSort('location')}
          >
            <div class="flex items-center">
              <Icon icon="material-symbols:location-on" class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Location
              {#if getSortIcon('location')}
                <Icon icon={getSortIcon('location')} class="h-4 w-4 ml-1" />
              {/if}
            </div>
          </Table.Head>
          <Table.Head 
            class="font-medium cursor-pointer w-[100px]"
            on:click={() => handleSort('measurement')}
          >
            <div class="flex items-center">
              <Icon icon="material-symbols:tag" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {#if getSortIcon('measurement')}
                <Icon icon={getSortIcon('measurement')} class="h-4 w-4 ml-1" />
              {/if}
            </div>
          </Table.Head>
          <Table.Head class="w-16">
            Photo
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if sortedItems.length === 0}
          <Table.Row>
            <Table.Cell class="h-24 text-center text-muted-foreground" colspan={5}>
              No items found.
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each sortedItems as item (item.id)}
            <Table.Row 
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              on:click={() => handleRowClick(item)}
              on:keydown={(e) => handleKeyDown(e, item)}
              tabindex={0}
              role="button"
            >
              <Table.Cell class="px-4 py-2">
                <div on:click|stopPropagation>
                  <button 
                    class="flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
                    class:bg-primary={selectedItems.includes(item.id)}
                    class:text-primary-foreground={selectedItems.includes(item.id)}
                    on:click={(e) => handleSelectItem(item.id, e)}
                    aria-label={`Select ${item.itemName}`}
                  >
                    {#if selectedItems.includes(item.id)}
                      <Icon icon="material-symbols:check" class="h-3 w-3" />
                    {/if}
                  </button>
                </div>
              </Table.Cell>
              <Table.Cell class="px-4 py-2">{item.itemName}</Table.Cell>
              <Table.Cell class="px-4 py-2">{item.itemLocation.path}</Table.Cell>
              <Table.Cell class="px-4 py-2">
                {#if item.itemMeasurements}
                  {item.itemMeasurements.size} {item.itemMeasurements.unit}
                {/if}
              </Table.Cell>
              <Table.Cell class="px-4 py-2">
                <div 
                  class="relative w-10 h-10 overflow-hidden rounded-md border border-border cursor-pointer"
                  on:click={(e) => viewItemPhoto(item, e)}
                  on:keydown={(e) => handlePhotoKeyDown(e, item)}
                  tabindex={0}
                  role="button"
                >
                  <img 
                    src={getItemImage(item)} 
                    alt={item.itemName}
                    class="w-full h-full object-cover" 
                    on:error={handleImageError}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
  
<style>
  .indeterminate {
    background-color: hsl(var(--primary) / 0.5);
    color: hsl(var(--primary-foreground));
  }
</style>