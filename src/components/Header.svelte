<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import ThemeToggle from './ThemeToggle.svelte';
    import SearchBar from './SearchBar.svelte';
    import { Trash2, FolderPlus, Plus, FolderUp, HelpCircle } from 'lucide-svelte';
    
    const logo = '/2554_logo.png';
    export let searchQuery = '';
    export let selectedItems: string[] = [];

    const dispatch = createEventDispatcher();

    function handleSearchChange(value: string) {
      dispatch('searchChange', value);
    }
    
    function handleClearSearch() {
      searchQuery = '';
      dispatch('searchChange', '');
    }

    function handleClearSelection() {
      dispatch('clearSelection');
    }

    function handleDelete() {
      dispatch('delete');
    }

    function handleGroupIntoLocation() {
      dispatch('groupIntoLocation');
    }

    function handleAddItem() {
      dispatch('addItem');
    }

    function handleAddLocation() {
      dispatch('addLocation');
    }

    function handleShowHelp() {
      dispatch('showHelp');
    }
    
    interface ChangeEvent {
      detail: string;
    }
</script>

<header class="app-header sticky top-0 z-50 w-full flex items-center px-4 py-3 shadow-md">
  <!-- Left: Logo and Title -->
  <div class="flex items-center">
    <img 
      src={logo} 
      alt="Team 2554 Logo" 
      class="h-9 w-auto mr-3"
    />
    <h1 class="text-xl font-semibold hidden sm:block">Team 2554 Inventory Management</h1>
    <h1 class="text-xl font-semibold sm:hidden">Inventory</h1>
  </div>

  <!-- Center: Search Bar -->
  <div class="flex-1 flex justify-center">
    <div class="relative w-64">
      <SearchBar
        value={searchQuery}
        on:change={(event: ChangeEvent) => handleSearchChange(event.detail)}
        on:clear={handleClearSearch}
        className="header-search-input w-full"
      />
    </div>
  </div>

  <!-- Right: Buttons -->
  <div class="flex items-center gap-2">
    {#if selectedItems.length > 0}
      <!-- Selection Actions -->
      <span class="mr-1 text-sm">{selectedItems.length} Selected</span>
      <Button 
        variant="destructive"
        size="sm"
        on:click={handleDelete}
        class="h-9"
      >
        <Trash2 class="h-4 w-4 mr-1" />
        <span class="hidden md:inline">Delete</span>
      </Button>
      <Button 
        variant="outline"
        size="sm"
        on:click={handleGroupIntoLocation}
        class="h-9 hover:bg-base-300"
      >
        <FolderPlus class="h-4 w-4 mr-1" />
        <span class="hidden md:inline">Group</span>
      </Button>
    {:else}
      <!-- Normal Buttons -->
      <Button
        variant="outline"
        size="sm"
        on:click={handleAddItem}
        class="h-9 hover:bg-base-300"
      >
        <Plus class="h-4 w-4 mr-1" />
        <span>Add Item</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        on:click={handleAddLocation}
        class="h-9 hover:bg-base-300"
      >
        <FolderUp class="h-4 w-4 mr-1" />
        <span>Add Location</span>
      </Button>
    {/if}
    <Button
      variant="ghost"
      size="icon"
      on:click={handleShowHelp}
      class="hover:bg-base-300"
      aria-label="Help"
    >
      <HelpCircle class="h-5 w-5" />
    </Button>
    <ThemeToggle />
  </div>
</header>

<style>
  /* Ensure the header text is visible in both themes */
  .app-header {
    color: var(--header-fg);
  }
</style>
