<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import ThemeToggle from './ThemeToggle.svelte';
    const logo = '/2554_logo.png';
    export let searchQuery = '';
    export let selectedItems: string[] = [];

    const dispatch = createEventDispatcher();

    function handleSearchChange(event: Event) {
      const target = event.target as HTMLInputElement;
      dispatch('searchChange', target.value);
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
</script>

<header class="sticky top-0 z-50 w-full bg-primary text-primary-foreground flex items-center px-4 py-3 shadow-md">
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
      <Input 
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        on:input={handleSearchChange}
        class="pl-8 w-full bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 h-9 focus:bg-primary-foreground/20"
      />
      <Icon icon="material-symbols:search" class="h-4 w-4 absolute left-2.5 top-2.5 text-primary-foreground/60" />
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
        <Icon icon="material-symbols:delete" class="h-4 w-4 mr-1" />
        <span class="hidden md:inline">Delete</span>
      </Button>
      <Button 
        variant="outline"
        size="sm"
        on:click={handleGroupIntoLocation}
        class="h-9 text-primary-foreground border-primary-foreground/60 hover:bg-primary-foreground/10"
      >
        <Icon icon="material-symbols:folder-add" class="h-4 w-4 mr-1" />
        <span class="hidden md:inline">Group</span>
      </Button>
    {:else}
      <!-- Normal Buttons -->
      <Button
        variant="outline"
        size="sm"
        on:click={handleAddItem}
        class="h-9 text-primary-foreground border-primary-foreground/60 hover:bg-primary-foreground/10"
      >
        <Icon icon="material-symbols:add" class="h-4 w-4 mr-1" />
        <span>Add Item</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        on:click={handleAddLocation}
        class="h-9 text-primary-foreground border-primary-foreground/60 hover:bg-primary-foreground/10"
      >
        <Icon icon="material-symbols:create-new-folder" class="h-4 w-4 mr-1" />
        <span>Add Location</span>
      </Button>
    {/if}
    <Button
      variant="ghost"
      size="icon"
      on:click={handleShowHelp}
      class="text-primary-foreground hover:bg-primary-foreground/10"
      aria-label="Help"
    >
      <Icon icon="material-symbols:help" class="h-5 w-5" />
    </Button>
    <ThemeToggle />
  </div>
</header>
