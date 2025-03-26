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
    let showCamera = false;
    let imageSrc: string | undefined = undefined;

    // For camera functionality
    let videoElement: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let cameraActive = false;
    let mediaStream: MediaStream | null = null;

    const MEASUREMENT_TYPES = [
        { label: 'None', value: '' },
        { label: 'Length', value: 'ft' },
        { label: 'Weight', value: 'lbs' },
        { label: 'Volume', value: 'oz' },
        { label: 'Electrical', value: 'V' },
        { label: 'Count', value: 'pcs' }
    ];

    onMount(() => {
        return () => {
            // Make sure to clean up the camera stream when component is destroyed
            stopCamera();
        };
    });

    function resetForm() {
        itemName = '';
        description = '';
        location = defaultLocation;
        measurementValue = undefined;
        measurementUnit = '';
        imageSrc = undefined;
        showCamera = false;
        stopCamera();
    }

    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoElement) {
                videoElement.srcObject = mediaStream;
                cameraActive = true;
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            toast({
                title: "Camera Error",
                description: "Unable to access camera",
                variant: "destructive"
            });
        }
    }

    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            if (videoElement) {
                videoElement.srcObject = null;
            }
            mediaStream = null;
            cameraActive = false;
        }
    }

    function capturePhoto() {
        if (videoElement && canvasElement) {
            const context = canvasElement.getContext('2d');

            if (context) {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

                const imageData = canvasElement.toDataURL('image/png');
                imageSrc = imageData;
                showCamera = false;
                stopCamera();
            }
        }
    }

    function handleShowCamera() {
        showCamera = true;
        // Start camera after dialog is open
        setTimeout(() => {
            startCamera();
        }, 300);
    }

    function handleCameraClose() {
        stopCamera();
        showCamera = false;
    }

    function handleSubmit() {
        if (!itemName) {
            toast({
                title: "Error",
                description: "Item name is required",
                variant: "destructive"
            });
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
        resetForm();
        onClose();

        toast({
            title: "Success",
            description: "Item added successfully"
        });
    }

    function handleUploadImage() {
        // Mock image for demo purposes
        imageSrc = '/assets/images/placeholder-item.jpg';
    }

    $: if (!open) {
        resetForm();
    }
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => {
    if (!isOpen) {
        resetForm();
        onClose();
    }
}}>
    </Dialog.Root>

<Dialog.Root bind:open={showCamera} onOpenChange={(isOpen) => !isOpen && handleCameraClose()}>
    </Dialog.Root>
