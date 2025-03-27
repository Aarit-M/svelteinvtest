<script lang="ts">
    import { onMount } from 'svelte';
    import { X, FolderPlus, Upload, Camera } from 'lucide-svelte';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { cn } from '$lib/utils';
    import type { Container } from '$lib/types';
    import { v4 as uuidv4 } from 'uuid';
    import { toast } from 'svelte-sonner';
    import { getPlaceholderImage } from '$lib/utils';
  
    export let open: boolean;
    export let onClose: () => void;
    export let onAddLocation: (newLocation: Partial<Container>) => void;
    const containers: Container[] = [];
  
    let locationName = '';
    let imageSrc: string | undefined = undefined;
    let fileInput: HTMLInputElement;
    let description = '';
    
    let showCamera = false;
    let videoElement: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let cameraActive = false;
    let mediaStream: MediaStream | null = null;
    let camError: string | null = null;
  
    function resetForm() {
      locationName = '';
      imageSrc = undefined;
      description = '';
      stopCamera();
    }
    
    function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        
        if (!file.type.match('image.*')) {
          toast.error("Please select an image file");
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image too large. Please select an image under 5MB");
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            imageSrc = result;
            toast.success("Image uploaded successfully");
          }
        };
        reader.onerror = () => {
          toast.error("Failed to read file");
        };
        
        reader.readAsDataURL(file);
      }
    }
    
    function triggerFileInput() {
      if (fileInput) {
        fileInput.click();
      }
    }
    
    async function startCamera() {
      try {
        camError = null;
        
        stopCamera();
        
        console.log("Requesting camera access...");
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false
        });
        
        if (!videoElement) {
          console.error("Video element not found");
          camError = "Camera element not initialized";
          return;
        }
        
        videoElement.srcObject = mediaStream;
        videoElement.play();
        cameraActive = true;
        
        console.log("Camera started successfully");
      } catch (err) {
        console.error("Error accessing camera: ", err);
        camError = "Unable to access camera. Please check permissions.";
        toast.error("Unable to access camera. Please check permissions.");
      }
    }
    
    function stopCamera() {
      if (mediaStream) {
        console.log("Stopping camera stream");
        mediaStream.getTracks().forEach(track => track.stop());
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject = null;
        }
        mediaStream = null;
      }
      
      cameraActive = false;
    }
    
    function capturePhoto() {
      if (!videoElement || !canvasElement) {
        console.error("Video or canvas element not found");
        toast.error("Camera not properly initialized");
        return;
      }
      
      if (!cameraActive) {
        console.error("Camera not active");
        toast.error("Camera not active, please try again");
        return;
      }
      
      try {
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
          console.error("Could not get canvas context");
          toast.error("Failed to initialize photo capture");
          return;
        }
        
        canvasElement.width = videoElement.videoWidth || 640;
        canvasElement.height = videoElement.videoHeight || 480;
        
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        const imageData = canvasElement.toDataURL('image/jpeg', 0.9);
        
        imageSrc = imageData;
        showCamera = false;
        stopCamera();
        
        toast.success("Photo captured successfully");
      } catch (err) {
        console.error("Error capturing photo: ", err);
        toast.error("Failed to capture photo");
      }
    }
    
    function handleShowCamera() {
      showCamera = true;
      setTimeout(() => {
        startCamera();
      }, 300);
    }
    
    function handleCameraClose() {
      stopCamera();
      showCamera = false;
    }
  
    function handleSubmit() {
      if (!locationName) {
        toast.error("Location name is required");
        return;
      }
  
      const newLocation: Partial<Container> = {
        containerName: locationName,
        containerLocation: { path: locationName },
        image: imageSrc || getPlaceholderImage('location', locationName),
        description
      };
  
      onAddLocation(newLocation);
      resetForm();
      onClose();
      
      toast.success("Location added successfully");
    }
  
    onMount(() => {
      resetForm();
      return () => {
        stopCamera();
      };
    });
</script>
  
<Dialog {open} onOpenChange={(isOpen) => {
  if (!isOpen) {
    resetForm();
    onClose();
  }
}}>
  <DialogContent class="sm:max-w-md bg-white dark:bg-gray-950">
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
      
      <div class="space-y-2">
        <Label for="description">Description</Label>
        <Input
          id="description"
          bind:value={description}
          placeholder="Enter location description (optional)"
        />
      </div>
      
      <div class="space-y-2">
        <Label>Location Image (Optional)</Label>
        <Card class="p-0 overflow-hidden border border-base-300">
          <div class="p-0">
            {#if imageSrc}
              <div class="relative">
                <img 
                  src={imageSrc} 
                  alt="Location preview" 
                  class="mx-auto h-48 object-contain"
                />
                <button
                  on:click={() => imageSrc = undefined}
                  class="absolute top-2 right-2 bg-base-100 p-1 rounded-full shadow"
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
                  on:click={triggerFileInput}
                  class="flex-1 h-24"
                >
                  <Upload class="mr-2 h-5 w-5" />
                  Upload Image
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
            {/if}
          </div>
        </Card>
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

<!-- Camera Dialog -->
{#if showCamera}
<Dialog open={showCamera} onOpenChange={(isOpen) => !isOpen && handleCameraClose()}>
  <DialogContent class="sm:max-w-md animate-fade-in bg-white dark:bg-gray-950">
    <DialogHeader>
      <DialogTitle>Take a Photo</DialogTitle>
    </DialogHeader>
    
    <div class="space-y-4">
      <div class="relative bg-black rounded-md aspect-video flex items-center justify-center overflow-hidden">
        <!-- Simple video element like in reference code -->
        <video bind:this={videoElement} autoplay playsinline muted class="w-full h-full object-cover"></video>
        <canvas bind:this={canvasElement} style="display:none;"></canvas>
        
        {#if !cameraActive && !camError}
          <div class="absolute inset-0 flex justify-center items-center bg-black/70 text-white">
            <div class="text-center">
              <Camera class="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p class="text-lg">Accessing camera...</p>
            </div>
          </div>
        {/if}
        
        {#if camError}
          <div class="absolute inset-0 flex justify-center items-center bg-black/70 text-white">
            <div class="text-center">
              <p class="text-red-400 font-semibold">{camError}</p>
              <p class="text-sm mt-2">Please check your camera permissions</p>
            </div>
          </div>
        {/if}
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
  </DialogContent>
</Dialog>
{/if}
  