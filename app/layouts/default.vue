<template>
  <div>
    <AppHeader />
    <div class="min-h-[calc(100vh-var(--header-height))] relative">
      <slot />
    </div>

    <LazyMobileAppFooter />

    <ToastContainer />
    <LazyConfirmDialog />
  </div>
</template>
