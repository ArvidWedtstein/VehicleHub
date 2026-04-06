<script setup lang="ts"></script>

<template>
  <div class="overflow-hidden min-h-full">
    <div
      class="w-full max-w-8/12 mx-auto flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16 lg:grid-cols-2 lg:items-center"
    >
      <div class="">
        <div class="">
          <h2
            class="text-3xl sm:text-4xl text-pretty tracking-tight font-bold text-highlighted"
          >
            Welcome
          </h2>

          <div class="text-base sm:text-lg text-pretty text-muted mt-6">
            Manage your vehicles, track expenses and services, and stay on top
            of maintenance with ease. Welcome to your personal Vehicle Hub.
          </div>
        </div>

        <div class="mt-8">
          <NuxtLink class="btn btn-primary btn-lg" to="/vehicles">
            Get Started
          </NuxtLink>
        </div>
      </div>

      <img
        src="/img/StartImg.jpg"
        alt="Illustration of a car, representing vehicle management and maintenance."
        width="500"
        height="500"
        class="will-change-transform w-full rounded-lg -z-10"
      />
    </div>
  </div>
</template>
