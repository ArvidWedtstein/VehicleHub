<script setup lang="ts">
import type Modal from "~/components/Modal.vue";

const modalRef = ref<InstanceType<typeof Modal> | null>(null);

const formData = reactive({
  loading: false,
});

const supabase = useSupabaseClient();

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });

  if (error) throw new Error(error.message);
};

defineExpose({
  modalRef,
  open: () => modalRef.value?.modalRef?.showModal(),
  close: () => modalRef.value?.modalRef?.close(),
});
</script>

<template>
  <Modal ref="modalRef" size="md" title="Sign in via google">
    <div class="my-2 grid grid-cols-1 gap-2">
      <button type="button" class="btn btn-accent" @click="signInWithGoogle">
        <Icon name="mdi:google" />
        Sign in with Google
      </button>
    </div>

    <template #actions>
      <button class="btn btn-outline" value="cancel" formmethod="dialog">
        Close
      </button>

      <button
        type="submit"
        class="btn btn-primary"
        value="submit"
        :disabled="formData.loading"
      >
        <span
          v-if="formData.loading"
          class="loading loading-spinner loading-xs"
        ></span>
        OK
      </button>
    </template>
  </Modal>
</template>
