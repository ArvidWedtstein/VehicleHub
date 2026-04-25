<script setup lang="ts">
type Props = {
  bucket: string;
  alt?: string;

  src?: string;
  path?: string;
};

const { bucket, src, path, alt = "Image Preview" } = defineProps<Props>();

const emit = defineEmits<{
  close: [boolean];
}>();

const source = ref("");

const fetchUrl = async (path: string) => {
  const client = useSupabaseClient();
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(path, 7200);

  if (error) {
    console.error("Error fetching signed url:", error);
    return;
  }

  source.value = data.signedUrl || "";
};

const onOpen = async () => {
  if (!path) {
    source.value = src || "";

    return;
  }

  await fetchUrl(path);
};

const onClose = () => {
  source.value = "";
};

const handleError = (event: Event) => {
  console.log(event);
  console.error("Error loading image");
};

// Image transformations
const rotation = ref(0);
const zoom = ref(1);

const rotate = (direction: "left" | "right") => {
  rotation.value =
    (direction === "right" ? rotation.value + 90 : rotation.value - 90) % 360;
};

const zoomIn = () => {
  zoom.value += 0.1;
};

const zoomOut = () => {
  if (zoom.value > 0.2) {
    zoom.value -= 0.1;
  }
};

const resetTransformations = () => {
  rotation.value = 0;
  zoom.value = 1;
};

const imageStyles = computed(() => ({
  transform: `rotate(${rotation.value}deg) scale(${zoom.value})`,
}));
</script>

<template>
  <UModal
    title="Preview"
    :ui="{ footer: 'justify-end' }"
    fullscreen
    :close="{ onClick: () => emit('close', false) }"
    @after:enter="onOpen"
  >
    <template #actions>
      <div class="flex flex-row items-center gap-2">
        <UFieldGroup>
          <UTooltip text="Rotate Counter-clockwise">
            <UButton
              icon="mdi:rotate-left"
              variant="subtle"
              color="neutral"
              @click="rotate('left')"
            />
          </UTooltip>

          <UTooltip text="Rotate Clockwise">
            <UButton
              icon="mdi:rotate-right"
              variant="subtle"
              color="neutral"
              @click="rotate('right')"
            />
          </UTooltip>
        </UFieldGroup>

        <UFieldGroup>
          <UTooltip text="Zoom In">
            <UButton
              icon="mdi:magnify-plus-outline"
              variant="subtle"
              color="neutral"
              @click="zoomIn"
            />
          </UTooltip>

          <UTooltip text="Zoom Out">
            <UButton
              icon="mdi:magnify-minus-outline"
              variant="subtle"
              color="neutral"
              @click="zoomOut"
            />
          </UTooltip>
        </UFieldGroup>

        <UButton
          label="Reset"
          variant="subtle"
          color="error"
          @click="resetTransformations"
        />
      </div>
    </template>
    <template #body>
      <div class="flex justify-center items-center overflow-auto h-auto">
        <img
          v-if="source && source.length && !source.includes('pdf')"
          :src="source"
          :alt="alt"
          :key="source"
          :style="imageStyles"
          class="object-cover rounded w-full h-full transition-transform duration-300"
          @error="handleError"
        />

        <iframe
          v-else-if="source && source.length && source.includes('pdf')"
          :src="source"
          type="application/pdf"
          class="w-full h-full min-h-96 max-w-full"
          :frameborder="0"
          @error="handleError"
        ></iframe>

        <UEmpty
          v-else
          title="No Image to preview"
          icon="mdi:file-image-remove-outline"
        />
      </div>
    </template>
  </UModal>
</template>
