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
    import FolderTree from '../components/FolderTree.svelte';
    import Header from '../components/Header.svelte';
    import AddItemButton from '../components/AddItemButton.svelte';
    import InventoryTable from '../components/InventoryTable.svelte';
    import Icon from '@iconify/svelte';
    const logo = '/2554_logo.png';

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

  // Function to filter items based on search query
  function filterItemsBySearch(items: Item[], query: string): Item[] {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.itemName.toLowerCase().includes(lowerQuery) || 
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.itemLocation.path.toLowerCase().includes(lowerQuery)
    );
  }

  // Update filtered items when search query changes
  function handleSearchChange(newQuery: string) {
    searchQuery = newQuery;
    
    if (selectedContainer) {
      const container = findContainerById(containers, selectedContainer);
      if (container && container.items) {
        // Apply search filter
        filteredItems = filterItemsBySearch(container.items, searchQuery);
      }
    }
  }
</script>
  
<svelte:head>
  <title>Team 2554 Inventory Management</title>
  <style>
  .app-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: hsl(var(--background));
  }
  
  /* Main content */
  .main-content {
    display: flex;
    flex: 1;
    height: calc(100vh - 60px); /* Adjust for header height */
    overflow: hidden;
  }
  
  /* Sidebar */
  .sidebar {
    width: 240px;
    background-color: hsl(var(--primary) / 0.1);
    border-right: 1px solid hsl(var(--border));
    padding: 0.5rem 0;
    overflow-y: auto;
  }
  
  /* Content area */
  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow: hidden;
    background-color: hsl(var(--background));
  }
  
  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    color: hsl(var(--muted-foreground));
    text-align: center;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  
  .action-button:hover {
    background-color: hsl(var(--primary) / 0.9);
  }
  
  .mt-2 {
    margin-top: 0.5rem;
  }
</style>
</svelte:head>

<div class="app-container">
  <!-- Top header with search, theme toggle and help button -->
  <Header
    {searchQuery}
    selectedItems={selectedItems}
    on:searchChange={e => handleSearchChange(e.detail)}
    on:clearSelection={() => { selectedItems = []; allItemsSelected = false; }}
    on:delete={handleDeleteItems}
    on:groupIntoLocation={() => showGroupModal = true}
    on:addItem={() => showAddItemModal = true}
    on:addLocation={() => showNewLocationModal = true}
    on:showHelp={() => showHelpModal = true}
  />
  
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
          
          toast.success(`Moved "${item.itemName}" to ${targetContainer.containerName}`, {
            position: 'bottom-right',
            duration: 3000,
          });
        }}
      />
    </div>
  
    <!-- Main content area -->
    <div class="content-area">
      <!-- Replace the table header and body with InventoryTable -->
      {#if filteredItems.length === 0}
        <div class="empty-state">
          <p>No items in this location</p>
          <button class="action-button mt-2" on:click={() => showAddItemModal = true}>
            <Icon icon="material-symbols:add" class="h-4 w-4 mr-1" />
            <span>Add Item</span>
          </button>
        </div>
      {:else}
        <InventoryTable 
          items={filteredItems}
          bind:selectedItems={selectedItems}
          on:selectItems={(e) => { 
            selectedItems = e.detail; 
            allItemsSelected = selectedItems.length === filteredItems.length; 
          }}
          on:viewItem={(e) => viewItemDetails(e.detail)}
        />
      {/if}
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

</div>
  
<style>
  .app-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--background);
  }
  
  /* Main content */
  .main-content {
    display: flex;
    flex: 1;
    height: calc(100vh - 60px); /* Adjust for header height */
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
  
  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    color: #666;
    text-align: center;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  
  .action-button:hover {
    background-color: hsl(var(--primary) / 0.9);
  }
  
  .mt-2 {
    margin-top: 0.5rem;
  }
</style>
  
