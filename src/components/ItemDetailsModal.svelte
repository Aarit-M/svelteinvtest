<script lang="ts">
    import { X, Edit, Plus, Hash, Camera, ArrowUpToLine, Upload } from 'lucide-svelte';
    import type { Item } from '$lib/types';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import AddItemModal from '../components/AddItemModal.svelte';
    import EditItemModal from '../components/EditItemModal.svelte';
    import { Card } from '$lib/components/ui/card';
    import { Separator } from '$lib/components/ui/separator';
    import { toast } from 'svelte-sonner';
    import { getPlaceholderImage } from '$lib/utils';
    import { MapPin } from 'lucide-svelte';
  
    export let open: boolean;
    export let onClose: () => void;
    export let item: Item | null;
    export let onEdit: (updatedItem: Item) => void;
    export let onAddItem: (newItem: Partial<Item>) => void;
  
    let showAddModal = false;
    let showEditModal = false;
    let showFullImage = false;
    let showCamera = false;
    
    // Camera functionality
    let videoElement: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let cameraActive = false;
    let mediaStream: MediaStream | null = null;
    let fileInput: HTMLInputElement;
    
    // Start camera
    async function handleTakePhoto() {
      showCamera = true;
      setTimeout(startCamera, 300);
    }
    
    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera not supported in this browser");
        }
        
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoElement) {
          videoElement.srcObject = mediaStream;
          cameraActive = true;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        toast.error("Unable to access camera. Please check permissions.");
      }
    }
    
    function stopCamera() {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject = null;
        }
        mediaStream = null;
        cameraActive = false;
      }
    }
    
    function capturePhoto() {
      if (videoElement && canvasElement && cameraActive) {
        const context = canvasElement.getContext('2d');
        
        if (context) {
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
          
          try {
            // Compress image for storage efficiency
            const imageData = canvasElement.toDataURL('image/jpeg', 0.7);
            
            if (item) {
              onEdit({
                ...item,
                image: imageData
              });
              toast.success("Photo updated successfully");
            }
            
            showCamera = false;
            stopCamera();
          } catch (err) {
            console.error("Error capturing photo: ", err);
            toast.error("Failed to capture photo");
          }
        }
      }
    }
    
    function handleCameraClose() {
      stopCamera();
      showCamera = false;
    }
    
    // File upload functionality
    function handleUploadImage() {
      if (fileInput) {
        fileInput.click();
      }
    }
    
    function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        
        // Check file type
        if (!file.type.match('image.*')) {
          toast.error("Please select an image file");
          return;
        }
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image too large. Please select an image under 5MB");
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string' && item) {
            onEdit({
              ...item,
              image: result
            });
            toast.success("Image uploaded successfully");
          }
        };
        reader.onerror = () => {
          toast.error("Failed to read file");
        };
        
        reader.readAsDataURL(file);
      }
    }
    
    function formatMeasurement(item: Item) {
      if (!item.itemMeasurements) return '';
      
      const { size, unit } = item.itemMeasurements;
      
      const unitMap: Record<string, string> = {
        'ft': 'feet',
        'lbs': 'pounds',
        'oz': 'ounces',
        'V': 'volts',
        'pcs': 'pieces'
      };
      
      return `${size} ${unitMap[unit] || unit}`;
    }

    // Function to get image src with fallback to placeholder
    function getItemImage(item: Item | null): string {
      if (!item) return getPlaceholderImage('item');
      return item.image || getPlaceholderImage('item', item.itemName);
    }
    
    // Open edit modal
    function openEditModal() {
      showEditModal = true;
    }
</script>
  
