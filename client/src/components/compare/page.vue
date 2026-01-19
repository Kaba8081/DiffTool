<script setup lang="ts">
import { ref } from "vue";
import FileSelector from "./FileSelector.vue";

const file1 = ref<File | null>(null);
const file2 = ref<File | null>(null);
</script>

<template>
  <div class="flex flex-row gap-x-16">
    <div class="flex-1">
      <h2>Select a file</h2>
      <FileSelector v-model:file="file1" />
    </div>
    <div class="flex-1">
      <h2>Select a file</h2>
      <FileSelector v-model:file="file2" />
    </div>
  </div>
  <div class="mt-8">
    <!-- <DiffViewer :file1Content="file1Content" :file2Content="file2Content" /> -->
  </div>
</template>
