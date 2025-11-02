<template>
  <ClientOnly>
    <Modal
      ref="modalRef"
      size="sm"
      :title="confirmState.title"
      @close="
        () => {
          if (modalRef.modalRef.returnValue === 'cancel') {
            cancel();
            return;
          }

          confirm();
        }
      "
    >
      <p class="mb-2">{{ confirmState.message }}</p>

      <template #actions>
        <button
          class="btn btn-sm btn-outline"
          value="cancel"
          formmethod="dialog"
          @click="
            () => {
              modalRef.modalRef.close('cancel');
            }
          "
        >
          {{ confirmState.cancelLabel }}
        </button>

        <button
          type="button"
          class="btn btn-sm"
          :class="{
            'btn-primary': confirmState.severity === 'default',
            'btn-success': confirmState.severity === 'success',
            'btn-warning': confirmState.severity === 'warning',
            'btn-error': confirmState.severity === 'danger',
            'btn-info': confirmState.severity === 'info',
          }"
          value="submit"
          autofocus
          @click="
            () => {
              modalRef.modalRef.close('submit');
            }
          "
        >
          {{ confirmState.confirmLabel }}
        </button>
      </template>
    </Modal>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const modalRef = ref();

const { confirmState, confirm, cancel } = setupConfirm();

watch(
  () => confirmState.visible,
  async (isOpen) => {
    if (!isOpen) {
      return;
    }

    modalRef.value.modalRef.showModal();
  }
);
</script>
