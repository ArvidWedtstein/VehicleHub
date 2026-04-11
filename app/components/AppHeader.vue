<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
import LoginModal from "./auth/LoginModal.vue";

const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

const overlay = useOverlay();

const loginModal = overlay.create(LoginModal);

const links = computed<NavigationMenuItem[]>(() => [
  {
    label: "Home",
    icon: "mdi:home",
    to: "/",
  },
  {
    label: "Vehicles",
    icon: "mdi:car",
    to: "/vehicles",
  },
]);

const handleSignIn = () => {
  loginModal.open();
};

const toast = useToast();

const handleSignOut = async () => {
  const { error } = await client.auth.signOut({
    scope: "global",
  });
  if (error) {
    console.error("Error signing out:", error);
    toast.add({
      title: "Error",
      description: `Error signing out: ${error.message}`,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Signed out successfully",
    color: "success",
  });
  router.push("/");
};

const menuItems = computed<DropdownMenuItem[]>(() => {
  if (user.value) {
    return [
      {
        label: "Profile",
        icon: "mdi:account",
        // to: `/profile/${user.value.id}`,
      },
      {
        label: "Logout",
        icon: "mdi:logout",
        onSelect: handleSignOut,
      },
    ];
  } else {
    return [
      {
        label: "Login",
        onSelect: handleSignIn,
      },
    ];
  }
});
</script>

<template>
  <UHeader>
    <template #title>
      <div class="inline-flex items-center text-xl space-x-0 gap-1">
        Vehicle
        <UBadge color="warning" label="Hub" variant="outline" />
      </div>
    </template>

    <UNavigationMenu :items="links" />

    <template #right>
      <UColorModeButton />

      <UDropdownMenu :items="menuItems">
        <UButton
          color="neutral"
          variant="ghost"
          :avatar="{
            src: user?.user_metadata.avatar_url,
            alt: user?.user_metadata.name || 'User Avatar',
            size: 'lg',
          }"
        />
      </UDropdownMenu>
    </template>
  </UHeader>
</template>
