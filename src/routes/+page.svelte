<script lang="ts">
    import { Plus, HelpCircle, FolderPlus, Search, Eye, Hash, Square, CheckSquare, Folder, Info } from 'lucide-svelte';
    import { toast } from 'svelte-sonner';
    import type { Item, Container } from '$lib/types';
    import { onMount } from 'svelte';
    import ItemDetailsModal from '../components/ItemDetailsModal.svelte';
    import EditItemModal from '../components/EditItemModal.svelte';
    import AddItemModal from '../components/AddItemModal.svelte';
    import HelpModal from '../components/HelpModal.svelte';
    import GroupItemsModal from '../components/GroupItemsModal.svelte';
    import NewLocationModal from '../components/NewLocationModal.svelte';
    import FolderTree from '../components/FolderTree.svelte';
    import Header from '../components/Header.svelte';
    import AddItemButton from '../components/AddItemButton.svelte';
    import InventoryTable from '../components/InventoryTable.svelte';
    import PhotoViewModal from '../components/PhotoViewModal.svelte';
    import Icon from '@iconify/svelte';
    import { writable } from 'svelte/store';
    import { browser } from '$app/environment';
    const logo = '/2554_logo.png';

    let activeItem: Item | null = null;
    let showItemDetails = false;
    let showEditModal = false;
    let showAddItemModal = false;
    let showNewLocationModal = false;
    let showGroupModal = false;
    let showHelpModal = false;
    let showPhotoModal = false;
    let selectedItems: string[] = [];
    let searchQuery = '';
    let selectedContainer: string | null = null;
    let containers: Container[] = [];
    let filteredItems: Item[] = [];
    let allItemsSelected = false;
    let currentPhotoItem: Item | null = null;
  
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

  containers = mockContainers;

  onMount(() => {
    const box1 = findContainerById(containers, 'box-1');
    if (box1) {
      filteredItems = box1.items;
      selectedContainer = 'box-1';
    }
  });

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

  function selectContainer(id: string) {
    selectedContainer = id;
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
  
    const itemId = `item-${Date.now()}`;
    
    const container = findContainerById(containers, selectedContainer);
    if (container) {
      const item: Item = {
        id: itemId,
        itemName: newItem.itemName || 'New Item',
        itemLocation: newItem.itemLocation || { path: container.containerLocation.path },
        description: newItem.description
      };
      
      container.items = [...(container.items || []), item];
      
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
    
    const itemsToMove = currentContainer.items.filter(item => 
      selectedItems.includes(item.id)
    );
    
    currentContainer.items = currentContainer.items.filter(item => 
      !selectedItems.includes(item.id)
    );
    
    const updatedItems = itemsToMove.map(item => ({
      ...item,
      itemLocation: { path: targetContainer.containerLocation.path }
    }));
    
    if (!targetContainer.items) {
      targetContainer.items = [];
    }
    targetContainer.items = [...targetContainer.items, ...updatedItems];
    
    filteredItems = currentContainer.items;
    
    toast.success(`${selectedItems.length} items moved successfully`);
    selectedItems = [];
    allItemsSelected = false;
    showGroupModal = false;
  }
  
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
  
  function toggleSelectAll() {
    if (allItemsSelected) {
      selectedItems = [];
    } else {
      selectedItems = filteredItems.map(item => item.id);
    }
    allItemsSelected = !allItemsSelected;
  }
  
  function viewItemDetails(item: Item) {
    activeItem = item;
    showItemDetails = true;
  }
  
  function viewItemPhoto(item: Item) {
    currentPhotoItem = item;
    showPhotoModal = true;
  }
  
  function handleItemClick(item: Item) {
    viewItemDetails(item);
  }
  
  function shouldShowInfoIcon(id: string): boolean {
    const container = findContainerById(containers, id);
    return Boolean(container?.image || container?.description);
  }

  function isItemSelected(id: string): boolean {
    return selectedItems.includes(id);
  }

  function filterItemsBySearch(items: Item[], query: string): Item[] {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.itemName.toLowerCase().includes(lowerQuery) || 
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.itemLocation.path.toLowerCase().includes(lowerQuery)
    );
  }

  function handleSearchChange(newQuery: string) {
    searchQuery = newQuery;
    
    if (selectedContainer) {
      const container = findContainerById(containers, selectedContainer);
      if (container && container.items) {
        filteredItems = filterItemsBySearch(container.items, searchQuery);
      }
    }
  }
</script>
  
<svelte:head>
  <title>Team 2554 Inventory Management</title>
  <style>
