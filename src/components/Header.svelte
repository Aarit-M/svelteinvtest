<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { theme, toggleTheme } from '$lib/stores/theme';
    import logo from '../../2554_logo.png';

    export let searchQuery = '';
    export let selectedItems: string[] = [];
  
    const dispatch = createEventDispatcher();
  
    function handleSearchChange(event) {
      dispatch('searchChange', event.target.value);
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
  </script>
  
  <header class="sticky top-0 z-50 w-full bg-[#333] dark:bg-[#222] text-white flex items-center px-4 py-3 shadow-md">
    <div class="flex items-center space-x-3">
      <img 
        src={logo} 
        alt="Team 2554 Logo" 
        class="h-9 w-auto"
      />
      <h1 class="text-xl font-semibold hidden sm:block">Team 2554 Inventory Management</h1>
      <h1 class="text-xl font-semibold sm:hidden">Inventory</h1>
    </div>
    
    <div class="relative ml-auto flex items-center space-x-2 md:space-x-4">
      <div class="relative w-40 md:w-64">
        <Input 
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          on:input={handleSearchChange}
          class="pl-8 bg-[#444] dark:bg-[#333] border-[#555] text-white placeholder:text-gray-400 h-9"
        />
        <Icon icon="lucide:search" class="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
      </div>
  
      {#if selectedItems.length > 0}
        <div class="flex items-center gap-2">
          <span class="mr-1 text-sm hidden md:inline">{selectedItems.length} Selected</span>
          <Button 
            variant="destructive"
            size="sm"
            on:click={handleDelete}
            class="h-9"
          >
            <Icon icon="lucide:trash-2" class="h-4 w-4 mr-1" />
            <span class="hidden md:inline">Delete</span>
          </Button>
          <Button 
            variant="outline"
            size="sm"
            on:click={handleGroupIntoLocation}
            class="h-9 text-white border-white hover:bg-white/10"
          >
            <Icon icon="lucide:folder-plus" class="h-4 w-4 mr-1" />
            <span class="hidden md:inline">Group</span>
          </Button>
        </div>
      {/if}
  
      <Button
        variant="ghost"
        size="icon"
        on:click={toggleTheme}
        class="ml-2 text-white hover:bg-white/10"
      >
        {#if $theme === 'dark'}
          <Icon icon="lucide:sun" class="h-5 w-5" />
        {:else}
          <Icon icon="lucide:moon" class="h-5 w-5" />
        {/if}
      </Button>
    </div>
  </header>
  