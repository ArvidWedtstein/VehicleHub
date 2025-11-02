<script setup lang="ts"></script>

<template>
  <li class="group">
    <div class="relative pb-8">
      <span
        aria-hidden="true"
        class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-500 group-last:hidden"
      ></span>
      <div class="relative flex items-start space-x-3">
        <div class="relative">
          <AvatarImage loading size="sm" />
        </div>
        <div class="min-w-0 flex-1">
          <div>
            <div class="skeleton h-4 w-32"></div>

            <span class="ms-auto float-end skeleton w-20 h-4"></span>
          </div>

          <div class="skeleton mt-1 h-4 w-20"></div>
        </div>
      </div>
    </div>
  </li>
</template>
