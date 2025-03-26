<script lang="ts">
    import { onMount } from 'svelte';
    import { X, FolderPlus } from 'lucide-svelte';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { cn } from '$lib/utils';
    import type { Container } from '$lib/types';
    import { v4 as uuidv4 } from 'uuid';
    import { toast } from 'svelte-sonner';
  
    export let open: boolean;
    export let onClose: () => void;
    export let onAddLocation: (location: Partial<Container>) => void;
    export let containers: Container[] = [];
  
    let locationName = '';
  
    function resetForm() {
      locationName = '';
    }
  
    function handleSubmit() {
      if (!locationName) {
        toast({
          title: "Error",
          description: "Location name is required"
        });
        return;
      }
  
      const newLocation: Partial<Container> = {
        id: uuidv4(),
        containerName: locationName,
        containerLocation: { path: '/' + locationName },
        items: [],
        children: []
      };
  
      onAddLocation(newLocation);
      resetForm();
      onClose();
      
      toast({
        title: "Success",
        description: "Location added successfully"
      });
    }
  
    onMount(() => {
      resetForm();
    });
</script>
  
<Dialog {open} onOpenChange={(isOpen) => {
  if (!isOpen) {
    resetForm();
    onClose();
  }
}}>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle class="flex items-center justify-center gap-2">
        <FolderPlus class="h-5 w-5" />
        Add New Location
      </DialogTitle>
      <DialogDescription>Create a new location to organize your items</DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 pt-4">
      <div class="space-y-2">
        <Label for="locationName">Location Name</Label>
        <Input
          id="locationName"
          bind:value={locationName}
          placeholder="Enter location name"
        />
      </div>

      <DialogFooter class="pt-4">
        <Button 
          on:click={handleSubmit} 
          class="w-full"
          disabled={!locationName}
        >
          Add Location
        </Button>
      </DialogFooter>
    </div>
  </DialogContent>
</Dialog>
  