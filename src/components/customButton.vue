<template>
    <button
      :type="type"
      :class="['custom-button', buttonClasses]"
      :style="{
        backgroundColor: isHovered ? hoverColor : bgColor,
        color: isHovered ? hoverTextColor : textColor,
        borderColor: borderColor,
      }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @click="onClick"
    >
      <slot />
    </button>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    type: {
      type: String,
      default: '',
    },
    bgColor: {
      type: String,
      default: '#C10C99',
    },
    textColor: {
      type: String,
      default: '#f8f9fa',
    },
    borderColor: {
      type: String,
      default: '#C10C99',
    },
    hoverColor: {
      type: String,
      default: '#f8f9fa',
    },
    hoverTextColor: {
      type: String,
      default: '#C10C99',
    },
    buttonClasses: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['click']);
  
  const isHovered = ref(false);
  
  const onClick = () => {
    emit('click');
  };
  </script>
  
  <style scoped>
  .custom-button {
    padding: 15px;
    font-size: 20px;
    font-weight: 600;
    border: 2px solid;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.12s, color 0.12s, border-color 0.12s;
    text-align: center;
    display: inline-block;
    width: 100%;
    margin-top: 20px;
  }
  </style>
  