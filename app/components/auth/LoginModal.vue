<script setup lang="ts">
const open = ref(false);
const emit = defineEmits<{ close: [boolean] }>();

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

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: signInWithGoogle,
  },
];

const handleClose = () => {
  open.value = false;
  emit("close", false);
};

defineExpose({
  open: () => (open.value = true),
  close: handleClose,
});
</script>

<template>
  <UModal
    v-model:open="open"
    title="Sign In"
    :close="{ onClick: handleClose }"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UAuthForm icon="mdi:lock" :providers="providers">
        <template #footer>
          By signing in, you agree to our
          <ULink to="#" class="text-primary font-medium">Terms of Service</ULink
          >.
        </template>
      </UAuthForm>
    </template>

    <template #footer>
      <UButton label="Cancel" variant="outline" @click="handleClose" />
    </template>
  </UModal>
</template>
