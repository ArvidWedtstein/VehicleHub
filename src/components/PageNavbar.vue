<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router';
import { computed } from 'vue';
import { useSessionStore } from '@/stores/userSession';
import LoginModal from './auth/LoginModal.vue';
import { storeToRefs } from 'pinia';

const router = useRouter();

const sessionStore = useSessionStore();

const { profile } = storeToRefs(sessionStore);

const navbarRoutes = computed(() => {
  const routes = router.getRoutes();

  return routes.filter(({ meta }) => meta.showInNavbar);
});
</script>

<template>
  <LoginModal />

  <div class="navbar bg-base-300">
    <div class="navbar-start">
      <a class="btn btn-ghost text-xl space-x-0 gap-1"
        >Vehicle
        <div class="badge badge-warning badge-outline">Hub</div>
      </a>
    </div>

    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-2">
        <li v-for="route in navbarRoutes" :key="route.name">
          <RouterLink
            :to="route.path"
            class="btn btn-sm capitalize"
            :class="{
              'btn-ghost btn-neutral':
                router.currentRoute.value.name !== route.name,
            }"
            activeClass="btn-primary"
          >
            {{ route.name }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img alt="My Profile Image 1" :src="profile?.profile_image_url" />
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <template v-if="profile">
            <li>
              <a class="justify-between">
                Profile
                <span class="badge">Comming Soon</span>
              </a>
            </li>
            <li><button @click="sessionStore.logout">Logout</button></li>
          </template>

          <li v-else><a onclick="loginModal.showModal()">Login</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
