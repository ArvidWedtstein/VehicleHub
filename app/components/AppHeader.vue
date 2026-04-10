<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";

const LoginModal = defineAsyncComponent(
  async () => await import("~/features/auth/LoginModal.vue"),
);

const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

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

const loginModalRef = ref<InstanceType<typeof LoginModal>>();

const handleSignIn = () => {
  loginModalRef.value?.open();
};

const handleSignOut = async () => {
  const { error } = await client.auth.signOut({
    scope: "global",
  });
  if (error) {
    console.error("Error signing out:", error);
    toast.error(`Error signing out: ${error}`);

    return;
  }

  toast.success("Signed out successfully");
  router.push("/");
};

const menuItems = computed<DropdownMenuItem[]>(() => {
  if (user.value) {
    return [
      {
        label: "Profile",
        icon: "mdi:account",
        to: `/profile/${user.value.id}`,
      },
      {
        label: "Logout",
        icon: "mdi:logout",
        action: handleSignOut,
      },
    ];
  } else {
    return [
      {
        label: "Login",
        action: handleSignIn,
      },
    ];
  }
});
</script>

<template>
  <LoginModal ref="loginModalRef" />

  <UHeader>
    <template #title>
      <div class="inline-flex items-center text-xl space-x-0 gap-1">
        Vehicle
        <div class="badge badge-outline badge-warning">Hub</div>
      </div>
    </template>

    <UNavigationMenu :items="links" />

    <template #right>
      <label class="swap swap-rotate mr-2">
        <input type="checkbox" class="theme-controller" value="light" />

        <Icon
          name="mdi:weather-sunny"
          class="swap-off fill-current"
          size="1.2em"
        />
        <Icon
          name="mdi:weather-night"
          class="swap-on fill-current"
          size="1.2em"
        />
      </label>

      <UDropdownMenu :items="menuItems">
        <UButton
          color="neutral"
          variant="ghost"
          :avatar="{
            src: user?.user_metadata.avatar_url,
            alt: user?.user_metadata.name,
            size: 'lg',
          }"
        />
      </UDropdownMenu>
    </template>
  </UHeader>
</template>
