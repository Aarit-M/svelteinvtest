<script lang="ts">
    import { onMount } from 'svelte';
    import { X, FolderPlus } from 'lucide-svelte';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Label } from '$lib/components/ui/label';
    import { Input } from '$lib/components/ui/input';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import { cn } from '$lib/utils';
    import type { Container, Item } from '$lib/types';
    import Icon from '@iconify/svelte';
  
    export let open: boolean;
    export let onClose: () => void;
    export let onGroup: (locationId: string) => void;
    export let containers: Container[];
    export let selectedItems: Item[];
  
    let locationId = '';
    let searchTerm = '';
  
    function resetForm() {
      locationId = '';
      searchTerm = '';
    }
  
    function handleSubmit() {
      if (!locationId) return;
  
      onGroup(locationId);
      resetForm();
      onClose();
    }
  
    // Helper function to recursively render containers
    function renderContainers(containers: Container[], level = 0) {
      return containers
        .map(container => {
          // Get icon based on level
          const isOutline = level % 2 !== 0;
          const baseIcon = isOutline ? "folder-outline-rounded" : "folder-rounded";
          
          const isSelected = locationId === container.id;
          const locationNameLower = container.containerName.toLowerCase();
          const searchTermLower = searchTerm.toLowerCase();
          
          // Filter by search term
          if (searchTerm && !locationNameLower.includes(searchTermLower)) {
            // Still render this container if any of its children match
            const hasMatchingChild = container.children && container.children.some(child => 
              child.containerName.toLowerCase().includes(searchTermLower)
            );
            
            if (!hasMatchingChild) {
              return null;
            }
          }
          
          return {
            container,
            isSelected,
            level,
            baseIcon,
            children: container.children ? renderContainers(container.children, level + 1) : []
          };
        })
        .filter(Boolean);
    }
  
    $: renderedContainers = renderContainers(containers);
  
    onMount(() => {
      resetForm();
    });
  </script>
  
  <Dialog {open} onOpenChange={(isOpen) => {
    if (!isOpen) {
      resetForm();
      onClose();
    }
  }}>
    <DialogContent class="sm:max-w-md animate-fade-in">
      <DialogHeader>
        <DialogTitle class="text-center text-xl flex items-center justify-center gap-2">
          <FolderPlus class="h-5 w-5" />
          Group {selectedItems.length} Items
        </DialogTitle>
      </DialogHeader>
      <button 
        on:click={onClose} 
        class="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <X class="h-4 w-4" />
      </button>
  
      <div class="space-y-4 pt-4">
        <div class="space-y-2">
          <Label for="destinationSelect">Select Destination Location</Label>
          <Input
            id="searchLocation"
            bind:value={searchTerm}
            placeholder="Search locations..."
            class="mb-2"
          />
          
          <div class="border rounded-md h-56 overflow-hidden p-1 bg-white dark:bg-gray-950">
            <ScrollArea class="h-[216px]">
              {#each renderedContainers as item}
                <div>
                  <div 
                    class={cn(
                      "flex items-center py-2 px-2 cursor-pointer rounded-md mb-1",
                      item.isSelected 
                        ? 'bg-primary/20 dark:bg-primary/30' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    style={`padding-left: ${item.level * 16 + 8}px`}
                    on:click={() => locationId = item.container.id}
                  >
                    <Icon 
                      icon={item.baseIcon}
                      class={cn(
                        "h-5 w-5 mr-2",
                        item.isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300"
                      )}
                    />
                    <span class={cn(
                      "truncate",
                      item.isSelected ? "font-medium" : ""
                    )}>
                      {item.container.containerName}
                    </span>
                  </div>
                  
                  {#if item.children && item.children.length > 0}
                    <div class="ml-4">
                      <!-- Recursively render children components -->
                      {#each item.children as child}
                        <!-- This part would be recursive in React, but in Svelte we need a different approach -->
                        <!-- For simplicity, we'll only show 2 levels deep in this example -->
                        <div 
                          class={cn(
                            "flex items-center py-2 px-2 cursor-pointer rounded-md mb-1",
                            child.isSelected 
                              ? 'bg-primary/20 dark:bg-primary/30' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                          style={`padding-left: ${child.level * 16 + 8}px`}
                          on:click={() => locationId = child.container.id}
                        >
                          <Icon 
                            icon={child.baseIcon}
                            class={cn(
                              "h-5 w-5 mr-2",
                              child.isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300"
                            )}
                          />
                          <span class={cn(
                            "truncate",
                            child.isSelected ? "font-medium" : ""
                          )}>
                            {child.container.containerName}
                          </span>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
              
              {#if searchTerm && !containers.some(c => c.containerName.toLowerCase().includes(searchTerm.toLowerCase()))}
                <div class="py-2 px-2 text-gray-500 text-sm italic">
                  No locations match your search
                </div>
              {/if}
            </ScrollArea>
          </div>
        </div>
  
        <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-md max-h-40 overflow-y-auto">
          <Label class="block mb-2 text-sm font-medium">Selected Items:</Label>
          <ul class="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            {#each selectedItems as item}
              <li class="truncate">• {item.itemName}</li>
            {/each}
          </ul>
        </div>
  
        <DialogFooter class="pt-2">
          <Button 
            on:click={handleSubmit} 
            class="w-full"
            disabled={!locationId}
          >
            Move Items to Selected Location
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>