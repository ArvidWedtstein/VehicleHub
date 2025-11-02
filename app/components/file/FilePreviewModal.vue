<script setup lang="ts">
import type Modal from "../Modal.vue";

type Props = {
  bucket: string;
  alt?: string;
};

const props = withDefaults(defineProps<Props>(), {
  alt: "Image preview",
});

const modalRef = ref<InstanceType<typeof Modal> | null>(null);

const source = ref("");

const fetchUrl = async (path: string) => {
  const client = useSupabaseClient();
  const { data, error } = await client.storage
    .from(props.bucket)
    .createSignedUrl(path, 7200);

  if (error) {
    console.error("Error fetching signed url:", error);
    return;
  }

  source.value = data.signedUrl || "";
};

const handleOpen = async ({ src, path }: { src?: string; path?: string }) => {
  if (!path) {
    source.value = src || "";
    modalRef.value?.modalRef?.showModal();

    return;
  }

  const res = await fetchUrl(path);

  modalRef.value?.modalRef?.showModal();
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

defineExpose({
  modalRef,
  open: handleOpen,
  close: () => {
    modalRef.value?.modalRef?.close();
  },
});
</script>

<template>
  <Modal id="filePreviewModal" ref="modalRef" title="Preview" @close="onClose">
    <ul class="menu menu-horizontal bg-base-200 rounded-box mb-2">
      <li>
        <button type="button" class="btn btn-square" @click="rotate('left')">
          <Icon name="mdi:rotate-left" size="1.2em" />
        </button>
      </li>
      <li>
        <button type="button" class="btn btn-square" @click="rotate('right')">
          <Icon name="mdi:rotate-right" size="1.2em" />
        </button>
      </li>
      <li>
        <button type="button" class="btn btn-square" @click="zoomIn">
          <Icon name="mdi:magnify-plus-outline" size="1.2em" />
        </button>
      </li>
      <li>
        <button type="button" class="btn btn-square" @click="zoomOut">
          <Icon name="mdi:magnify-minus-outline" size="1.2em" />
        </button>
      </li>
      <li>
        <button
          type="button"
          class="btn btn-square"
          @click="resetTransformations"
        >
          Reset
        </button>
      </li>
    </ul>

    <div
      class="flex justify-center items-center overflow-auto"
      style="height: 80vh"
    >
      <img
        v-if="source && source.length && !source.includes('pdf')"
        :src="source"
        :alt="alt"
        :key="source"
        :style="imageStyles"
        class="object-cover rounded-sm image-full transition-transform duration-300"
        @error="handleError"
      />

      <iframe
        v-else-if="source && source.length && source.includes('pdf')"
        :src="source"
        type="application/pdf"
        class="w-full h-full min-h-96 max-w-full image-full"
        :frameborder="0"
        @error="handleError"
      ></iframe>

      <p v-else>No image to preview</p>
    </div>

    <template #actions>
      <button
        class="btn btn-outline mt-2"
        value="cancel"
        formmethod="dialog"
        formnovalidate
      >
        Close
      </button>
    </template>
  </Modal>
</template>
