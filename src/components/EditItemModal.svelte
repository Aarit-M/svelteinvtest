<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Textarea } from '$lib/components/ui/textarea';
    import type { Item } from '$lib/types';
  
    export let open: boolean;
    export let onClose: () => void;
    export let onEdit: (item: Item) => void;
    export let item: Item;
  
    let editedTitle = '';
    let editedDescription = '';
  
    $: if (item && open) {
      editedTitle = item.itemName;
      editedDescription = item.description || '';
    }
  
    function handleSubmit() {
      if (!editedTitle.trim()) return;
      
      onEdit({
        ...item,
        itemName: editedTitle,
        description: editedDescription || undefined
      });
      
      onClose();
    }
</script>
  
<Dialog {open} onOpenChange={onClose}>
  <DialogContent class="sm:max-w-md bg-white dark:bg-gray-950">
    <DialogHeader>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogDescription>Make changes to your item</DialogDescription>
    </DialogHeader>
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Input
            id="title"
            placeholder="Item Name"
            bind:value={editedTitle}
          />
        </div>
        
        <div class="space-y-2">
          <Textarea
            id="description"
            placeholder="Description (optional)"
            bind:value={editedDescription}
          />
        </div>
        
        <div class="space-y-2">
          <Input
            id="location"
            placeholder="Location"
            value={item?.itemLocation?.path || ''}
            disabled
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" on:click={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>