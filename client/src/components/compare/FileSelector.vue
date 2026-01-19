<script setup lang="ts">
const props = defineProps<{
  file: File | null;
}>();

const emit = defineEmits<{
  (e: "update:file", file: File | null): void;
  (e: "file-content", content: string | ArrayBuffer | null): void;
}>();

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  emit("update:file", file);
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      emit("file-content", reader.result);
    };
    reader.readAsArrayBuffer(file);
  } else {
    emit("file-content", null);
  }
}
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
</template>
