<script setup lang="ts">
const toast = useToast();

onMounted(async () => {
  // Chrome posts files as a form submission
  const form = document.forms[0];
  const data = new FormData(form);

  const files = data.getAll("files") as File[];

  for (const file of files) {
    toast.add({
      title: "Received File",
      description: `Received file: ${file.name} ${file.type}`,
      duration: 5000,
    });
    console.log("Received file:", file.name, file.type);

    // Example: upload to your backend
    const upload = new FormData();
    upload.append("file", file);

    await fetch("/api/upload", {
      method: "POST",
      body: upload,
    });
  }

  //   await navigateTo("/vehicles/new");
});
</script>

<template>
  <form method="POST" enctype="multipart/form-data">
    Importing file into VehicleHub...
  </form>
</template>
