// place files you want to import through the `$lib` alias in this folder.

import type { SvelteActionReturnType } from 'svelte/action';
import { writable } from 'svelte/store';

// Atlas Kit-inspired drag and drop for Svelte

/**
 * DragDropState interface that tracks the current drag operation
 */
export interface DragDropState<T = unknown> {
  isDragging: boolean;
  draggedItem: T | null;
  sourceContainer: string | null;
  targetContainer: string | null;
  attributes?: DragDropAttributes;
}

export interface DragDropAttributes {
  draggingClass?: string;
  dragOverClass?: string;
}

// Global store for tracking drag state - similar to Atlas Kit's monitor
export const dndState = writable<{
  isDragging: boolean;
  draggedItem: any | null;
  sourceContainer: string | null;
  targetContainer: string | null;
  invalidDrop: boolean;
}>({
  isDragging: false,
  draggedItem: null,
  sourceContainer: null,
  targetContainer: null,
  invalidDrop: false
});

// Options for draggable directive
export interface DraggableOptions<T = any> {
  container: string;
  dragData: T;
  disabled?: boolean;
  callbacks?: {
    onDragStart?: (state: DragDropState<T>, event?: DragEvent) => void;
    onDragEnd?: (state: DragDropState<T>, event?: DragEvent) => void;
  };
}

// Options for droppable directive
export interface DroppableOptions<T = any> {
  container: string;
  disabled?: boolean;
  attributes?: DragDropAttributes;
  canDrop?: (state: { source: { data: any } }) => boolean;
  callbacks?: {
    onDragEnter?: (state: DragDropState<T>, event?: DragEvent) => void;
    onDragLeave?: (state: DragDropState<T>, event?: DragEvent) => void;
    onDragOver?: (state: DragDropState<T>, event?: DragEvent) => void;
    onDrop?: (state: DragDropState<T>, event?: DragEvent) => Promise<void> | void;
  };
}

/**
 * Draggable action that makes an element draggable
 * 
 * Similar to Atlas Kit's draggable function, this attaches drag event
 * handlers to an element
 */
export function draggable<T = any>(
  node: HTMLElement, 
  options: DraggableOptions<T>
): SvelteActionReturnType {
  const { container, dragData, disabled = false, callbacks = {} } = options;
  
  // Exit early if dragging is disabled
  if (disabled) {
    return {
      update() {},
      destroy() {}
    };
  }

  // Add CSS class to indicate draggable
  node.classList.add('svelte-dnd-draggable');
  
  // Function to handle drag start
  function handleDragStart(event: DragEvent) {
    // Set data transfer
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ 
        containerId: container,
        data: dragData 
      }));
    }
    
    // Update global state
    dndState.update(state => ({
      ...state,
      isDragging: true,
      draggedItem: dragData,
      sourceContainer: container,
      targetContainer: null
    }));
    
    // Add dragging class
    node.classList.add('svelte-dnd-dragging');
    
    // Call callback if provided
    if (callbacks.onDragStart) {
      callbacks.onDragStart({
        isDragging: true,
        draggedItem: dragData,
        sourceContainer: container,
        targetContainer: null
      }, event);
    }
  }
  
  // Function to handle drag end
  function handleDragEnd(event: DragEvent) {
    // Remove dragging class
    node.classList.remove('svelte-dnd-dragging');
    
    // Call callback if provided
    if (callbacks.onDragEnd) {
      callbacks.onDragEnd({
        isDragging: false,
        draggedItem: null,
        sourceContainer: null,
        targetContainer: null
      }, event);
    }
    
    // Reset global state
    dndState.update(state => ({
      ...state,
      isDragging: false,
      draggedItem: null,
      sourceContainer: null,
      targetContainer: null,
      invalidDrop: false
    }));
  }
  
  // Add event listeners
  node.setAttribute('draggable', 'true');
  node.addEventListener('dragstart', handleDragStart);
  node.addEventListener('dragend', handleDragEnd);
  
  return {
    update(newOptions: DraggableOptions<T>) {
      const { container: newContainer, dragData: newDragData, disabled: newDisabled = false } = newOptions;
      
      // Update options
      Object.assign(options, {
        container: newContainer,
        dragData: newDragData,
        disabled: newDisabled
      });
    },
    destroy() {
      // Remove event listeners
      node.removeAttribute('draggable');
      node.removeEventListener('dragstart', handleDragStart);
      node.removeEventListener('dragend', handleDragEnd);
    }
  };
}

/**
 * Droppable action that makes an element a drop target
 * 
 * Similar to Atlas Kit's dropTargetForElements function
 */