:root {
  --background: #ffffff;
  --primary: #f4f4f4;
  --primary-hover: #e0e0e0;
  --text-primary: #000000;
  --text-secondary: #666666;
  --text-dark: #000000;
  --disabled-bg: #f0f0f0;
  --disabled-border: #d0d0d0;
  --disabled-text: #999999;
  --header-bg: #ffffff;
  --sidebar-bg: #f9f9f9;
  --selected-bg: #e6e6e6;
  --table-header-bg: #f0f0f0;
  --table-row-bg: #ffffff;
  --table-alternate-row-bg: #f9f9f9;
  --button-bg: #f4f4f4;
  --button-hover-bg: #e0e0e0;
  --border-color: #e0e0e0;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

body {
  margin: 0;
  padding: 0;
  font-family: "Inter", sans-serif;
  background-color: var(--background);
  color: var(--text-primary);
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

.rectangle-1 {
  background-color: var(--sidebar-bg);
  color: var(--text-primary);
  width: 240px;
  padding: 10px;
}

header {
  background-color: var(--header-bg);
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}

.button {
  background-color: var(--button-bg);
  color: var(--text-primary);
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

.button:hover {
  background-color: var(--button-hover-bg);
}

.selected {
  background-color: var(--selected-bg);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: var(--table-header-bg);
  padding: 10px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid var(--border-color);
}

tr:nth-child(even) {
  background-color: var(--table-alternate-row-bg);
}

tr:nth-child(odd) {
  background-color: var(--table-row-bg);
}

tr:hover {
  background-color: var(--selected-bg);
}

td {
  padding: 10px;
}

input {
  background-color: var(--primary);
  color: var(--text-primary);
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
}

input::placeholder {
  color: var(--text-secondary);
}

.disabled {
  background-color: var(--disabled-bg);
  color: var(--disabled-text);
  border: 1px solid var(--disabled-border);
  cursor: not-allowed;
}
</style>
</svelte:head>

<div class="app-container">
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
    <div class="sidebar">
      <FolderTree
        containers={containers}
        selectedContainer={selectedContainer}
        onContainerSelect={(id) => selectContainer(id)}
        onContainerToggle={(id) => toggleContainer(id)}
        onItemDrop={(containerId, itemId) => {
          const sourceContainer = findContainerById(containers, selectedContainer || '');
          const targetContainer = findContainerById(containers, containerId);
          
          if (!sourceContainer || !targetContainer || !sourceContainer.items) return;
          
          const item = sourceContainer.items.find(item => item.id === itemId);
          if (!item) return;
          
          sourceContainer.items = sourceContainer.items.filter(i => i.id !== itemId);
          
          if (!targetContainer.items) targetContainer.items = [];
          targetContainer.items = [...targetContainer.items, {
            ...item,
            itemLocation: { path: targetContainer.containerLocation.path }
          }];
          
          if (selectedContainer === sourceContainer.id) {
            filteredItems = sourceContainer.items;
          }
          
          toast.success(`Moved "${item.itemName}" to ${targetContainer.containerName}`, {
            position: 'bottom-right',
            duration: 3000,
          });
        }}
        onViewAllItems={() => {
          selectedContainer = null;
          const allItems: Item[] = [];
          
          function collectItems(containersArray: Container[]) {
            if (!containersArray || !containersArray.length) return;
            
            for (const container of containersArray) {
              if (container.items && container.items.length) {
                allItems.push(...container.items);
              }
              
              if (container.children && container.children.length) {
                collectItems(container.children);
              }
            }
          }
          
          collectItems(containers);
          filteredItems = allItems;
        }}
        onItemClick={handleItemClick}
      />
    </div>
  
    <div class="content-area">
      <div class="table-header mb-4">
        <h2 class="text-xl font-semibold">
          {#if selectedContainer}
            {findContainerById(containers, selectedContainer)?.containerName || 'Location'} Contents
          {:else if filteredItems.length > 0}
            All Items ({filteredItems.length})
          {:else}
            Contents
          {/if}
        </h2>
      </div>
      
      {#if filteredItems.length === 0}
        <div class="empty-state">
          <p>No items found</p>
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
          on:viewPhoto={(e) => viewItemPhoto(e.detail)}
        />
      {/if}
    </div>
  </div>
  
  <ItemDetailsModal 
    open={showItemDetails}
    onClose={() => showItemDetails = false}
    item={activeItem}
    onEdit={handleEditItem}
    onAddItem={handleAddItem}
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
  />

  <PhotoViewModal
    open={showPhotoModal}
    onClose={() => showPhotoModal = false}
    item={currentPhotoItem}
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
  
  .main-content {
    display: flex;
    flex: 1;
    height: calc(100vh - 60px);
    overflow: hidden;
  }
  
  .sidebar {
    width: 300px;
    background-color: var(--sidebar-bg);
    overflow-y: auto;
    border-right: 1px solid #ccc;
    padding: 0.5rem 0;
  }
  
  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
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
  
