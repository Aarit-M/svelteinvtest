<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    import * as Accordion from "$lib/components/ui/accordion";
    import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
    import { draggable, droppable, type DragDropState, dndState } from '$lib/index';
    import type { Container, Item } from '$lib/types';
    import { cn } from '$lib/utils';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { GripVertical } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
  
    export let containers: Container[] = [];
    export let selectedContainer: string | null = null;
    export let onContainerSelect: (id: string) => void = () => {};
    export let onContainerToggle: (id: string) => void = () => {};
    export let onItemDrop: (containerId: string, itemId: string) => void = () => {};
    
    const dispatch = createEventDispatcher();
    
    // Modal state for container information
    let showInfoModal = false;
    let selectedContainerInfo: Container | null = null;
    
    // Drag and drop state
    let dragPreviewElement: HTMLElement | null = null;
    let currentDragData: any = null;
    let dragOverContainer: string | null = null;
    let dropEdge: 'top' | 'bottom' | null = null;
    
    // Keep track of mouse position
    let mouseY = 0;
    let mouseX = 0;

    // Subscribe to dndState to monitor drag operations
    let unsubscribe: (() => void) | null = null;
    
    onMount(() => {
      // Create subscription to dndState
      unsubscribe = dndState.subscribe((state) => {
        currentDragData = state.draggedItem;
        dragOverContainer = state.targetContainer;
      });
      
      // Add mousemove event listener for drag preview positioning
      window.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        window.removeEventListener('mousemove', handleMouseMove);
      };
    });
    
    function handleMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (dragPreviewElement) {
        // Position the drag preview near the cursor
        dragPreviewElement.style.left = `${mouseX + 16}px`;
        dragPreviewElement.style.top = `${mouseY + 8}px`;
      }
    }

    // Function to get the appropriate folder icon based on nesting level
    function getFolderIcon(level: number, isSelected: boolean): { icon: string, class: string } {
      // Use the specified icons: folder-rounded for main folders (level 0), 
      // folder-outline-rounded for nested folders (level > 0)
      const isMainFolder = level === 0;
      const iconName = isMainFolder 
                       ? "material-symbols:folder-rounded" 
                       : "material-symbols:folder-outline-rounded";
      
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
    function handleDrop(containerId: string, state: DragDropState<any>, event: MouseEvent) {
      if (!state.draggedItem) return;
      
      // Flash effect on drop
      const targetElement = event.currentTarget as HTMLElement;
      if (targetElement) {
        triggerPostMoveFlash(targetElement);
      }
      
      onItemDrop(containerId, state.draggedItem.id);
      
      // Add toast notification for item move
      const itemName = state.draggedItem.containerName || state.draggedItem.itemName || 'Item';
      const containerName = containers.find(c => c.id === containerId)?.containerName || 'location';
      toast.success(`Moved "${itemName}" to "${containerName}"`, {
        position: 'bottom-right',
        duration: 3000,
      });
      
      // Reset drop edge
      dropEdge = null;
    }
    
    // Function to handle drag over
    function handleDragOver(containerId: string, event: DragEvent, state: DragDropState<any>) {
      const element = event.currentTarget as HTMLElement;
      if (!element) return;
      
      // Calculate position to determine if dropping at top or bottom
      const rect = element.getBoundingClientRect();
      const y = event.clientY;
      
      const relativeY = y - rect.top;
      const threshold = rect.height / 2;
      
      // Set the drop edge based on position
      dropEdge = relativeY < threshold ? 'top' : 'bottom';
    }
    
    // Function to handle drag leave
    function handleDragLeave() {
      // Reset drop edge
      dropEdge = null;
    }
    
    // Function to handle drag start
    function handleDragStart(container: Container) {
      // Create drag preview element
      const preview = document.createElement('div');
      preview.className = "bg-white shadow-lg border border-solid rounded p-2 pl-2 z-50 fixed";
      preview.style.position = 'fixed';
      preview.style.pointerEvents = 'none';
      preview.style.left = `${mouseX + 16}px`;
      preview.style.top = `${mouseY + 8}px`;
      preview.style.opacity = '0.9';
      
      // Add content to the preview
      preview.innerHTML = `
        <div class="flex items-center">
          <span class="h-5 w-5 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-folder">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
            </svg>
          </span>
          <span class="truncate">${container.containerName}</span>
        </div>
      `;
      
      // Add to the body
      document.body.appendChild(preview);
      dragPreviewElement = preview;
    }
    
    // Function to handle drag end
    function handleDragEnd() {
      // Remove drag preview
      if (dragPreviewElement) {
        document.body.removeChild(dragPreviewElement);
        dragPreviewElement = null;
      }
      
      // Reset drop edge
      dropEdge = null;
    }
    
    // Function to show container info modal
    function showContainerInfo(container: Container, event: Event) {
      event.stopPropagation();
      selectedContainerInfo = container;
      showInfoModal = true;
    }
    
    // Helper to check if a container should show info icon
    function shouldShowInfoIcon(container: Container): boolean {
      if (container?.image || container?.description) return true;
      return ['kearnys-desk', 'back-corner-shelf', 'box-1', 'box-2', 'box-3', 'small-cabinet'].includes(container.id);
    }
    
    // Helper to get indent style for nested levels
    function getIndentStyle(level: number): string {
      return `padding-left: ${level * 12}px;`;
    }
    
    // Get placeholder image for container based on ID
    function getContainerImage(container: Container): string {
      if (container?.image) return container.image;
      
      // Placeholder images based on container ID
      const placeholders: Record<string, string> = {
        'kearnys-desk': '/assets/images/desk.jpg',
        'back-corner-shelf': '/assets/images/shelf.jpg',
        'box-1': '/assets/images/box1.jpg',
        'box-2': '/assets/images/box2.jpg',
        'box-3': '/assets/images/box3.jpg',
        'small-cabinet': '/assets/images/cabinet.jpg'
      };
      
      return placeholders[container.id] || '/assets/images/default-container.jpg';
    }
    
    // Function to trigger a flash effect on drop
    function triggerPostMoveFlash(element: HTMLElement) {
      element.classList.add('post-drop-flash');
      setTimeout(() => {
        element.classList.remove('post-drop-flash');
      }, 500);
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
        class="folder-item relative {isSelected ? 'folder-selected' : ''}"
        use:droppable={{
          container: container.id,
          callbacks: {
            onDrop: (state: DragDropState<any>, event: any) => handleDrop(container.id, state, event),
            onDragEnter: () => { dragOverContainer = container.id; },
            onDragOver: () => {
              // Calculate the drop position based on the last known mouse position
              const element = document.querySelector(`[data-container-id="${container.id}"]`) as HTMLElement;
              if (element) {
                const rect = element.getBoundingClientRect();
                const y = mouseY;
                const relativeY = y - rect.top;
                const threshold = rect.height / 2;
                dropEdge = relativeY < threshold ? 'top' : 'bottom';
              }
            },
            onDragLeave: handleDragLeave
          }
        }}
        data-container-id={container.id}
        class:drag-over={dragOverContainer === container.id}
        class:drop-top={dragOverContainer === container.id && dropEdge === 'top'}
        class:drop-bottom={dragOverContainer === container.id && dropEdge === 'bottom'}
      >
        {#if hasChildren}
          <Accordion.Item value={container.id} class="border-none">
            <div 
              class="folder-header {isSelected ? 'selected' : ''}"
              style={getIndentStyle(level)}
              on:click={() => handleSelect(container.id)}
              role="button"
              tabindex="0"
              on:keydown={(e: KeyboardEvent) => e.key === 'Enter' && handleSelect(container.id)}
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
                  
                  {#if shouldShowInfoIcon(container)}
                    <button 
                      class="info-icon ml-1.5 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      on:click={(e) => showContainerInfo(container, e)}
                      aria-label="Show container information"
                    >
                      <Icon icon="material-symbols:info-i" class="h-4 w-4 text-muted-foreground" />
                    </button>
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
              dragData: container,
              callbacks: {
                onDragStart: () => {
                  handleDragStart(container);
                },
                onDragEnd: () => {
                  handleDragEnd();
                }
              }
            }}
            role="button"
            tabindex="0"
            on:keydown={(e: KeyboardEvent) => e.key === 'Enter' && handleSelect(container.id)}
          >
            <div class="flex items-center w-full">
              <div class="drag-handle mr-1">
                <GripVertical size={14} class="text-gray-400" />
              </div>
              <Icon {...iconProps} />
              <span class="folder-name">{container.containerName}</span>
              
              {#if shouldShowInfoIcon(container)}
                <button 
                  class="info-icon ml-1.5 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  on:click={(e) => showContainerInfo(container, e)}
                  aria-label="Show container information"
                >
                  <Icon icon="material-symbols:info-i" class="h-4 w-4 text-muted-foreground" />
                </button>
              {/if}
            </div>
          </div>
        {/if}
        
        <!-- Drop indicators -->
        {#if dragOverContainer === container.id && dropEdge === 'top'}
          <div class="drop-indicator drop-indicator-top"></div>
        {/if}
        {#if dragOverContainer === container.id && dropEdge === 'bottom'}
          <div class="drop-indicator drop-indicator-bottom"></div>
        {/if}
      </div>
    {/each}
  </Accordion.Root>
</div>

<!-- Container Info Modal -->
<Dialog.Root bind:open={showInfoModal}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>{selectedContainerInfo?.containerName || 'Container'} Details</Dialog.Title>
    </Dialog.Header>
    {#if selectedContainerInfo}
      <div class="space-y-4">
        {#if getContainerImage(selectedContainerInfo)}
          <div class="overflow-hidden rounded-md border border-border">
            <img
              src={getContainerImage(selectedContainerInfo)}
              alt={selectedContainerInfo.containerName}
              class="aspect-video object-cover w-full"
            />
          </div>
        {/if}
        
        {#if selectedContainerInfo.description}
          <div class="text-sm text-muted-foreground">
            {selectedContainerInfo.description}
          </div>
        {/if}
      </div>
    {/if}
    <Dialog.Footer>
      <Button on:click={() => showInfoModal = false} class="w-full sm:w-auto">Close</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

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
    background-color: hsl(var(--muted));
  }
  
  .folder-header.selected {
    background-color: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
  }
  
  .folder-item.folder-selected {
    background-color: hsl(var(--primary) / 0.05);
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
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.15s ease;
  }
  
  .info-icon:hover {
    opacity: 1;
  }
  
  .accordion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(var(--muted-foreground));
    min-width: 14px;
  }
  
  .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    width: 16px;
    height: 16px;
    opacity: 0.3;
    transition: opacity 0.2s ease;
  }
  
  .folder-header:hover .drag-handle {
    opacity: 0.6;
  }
  
  .folder-item.drag-over {
    background-color: hsl(var(--primary) / 0.05);
  }
  
  /* Drop indicators */
  .drop-indicator {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background-color: hsl(var(--primary));
    z-index: 10;
  }
  
  .drop-indicator::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: hsl(var(--primary));
    border-radius: 50%;
    left: -4px;
    top: -3px;
  }
  
  .drop-indicator-top {
    top: 0;
  }
  
  .drop-indicator-bottom {
    bottom: 0;
  }
  
  /* Animation for post-drop flash effect */
  .post-drop-flash {
    animation: flashBg 0.5s ease-out;
  }
  
  @keyframes flashBg {
    0% { background-color: hsl(var(--primary) / 0.2); }
    100% { background-color: transparent; }
  }
</style>