export function droppable<T = any>(
  node: HTMLElement, 
  options: DroppableOptions<T>
): SvelteActionReturnType {
  const { 
    container, 
    disabled = false, 
    canDrop = () => true,
    attributes = { 
      dragOverClass: 'drag-over' 
    }, 
    callbacks = {} 
  } = options;
  
  // Exit early if dropping is disabled
  if (disabled) {
    return {
      update() {},
      destroy() {}
    };
  }
  
  // Function to handle drag enter
  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    
    // Get current drag state
    let currentDragData: any = null;
    let sourceContainer: string | null = null;
    
    dndState.update(state => {
      currentDragData = state.draggedItem;
      sourceContainer = state.sourceContainer;
      return state;
    });
    
    // Check if drop is allowed
    const isValidDrop = canDrop({ 
      source: { 
        data: { 
          location: currentDragData?.location,
          pieceType: currentDragData?.type,
          ...currentDragData 
        } 
      } 
    });
    
    if (!isValidDrop) {
      return;
    }
    
    // Update global state
    dndState.update(state => ({
      ...state,
      targetContainer: container,
      invalidDrop: false
    }));
    
    // Add drag over class
    if (attributes.dragOverClass) {
      node.classList.add(attributes.dragOverClass);
    }
    
    // Call callback if provided
    if (callbacks.onDragEnter) {
      callbacks.onDragEnter({
        isDragging: true,
        draggedItem: currentDragData,
        sourceContainer: sourceContainer,
        targetContainer: container
      }, event);
    }
  }
  
  // Function to handle drag over
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    
    // Specify drop effect
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    // Call callback if provided
    if (callbacks.onDragOver) {
      let currentDragData: any = null;
      let sourceContainer: string | null = null;
      
      dndState.update(state => {
        currentDragData = state.draggedItem;
        sourceContainer = state.sourceContainer;
        return state;
      });
      
      callbacks.onDragOver({
        isDragging: true,
        draggedItem: currentDragData,
        sourceContainer: sourceContainer,
        targetContainer: container
      }, event);
    }
  }
  
  // Function to handle drag leave
  function handleDragLeave(event: DragEvent) {
    // Make sure we're leaving the actual target, not a child
    const relatedTarget = event.relatedTarget as Node;
    if (node.contains(relatedTarget)) {
      return;
    }
    
    // Remove drag over class
    if (attributes.dragOverClass) {
      node.classList.remove(attributes.dragOverClass);
    }
    
    // Call callback if provided
    if (callbacks.onDragLeave) {
      let currentDragData: any = null;
      let sourceContainer: string | null = null;
      
      dndState.update(state => {
        currentDragData = state.draggedItem;
        sourceContainer = state.sourceContainer;
        return state;
      });
      
      callbacks.onDragLeave({
        isDragging: true,
        draggedItem: currentDragData,
        sourceContainer: sourceContainer,
        targetContainer: null
      }, event);
    }
    
    // Update global state
    dndState.update(state => ({
      ...state,
      targetContainer: null
    }));
  }
  
  // Function to handle drop
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    
    // Remove drag over class
    if (attributes.dragOverClass) {
      node.classList.remove(attributes.dragOverClass);
    }
    
    // Get the data
    let sourceData = null;
    let sourceId = null;
    
    if (event.dataTransfer) {
      const rawData = event.dataTransfer.getData('text/plain');
      if (rawData) {
        try {
          const parsedData = JSON.parse(rawData);
          sourceData = parsedData.data;
          sourceId = parsedData.containerId;
        } catch (e) {
          console.error('Error parsing drop data', e);
        }
      }
    }
    
    // Check if drop is allowed
    const isValidDrop = canDrop({ 
      source: { 
        data: { 
          location: sourceData?.location,
          pieceType: sourceData?.type,
          ...sourceData 
        } 
      } 
    });
    
    if (!isValidDrop) {
      return;
    }
    
    // Call callback if provided
    if (callbacks.onDrop) {
      callbacks.onDrop({
        isDragging: false,
        draggedItem: sourceData,
        sourceContainer: sourceId,
        targetContainer: container
      }, event);
    }
  }
  
  // Add event listeners
  node.addEventListener('dragenter', handleDragEnter);
  node.addEventListener('dragover', handleDragOver);
  node.addEventListener('dragleave', handleDragLeave);
  node.addEventListener('drop', handleDrop);
  
  return {
    update(newOptions: DroppableOptions<T>) {
      // Update options
      Object.assign(options, newOptions);
    },
    destroy() {
      // Remove event listeners
      node.removeEventListener('dragenter', handleDragEnter);
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('dragleave', handleDragLeave);
      node.removeEventListener('drop', handleDrop);
    }
  };
}

/**
 * Monitor for drag and drop operations
 * Similar to Atlas Kit's monitorForElements
 * 
 * @param options Monitor options
 */
export function monitorForElements(options: {
  onDrop?: (args: { 
    source: { data: any },
    location: { 
      current: { 
        dropTargets: Array<{ data: any }> 
      } 
    }
  }) => void,
  canMonitor?: (args: { source: { data: any } }) => boolean
}) {
  // Subscribe to the dnd store
  const unsubscribe = dndState.subscribe(state => {
    // Skip if not relevant
    if (!state.isDragging || !state.draggedItem || !state.targetContainer) {
      return;
    }
    
    // Check if we can monitor this drag
    if (options.canMonitor && !options.canMonitor({ source: { data: state.draggedItem } })) {
      return;
    }
    
    // Call onDrop handler when drop happens
    if (!state.isDragging && options.onDrop) {
      options.onDrop({
        source: { data: state.draggedItem },
        location: {
          current: {
            dropTargets: state.targetContainer ? [
              { data: { id: state.targetContainer } }
            ] : []
          }
        }
      });
    }
  });
  
  // Return cleanup function
  return unsubscribe;
}
