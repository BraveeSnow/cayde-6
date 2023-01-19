<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";
import HomeView from "@/views/HomeView.vue";
</script>

<template>
  <NavBar />
  <div class="h-14" />
  <HomeView />
</template>
