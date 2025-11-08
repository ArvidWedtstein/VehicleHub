<template>
  <div>
    <AppHeader />
    <div
      class="min-h-[calc(100vh-var(--header-height))] relative mb-16 md:mb-0"
    >
      <slot />
    </div>

    <LazyMobileAppFooter />

    <ToastContainer />
    <LazyConfirmDialog />
  </div>
</template>
