<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{
  file: File | null;
}>();

const emit = defineEmits<{
  (e: "update:file", file: File | null): void;
}>();

function getOrSetClientID() {
  let match = document.cookie.match(/clientID=([^;]+)/);
  if (match && match[1]) return match[1];
  const newID = Math.random().toString(36).substring(2, 15);
  document.cookie = `clientID=${newID}; path=/`;
  return newID;
}

const previousFiles = ref<string[]>([]);
const clientID = getOrSetClientID();

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("clientID", clientID);

  await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  await fetchPreviousFiles();
}

async function fetchPreviousFiles() {
  if (!clientID) return;
  const res = await fetch(
    `/api/files?clientID=${encodeURIComponent(clientID)}`,
  );
  const data = await res.json();
  previousFiles.value = data.files || [];
}

async function onPreviousFileSelect(filename: string) {
  const res = await fetch(
    `/api/file/${encodeURIComponent(clientID)}/${encodeURIComponent(filename)}`,
  );
  const blob = await res.blob();
  const file = new File([blob], filename);
  emit("update:file", file);
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  emit("update:file", file);
  if (file) uploadFile(file);
}

onMounted(fetchPreviousFiles);
</script>

<template>
  <div
    class="relative flex w-64 h-12 p-2 border-2 border-dashed border-[--color-text] rounded-xl items-center"
  >
    <input
      type="file"
      accept="*/*"
      class="absolute flex w-full h-full opacity-0 cursor-pointer outline-none z-10 touch-manipulation"
      @change="onFileChange"
    />
    <span v-if="props.file">
      {{ props.file.name }}
    </span>
  </div>
  <div class="mt-2">
    <label class="block mb-1">Previous files:</label>
    <select
      class="w-full p-1 border rounded"
      @change="onPreviousFileSelect(($event.target as HTMLSelectElement).value)"
      @focus="fetchPreviousFiles"
    >
      <option value="" disabled selected hidden>Select a previous file</option>
      <option
        v-for="filename in previousFiles"
        :key="filename"
        :value="filename"
      >
        {{ filename }}
      </option>
    </select>
  </div>
</template>

<style scoped>
select {
  border: 2px dashed var(--color-text);
  border-radius: 0.75rem;
  background: var(--color-background, #fff);
  color: var(--color-text, #222);
  padding: 0.5rem 1rem;
  font-size: 1rem;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-shadow: none;
  appearance: none;
  cursor: pointer;
}
select:focus {
  border-color: var(--color-accent, #007bff);
  box-shadow: 0 0 0 2px var(--color-accent, #007bff33);
}
option {
  color: var(--color-text, #222);
  background: var(--color-background, #fff);
}
</style>
