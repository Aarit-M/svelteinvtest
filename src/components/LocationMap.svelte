
<script lang="ts">
    import { Dialog } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { MapPin } from 'lucide-svelte';
  
    export let showMap: boolean;
    export let onClose: () => void;
    export let location: string;
  </script>
  
  <Dialog open={showMap} onOpenChange={onClose}>
    <div slot="content" class="sm:max-w-md md:max-w-lg">
      <div slot="header">
        <div slot="title">Location Map</div>
        <div slot="description">{location}</div>
      </div>
      <div class="p-6">
        <div class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
          <div class="text-center p-4">
            <MapPin class="h-12 w-12 mx-auto mb-2 text-primary" />
            <p class="text-lg font-medium">{location}</p>
            <p class="text-sm text-muted-foreground">
              Map visualization would appear here
            </p>
          </div>
        </div>
        <div class="flex justify-end">
          <Button on:click={onClose}>Close</Button>
        </div>
      </div>
    </div>
  </Dialog>
  