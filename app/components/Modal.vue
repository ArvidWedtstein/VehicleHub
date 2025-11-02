<script setup lang="ts">
import { ref, onMounted } from "vue";

const modalRef = ref<InstanceType<typeof HTMLDialogElement>>();

type Props = {
  title?: string;
  size?: "sm" | "md" | "lg";
  backdrop?: boolean;
  /**
   * Disables submit button
   */
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  size: "lg",
  backdrop: true,
  loading: false,
});

const emit = defineEmits<{
  open: [];
  close: [event: Event];
}>();

const id = useId();

const handleClose = (event: Event) => {
  modalRef.value?.close("cancel");
  emit("close", event);
};

const openModal = () => {
  modalRef.value?.showModal();
};
const closeModal = () => {
  modalRef.value?.close("close");
};

onMounted(() => {
  if (!modalRef.value) return;

  // const observer = new MutationObserver((event) => {
  //   if (event[0]?.attributeName == "open" && modalRef.value?.open) {
  //     emit("open");
  //   }
  // });

  // observer.observe(modalRef.value, { attributes: true });
});

defineExpose({ modalRef: modalRef, open: openModal, close: closeModal });
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <dialog
        :id="id"
        ref="modalRef"
        class="modal modal-bottom sm:modal-middle modal-scroll"
        :class="{ 'modal-middle': size !== 'lg' }"
        @close="handleClose"
      >
        <div
          class="modal-box flex flex-col"
          :class="{
            'w-4/12!': size === 'sm',
            'md:w-8/12! max-w-2xl!': size === 'md',
            'md:w-11/12! max-w-5xl! max-h-full h-full md:h-fit': size === 'lg',
          }"
        >
          <form method="dialog">
            <button
              class="btn btn-circle btn-sm btn-ghost absolute right-2 top-2"
              value="cancel"
              @click="handleClose"
            >
              <Icon name="mdi:close" />
            </button>
          </form>

          <h3 class="text-lg font-bold">
            {{ title }}
          </h3>

          <slot></slot>

          <form method="dialog" class="modal-action gap-1 mt-auto">
            <slot name="actions" :loading="loading">
              <button
                class="btn btn-outline"
                value="cancel"
                formmethod="dialog"
              >
                Cancel
              </button>

              <button
                type="button"
                class="btn btn-primary"
                value="submit"
                :disabled="loading"
              >
                OK
              </button>
            </slot>
          </form>
        </div>
        <form v-if="backdrop" method="dialog" class="modal-backdrop">
          <button value="cancel">close</button>
        </form>
      </dialog>
    </Teleport>
  </ClientOnly>
</template>
