<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    
    const logo = '/2554_logo.png';
    export let searchQuery = '';

    const dispatch = createEventDispatcher();

    function handleSearchChange(event: Event) {
      const target = event.target as HTMLInputElement;
      dispatch('searchChange', target.value);
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

<header class="sticky top-0 z-50 w-full bg-gray-900 text-white px-6 py-3 shadow">
  <div class="flex flex-col w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center">
        <img 
          src={logo} 
          alt="Team 2554 Logo" 
          class="h-9 w-auto mr-4"
        />
        <h1 class="text-xl font-semibold">Team 2554 Inventory Management</h1>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative w-72">
          <Input 
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            on:input={handleSearchChange}
            class="pl-8 w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-9 focus:bg-gray-700"
          />
          <Icon icon="material-symbols:search" class="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="text-white hover:bg-gray-700"
          aria-label="Theme Toggle"
        >
          <Icon icon="material-symbols:dark-mode" class="h-5 w-5" />
        </Button>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          on:click={handleAddItem}
          class="h-9 border-gray-500 text-white hover:bg-gray-700"
        >
          <Icon icon="material-symbols:add" class="h-5 w-5 mr-1" />
          <span>New Item</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          on:click={handleAddLocation}
          class="h-9 border-gray-500 text-white hover:bg-gray-700"
        >
          <Icon icon="material-symbols:create-new-folder" class="h-5 w-5 mr-1" />
          <span>New Location</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        on:click={handleShowHelp}
        class="text-white hover:bg-gray-700"
        aria-label="Help"
      >
        <Icon icon="material-symbols:help" class="h-5 w-5" />
      </Button>
    </div>
  </div>
</header>
