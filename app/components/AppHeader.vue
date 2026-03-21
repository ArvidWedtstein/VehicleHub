<script setup lang="ts">
const LoginModal = defineAsyncComponent(
  async () => await import("~/features/auth/LoginModal.vue"),
);

const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

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
</script>

<template>
  <LoginModal ref="loginModalRef" />

  <header class="navbar sticky top-0 bg-base-300 z-40 h-(--header-height)">
    <div class="navbar-start">
      <div class="inline-flex items-center text-xl space-x-0 gap-1">
        Vehicle
        <div class="badge badge-outline badge-warning">Hub</div>
      </div>
    </div>

    <div class="navbar-center hidden md:flex">
      <ul class="menu menu-horizontal px-1 gap-2">
        <li>
          <NuxtLink
            :to="{ name: 'index' }"
            class="btn btn-sm capitalize"
            activeClass="btn-primary"
          >
            <Icon name="mdi:home" class="sm:block hidden" />
            Home
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            :to="{ name: 'vehicles' }"
            class="btn btn-sm capitalize"
            activeClass="btn-primary"
          >
            Vehicles
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end">
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

      <Menu alignMenu="end" menuSize="sm" btnClass="btn btn-ghost btn-circle">
        <template #default>
          <AvatarImage
            tabindex="0"
            role="button"
            :src="user?.user_metadata.avatar_url"
            alt="My Profile Image"
            :fallbackSrc="`https://ui-avatars.com/api/?name=${
              user?.user_metadata?.name || 'Unknown User'
            }`"
            size="sm"
          />
        </template>

        <template #items>
          <template v-if="user?.id">
            <MenuItem v-if="user?.id">
              <!-- :to="{ name: 'profile', params: { id: user.id } }" -->
              <Icon name="mdi:account" size="1.2em" />
              Profile
            </MenuItem>
            <MenuItem @click="handleSignOut">
              <Icon name="mdi:logout" size="1.2em" />
              Logout
            </MenuItem>
          </template>

          <MenuItem v-else @click="handleSignIn">Login</MenuItem>
        </template>
      </Menu>
    </div>
  </header>
</template>
