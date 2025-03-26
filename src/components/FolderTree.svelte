<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    import * as Accordion from "$lib/components/ui/accordion";
    import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
    import type { Container, Item } from '$lib/types';
    import { cn } from '$lib/utils';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Textarea } from '$lib/components/ui/textarea';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Folder, ChevronRight, ChevronDown, MoreHorizontal, FolderPlus, Star, StarOff, Search, Info, FileText } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    import { getPlaceholderImage } from '$lib/utils';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
  
    export let containers: Container[] = [];
    export let selectedContainer: string | null = null;
    export let onContainerSelect: (id: string) => void = () => {};
    export let onContainerToggle: (id: string) => void = () => {};
    export let onItemDrop: (containerId: string, itemId: string) => void = () => {};
    export let onViewAllItems: () => void = () => {};
    export let onItemClick: (item: Item) => void = () => {};
    
    const dispatch = createEventDispatcher();
    
    // Modal state for container information
    let showInfoModal = false;
    let selectedContainerInfo: Container | null = null;
    let editMode = false; // Track if we're in edit mode within the info modal
    
    // For editing containers
    let editedContainerName = '';
    let editedContainerDescription = '';
    let editedContainerImage: string | undefined = undefined;
    
    // For image upload
    let fileInput: HTMLInputElement;
    let showCamera = false;
    let videoElement: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let cameraActive = false;
    let mediaStream: MediaStream | null = null;
    
    // Animation duration
    const flipDurationMs = 300;
    
    // Track expanded containers with a Set for easier lookup
    let expandedContainers = new Set<string>();
    
    // Add these new variables to track drag and drop state
    let draggedContainerId: string | null = null;
    let isDragging = false;
    
    // Initialize with all containers expanded by default
    onMount(() => {
      // Expand all top-level containers by default
      containers.forEach(container => {
        expandedContainers.add(container.id);
        
        // Also expand all child containers
        if (container.children && container.children.length > 0) {
          expandAllChildren(container.children);
        }
      });
    });
    
    // Recursively expand all children
    function expandAllChildren(children: Container[]) {
      children.forEach(child => {
        expandedContainers.add(child.id);
        if (child.children && child.children.length > 0) {
          expandAllChildren(child.children);
        }
      });
    }
    
    // Function to show container info modal
    function showContainerInfo(container: Container, event: Event) {
      event.stopPropagation();
      selectedContainerInfo = container;
      editedContainerName = container.containerName;
      editedContainerDescription = container.description || '';
      editedContainerImage = container.image;
      editMode = false; // Start in view mode
      showInfoModal = true;
    }
    
    function showEditContainerModal(container: Container, event: Event) {
      event.stopPropagation();
      selectedContainerInfo = container;
      editedContainerName = container.containerName;
      editedContainerDescription = container.description || '';
      editedContainerImage = container.image;
      editMode = true; // Start in edit mode
      showInfoModal = true;
    }
    
    function handleEditContainer() {
      if (!selectedContainerInfo || !editedContainerName.trim()) return;
      
      // Find and update the container in the containers array
      const updateNestedContainer = (containers: Container[]): Container[] => {
        return containers.map(container => {
          if (container.id === selectedContainerInfo!.id) {
            return { 
              ...container, 
              containerName: editedContainerName,
              description: editedContainerDescription || undefined,
              image: editedContainerImage
            };
          }
          
          if (container.children && container.children.length > 0) {
            return {
              ...container,
              children: updateNestedContainer(container.children)
            };
          }
          
          return container;
        });
      };
      
      containers = updateNestedContainer(containers);
      editMode = false; // Switch back to view mode after saving
      toast.success("Location updated successfully");
    }
    
    // Helper to check if a container should show info icon
    function shouldShowInfoIcon(container: Container): boolean {
      // Always show info icon - temporarily for testing
      return true;
    }
    
    // Helper to get indent style for nested levels
    function getIndentStyle(level: number): string {
      return `padding-left: ${level * 16}px;`;
    }
    
    // Function to get container image or default
    function getContainerImage(container: Container): string {
      return container.image || getPlaceholderImage('container', container.containerName);
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
      
      if (expandedContainers.has(id)) {
        expandedContainers.delete(id);
      } else {
        expandedContainers.add(id);
      }
      
      onContainerToggle(id);
      expandedContainers = expandedContainers; // Trigger reactivity
    }
    
    // Function to get accordion values based on expanded containers
    function getAccordionValues(containerId: string): string[] {
      return expandedContainers.has(containerId) ? [containerId] : [];
    }
    
    // Function to handle accordion value change
    function handleAccordionValueChange(containerId: string, values: string[]) {
      if (values.includes(containerId)) {
        expandedContainers.add(containerId);
      } else {
        expandedContainers.delete(containerId);
      }
      expandedContainers = expandedContainers; // Trigger reactivity
      onContainerToggle(containerId);
    }
    
    // Fix TypeScript errors for accordion value change
    function safeHandleAccordionValueChange(containerId: string, values: unknown) {
      // Ensure values is an array of strings
      const valueArray = Array.isArray(values) ? values as string[] : [];
      handleAccordionValueChange(containerId, valueArray);
    }
    
    // DnD functions for containers with improved cross-level movement
    function handleContainerDndConsider(event: any) {
      const detail = event.detail;
      
      // Track that we're currently dragging
      isDragging = true;
      
      // Store the ID of the container being dragged
      const draggedContainer = detail.items.find((item: Container) => 
        !containers.some(c => c.id === item.id)
      );
      
      if (draggedContainer) {
        draggedContainerId = draggedContainer.id;
      }
      
      // Update the top-level containers state
      containers = detail.items;
    }
    
    function handleContainerDndFinalize(event: any) {
      const detail = event.detail;
      
      // Reset drag state
      isDragging = false;
      
      // Update the container state
      containers = detail.items;
      
      // Find the dragged container to check if it moved from a nested position
      if (draggedContainerId) {
        // This ensures we don't try to leave the dragged container in its original parent
        removeNestedContainer(containers, draggedContainerId);
        draggedContainerId = null;
      }
      
      toast.success("Container moved successfully");
    }
    
    // Update the nested container DnD functions
    function handleNestedContainerDndConsider(event: any, parentContainer: Container) {
      const detail = event.detail;
      
      // Track that we're currently dragging
      isDragging = true;
      
      if (parentContainer && parentContainer.children) {
        // Find the container that's being dragged (if any)
        const draggedContainer = detail.items.find((item: Container) => 
          !parentContainer.children!.some(c => c.id === item.id)
        );
        
        if (draggedContainer) {
          draggedContainerId = draggedContainer.id;
          
          // Update parent reference for the dragged container
          draggedContainer.parentId = parentContainer.id;
        }
        
        // Update the children of this parent
        parentContainer.children = detail.items;
        
        // Trigger reactivity
        containers = [...containers];
      }
    }
    
    function handleNestedContainerDndFinalize(event: any, parentContainer: Container) {
      const detail = event.detail;
      
      // Reset drag state
      isDragging = false;
      
      if (parentContainer && parentContainer.children) {
        // If we have a dragged container from another parent
        if (draggedContainerId) {
          // Update its parent ID
          const draggedContainer = detail.items.find((item: Container) => item.id === draggedContainerId);
          if (draggedContainer) {
            draggedContainer.parentId = parentContainer.id;
            
            // Remove it from its previous parent's children
            removeNestedContainer(containers, draggedContainerId);
          }
          draggedContainerId = null;
        }
        
        // Set the children array for this parent
        parentContainer.children = detail.items;
        
        // Trigger reactivity
        containers = [...containers];
        
        toast.success("Container moved successfully");
      }
    }
    
    // Helper to recursively remove a nested container from its original parent
    function removeNestedContainer(containers: Container[], containerId: string): boolean {
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        
        // Skip if this is the container we're looking for (shouldn't happen at top level)
        if (container.id === containerId) continue;
        
        // If this container has children, check them
        if (container.children && container.children.length > 0) {
          // See if our target container is a direct child
          const childIndex = container.children.findIndex(child => child.id === containerId);
          
          if (childIndex !== -1) {
            // Remove from this parent's children
            container.children.splice(childIndex, 1);
            return true;
          }
          
          // If not a direct child, check nested children recursively
          if (removeNestedContainer(container.children, containerId)) {
            return true;
          }
        }
      }
      
      return false;
    }
    
    // DnD functions for items
    function handleItemsDndConsider(event: any, container: Container) {
      const detail = event.detail;
      if (container) {
        container.items = detail.items;
        containers = [...containers];
      }
    }
    
    function handleItemsDndFinalize(event: any, container: Container) {
      const detail = event.detail;
      if (container) {
        // Update items with the correct location path
        const updatedItems = detail.items.map((item: Item) => ({
          ...item,
          itemLocation: { path: container.containerLocation.path }
        }));
        
        container.items = updatedItems;
        containers = [...containers];
        toast.success(`Item order updated in ${container.containerName}`);
      }
    }
    
    // Handle item click
    function handleItemClick(item: Item) {
      onItemClick(item);
    }
    
    // Get appropriate folder icon based on level
    function getFolderIcon(container: Container, isSelected: boolean, level: number): string {
      // Use folder-outline-rounded for odd levels, folder-rounded for even levels
      const isOddLevel = level % 2 !== 0;
      return isOddLevel ? "material-symbols:folder-outline-rounded" : "material-symbols:folder-rounded";
    }
    
    // Recursive function to render container hierarchy
    function renderContainers(containers: Container[], level = 0): any[] {
      if (!containers || containers.length === 0) return [];
      
      return containers.map(container => {
        const hasChildren = Boolean(container.children && container.children.length > 0);
        const hasItems = Boolean(container.items && container.items.length > 0);
        const isSelected = selectedContainer === container.id;
        
        return {
          container,
          hasChildren,
          hasItems,
          isSelected,
          folderIcon: getFolderIcon(container, isSelected, level),
          level,
          children: hasChildren && container.children ? renderContainers(container.children, level + 1) : []
        };
      });
    }
    
    $: renderedContainers = renderContainers(containers);

    // Image upload handling functions
    function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        
        // Check file type
        if (!file.type.match('image.*')) {
          toast.error("Please select an image file");
          return;
        }
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image too large. Please select an image under 5MB");
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            editedContainerImage = result;
            toast.success("Image uploaded successfully");
          }
        };
        reader.onerror = () => {
          toast.error("Failed to read file");
        };
        
        reader.readAsDataURL(file);
      }
    }

    function triggerFileInput() {
      if (fileInput) {
        fileInput.click();
      }
    }

    // Camera functionality
    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera not supported in this browser");
        }
        
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoElement) {
          videoElement.srcObject = mediaStream;
          cameraActive = true;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        toast.error("Unable to access camera. Please check permissions.");
      }
    }

    function stopCamera() {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject = null;
        }
        mediaStream = null;
        cameraActive = false;
      }
    }

    function capturePhoto() {
      if (videoElement && canvasElement && cameraActive) {
        const context = canvasElement.getContext('2d');
        
        if (context) {
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
          
          try {
            // Compress image for storage efficiency
            const imageData = canvasElement.toDataURL('image/jpeg', 0.7);
            editedContainerImage = imageData;
            showCamera = false;
            stopCamera();
            toast.success("Photo captured successfully");
          } catch (err) {
            console.error("Error capturing photo: ", err);
            toast.error("Failed to capture photo");
          }
        }
      }
    }

    function handleShowCamera() {
      showCamera = true;
      // Start camera after dialog is open
      setTimeout(() => {
        startCamera();
      }, 300);
    }

    function handleCameraClose() {
      stopCamera();
      showCamera = false;
    }

    function removeImage() {
      editedContainerImage = undefined;
      toast.success("Image removed");
    }
