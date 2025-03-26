<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Textarea } from '$lib/components/ui/textarea';
    import type { Item } from '$lib/types';
  
    export let open: boolean;
    export let onClose: () => void;
    export let onAddItem: (newItem: Partial<Item>) => void;
    export let defaultLocation: string = '';
  
    let title = '';
    let description = '';
  
    function handleSubmit() {
      if (!title.trim()) return;
      
      onAddItem({
        itemName: title,
        description: description || undefined,
        itemLocation: { path: defaultLocation }
      });
      
      reset();
      onClose();
    }
  
    function reset() {
      title = '';
      description = '';
    }
  
    $: if (!open) {
      reset();
    }
</script>
  
<Dialog {open} onOpenChange={onClose}>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Add New Item</DialogTitle>
      <DialogDescription>Add a new item to your inventory</DialogDescription>
    </DialogHeader>
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Input
            id="title"
            placeholder="Item Name"
            bind:value={title}
          />
        </div>
        
        <div class="space-y-2">
          <Textarea
            id="description"
            placeholder="Description (optional)"
            bind:value={description}
          />
        </div>
        
        <div class="space-y-2">
          <Input
            id="location"
            placeholder="Location"
            value={defaultLocation}
            disabled
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" on:click={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Item</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
  