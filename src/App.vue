<script setup>
import { ref, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import TopBar from '@/components/customTopbar.vue';
import Sidebar from '@/components/customSidebar.vue';

const excludedRoutes = ['/login', '/forgotPassword', '/otpVerification', '/passwordChanging'];

const route = useRoute();

</script>

<template>
  <template v-if="!excludedRoutes.includes(route.path)">
    <TopBar />
    <Sidebar />
  </template>

  <RouterView />
</template>