</script>
  
<div class="folder-tree">
  <!-- All Items button at the top -->
  <Button 
    variant="ghost" 
    class="w-full flex items-center justify-start px-3 py-2 mb-2 text-sm"
    on:click={onViewAllItems}
  >
    <Icon icon="material-symbols:indeterminate-check-box" class="h-5 w-5 mr-2" />
    <span>View All Items</span>
  </Button>

  <!-- Main container list -->
  <div class="container-list" use:dndzone={{items: containers, flipDurationMs, type: 'top-level-containers'}} on:consider={handleContainerDndConsider} on:finalize={handleContainerDndFinalize}>
    {#each containers as container (container.id)}
      <div animate:flip={{duration: flipDurationMs}} class="container-wrapper">
        <Accordion.Root 
          value={getAccordionValues(container.id)} 
          onValueChange={(values) => safeHandleAccordionValueChange(container.id, values)}
        >
          <div class="folder-item relative {selectedContainer === container.id ? 'folder-selected' : ''}" data-container-id={container.id}>
            {#if container.children && container.children.length > 0}
          <Accordion.Item value={container.id} class="border-none">
            <div 
                  class="folder-header {selectedContainer === container.id ? 'selected' : ''}"
                  style={getIndentStyle(0)}
              on:click={() => handleSelect(container.id)}
              role="button"
              tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && handleSelect(container.id)}
            >
                  <Accordion.Trigger class="flex py-1 px-0 hover:no-underline w-full justify-start" on:click={(e) => {
                    e.stopPropagation();
                    toggleContainer(container.id, e);
                  }}>
                <div class="flex items-center w-full">
                      <Icon icon={getFolderIcon(container, selectedContainer === container.id, 0)} 
                            class="h-5 w-5 mr-2 {selectedContainer === container.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}" />
                  <span class="folder-name">{container.containerName}</span>
                  
                      <div class="ml-auto flex">
                    <button 
                          class="info-icon p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      on:click={(e) => showContainerInfo(container, e)}
                          aria-label="View/edit location"
                    >
                          <Icon icon="material-symbols:info-outline-rounded" class="h-5 w-5 text-gray-500 dark:text-white-400" />
                    </button>
                      </div>
                </div>
              </Accordion.Trigger>
            </div>
            
            <Accordion.Content class="pt-0 pb-0">
                  <!-- Nested containers -->
                  {#if container.children && container.children.length > 0}
                    <div class="pl-4">
                      <div class="nested-container-list" use:dndzone={{items: container.children, flipDurationMs, type: 'nested-containers'}} on:consider={(e) => handleNestedContainerDndConsider(e, container)} on:finalize={(e) => handleNestedContainerDndFinalize(e, container)}>
                        {#each container.children as childContainer (childContainer.id)}
                          <div animate:flip={{duration: flipDurationMs}}>
                            <Accordion.Root 
                              value={getAccordionValues(childContainer.id)} 
                              onValueChange={(values) => safeHandleAccordionValueChange(childContainer.id, values)}
                            >
                              <Accordion.Item value={childContainer.id} class="border-none">
                                <div 
                                  class="folder-header {selectedContainer === childContainer.id ? 'selected' : ''}"
                                  style={getIndentStyle(1)}
                                  on:click={() => handleSelect(childContainer.id)}
                                  role="button"
                                  tabindex="0"
                                  on:keydown={(e) => e.key === 'Enter' && handleSelect(childContainer.id)}
                                >
                                  <Accordion.Trigger class="flex py-1 px-0 hover:no-underline w-full justify-start" on:click={(e) => {
                                    e.stopPropagation();
                                    toggleContainer(childContainer.id, e);
                                  }}>
                                    <div class="flex items-center w-full">
                                      <Icon icon={getFolderIcon(childContainer, selectedContainer === childContainer.id, 1)} 
                                            class="h-5 w-5 mr-2 {selectedContainer === childContainer.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}" />
                                      <span class="folder-name">{childContainer.containerName}</span>
                                      
                                      <div class="ml-auto flex">
                                        <button 
                                          class="info-icon p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                          on:click={(e) => showContainerInfo(childContainer, e)}
                                          aria-label="View/edit location"
                                        >
                                          <Icon icon="material-symbols:info-outline-rounded" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                      </div>
                                    </div>
                                  </Accordion.Trigger>
                                </div>

                                <Accordion.Content class="pt-0 pb-0">
                                  <!-- Recursively render deeper nested containers -->
                                  {#if childContainer.children && childContainer.children.length > 0}
              <div class="pl-4">
                                      <div class="nested-container-list" use:dndzone={{items: childContainer.children, flipDurationMs, type: 'nested-containers'}} on:consider={(e) => handleNestedContainerDndConsider(e, childContainer)} on:finalize={(e) => handleNestedContainerDndFinalize(e, childContainer)}>
                                        {#each childContainer.children as grandChild (grandChild.id)}
                                          <div>
                                            <Accordion.Root 
                                              value={getAccordionValues(grandChild.id)} 
                                              onValueChange={(values) => safeHandleAccordionValueChange(grandChild.id, values)}
                                            >
                                              <Accordion.Item value={grandChild.id} class="border-none">
                                                <div 
                                                  class="folder-header {selectedContainer === grandChild.id ? 'selected' : ''}"
                                                  style={getIndentStyle(1)}
                                                  on:click={() => handleSelect(grandChild.id)}
                                                  role="button"
                                                  tabindex="0"
                                                >
                                                  <Accordion.Trigger class="flex py-1 px-0 hover:no-underline w-full justify-start" on:click={(e) => {
                                                    e.stopPropagation();
                                                    toggleContainer(grandChild.id, e);
                                                  }}>
                                                    <div class="flex items-center w-full">
                                                      <Icon icon={getFolderIcon(grandChild, selectedContainer === grandChild.id, 2)} 
                                                            class="h-5 w-5 mr-2 {selectedContainer === grandChild.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}" />
                                                      <span class="folder-name">{grandChild.containerName}</span>
                                                      
                                                      <div class="ml-auto flex">
                                                        <button 
                                                          class="info-icon p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                          on:click={(e) => showContainerInfo(grandChild, e)}
                                                          aria-label="View/edit location"
                                                        >
                                                          <Icon icon="material-symbols:info-outline-rounded" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </Accordion.Trigger>
                                                </div>
                                                
                                                <Accordion.Content class="pt-0 pb-0">
                                                  <!-- Display items inside this grandchild container -->
                                                  {#if grandChild.items && grandChild.items.length > 0}
                                                    <div class="items-list pl-6" use:dndzone={{items: grandChild.items, flipDurationMs, type: 'items'}} on:consider={(e) => handleItemsDndConsider(e, grandChild)} on:finalize={(e) => handleItemsDndFinalize(e, grandChild)}>
                                                      {#each grandChild.items as item (item.id)}
                                                        <div 
                                                          class="item-row flex items-center py-1 px-2 my-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                                          on:click={() => handleItemClick(item)}
                                                          role="button"
                                                          tabindex="0"
                                                        >
                                                          <Icon icon="material-symbols:indeterminate-check-box" class="h-5 w-5 mr-2 text-muted-foreground" />
                                                          <span class="truncate text-sm text-muted-foreground">{item.itemName}</span>
                                                        </div>
                                                      {/each}
                                                    </div>
                                                  {/if}
                                                </Accordion.Content>
                                              </Accordion.Item>
                                            </Accordion.Root>
                                          </div>
                                        {/each}
                                      </div>
                                    </div>
                                  {/if}
                                  
                                  <!-- Items inside this child container -->
                                  {#if childContainer.items && childContainer.items.length > 0}
                                    <div class="items-list pl-6" use:dndzone={{items: childContainer.items, flipDurationMs, type: 'items'}} on:consider={(e) => handleItemsDndConsider(e, childContainer)} on:finalize={(e) => handleItemsDndFinalize(e, childContainer)}>
                                      {#each childContainer.items as item (item.id)}
                                        <div 
                                          animate:flip={{duration: flipDurationMs}}
                                          class="item-row flex items-center py-1 px-2 my-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                          on:click={() => handleItemClick(item)}
                                          role="button"
                                          tabindex="0"
                                          on:keydown={(e) => e.key === 'Enter' && handleItemClick(item)}
                                        >
                                          <Icon icon="material-symbols:indeterminate-check-box" class="h-5 w-5 mr-2 text-muted-foreground" />
                                          <span class="truncate text-sm text-muted-foreground">{item.itemName}</span>
                                        </div>
                                      {/each}
                                    </div>
                                  {/if}
                                </Accordion.Content>
                              </Accordion.Item>
                            </Accordion.Root>
                          </div>
                        {/each}
                      </div>
                    </div>
                {/if}

                  <!-- Items directly in this container -->
                  {#if container.items && container.items.length > 0}
                    <div class="items-list pl-6" use:dndzone={{items: container.items, flipDurationMs, type: 'items'}} on:consider={(e) => handleItemsDndConsider(e, container)} on:finalize={(e) => handleItemsDndFinalize(e, container)}>
                      {#each container.items as item (item.id)}
                        <div 
                          animate:flip={{duration: flipDurationMs}}
                          class="item-row flex items-center py-1 px-2 my-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                          on:click={() => handleItemClick(item)}
                          role="button"
                          tabindex="0"
                          on:keydown={(e) => e.key === 'Enter' && handleItemClick(item)}
                        >
                          <Icon icon="material-symbols:indeterminate-check-box" class="h-5 w-5 mr-2 text-muted-foreground" />
                          <span class="truncate text-sm text-muted-foreground">{item.itemName}</span>
                        </div>
                      {/each}
              </div>
                  {/if}
            </Accordion.Content>
          </Accordion.Item>
        {:else}
          <!-- Leaf node (no children) -->
          <div 
                class="folder-header {selectedContainer === container.id ? 'selected' : ''}"
                style={getIndentStyle(0)}
            on:click={() => handleSelect(container.id)}
            role="button"
            tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && handleSelect(container.id)}
          >
            <div class="flex items-center w-full">
                  <Icon icon={getFolderIcon(container, selectedContainer === container.id, 0)} 
                        class="h-5 w-5 mr-2 {selectedContainer === container.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}" />
              <span class="folder-name">{container.containerName}</span>
              
                  <div class="ml-auto flex">
                <button 
                      class="info-icon p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  on:click={(e) => showContainerInfo(container, e)}
                      aria-label="View/edit location"
                >
                      <Icon icon="material-symbols:info-outline-rounded" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                  </div>
                </div>
              </div>

              <!-- Items in this leaf container -->
              {#if container.items && container.items.length > 0}
                <div class="items-list pl-6" use:dndzone={{items: container.items, flipDurationMs, type: 'items'}} on:consider={(e) => handleItemsDndConsider(e, container)} on:finalize={(e) => handleItemsDndFinalize(e, container)}>
                  {#each container.items as item (item.id)}
                    <div 
                      animate:flip={{duration: flipDurationMs}}
                      class="item-row flex items-center py-1 px-2 my-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      on:click={() => handleItemClick(item)}
                      role="button"
                      tabindex="0"
                      on:keydown={(e) => e.key === 'Enter' && handleItemClick(item)}
                    >
                      <Icon icon="material-symbols:indeterminate-check-box" class="h-5 w-5 mr-2 text-muted-foreground" />
                      <span class="truncate text-sm text-muted-foreground">{item.itemName}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            {/if}
          </div>
        </Accordion.Root>
      </div>
    {/each}
  </div>
</div>

<!-- Container Info/Edit Modal -->
<Dialog.Root bind:open={showInfoModal}>
  <Dialog.Content class="sm:max-w-md bg-white dark:bg-gray-950">
    <Dialog.Header>
      <Dialog.Title>
        {#if editMode}
          Edit {selectedContainerInfo?.containerName || 'Location'}
        {:else}
          {selectedContainerInfo?.containerName || 'Location'} Details
        {/if}
      </Dialog.Title>
      {#if editMode}
        <Dialog.Description>Make changes to your location properties</Dialog.Description>
      {/if}
    </Dialog.Header>
    
    {#if selectedContainerInfo}
      {#if editMode}
        <!-- Edit Mode -->
        <form on:submit|preventDefault={handleEditContainer}>
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <label for="containerName" class="text-sm font-medium">Location Name</label>
              <Input
                id="containerName"
                placeholder="Location Name"
                bind:value={editedContainerName}
              />
            </div>
            
            <div class="space-y-2">
              <label for="containerDescription" class="text-sm font-medium">Description</label>
              <Textarea
                id="containerDescription"
                placeholder="Description (optional)"
                bind:value={editedContainerDescription}
                rows={3}
              />
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium">Location Image</label>
              <div class="border rounded-md overflow-hidden">
                {#if editedContainerImage}
                  <div class="relative">
                    <img 
                      src={editedContainerImage} 
                      alt="Location preview" 
                      class="mx-auto max-h-48 object-contain"
                    />
                    <div class="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        on:click={removeImage}
                        class="bg-white dark:bg-gray-800 p-1 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Icon icon="material-symbols:delete-outline" class="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                {:else}
                  <div class="p-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      on:click={handleShowCamera}
                      class="h-24"
                    >
                      <Icon icon="material-symbols:photo-camera-outline" class="h-5 w-5 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      on:click={triggerFileInput}
                      class="h-24"
                    >
                      <Icon icon="material-symbols:upload" class="h-5 w-5 mr-2" />
                      Upload Image
                    </Button>
                    <!-- Hidden file input -->
                    <input 
                      type="file" 
                      bind:this={fileInput}
                      on:change={handleFileSelect}
                      accept="image/*"
                      class="hidden"
                    />
                  </div>
                {/if}
              </div>
            </div>
          </div>
          
          <Dialog.Footer>
            <Button type="button" variant="outline" on:click={() => editMode = false} class="mr-2">
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </Dialog.Footer>
        </form>
      {:else}
        <!-- View Mode -->
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
          
          <Dialog.Footer>
            <div class="flex w-full justify-between">
              <Button variant="outline" on:click={() => showInfoModal = false}>
                Close
              </Button>
              <Button on:click={() => editMode = true}>
                <Icon icon="material-symbols:edit" class="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </Dialog.Footer>
      </div>
      {/if}
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Camera Modal -->
{#if showCamera}
<Dialog.Root open={showCamera} onOpenChange={(isOpen) => !isOpen && handleCameraClose()}>
  <Dialog.Content class="sm:max-w-md animate-fade-in bg-white dark:bg-gray-950">
    <Dialog.Header>
      <Dialog.Title>Take a Photo</Dialog.Title>
    </Dialog.Header>
    
    <div class="space-y-4">
      <div class="relative bg-black rounded-md aspect-video flex items-center justify-center overflow-hidden">
        {#if cameraActive}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video 
            bind:this={videoElement} 
            autoplay 
            playsinline 
            class="w-full h-full object-cover"
          ></video>
        {:else}
          <div class="text-neutral-content p-4 text-center">
            <Icon icon="material-symbols:photo-camera-outline" class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Accessing camera...</p>
          </div>
        {/if}
        <canvas bind:this={canvasElement} class="hidden"></canvas>
      </div>
      
      <div class="flex gap-2">
        <Button 
          on:click={handleCameraClose} 
          variant="outline"
          class="flex-1"
        >
          Cancel
        </Button>
        <Button 
          on:click={capturePhoto} 
          class="flex-1"
          disabled={!cameraActive}
        >
          Capture Photo
        </Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
{/if}

<style>
  .folder-tree {
    width: 100%;
    min-width: 280px;
    user-select: none;
    padding: 0.5rem;
    border-radius: 0.375rem;
    overflow-x: hidden; /* Prevent horizontal scrolling */
    box-sizing: border-box; /* Include padding in width calculation */
  }
  
  .folder-header {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.15s ease;
    margin-bottom: 2px;
    width: 100%;
    box-sizing: border-box; /* Include padding in width calculation */
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
    margin: 0 0.5rem;
    max-width: calc(100% - 3.5rem); /* Provide more space for the folder name */
  }
  
  .info-icon, .edit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1; /* Make fully visible */
    transition: background-color 0.15s ease;
    margin-left: 0.25rem;
    width: 30px;
    height: 30px;
    z-index: 10;
  }
  
  .info-icon:hover, .edit-icon:hover {
    background-color: hsl(var(--muted));
  }
  
  .item-row {
    font-size: 0.85rem;
    transition: background-color 0.15s ease;
    border: 1px solid transparent;
    padding: 0.5rem 0.75rem;
    margin: 0.25rem 0;
  }
  
  .container-wrapper {
    margin-bottom: 4px;
  }
  
  .items-list {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
  }
  
  /* Make tree deeper levels have proper padding */
  .nested-container-list {
    padding-left: 0.5rem;
    width: 100%;
    box-sizing: border-box; /* Include padding in width calculation */
  }

  /* Add container to properly size the folder tree and prevent overflow */
  .container-list {
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
</style>