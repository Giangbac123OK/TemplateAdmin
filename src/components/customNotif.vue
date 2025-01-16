<script setup>
import { ref, onMounted } from 'vue';

const showNotification = ref(true);

onMounted(() => {
  setTimeout(() => {
    showNotification.value = false;
  }, 6000);
});

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: '',
  },
});
</script>

<template>
  <div v-if="showNotification" class="notification">
    <i :class="icon" style="font-size: 16px; margin-right: 10px; color: #c10c99; background-color: white; font-weight: 600; border-radius: 50%; padding: 5px;"></i>
    <slot/>
  </div>
</template>

<style scoped>
.notification {
  background-color: #c10c99;
  color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid #c10c99;
  animation: fadeOut 6s;
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
