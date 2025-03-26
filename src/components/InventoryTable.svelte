<script lang="ts">
    import Icon from '@iconify/svelte';
    import { createEventDispatcher } from 'svelte';
    import type { Item } from '$lib/types';
    import { cn } from '$lib/utils';
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
  
    function handleSelectItem(itemId: string) {
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
  
    function getSortIcon(column: string) {
      if (sortColumn !== column) return null;
      return sortDirection === 'asc' ? 'material-symbols:keyboard-arrow-down' : 'material-symbols:keyboard-arrow-up';
    }
  </script>
  
  <div class="w-full shadow-sm rounded-md overflow-hidden">
    <Table.Root>
      <Table.Header class="bg-gray-100 dark:bg-gray-800">
        <Table.Row>
          <Table.Head class="w-16 pl-4">
            <button 
              class="flex h-4 w-4 items-center justify-center rounded-sm border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              on:click={handleSelectAll}
              aria-label="Select all items"
              data-state={items.length > 0 && selectedItems.length === items.length ? 'checked' : 'unchecked'}
            >
              {#if items.length > 0 && selectedItems.length === items.length}
                <Icon icon="material-symbols:check" class="h-3 w-3" />
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
            <div class="flex justify-end">
              <Icon icon="material-symbols:search" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if sortedItems.length === 0}
          <Table.Row>
            <Table.Cell colSpan={5} class="h-24 text-center text-muted-foreground">
              No items found.
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each sortedItems as item (item.id)}
            <Table.Row class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <Table.Cell class="px-4 py-2">
                <button 
                  class="flex h-4 w-4 items-center justify-center rounded-sm border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  on:click={() => handleSelectItem(item.id)}
                  aria-label={`Select ${item.itemName}`}
                  data-state={selectedItems.includes(item.id) ? 'checked' : 'unchecked'}
                >
                  {#if selectedItems.includes(item.id)}
                    <Icon icon="material-symbols:check" class="h-3 w-3" />
                  {/if}
                </button>
              </Table.Cell>
              <Table.Cell class="px-4 py-2">{item.itemName}</Table.Cell>
              <Table.Cell class="px-4 py-2">{item.itemLocation.path}</Table.Cell>
              <Table.Cell class="px-4 py-2">
                {#if item.itemMeasurements}
                  {item.itemMeasurements.size} {item.itemMeasurements.unit}
                {/if}
              </Table.Cell>
              <Table.Cell class="px-4 py-2">
                <div class="flex justify-end">
                  <button 
                    class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
                    on:click={() => viewItemDetails(item)}
                  >
                    <Icon icon="material-symbols:visibility" class="w-4 h-4" />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>