<script setup lang="ts">
import { ref, onMounted } from "vue";

const serverActive = ref<boolean | null>(null);

async function checkServerHealth() {
  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      const data = await res.json();
      serverActive.value = data.status === "ok";
    } else {
      serverActive.value = false;
    }
  } catch {
    serverActive.value = false;
  }
}

onMounted(checkServerHealth);
</script>

<template>
  <nav class="flex flex-row justify-between items-center my-2 mx-8">
    <h2>DiffTool</h2>
    <div class="flex flex-col gap-y-0">
      <p>v1.0.0</p>
      <p v-if="serverActive === null">Checking server...</p>
      <p v-else-if="serverActive">
        Server is <span style="color: green">active</span>
      </p>
      <p v-else>Server is <span style="color: red">inactive</span></p>
    </div>
  </nav>
</template>
