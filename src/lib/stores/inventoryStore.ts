import { writable } from 'svelte/store';
import type { Container, Item } from '$lib/types';

// Define the store state type
interface InventoryState {
  containers: Container[];
  selectedItems: string[];
  searchQuery: string;
  selectedContainer: string | null;
}

// Create the initial state
const initialState: InventoryState = {
  containers: [],
  selectedItems: [],
  searchQuery: '',
  selectedContainer: null
};

// Create a writable store
function createInventoryStore() {
  const { subscribe, set, update } = writable<InventoryState>(initialState);

  return {
    subscribe,
    
    // Set selected items
    setSelectedItems: (items: string[]) => update(state => ({
      ...state,
      selectedItems: items
    })),
    
    // Set search query
    setSearchQuery: (query: string) => update(state => ({
      ...state,
      searchQuery: query
    })),
    
    // Set selected container
    setSelectedContainer: (id: string | null) => update(state => ({
      ...state,
      selectedContainer: id
    })),
    
    // Add a new item
    addItem: (item: Partial<Item>, containerId: string) => update(state => {
      const updatedContainers = addItemToContainer(
        [...state.containers], 
        containerId, 
        item as Item
      );
      
      return {
        ...state,
        containers: updatedContainers
      };
    }),
    
    // Edit an item
    editItem: (updatedItem: Item) => update(state => {
      const updatedContainers = editItemInContainers(
        [...state.containers], 
        updatedItem
      );
      
      return {
        ...state,
        containers: updatedContainers
      };
    }),
    
    // Delete items
    deleteItems: (itemIds: string[]) => update(state => {
      const updatedContainers = deleteItemsFromContainers(
        [...state.containers], 
        itemIds
      );
      
      return {
        ...state,
        containers: updatedContainers,
        selectedItems: []
      };
    }),
    
    // Add a new location
    addLocation: (location: Partial<Container>) => update(state => {
      let updatedContainers = [...state.containers];
      
      if (location.parentId) {
        updatedContainers = addLocationToParent(
          updatedContainers, 
          location.parentId, 
          location as Container
        );
      } else {
        updatedContainers.push(location as Container);
      }
      
      return {
        ...state,
        containers: updatedContainers
      };
    }),
    
    // Find a container path by ID
    findContainerPath: (containerId: string) => {
      let result = '';
      const findPath = (containers: Container[], id: string): boolean => {
        for (const container of containers) {
          if (container.id === id) {
            result = container.containerLocation.path;
            return true;
          }
          if (container.children && container.children.length > 0) {
            if (findPath(container.children, id)) {
              return true;
            }
          }
        }
        return false;
      };
      
      // Get the current state manually since we're outside of update/set
      let currentState: InventoryState = { containers: [], selectedItems: [], searchQuery: '', selectedContainer: null };
      const unsubscribe = subscribe(state => { currentState = state; });
      findPath(currentState.containers, containerId);
      unsubscribe();
      
      return result;
    }
  };
}

// Helper function to add an item to a container
function addItemToContainer(containers: Container[], containerId: string, item: Item): Container[] {
  return containers.map(container => {
    if (container.id === containerId) {
      return {
        ...container,
        items: [...container.items, item]
      };
    }
    
    if (container.children) {
      return {
        ...container,
        children: addItemToContainer(container.children, containerId, item)
      };
    }
    
    return container;
  });
}

// Helper function to edit an item in containers
function editItemInContainers(containers: Container[], updatedItem: Item): Container[] {
  return containers.map(container => {
    const updatedItems = container.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    return {
      ...container,
      items: updatedItems,
      children: container.children 
        ? editItemInContainers(container.children, updatedItem) 
        : container.children
    };
  });
}

// Helper function to delete items from containers
function deleteItemsFromContainers(containers: Container[], itemIds: string[]): Container[] {
  return containers.map(container => {
    const updatedItems = container.items.filter(item => !itemIds.includes(item.id));
    
    return {
      ...container,
      items: updatedItems,
      children: container.children 
        ? deleteItemsFromContainers(container.children, itemIds) 
        : container.children
    };
  });
}

// Helper function to add a location to a parent
function addLocationToParent(containers: Container[], parentId: string, newLocation: Container): Container[] {
  return containers.map(container => {
    if (container.id === parentId) {
      return {
        ...container,
        children: [...(container.children || []), newLocation]
      };
    }
    
    if (container.children) {
      return {
        ...container,
        children: addLocationToParent(container.children, parentId, newLocation)
      };
    }
    
    return container;
  });
}

// Create and export the store
export const inventoryStore = createInventoryStore();
