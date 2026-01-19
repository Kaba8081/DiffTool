<script setup lang="ts">
import Nabvar from './Nabvar.vue';
import Footer from './Footer.vue';
</script>

<template>
  <Nabvar />
  <main class="flex flex-col items-center justify-center">
    <RouterView />
  </main>
  <Footer />
</template>