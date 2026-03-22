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

      <div class="relative isolate">
        <img
          src="/img/StartImg.jpg"
          alt="Illustration of a car, representing vehicle management and maintenance."
          width="500"
          height="500"
          class="will-change-transform w-full rounded-lg -z-10"
        />
        <div
          class="absolute -top-10 right-1/2 -z-10 block transform-gpu blur-3xl"
          aria-hidden="true"
        >
          <div
            class="aspect-1097/845 w-274.25 bg-linear-to-tr from-amber-600 via-amber-500 to-green-700 opacity-20"
            style="
              clip-path: polygon(
                74.1% 44.1%,
                100% 61.6%,
                97.5% 26.9%,
                85.5% 0.1%,
                80.7% 2%,
                72.5% 32.5%,
                60.2% 62.4%,
                52.4% 68.1%,
                47.5% 58.3%,
                45.2% 34.5%,
                27.5% 76.7%,
                0.1% 64.9%,
                17.9% 100%,
                27.6% 76.8%,
                76.1% 97.7%,
                74.1% 44.1%
              );
            "
          ></div>
        </div>
        <div
          class="absolute -top-116 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl ml-16"
          aria-hidden="true"
        >
          <div
            class="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-20"
            style="
              clip-path: polygon(
                74.1% 44.1%,
                100% 61.6%,
                97.5% 26.9%,
                85.5% 0.1%,
                80.7% 2%,
                72.5% 32.5%,
                60.2% 62.4%,
                52.4% 68.1%,
                47.5% 58.3%,
                45.2% 34.5%,
                27.5% 76.7%,
                0.1% 64.9%,
                17.9% 100%,
                27.6% 76.8%,
                76.1% 97.7%,
                74.1% 44.1%
              );
            "
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
