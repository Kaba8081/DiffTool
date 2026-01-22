<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  file1: File | null;
  file2: File | null;
}>();

const hexRows = ref<
  Array<{
    offset: number;
    left: Array<{ value: string; diff: boolean } | null>;
    right: Array<{ value: string; diff: boolean } | null>;
  }>
>([]);

// Virtualization state
const visibleStart = ref(0);
const visibleCount = ref(50); // Number of rows to show at once
const scrollToRow = (row: number) => {
  visibleStart.value = Math.max(
    0,
    Math.min(row, hexRows.value.length - visibleCount.value),
  );
};
const maxLength = ref<number>(0);
const loading = ref(false);
const error = ref<string>("");

async function compareFilesHex(file1: File, file2: File) {
  loading.value = true;
  error.value = "";
  hexRows.value = [];
  try {
    const [buf1, buf2] = await Promise.all([
      file1.arrayBuffer(),
      file2.arrayBuffer(),
    ]);
    const arr1 = new Uint8Array(buf1);
    const arr2 = new Uint8Array(buf2);
    maxLength.value = Math.max(arr1.length, arr2.length);
    const rows = [];
    for (let offset = 0; offset < maxLength.value; offset += 16) {
      const left: Array<{ value: string; diff: boolean } | null> = [];
      const right: Array<{ value: string; diff: boolean } | null> = [];
      for (let i = 0; i < 16; i++) {
        const idx = offset + i;
        // Only use null for missing bytes (beyond file length)
        const l = idx < arr1.length ? arr1[idx] : undefined;
        const r = idx < arr2.length ? arr2[idx] : undefined;
        if (l !== undefined) {
          left.push({
            value: l.toString(16).padStart(2, "0").toUpperCase(),
            diff: r !== undefined && l !== r,
          });
        } else {
          left.push(null);
        }
        if (r !== undefined) {
          right.push({
            value: r.toString(16).padStart(2, "0").toUpperCase(),
            diff: l !== undefined && l !== r,
          });
        } else {
          right.push(null);
        }
      }
      rows.push({ offset, left, right });
    }
    hexRows.value = rows;
  } catch (e) {
    error.value = "Error comparing files.";
  } finally {
    loading.value = false;
  }
}

function groupCells(cells: Array<{ value: string; diff: boolean } | null>) {
  const groups: Array<{ diff: boolean; values: string[] }> = [];
  let current: { diff: boolean; values: string[] } | null = null;
  for (const cell of cells) {
    const diff = cell ? cell.diff : false;
    const value = cell && cell.value ? cell.value : "  ";
    if (!current || current.diff !== diff) {
      if (current) groups.push(current);
      current = { diff, values: [value] };
    } else {
      current.values.push(value);
    }
  }
  if (current) groups.push(current);
  return groups;
}

watch(
  () => [props.file1, props.file2],
  ([file1, file2]) => {
    if (file1 && file2) {
      compareFilesHex(file1, file2);
    } else {
      hexRows.value = [];
      error.value = "";
    }
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="props.file1 && props.file2">
    <div v-if="loading">Comparing files...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="binary-diff-table-wrapper">
      <div
        style="
          margin-bottom: 0.5em;
          display: flex;
          gap: 1em;
          align-items: center;
        "
      >
        <button
          @click="scrollToRow(visibleStart - visibleCount)"
          :disabled="visibleStart === 0"
        >
          ▲ Up
        </button>
        <span
          >Rows {{ visibleStart + 1 }} -
          {{ Math.min(visibleStart + visibleCount, hexRows.length) }} of
          {{ hexRows.length }}</span
        >
        <button
          @click="scrollToRow(visibleStart + visibleCount)"
          :disabled="visibleStart + visibleCount >= hexRows.length"
        >
          ▼ Down
        </button>
      </div>
      <table class="binary-diff-table">
        <thead>
          <tr>
            <th>Offset</th>
            <th>{{ props.file1.name }}</th>
            <th>{{ props.file2.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in hexRows.slice(
              visibleStart,
              visibleStart + visibleCount,
            )"
            :key="row.offset"
          >
            <td class="offset">
              {{ row.offset.toString(16).padStart(8, "0").toUpperCase() }}
            </td>
            <td class="hex-col">
              <template
                v-for="(group, gIdx) in groupCells(row.left)"
                :key="gIdx"
              >
                <span :class="group.diff ? 'diff-group' : ''">
                  <span
                    v-for="(value, vIdx) in group.values"
                    :key="vIdx"
                    class="hex-byte"
                    >{{ value }}</span
                  >
                </span>
              </template>
            </td>
            <td class="hex-col">
              <template
                v-for="(group, gIdx) in groupCells(row.right)"
                :key="gIdx"
              >
                <span :class="group.diff ? 'diff-group' : ''">
                  <span
                    v-for="(value, vIdx) in group.values"
                    :key="vIdx"
                    class="hex-byte"
                    >{{ value }}</span
                  >
                </span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else>
    <p>Select two files to display the DiffViewer.</p>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.binary-diff-table-wrapper {
  overflow-x: auto;
}
.binary-diff-table {
  width: 100%;
  font-family: monospace;
  font-size: 1em;
}
.binary-diff-table th,
.binary-diff-table td {
  padding: 0em 0.5em;
  text-align: left;
}
.binary-diff-table th {
  background: #242424;
}
.offset {
  color: var(--color-text);
}
.hex-col {
  white-space: pre;
  font-family: monospace;
}
.hex-byte {
  display: inline-block;
  width: 2ch;
  margin-right: 0.3ch;
}
.diff-group {
  background: #942626;
  color: #e7e0e0;
  border-radius: 2px;
}
</style>
