
<script lang="ts">
    import { Camera, X, Upload } from 'lucide-svelte';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Label } from '$lib/components/ui/label';
    import type { Item } from '$lib/types';
    import { Card } from '$lib/components/ui/card';
    import { toast } from '$lib/components/ui/use-toast';
    import { onMount } from 'svelte';
    
    export let open: boolean;
    export let onClose: () => void;
    export let onAddItem: (newItem: Partial<Item>) => void;
    export let defaultLocation: string = '';
  
    let itemName = '';
    let description = '';
    let location = defaultLocation;
    let measurementValue: number | undefined = undefined;
    let measurementUnit = '';
    let imageSrc: string | undefined = undefined;
    
    // Camera Elements
    let showCamera = false;
    let videoElement: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let mediaStream: MediaStream | null = null;
  
    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoElement) {
                videoElement.srcObject = mediaStream;
            }
        } catch (err) {
            toast({ title: "Camera Error", description: "Unable to access camera", variant: "destructive" });
        }
    }
    
    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }
    
    function capturePhoto() {
        const context = canvasElement.getContext('2d');
        if (context && videoElement) {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            imageSrc = canvasElement.toDataURL('image/png');
            stopCamera();
            showCamera = false;
        }
    }
    
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                imageSrc = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }
  
    function handleSubmit() {
        if (!itemName) {
            toast({ title: "Error", description: "Item name is required", variant: "destructive" });
            return;
        }
      
        const newItem: Partial<Item> = {
            itemName,
            description: description || undefined,
            itemLocation: { path: location || defaultLocation },
            image: imageSrc
        };
      
        if (measurementValue && measurementUnit) {
            newItem.itemMeasurements = {
                size: measurementValue,
                unit: measurementUnit
            };
        }
      
        onAddItem(newItem);
        onClose();
    }
</script>
  
<Dialog.Root bind:open onOpenChange={(isOpen) => {
  if (!isOpen) {
    resetForm();
    onClose();
  }
}}>
  <Dialog.Content class="sm:max-w-md animate-fade-in">
    <Dialog.Header>
      <Dialog.Title class="text-center text-xl">Add New Item</Dialog.Title>
    </Dialog.Header>
    <button 
      on:click={onClose} 
      class="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
    >
      <X class="h-4 w-4" />
    </button>

    <div class="space-y-4 pt-4">
      <div class="space-y-2">
        <Label for="itemName">Item Name</Label>
        <Input
          id="itemName"
          bind:value={itemName}
          placeholder="Enter item name"
        />
      </div>

      <div class="space-y-2">
        <Label for="description">Description</Label>
        <Textarea
          id="description"
          bind:value={description}
          placeholder="Enter item description"
          rows={3}
          class="resize-none"
        />
      </div>

      <div class="space-y-2">
        <Label for="location">Location</Label>
        <Input
          id="location"
          bind:value={location}
          placeholder="Enter item location"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="measurementValue">Measurement</Label>
          <Input
            id="measurementValue"
            type="number"
            bind:value={measurementValue}
            placeholder="Value"
          />
        </div>

        <div class="space-y-2">
          <Label for="measurementUnit">Unit</Label>
          <select
            id="measurementUnit"
            bind:value={measurementUnit}
            class="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 form-select"
          >
            {#each MEASUREMENT_TYPES as type}
              <option value={type.value}>
                {type.label}
              </option>
            {/each}
          </select>
        </div>
      </div>

      <div class="space-y-2">
        <Label>Image</Label>
        <Card class="p-0 overflow-hidden">
          <div class="p-0">
            {#if imageSrc}
              <div class="relative">
                <img 
                  src={imageSrc} 
                  alt="Item preview" 
                  class="mx-auto h-48 object-contain"
                />
                <button
                  on:click={() => imageSrc = undefined}
                  class="absolute top-2 right-2 bg-white dark:bg-gray-800 p-1 rounded-full shadow"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            {:else}
              <div class="grid grid-cols-2 gap-2 p-4">
                <Button
                  type="button"
                  variant="outline"
                  on:click={handleShowCamera}
                  class="flex-1 h-24"
                >
                  <Camera class="mr-2 h-5 w-5" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  on:click={handleUploadImage}
                  class="flex-1 h-24"
                >
                  <Upload class="mr-2 h-5 w-5" />
                  Upload Image
                </Button>
              </div>
            {/if}
          </div>
        </Card>
      </div>

      <Dialog.Footer class="pt-4">
        <Button 
          on:click={handleSubmit} 
          class="w-full"
        >
          Add Item
        </Button>
      </Dialog.Footer>
    </div>
  </Dialog.Content>
</Dialog.Root>

<!-- Camera Dialog -->
<Dialog.Root bind:open={showCamera} onOpenChange={(isOpen) => !isOpen && handleCameraClose()}>
  <Dialog.Content class="sm:max-w-md animate-fade-in">
    <Dialog.Header>
      <Dialog.Title>Take a Photo</Dialog.Title>
    </Dialog.Header>
    
    <div class="space-y-4">
      <div class="relative bg-black rounded-md aspect-video flex items-center justify-center overflow-hidden">
        {#if cameraActive}
          <video 
            bind:this={videoElement} 
            autoplay 
            playsinline 
            class="w-full h-full object-cover"
          ></video>
        {:else}
          <div class="text-gray-500">Starting camera...</div>
        {/if}
        <canvas bind:this={canvasElement} class="hidden"></canvas>
      </div>
      
      <Button 
        on:click={capturePhoto} 
        class="w-full"
        disabled={!cameraActive}
      >
        Capture Photo
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
  
