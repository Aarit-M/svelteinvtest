<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
  
    export let open: boolean;
    export let onClose: () => void;
</script>
  
<Dialog {open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Help & Tips</DialogTitle>
      <DialogDescription>How to use this inventory management system</DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium">Getting Started</h3>
        <p class="text-sm text-muted-foreground">
          Create locations to organize your items, then add items to these locations.
        </p>
      </div>
      
      <div>
        <h3 class="text-lg font-medium">Managing Items</h3>
        <ul class="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>Click on a location to view its items</li>
          <li>Use the search to find items across all locations</li>
          <li>Select multiple items to move or delete them together</li>
        </ul>
      </div>
      
      <div>
        <h3 class="text-lg font-medium">Keyboard Shortcuts</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>Ctrl+F</div><div>Search</div>
          <div>Ctrl+N</div><div>New Item</div>
          <div>Delete</div><div>Delete Selected</div>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button on:click={onClose}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  