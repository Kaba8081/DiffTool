<script setup lang="ts">
defineProps<{}>();
</script>

<template>
    <nav class="flex flex-row justify-between items-center my-2">
        <!-- title / logo -->
        <h2>Diff tool</h2>

        <!-- nav items -->
        <div class="flex flex-row gap-x-4">
            <RouterLink to="/">Compare</RouterLink>
            <RouterLink to="/about">About</RouterLink>
        </div>

        <!-- version -->
        <span>
            v1.0.0
        </span>
    </nav>
</template>