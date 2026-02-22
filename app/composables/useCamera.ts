export const useCamera = (videoRef: Ref<HTMLVideoElement | null>) => {
  const stream = ref<MediaStream | null>(null);
  const devices = ref<MediaDeviceInfo[]>([]);
  const selectedDeviceId = ref<string | null>(null);

  const isLoading = ref(false);
  const hasTakenPicture = ref(false);
  const error = ref<string | null>(null);
  const previewUrl = ref<string | null>(null);

  let lastBlob: Blob | null = null;

  const handleError = (err: unknown) => {
    if (err instanceof DOMException) {
      switch (err.name) {
        case "NotAllowedError":
          error.value = "Camera permission denied.";
          break;
        case "NotFoundError":
          error.value = "No camera device found.";
          break;
        case "NotReadableError":
          error.value = "Camera is already in use.";
          break;
        default:
          error.value = "Unable to access camera.";
      }
      return;
    }

    error.value = "Unexpected camera error.";
  };

  const loadDevices = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    devices.value = allDevices.filter((d) => d.kind === "videoinput");

    if (!selectedDeviceId.value && devices.value.length) {
      const device = devices.value[0];
      if (device) {
        selectedDeviceId.value = device.deviceId;
      }
    }
  };

  const revokePreview = () => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = null;
    }
  };

  const startCamera = async () => {
    if (stream.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: selectedDeviceId.value
          ? { deviceId: { exact: selectedDeviceId.value } }
          : { facingMode: "environment" },
      });

      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
        await videoRef.value.play();
      }

      await loadDevices();
    } catch (err) {
      handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  const stopCamera = () => {
    stream.value?.getTracks().forEach((track) => track.stop());
    stream.value = null;
  };

  const restartCamera = async () => {
    stopCamera();
    await startCamera();
  };

  const capture = async (
    type = "image/jpeg",
    quality = 0.9,
  ): Promise<Blob | null> => {
    const video = videoRef.value;
    if (!video) return null;

    const { videoWidth, videoHeight } = video;

    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const bitmap = await createImageBitmap(video, {
      imageOrientation: "from-image",
    });
    ctx.drawImage(bitmap, 0, 0, videoWidth, videoHeight);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, quality),
    );

    if (!blob) return null;

    lastBlob = blob;

    revokePreview();
    previewUrl.value = URL.createObjectURL(blob);

    hasTakenPicture.value = true;

    stopCamera();

    return blob;
  };

  const reset = async () => {
    hasTakenPicture.value = false;
    revokePreview();
    await startCamera();
  };

  const getBlob = () => lastBlob;

  onUnmounted(() => {
    stopCamera();
    revokePreview();
  });

  return {
    isLoading,
    error,
    devices,
    selectedDeviceId,
    hasTakenPicture,
    previewUrl,

    startCamera,
    stopCamera,
    restartCamera,
    capture,
    reset,
    getBlob,
  };
};
