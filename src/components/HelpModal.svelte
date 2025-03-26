<script lang="ts">
    import { X, Info, Plus, Search, Move, Eye } from 'lucide-svelte';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Separator } from '$lib/components/ui/separator';
  
    export let open = false;
    export let onClose = () => {};
</script>
  
<Dialog.Root bind:open onOpenChange={(isOpen) => !isOpen && onClose()}>
  <Dialog.Content class="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in bg-white dark:bg-gray-950">
    <Dialog.Header>
      <Dialog.Title class="text-center text-xl flex items-center justify-center">
        <Info class="mr-2 h-5 w-5" />
        Inventory Management Help
      </Dialog.Title>
    </Dialog.Header>
    <button 
      on:click={onClose} 
      class="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
    >
      <X class="h-4 w-4" />
    </button>

    <div class="space-y-6 pt-4">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">
            Welcome to Team 2554's Inventory Management System. This tool helps you organize, track, and manage all items in your inventory.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Basic Features</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex">
            <div class="mr-4 bg-primary/10 p-2 rounded-full">
              <Plus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-medium">Adding Items</h4>
              <p class="text-muted-foreground text-sm">Click "New Item" to add items to your inventory. Provide as much detail as possible.</p>
            </div>
          </div>
          <div class="flex">
            <div class="mr-4 bg-primary/10 p-2 rounded-full">
              <Plus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-medium">Creating Locations</h4>
              <p class="text-muted-foreground text-sm">Click "New Location" to create storage locations. You can create a hierarchy.</p>
            </div>
          </div>
          <div class="flex">
            <div class="mr-4 bg-primary/10 p-2 rounded-full">
              <Search class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-medium">Searching</h4>
              <p class="text-muted-foreground text-sm">Use the search bar to find items by name or description.</p>
            </div>
          </div>
          <div class="flex">
            <div class="mr-4 bg-primary/10 p-2 rounded-full">
              <Move class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-medium">Drag and Drop</h4>
              <p class="text-muted-foreground text-sm">Organize your inventory by dragging and dropping items or locations.</p>
            </div>
          </div>
          <div class="flex">
            <div class="mr-4 bg-primary/10 p-2 rounded-full">
              <Eye class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-medium">Viewing Items</h4>
              <p class="text-muted-foreground text-sm">Click the eye icon to view detailed information about an item.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Tips & Tricks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-start">
              <span class="font-bold mr-2">•</span>
              <span>Use consistent naming conventions for easier searching</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">•</span>
              <span>Create a logical location hierarchy that mimics your physical space</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">•</span>
              <span>Take photos of items in their locations to make them easier to find</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">•</span>
              <span>Use the "Group Into Location" feature to move multiple items at once</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Separator />
      
      <Button on:click={onClose} class="w-full">
        Got It
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
  