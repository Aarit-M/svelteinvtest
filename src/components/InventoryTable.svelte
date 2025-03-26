
<script lang="ts">
    import { Eye, MapPin, Hash, Search, ChevronDown, ChevronUp } from 'lucide-svelte';
    import type { Item } from '$lib/types';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { cn } from '$lib/utils';
    import { 
      Table,
      TableBody, 
      TableCell, 
      TableHead, 
      TableHeader, 
      TableRow
    } from '$lib/components/ui/table';
  
    export let items: Item[] = [];
    export let onSelectItems: (items: string[]) => void;
    export let selectedItems: string[] = [];
    export let onViewItem: (item: Item) => void;
  
    let sortColumn: string | null = 'itemName';
    let sortDirection: 'asc' | 'desc' = 'asc';
  
    const handleSort = (column: string) => {
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }
    };
  
    const handleSelectItem = (itemId: string) => {
      if (selectedItems.includes(itemId)) {
        onSelectItems(selectedItems.filter(id => id !== itemId));
      } else {
        onSelectItems([...selectedItems, itemId]);
      }
    };
  
    const handleSelectAll = () => {
      if (selectedItems.length === items.length) {
        onSelectItems([]);
      } else {
        onSelectItems(items.map(item => item.id));
      }
    };
  
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
        valueA = a.itemMeasurements?.size || 0;
        valueB = b.itemMeasurements?.size || 0;
      } else {
        return 0;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
    const getSortIcon = (column: string) => {
      if (sortColumn !== column) return null;
      return sortDirection === 'asc' ? 
        '<ChevronDown class="h-4 w-4 ml-1" />' : 
        '<ChevronUp class="h-4 w-4 ml-1" />';
    };
  </script>
  
  <div class="w-full bg-white dark:bg-gray-900 shadow-sm">
    <Table>
      <TableHeader class="bg-gray-100 dark:bg-gray-800">
        <TableRow>
          <TableHead class="w-16">
            <Checkbox 
              checked={items.length > 0 && selectedItems.length === items.length} 
              onCheckedChange={handleSelectAll}
              aria-label="Select all items"
            />
          </TableHead>
          <TableHead 
            class="font-medium cursor-pointer" 
            on:click={() => handleSort('itemName')}
          >
            <div class="flex items-center">
              Item
              {#if sortColumn === 'itemName'}
                {#if sortDirection === 'asc'}
                  <ChevronDown class="h-4 w-4 ml-1" />
                {:else}
                  <ChevronUp class="h-4 w-4 ml-1" />
                {/if}
              {/if}
            </div>
          </TableHead>
          <TableHead 
            class="font-medium cursor-pointer"
            on:click={() => handleSort('location')}
          >
            <div class="flex items-center">
              <MapPin class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Location
              {#if sortColumn === 'location'}
                {#if sortDirection === 'asc'}
                  <ChevronDown class="h-4 w-4 ml-1" />
                {:else}
                  <ChevronUp class="h-4 w-4 ml-1" />
                {/if}
              {/if}
            </div>
          </TableHead>
          <TableHead 
            class="font-medium cursor-pointer w-[100px]"
            on:click={() => handleSort('measurement')}
          >
            <div class="flex items-center">
              <Hash class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {#if sortColumn === 'measurement'}
                {#if sortDirection === 'asc'}
                  <ChevronDown class="h-4 w-4 ml-1" />
                {:else}
                  <ChevronUp class="h-4 w-4 ml-1" />
                {/if}
              {/if}
            </div>
          </TableHead>
          <TableHead class="w-16">
            <div class="flex justify-end">
              <Search class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#if sortedItems.length === 0}
          <TableRow>
            <TableCell colSpan={5} class="h-24 text-center text-muted-foreground">
              No items found.
            </TableCell>
          </TableRow>
        {:else}
          {#each sortedItems as item (item.id)}
            <TableRow class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <TableCell class="px-4 py-2">
                <Checkbox 
                  checked={selectedItems.includes(item.id)} 
                  onCheckedChange={() => handleSelectItem(item.id)}
                  aria-label={`Select ${item.itemName}`}
                />
              </TableCell>
              <TableCell class="px-4 py-2">{item.itemName}</TableCell>
              <TableCell class="px-4 py-2">{item.itemLocation.path}</TableCell>
              <TableCell class="px-4 py-2">
                {#if item.itemMeasurements}
                  {item.itemMeasurements.size} {item.itemMeasurements.unit}
                {/if}
              </TableCell>
              <TableCell class="px-4 py-2">
                <div class="flex justify-end">
                  <button 
                    class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
                    on:click={() => onViewItem(item)}
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </div>