{#if item}
  <Dialog.Root bind:open onOpenChange={onClose}>
    <Dialog.Content class="sm:max-w-md animate-fade-in bg-white dark:bg-gray-950">
      <Dialog.Header>
        <Dialog.Title class="text-xl font-semibold flex items-center">
          <span class="truncate">{item.itemName}</span>
        </Dialog.Title>
      </Dialog.Header>
      <button 
        on:click={onClose} 
        class="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <X class="h-4 w-4" />
      </button>
      
      <div class="space-y-6 pt-2">
        <Card class="overflow-hidden border shadow-sm">
          <div class="relative p-0">
            <div 
              class="aspect-video bg-black flex items-center justify-center cursor-pointer overflow-hidden"
              on:click={() => showFullImage = true}
              on:keydown={(e) => e.key === 'Enter' && (showFullImage = true)}
              tabindex={0}
              role="button"
              aria-label="View full image"
            >
              <img 
                src={getItemImage(item)} 
                alt={item.itemName} 
                class="max-h-full max-w-full object-contain"
              />
              <div class="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <ArrowUpToLine class="h-8 w-8 text-white drop-shadow-md" />
              </div>
            </div>
            
            <div class="absolute bottom-2 right-2 flex gap-2">
              <Button variant="outline" size="sm" on:click={handleTakePhoto} class="text-xs bg-white/80 hover:bg-white">
                <Camera class="h-3 w-3 mr-1" />
                Take Photo
              </Button>
              <Button variant="outline" size="sm" on:click={handleUploadImage} class="text-xs bg-white/80 hover:bg-white">
                <Upload class="h-3 w-3 mr-1" />
                Upload
              </Button>
              
              <!-- Hidden file input -->
              <input 
                type="file" 
                bind:this={fileInput}
                on:change={handleFileSelect}
                accept="image/*"
                class="hidden"
              />
            </div>
          </div>
        </Card>

        <div class="space-y-4">
          {#if item.description}
            <div class="bg-muted/50 p-3 rounded-md text-sm text-foreground/90">
              {item.description}
            </div>
          {/if}
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2 col-span-2">
              <div class="flex items-center text-muted-foreground">
                <MapPin class="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                <span class="truncate text-sm">{item.itemLocation.path}</span>
              </div>
              
              {#if item.itemMeasurements}
                <div class="flex items-center text-muted-foreground">
                  <Hash class="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                  <span class="text-sm">{formatMeasurement(item)}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <Separator />

        <div class="grid grid-cols-12 gap-4">
          <Button 
            variant="outline" 
            class="col-span-12"
            on:click={openEditModal}
          >
            <Edit class="mr-2 h-4 w-4" /> Edit Item
          </Button>
          
          <Button 
            class="col-span-12 bg-primary hover:bg-primary-hover"
            on:click={() => (showAddModal = true)}
          >
            <Plus class="mr-2 h-4 w-4" /> Add Similar Item
          </Button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
  
  <!-- Full Image Modal -->
  <Dialog.Root bind:open={showFullImage}>
    <Dialog.Content class="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
      <div class="relative">
        <button 
          on:click={() => showFullImage = false} 
          class="absolute right-2 top-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
        >
          <X class="h-5 w-5" />
        </button>
        <div class="flex items-center justify-center max-h-[90vh]">
          <img 
            src={getItemImage(item)} 
            alt={item.itemName} 
            class="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Camera Modal -->
  <Dialog.Root bind:open={showCamera} onOpenChange={(isOpen) => !isOpen && handleCameraClose()}>
    <Dialog.Content class="sm:max-w-md animate-fade-in bg-white dark:bg-gray-950">
      <Dialog.Header>
        <Dialog.Title>Take a Photo</Dialog.Title>
      </Dialog.Header>
      
      <div class="space-y-4">
        <div class="relative bg-black rounded-md aspect-video flex items-center justify-center overflow-hidden">
          {#if cameraActive}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video 
              bind:this={videoElement} 
              autoplay 
              playsinline 
              class="w-full h-full object-cover"
            ></video>
          {:else}
            <div class="text-neutral-content p-4 text-center">
              <Camera class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Accessing camera...</p>
            </div>
          {/if}
          <canvas bind:this={canvasElement} class="hidden"></canvas>
        </div>
        
        <div class="flex gap-2">
          <Button 
            on:click={handleCameraClose} 
            variant="outline"
            class="flex-1"
          >
            Cancel
          </Button>
          <Button 
            on:click={capturePhoto} 
            class="flex-1"
            disabled={!cameraActive}
          >
            Capture Photo
          </Button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>

  <AddItemModal
    open={showAddModal}
    onClose={() => (showAddModal = false)}
    onAddItem={onAddItem}
    defaultLocation={item.itemLocation.path}
  />

  <EditItemModal
    open={showEditModal}
    onClose={() => (showEditModal = false)}
    item={item}
    onEdit={onEdit}
  />
{/if}
  