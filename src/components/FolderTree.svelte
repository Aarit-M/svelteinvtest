<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    import * as Accordion from "$lib/components/ui/accordion";
    import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
    import { draggable, droppable, type DragDropState } from '$lib/index.js';
    import type { Container, Item } from '$lib/types';
    import { cn } from '$lib/utils';
  
    export let containers: Container[] = [];
    export let selectedContainer: string | null = null;
    export let onContainerSelect: (id: string) => void = () => {};
    export let onContainerToggle: (id: string) => void = () => {};
    export let onItemDrop: (containerId: string, itemId: string) => void = () => {};
    
    const dispatch = createEventDispatcher();

    // Function to get the appropriate folder icon based on nesting level
    function getFolderIcon(level: number, isSelected: boolean) {
      const iconMap = [
        { icon: 'material-symbols:folder-rounded', outline: 'material-symbols:folder-outline-rounded' },
        { icon: 'material-symbols:folder-outline-rounded', outline: 'material-symbols:folder-rounded' }
      ];
      
      const iconSet = iconMap[level % 2];
      const iconName = level === 0 ? iconSet.icon : 
                       (isSelected ? iconSet.icon : iconSet.outline);
      
      return {
        icon: iconName,
        class: cn(
          "h-5 w-5 mr-2",
          isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300"
        )
      };
    }
    
    // Function to handle container selection
    function handleSelect(id: string) {
      selectedContainer = id;
      onContainerSelect(id);
      dispatch('selectContainer', id);
    }
    
    // Function to toggle container expanded state
    function toggleContainer(id: string, event?: Event) {
      if (event) event.stopPropagation();
      onContainerToggle(id);
    }
    
    // Function to handle dropping an item into a container
    function handleDrop(containerId: string, state: DragDropState<Item>) {
      if (!state.draggedItem) return;
      onItemDrop(containerId, state.draggedItem.id);
    }
    
    // Helper to check if a container should show info icon
    function shouldShowInfoIcon(id: string): boolean {
      return ['kearnys-desk', 'back-corner-shelf', 'box-1', 'box-2', 'box-3', 'small-cabinet'].includes(id);
    }
    
    // Helper to get indent style for nested levels
    function getIndentStyle(level: number): string {
      return `padding-left: ${level * 12}px;`;
    }
    
    // Recursive function to render container hierarchy
    function renderContainers(containers: Container[], level = 0): any[] {
      if (!containers || containers.length === 0) return [];
      
      return containers.map(container => {
        const hasChildren = Boolean(container.children && container.children.length > 0);
        const isSelected = selectedContainer === container.id;
        const iconProps = getFolderIcon(level, isSelected);
        
        return {
          container,
          hasChildren,
          isSelected,
          iconProps,
          level,
          children: hasChildren && container.children ? renderContainers(container.children, level + 1) : []
        };
      });
    }
    
    $: renderedContainers = renderContainers(containers);
</script>
  
<div class="folder-tree">
  <Accordion.Root value="multiple">
    {#each renderedContainers as { container, hasChildren, isSelected, iconProps, level, children }}
      <div 
        class="folder-item"
        use:droppable={{
          container: container.id,
          callbacks: {
            onDrop: (state: DragDropState<Item>) => handleDrop(container.id, state)
          }
        }}
      >
        {#if hasChildren}
          <Accordion.Item value={container.id} class="border-none">
            <div 
              class="folder-header {isSelected ? 'selected' : ''}"
              style={getIndentStyle(level)}
              on:click={() => handleSelect(container.id)}
            >
              <Accordion.Trigger class="flex py-1 px-0 hover:no-underline w-full justify-start">
                <div class="flex items-center w-full">
                  <span class="accordion-icon mr-1">
                    {#if container.isExpanded}
                      <Icon icon="material-symbols:indeterminate-check-box" class="h-4 w-4" />
                    {:else}
                      <Icon icon="material-symbols:add-box-outline" class="h-4 w-4" />
                    {/if}
                  </span>
                  <Icon {...iconProps} />
                  <span class="folder-name">{container.containerName}</span>
                  
                  {#if shouldShowInfoIcon(container.id)}
                    <Tooltip>
                      <TooltipTrigger>
                        <span class="info-icon">
                          <Icon icon="material-symbols:information-outline" size={12} class="text-gray-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p class="text-xs">Additional info about {container.containerName}</p>
                      </TooltipContent>
                    </Tooltip>
                  {/if}
                </div>
              </Accordion.Trigger>
            </div>
            
            <Accordion.Content class="pt-0 pb-0">
              <div class="pl-4">
                {#if children.length > 0}
                  <svelte:self 
                    containers={container.children || []}
                    {selectedContainer}
                    onContainerSelect={onContainerSelect}
                    onContainerToggle={onContainerToggle}
                    onItemDrop={onItemDrop}
                  />
                {/if}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        {:else}
          <!-- Leaf node (no children) -->
          <div 
            class="folder-header {isSelected ? 'selected' : ''}"
            style={getIndentStyle(level)}
            on:click={() => handleSelect(container.id)}
            use:draggable={{
              container: container.id,
              dragData: container
            }}
          >
            <span class="w-4 mr-1"></span>
            <Icon {...iconProps} />
            <span class="folder-name">{container.containerName}</span>
            
            {#if shouldShowInfoIcon(container.id)}
              <Tooltip>
                <TooltipTrigger>
                  <span class="info-icon">
                    <Icon icon="material-symbols:information-outline" size={12} class="text-gray-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="text-xs">Additional info about {container.containerName}</p>
                </TooltipContent>
              </Tooltip>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </Accordion.Root>
</div>

<style>
  .folder-tree {
    width: 100%;
    user-select: none;
  }
  
  .folder-header {
    display: flex;
    align-items: center;
    padding: 0.35rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.15s ease;
  }
  
  .folder-header:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .folder-header.selected {
    background-color: var(--selected-bg, #e5e7eb);
  }
  
  .folder-name {
    font-size: 0.9rem;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .info-icon {
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
    opacity: 0.6;
  }
  
  .accordion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    min-width: 14px;
  }
  
  /* Drag and drop styling */
  :global(.dragging) {
    opacity: 0.5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  :global(.drag-over) {
    background-color: rgba(59, 130, 246, 0.1);
    border-radius: 4px;
  }
</style>