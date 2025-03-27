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
    
    let showInfoModal = false;
    let selectedContainerInfo: Container | null = null;
    let editMode = false;
    
    let editedContainerName = '';
    let editedContainerDescription = '';
    let editedContainerImage: string | undefined = undefined;
    
    let fileInput: HTMLInputElement;
    let showCamera = false;
    let videoElement: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let cameraActive = false;
    let mediaStream: MediaStream | null = null;
    let camError: string | null = null;
    
    const flipDurationMs = 300;
    
    let expandedContainers = new Set<string>();
    
    let draggedContainerId: string | null = null;
    let isDragging = false;
    
    onMount(() => {
      containers.forEach(container => {
        expandedContainers.add(container.id);
        
        if (container.children && container.children.length > 0) {
          expandAllChildren(container.children);
        }
      });
    });
    
    function expandAllChildren(children: Container[]) {
      children.forEach(child => {
        expandedContainers.add(child.id);
        if (child.children && child.children.length > 0) {
          expandAllChildren(child.children);
        }
      });
    }
    
    function showContainerInfo(container: Container, event: Event) {
      event.stopPropagation();
      selectedContainerInfo = container;
      editedContainerName = container.containerName;
      editedContainerDescription = container.description || '';
      editedContainerImage = container.image;
      editMode = false;
      showInfoModal = true;
    }
    
    function showEditContainerModal(container: Container, event: Event) {
      event.stopPropagation();
      selectedContainerInfo = container;
      editedContainerName = container.containerName;
      editedContainerDescription = container.description || '';
      editedContainerImage = container.image;
      editMode = true;
      showInfoModal = true;
    }
    
    function handleEditContainer() {
      if (!selectedContainerInfo || !editedContainerName.trim()) return;
      
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
      editMode = false;
      toast.success("Location updated successfully");
    }
    
    function shouldShowInfoIcon(container: Container): boolean {
      return true;
    }
    
    function getIndentStyle(level: number): string {
      return `padding-left: ${level * 16}px;`;
    }
    
    function getContainerImage(container: Container): string {
      return container.image || getPlaceholderImage('container', container.containerName);
    }
    
    function handleSelect(id: string) {
      selectedContainer = id;
      onContainerSelect(id);
      dispatch('selectContainer', id);
    }
    
    function toggleContainer(id: string, event?: Event) {
      if (event) event.stopPropagation();
      
      if (expandedContainers.has(id)) {
        expandedContainers.delete(id);
      } else {
        expandedContainers.add(id);
      }
      
      onContainerToggle(id);
      expandedContainers = expandedContainers;
    }
    
    function getAccordionValues(containerId: string): string[] {
      return expandedContainers.has(containerId) ? [containerId] : [];
    }
    
    function handleAccordionValueChange(containerId: string, values: string[]) {
      if (values.includes(containerId)) {
        expandedContainers.add(containerId);
      } else {
        expandedContainers.delete(containerId);
      }
      expandedContainers = expandedContainers;
      onContainerToggle(containerId);
    }
    
    function safeHandleAccordionValueChange(containerId: string, values: unknown) {
      const valueArray = Array.isArray(values) ? values as string[] : [];
      handleAccordionValueChange(containerId, valueArray);
    }
    
    function handleContainerDndConsider(event: any) {
      const detail = event.detail;
      
      isDragging = true;
      
      const draggedContainer = detail.items.find((item: Container) => 
        !containers.some(c => c.id === item.id)
      );
      
      if (draggedContainer) {
        draggedContainerId = draggedContainer.id;
      }
      
      containers = detail.items;
    }
    
    function handleContainerDndFinalize(event: any) {
      const detail = event.detail;
      
      isDragging = false;
      
      containers = detail.items;
      
      if (draggedContainerId) {
        removeNestedContainer(containers, draggedContainerId);
        draggedContainerId = null;
      }
      
      toast.success("Container moved successfully");
    }
    
    function handleNestedContainerDndConsider(event: any, parentContainer: Container) {
      const detail = event.detail;
      
      isDragging = true;
      
      if (parentContainer && parentContainer.children) {
        const draggedContainer = detail.items.find((item: Container) => 
          !parentContainer.children!.some(c => c.id === item.id)
        );
        
        if (draggedContainer) {
          draggedContainerId = draggedContainer.id;
          
          draggedContainer.parentId = parentContainer.id;
        }
        
        parentContainer.children = detail.items;
        
        containers = [...containers];
      }
    }
    
    function handleNestedContainerDndFinalize(event: any, parentContainer: Container) {
      const detail = event.detail;
      
      isDragging = false;
      
      if (parentContainer && parentContainer.children) {
        if (draggedContainerId) {
          const draggedContainer = detail.items.find((item: Container) => item.id === draggedContainerId);
          if (draggedContainer) {
            draggedContainer.parentId = parentContainer.id;
            
            removeNestedContainer(containers, draggedContainerId);
          }
          draggedContainerId = null;
        }
        
        parentContainer.children = detail.items;
        
        containers = [...containers];
        
        toast.success("Container moved successfully");
      }
    }
    
    function removeNestedContainer(containers: Container[], containerId: string): boolean {
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        
        if (container.id === containerId) continue;
        
        if (container.children && container.children.length > 0) {
          const childIndex = container.children.findIndex(child => child.id === containerId);
          
          if (childIndex !== -1) {
            container.children.splice(childIndex, 1);
            return true;
          }
          
          if (removeNestedContainer(container.children, containerId)) {
            return true;
          }
        }
      }
      
      return false;
    }
    
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
        const updatedItems = detail.items.map((item: Item) => ({
          ...item,
          itemLocation: { path: container.containerLocation.path }
        }));
        
        container.items = updatedItems;
        containers = [...containers];
        toast.success(`Item order updated in ${container.containerName}`);
      }
    }
    
    function handleItemClick(item: Item) {
      onItemClick(item);
    }
    
    function getFolderIcon(container: Container, isSelected: boolean, level: number): string {
      const isOddLevel = level % 2 !== 0;
      return isOddLevel ? "material-symbols:folder-outline-rounded" : "material-symbols:folder-rounded";
    }
    
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

    function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (!target.files || !target.files[0]) {
        console.log("No file selected");
        return;
      }
      
      console.log("File selected, processing...");
      const file = target.files[0];
      
      if (!file.type.match('image.*')) {
        console.error("Invalid file type:", file.type);
        toast.error("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        console.error("File too large:", file.size);
        toast.error("Image too large. Please select an image under 5MB");
        return;
      }
      
      toast.loading("Processing image...");
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          console.log("Image loaded successfully");
          editedContainerImage = result;
          toast.dismiss();
          toast.success("Image uploaded successfully");
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast.dismiss();
        toast.error("Failed to read file");
      };
      
      reader.readAsDataURL(file);
      
      target.value = '';
    }

    function triggerFileInput() {
      if (fileInput) {
        try {
          fileInput.click();
        } catch (err) {
          console.error("Error triggering file input:", err);
          toast.error("Unable to open file selector");
        }
      } else {
        console.error("File input element not available");
        toast.error("File upload not available");
      }
    }

    async function startCamera() {
      try {
        camError = null;
        
        stopCamera();
        
        console.log("Requesting camera access...");
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false
        });
        
        if (!videoElement) {
          console.error("Video element not found");
          camError = "Camera element not initialized";
          return;
        }
        
        videoElement.srcObject = mediaStream;
        videoElement.play();
        cameraActive = true;
        
        console.log("Camera started successfully");
      } catch (err) {
        console.error("Error accessing camera: ", err);
        camError = "Unable to access camera. Please check permissions.";
        toast.error("Unable to access camera. Please check permissions.");
      }
    }

    function stopCamera() {
      if (mediaStream) {
        console.log("Stopping camera stream");
        mediaStream.getTracks().forEach(track => track.stop());
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject = null;
        }
        mediaStream = null;
      }
      
      cameraActive = false;
    }

    function capturePhoto() {
      if (!videoElement || !canvasElement) {
        console.error("Video or canvas element not found");
        toast.error("Camera not properly initialized");
        return;
      }
      
      if (!cameraActive) {
        console.error("Camera not active");
        toast.error("Camera not active, please try again");
        return;
      }
      
      try {
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
          console.error("Could not get canvas context");
          toast.error("Failed to initialize photo capture");
          return;
        }
        
        canvasElement.width = videoElement.videoWidth || 640;
        canvasElement.height = videoElement.videoHeight || 480;
        
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        const imageData = canvasElement.toDataURL('image/jpeg', 0.9);
        
        editedContainerImage = imageData;
        showCamera = false;
        stopCamera();
        
        toast.success("Photo captured successfully");
      } catch (err) {
        console.error("Error capturing photo: ", err);
        toast.error("Failed to capture photo");
      }
    }

    function handleShowCamera() {
      showCamera = true;
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
  <Button 
    variant="ghost" 
    class="w-full flex items-center justify-start px-3 py-2 mb-2 text-sm"
    on:click={onViewAllItems}
  >
    <Icon icon="material-symbols:indeterminate-check-box" class="h-5 w-5 mr-2" />
    <span>View All Items</span>
  </Button>

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

{#if showCamera}
<Dialog.Root open={showCamera} onOpenChange={(isOpen) => !isOpen && handleCameraClose()}>
  <Dialog.Content class="sm:max-w-md animate-fade-in bg-white dark:bg-gray-950">
    <Dialog.Header>
      <Dialog.Title>Take a Photo</Dialog.Title>
    </Dialog.Header>
    
    <div class="space-y-4">
      <div class="relative bg-black rounded-md aspect-video flex items-center justify-center overflow-hidden">
        <video bind:this={videoElement} autoplay playsinline muted class="w-full h-full object-cover"></video>
        <canvas bind:this={canvasElement} style="display:none;"></canvas>
        
        {#if !cameraActive && !camError}
          <div class="absolute inset-0 flex justify-center items-center bg-black/70 text-white">
            <div class="text-center">
              <Icon icon="material-symbols:photo-camera-outline" class="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p class="text-lg">Accessing camera...</p>
            </div>
          </div>
        {/if}
        
        {#if camError}
          <div class="absolute inset-0 flex justify-center items-center bg-black/70 text-white">
            <div class="text-center">
              <p class="text-red-400 font-semibold">{camError}</p>
              <p class="text-sm mt-2">Please check your camera permissions</p>
            </div>
          </div>
        {/if}
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
          <Icon icon="material-symbols:photo-camera" class="h-5 w-5 mr-2" />
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
    overflow-x: hidden;
    box-sizing: border-box;
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
    box-sizing: border-box;
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
    max-width: calc(100% - 3.5rem);
  }
  
  .info-icon, .edit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
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
  
  .nested-container-list {
    padding-left: 0.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .container-list {
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
</style>