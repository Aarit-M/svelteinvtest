<script lang="ts">
    import { Plus, HelpCircle, FolderPlus, Search, Eye, Hash, Square, CheckSquare, Folder, Info } from 'lucide-svelte';
    import { toast } from 'svelte-sonner';
    import type { Item, Container } from '$lib/types';
    import { onMount } from 'svelte';
    import ItemDetailsModal from '../components/EditItemModal.svelte';
    import AddItemModal from '../components/AddItemModal.svelte';
    import HelpModal from '../components/HelpModal.svelte';
    import GroupItemsModal from '../components/GroupItemsModal.svelte';
    import NewLocationModal from '../components/NewLocationModal.svelte';
    import logo from '../../2554_logo.png';
    import FolderTree from '../components/FolderTree.svelte';

    // State variables
    let activeItem: Item | null = null;
    let showItemDetails = false;
    let showAddItemModal = false;
    let showNewLocationModal = false;
    let showGroupModal = false;
    let showHelpModal = false;
    let selectedItems: string[] = [];
    let searchQuery = '';
    let selectedContainer: string | null = null;
    let containers: Container[] = [];
    let filteredItems: Item[] = [];
    let allItemsSelected = false;
  
    // Mock data for containers and items
    const mockContainers: Container[] = [
      {
        id: 'trailers',
        containerName: 'Trailers',
        containerLocation: { path: '/Trailers' },
        items: [],
        isExpanded: false,
        children: []
      },
      {
        id: 'rooms',
        containerName: 'Rooms',
        containerLocation: { path: '/Rooms' },
        items: [],
        isExpanded: true,
        children: [
          {
            id: 'av-room',
            containerName: 'AV Room',
            containerLocation: { path: '/Rooms/AV_Room' },
            items: [],
            parentId: 'rooms'
          },
          {
            id: 'mays-room',
            containerName: "May's Room",
            containerLocation: { path: '/Rooms/Mays_Room' },
            items: [],
            parentId: 'rooms'
          },
          {
            id: 'kearnys-room',
            containerName: "Kearny's Room",
            containerLocation: { path: '/Rooms/Kearnys_Room' },
            items: [],
            isExpanded: true,
            parentId: 'rooms',
            children: [
              {
                id: 'kearnys-desk',
                containerName: "Kearny's Desk",
                containerLocation: { path: '/Rooms/Kearnys_Room/Kearnys_Desk' },
                items: [],
                parentId: 'kearnys-room'
              },
              {
                id: 'back-corner-shelf',
                containerName: "Back Corner Shelf",
                containerLocation: { path: '/Rooms/Kearnys_Room/Back_Corner_Shelf' },
                items: [],
                parentId: 'kearnys-room'
              },
              {
                id: 'big-cabinet',
                containerName: "Big Cabinet",
                containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet' },
                items: [],
                isExpanded: true,
                parentId: 'kearnys-room',
                children: [
                  {
                    id: 'box-1',
                    containerName: "Box 1",
                    containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                    items: [
                      {
                        id: 'wire-1',
                        itemName: '22 AWG Wire',
                        itemLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                        itemMeasurements: { unit: 'ft', size: 2 },
                        description: 'Thin wire for electronics'
                      },
                      {
                        id: 'wire-2',
                        itemName: '22 AWG Wire',
                        itemLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                        itemMeasurements: { unit: '', size: 0 },
                        description: 'Thin wire, color: red'
                      }
                    ],
                    parentId: 'big-cabinet'
                  },
                  {
                    id: 'box-2',
                    containerName: "Box 2",
                    containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_2' },
                    items: [],
                    parentId: 'big-cabinet'
                  },
                  {
                    id: 'box-3',
                    containerName: "Box 3",
                    containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_3' },
                    items: [],
                    parentId: 'big-cabinet'
                  }
                ]
              },
              {
                id: 'small-cabinet',
                containerName: "Small Cabinet",
                containerLocation: { path: '/Rooms/Kearnys_Room/Small_Cabinet' },
                items: [],
                parentId: 'kearnys-room'
              }
            ]
          }
        ]
      }
    ];

  // Initialize data right away
  containers = mockContainers;

  onMount(() => {
    // Initialize filtered items with the items from Box 1
    const box1 = findContainerById(containers, 'box-1');
    if (box1) {
      filteredItems = box1.items;
      selectedContainer = 'box-1';
    }
  });

  // Helper function to find a container by ID in the nested structure
  function findContainerById(containers: Container[], id: string): Container | null {
    for (const container of containers) {
      if (container.id === id) {
        return container;
      }
      
      if (container.children && container.children.length > 0) {
        const found = findContainerById(container.children, id);
        if (found) return found;
      }
    }
    
    return null;
  }

  // Toggle container expanded state
  function toggleContainer(id: string) {
    containers = containers.map(container => {
      if (container.id === id) {
        return { ...container, isExpanded: !container.isExpanded };
      } else if (container.children && container.children.length > 0) {
        return { ...container, children: toggleChildrenContainer(container.children, id) };
      }
      return container;
    });
  }

  function toggleChildrenContainer(children: Container[], id: string): Container[] {
    return children.map(child => {
      if (child.id === id) {
        return { ...child, isExpanded: !child.isExpanded };
      } else if (child.children && child.children.length > 0) {
        return { ...child, children: toggleChildrenContainer(child.children, id) };
      }
      return child;
    });
  }

  // Select a container
  function selectContainer(id: string) {
    selectedContainer = id;
    // Clear selected items when changing containers
    selectedItems = [];
    allItemsSelected = false;
    
    const container = findContainerById(containers, id);
    if (container) {
      filteredItems = container.items || [];
    } else {
      filteredItems = [];
    }
    }
  
    function handleAddItem(newItem: Partial<Item>) {
    if (!selectedContainer) {
      toast.error("Please select a container to add the item to.");
        return;
      }
  
    // Generate a unique ID
    const itemId = `item-${Date.now()}`;
    
    // Find the selected container
    const container = findContainerById(containers, selectedContainer);
    if (container) {
      // Create the new item
      const item: Item = {
        id: itemId,
        itemName: newItem.itemName || 'New Item',
        itemLocation: newItem.itemLocation || { path: container.containerLocation.path },
        description: newItem.description
      };
      
      // Add the item to the container
      container.items = [...(container.items || []), item];
      
      // Update filtered items if we're viewing the container
      if (selectedContainer === container.id) {
        filteredItems = [...filteredItems, item];
      }
      
      toast.success("Item added successfully");
    }
    
    showAddItemModal = false;
    }
  
    function handleEditItem(updatedItem: Item) {
    if (!selectedContainer) return;
    
    const container = findContainerById(containers, selectedContainer);
    if (container && container.items) {
      container.items = container.items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      
      // Update filtered items
      filteredItems = container.items;
      
      toast.success("Item updated successfully");
    }
    
    showItemDetails = false;
    }
  
    function handleDeleteItems() {
      if (selectedItems.length === 0) return;
      
    if (!selectedContainer) return;
    
    const container = findContainerById(containers, selectedContainer);
    if (container && container.items) {
      container.items = container.items.filter(item => !selectedItems.includes(item.id));
      
      // Update filtered items
      filteredItems = container.items;
      
      toast.success(`${selectedItems.length} items deleted successfully`);
      selectedItems = [];
      allItemsSelected = false;
    }
  }

  function handleAddLocation(newLocation: Partial<Container>) {
    if (!newLocation.containerName) {
      toast.error("Location name is required");
      return;
    }
    
    // If a parent container is selected, add as child, otherwise add to root
    if (selectedContainer) {
      const parentContainer = findContainerById(containers, selectedContainer);
      if (parentContainer) {
        const newChild: Container = {
          id: `container-${Date.now()}`,
          containerName: newLocation.containerName,
          containerLocation: { 
            path: `${parentContainer.containerLocation.path}/${newLocation.containerName.replace(/\s/g, '_')}` 
          },
          items: [],
          parentId: parentContainer.id
        };
        
        if (!parentContainer.children) {
          parentContainer.children = [];
        }
        
        parentContainer.children.push(newChild);
        
        toast.success("Location added successfully");
      }
    } else {
      // Add to root
      const newContainer: Container = {
        id: `container-${Date.now()}`,
        containerName: newLocation.containerName,
        containerLocation: { 
          path: `/${newLocation.containerName.replace(/\s/g, '_')}` 
        },
        items: [],
        children: []
      };
      
      containers = [...containers, newContainer];
      
      toast.success("Location added successfully");
    }
    
    showNewLocationModal = false;
    }
  
    function handleGroupItems(locationId: string) {
    if (selectedItems.length === 0) return;
    
    const targetContainer = findContainerById(containers, locationId);
    if (!targetContainer) return;
    
    const currentContainer = findContainerById(containers, selectedContainer || '');
    if (!currentContainer || !currentContainer.items) return;
    
    // Get the selected items from the current container
    const itemsToMove = currentContainer.items.filter(item => 
      selectedItems.includes(item.id)
    );
    
    // Remove the items from the current container
    currentContainer.items = currentContainer.items.filter(item => 
      !selectedItems.includes(item.id)
    );
    
    // Update items' location
    const updatedItems = itemsToMove.map(item => ({
      ...item,
      itemLocation: { path: targetContainer.containerLocation.path }
    }));
    
    // Add the items to the target container
    if (!targetContainer.items) {
      targetContainer.items = [];
    }
    targetContainer.items = [...targetContainer.items, ...updatedItems];
    
    // Update filtered items
    filteredItems = currentContainer.items;
    
    toast.success(`${selectedItems.length} items moved successfully`);
    selectedItems = [];
    allItemsSelected = false;
    showGroupModal = false;
  }
  
  // Toggle item selection
  function toggleSelectItem(id: string) {
    if (selectedItems.includes(id)) {
      selectedItems = selectedItems.filter(item => item !== id);
      allItemsSelected = false;
    } else {
      selectedItems = [...selectedItems, id];
      if (selectedItems.length === filteredItems.length) {
        allItemsSelected = true;
      }
    }
  }
  
  // Toggle select all items
  function toggleSelectAll() {
    if (allItemsSelected) {
      selectedItems = [];
    } else {
      selectedItems = filteredItems.map(item => item.id);
    }
    allItemsSelected = !allItemsSelected;
  }
  
  // View item details
  function viewItemDetails(item: Item) {
    activeItem = item;
    showItemDetails = true;
  }
  
  // Check if a container should show the info icon
  function shouldShowInfoIcon(id: string): boolean {
    return ['kearnys-desk', 'back-corner-shelf', 'box-1', 'box-2', 'box-3', 'small-cabinet'].includes(id);
  }

  // Check if item is selected
  function isItemSelected(id: string): boolean {
    return selectedItems.includes(id);
    }
  </script>
  
<svelte:head>
  <title>Team 2554 Inventory Management</title>
  <style>
    :root {
      --background: #f4f4f4;
      --primary: #2c2c2c;
      --primary-hover: #444444;
      --text-primary: #f5f5f5;
      --text-dark: #000000;
      --disabled-bg: #d9d9d9;
      --disabled-border: #b3b3b3;
      --disabled-text: #b3b3b3;
      --header-bg: #d9d9d9;
      --sidebar-bg: #cbcbcb;
      --selected-bg: #cdc9c9;
      --table-header-bg: #b7b7b7;
      --table-row-bg: #d9d9d9;
      --table-alternate-row-bg: #f8f8f8;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: "Inter", sans-serif;
      background-color: var(--background);
      box-sizing: border-box;
    }

    button, input, select, h1, h2, h3, h4, h5, * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: none;
      text-decoration: none;
      background: none;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</svelte:head>

<div class="app-container">
  <!-- Top header with title -->
  <div class="header">
    <img 
      src={logo} 
      alt="Team 2554 Logo" 
      class="h-10 w-auto mr-3"
    />
    <h1 class="app-title">Team 2554 Inventory Management</h1>
  </div>
  
  <!-- Action buttons -->
  <div class="action-bar">
    <button class="action-button" on:click={() => showAddItemModal = true}>
      <Plus size={16} />
      <span>New Item</span>
    </button>
    
    <button class="action-button" on:click={() => showNewLocationModal = true}>
      <FolderPlus size={16} />
      <span>New Location</span>
    </button>
    
    <button class="action-button" on:click={() => showHelpModal = true}>
      <HelpCircle size={16} />
      <span>Help</span>
    </button>
    
    <div class="selection-info">
      <span>{selectedItems.length} Selected</span>
    </div>
    
    <button class="action-button {selectedItems.length === 0 ? 'disabled' : ''}" 
            on:click={handleDeleteItems}
            disabled={selectedItems.length === 0}>
      <span>Delete</span>
    </button>
    
    <button class="action-button {selectedItems.length === 0 ? 'disabled' : ''}" 
            on:click={() => showGroupModal = true}
            disabled={selectedItems.length === 0}>
      <span>Group Into Location</span>
    </button>
  </div>
  
  <div class="main-content">
    <!-- Sidebar - Container tree -->
    <div class="sidebar">
      <FolderTree
        containers={containers}
        selectedContainer={selectedContainer}
        onContainerSelect={(id) => selectContainer(id)}
        onContainerToggle={(id) => toggleContainer(id)}
        onItemDrop={(containerId, itemId) => {
          // Handle item drop - move an item to a different container
          const sourceContainer = findContainerById(containers, selectedContainer || '');
          const targetContainer = findContainerById(containers, containerId);
          
          if (!sourceContainer || !targetContainer || !sourceContainer.items) return;
          
          // Find the item
          const item = sourceContainer.items.find(item => item.id === itemId);
          if (!item) return;
          
          // Remove from source container
          sourceContainer.items = sourceContainer.items.filter(i => i.id !== itemId);
          
          // Add to target container
          if (!targetContainer.items) targetContainer.items = [];
          targetContainer.items = [...targetContainer.items, {
            ...item,
            itemLocation: { path: targetContainer.containerLocation.path }
          }];
          
          // Update filtered items if we're looking at the source container
          if (selectedContainer === sourceContainer.id) {
            filteredItems = sourceContainer.items;
          }
          
          toast.success(`Item moved to ${targetContainer.containerName}`);
        }}
      />
    </div>
  
    <!-- Main content area -->
    <div class="content-area">
      <!-- Table header -->
      <div class="table-header">
        <div class="table-cell checkbox-cell">
          <!-- Master checkbox for selecting all -->
          <button 
            class="checkbox-button" 
            on:click={toggleSelectAll}
            aria-label={allItemsSelected ? "Deselect all items" : "Select all items"}
          >
            {#if allItemsSelected}
              <CheckSquare size={20} />
            {:else}
              <Square size={20} />
            {/if}
          </button>
        </div>
        <div class="table-cell item-cell">Item</div>
        <div class="table-cell location-cell">Location</div>
        <div class="table-cell size-cell">
          <Hash size={20} />
        </div>
        <div class="table-cell actions-cell">
          <Search size={20} />
        </div>
      </div>
  
      <!-- Table rows -->
      <div class="table-body">
        {#if filteredItems.length === 0}
          <div class="empty-state">
            <p>No items in this location</p>
            <button class="action-button mt-2" on:click={() => showAddItemModal = true}>
              <Plus size={16} />
              <span>Add Item</span>
            </button>
          </div>
        {:else}
          {#each filteredItems as item, index}
            <div class="table-row {index % 2 === 0 ? 'even' : 'odd'}">
              <div class="table-cell checkbox-cell">
                <button 
                  class="checkbox-button" 
                  on:click={() => toggleSelectItem(item.id)}
                  aria-label={isItemSelected(item.id) ? "Deselect item" : "Select item"}
                >
                  {#if isItemSelected(item.id)}
                    <CheckSquare size={20} />
                  {:else}
                    <Square size={20} />
                  {/if}
                </button>
              </div>
              <div class="table-cell item-cell">
                <button class="item-name-btn" on:click={() => viewItemDetails(item)}>
                  {item.itemName}
                </button>
              </div>
              <div class="table-cell location-cell">{item.itemLocation?.path}</div>
              <div class="table-cell size-cell">
                {#if item.itemMeasurements}
                  {item.itemMeasurements.size} {item.itemMeasurements.unit}
                {/if}
              </div>
              <div class="table-cell actions-cell">
                <button class="view-button" on:click={() => viewItemDetails(item)}>
                  <Eye size={20} />
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
      </div>
    </div>
  </div>
  
<!-- Modals -->
  <ItemDetailsModal 
    open={showItemDetails}
    onClose={() => showItemDetails = false}
  item={activeItem || {
    id: '',
    itemName: '',
    itemLocation: { path: '' }
  }}
    onEdit={handleEditItem}
  />
  
  <AddItemModal 
    open={showAddItemModal}
    onClose={() => showAddItemModal = false}
    onAddItem={handleAddItem}
    defaultLocation={selectedContainer 
  ? findContainerById(containers, selectedContainer)?.containerLocation.path || '' 
      : ''}
  />
  
  <HelpModal
    open={showHelpModal}
    onClose={() => showHelpModal = false}
  />
  
  <GroupItemsModal
    open={showGroupModal}
    onClose={() => showGroupModal = false}
    onGroup={handleGroupItems}
    containers={containers}
    selectedItems={selectedItems.map(id => {
  const container = findContainerById(containers, selectedContainer || '');
  if (container && container.items) {
        const item = container.items.find(item => item.id === id);
        if (item) return item;
      }
      return { id, itemName: 'Unknown item', itemLocation: { path: '' } };
    })}
  />
  
  <NewLocationModal
    open={showNewLocationModal}
    onClose={() => showNewLocationModal = false}
    onAddLocation={handleAddLocation}
    containers={containers}
  />
  
<style>
  .app-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--background);
  }
  
  /* Header */
  .header {
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: var(--header-bg);
    border-bottom: 1px solid #ccc;
  }
  
  .app-title {
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text-dark);
    margin-left: 0.5rem;
  }
  
  /* Action bar */
  .action-bar {
    display: flex;
    padding: 0.5rem;
    background-color: var(--header-bg);
    border-bottom: 1px solid #ccc;
    gap: 0.5rem;
    align-items: center;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--primary);
    color: var(--text-primary);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .action-button:hover {
    background-color: var(--primary-hover);
  }
  
  .action-button.disabled {
    background-color: var(--disabled-bg);
    color: var(--disabled-text);
    cursor: not-allowed;
  }
  
  .selection-info {
    margin-left: auto;
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: #666;
  }
  
  /* Main content */
  .main-content {
    display: flex;
    flex: 1;
    height: calc(100vh - 120px);
    overflow: hidden;
  }
  
  /* Sidebar */
  .sidebar {
    width: 250px;
    background-color: var(--sidebar-bg);
    overflow-y: auto;
    border-right: 1px solid #ccc;
    padding: 0.5rem 0;
  }
  
  /* Content area */
  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  /* Table styles */
  .table-header {
    display: flex;
    background-color: var(--table-header-bg);
    padding: 0.5rem 0;
    border-bottom: 1px solid #ccc;
    user-select: none;
  }
  
  .table-cell {
    padding: 0.5rem;
    display: flex;
    align-items: center;
  }
  
  .checkbox-cell {
    width: 40px;
    justify-content: center;
  }
  
  .item-cell {
    width: 25%;
    font-weight: 500;
  }
  
  .location-cell {
    width: 55%;
    font-weight: 500;
  }
  
  .size-cell {
    width: 10%;
    justify-content: center;
  }
  
  .actions-cell {
    width: 40px;
    justify-content: center;
  }
  
  .table-body {
    flex: 1;
    overflow-y: auto;
  }
  
  .table-row {
    display: flex;
    border-bottom: 1px solid #eee;
    align-items: center;
  }
  
  .table-row:hover {
    background-color: rgba(0, 0, 0, 0.025);
  }
  
  .table-row.even {
    background-color: var(--table-row-bg);
  }
  
  .table-row.odd {
    background-color: var(--table-alternate-row-bg);
  }
  
  .checkbox-button, .view-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    color: #555;
  }
  
  .item-name-btn {
    cursor: pointer;
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    padding: 0.25rem;
    color: inherit;
    font-weight: 400;
  }
  
  .item-name-btn:hover {
    color: #000;
    text-decoration: underline;
  }
  
  .checkbox-button:hover, .view-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    color: #000;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #666;
    text-align: center;
  }
  
  .mt-2 {
    margin-top: 0.5rem;
  }
</style>
  