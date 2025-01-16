<template>
    <div class="custom-search-field">
      <input
        :id="id"
        type="text"
        :placeholder="placeholder"
        v-model="searchQuery"
        @input="handleInput"
        :class="class"
      />
      <i :class="icon" class="search-icon"></i>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  const props = defineProps({
    id: {
      type: String,
    },
    class: {
      type: String,
    },
    placeholder: {
      type: String,
      default: "Search",
    },
    icon: {
      type: String,
      default: "pi pi-search",
    },
  });
  
  const emit = defineEmits(["search"]);
  
  const searchQuery = ref("");
  
  const handleInput = () => {
    emit("search", searchQuery.value);
  };
  </script>
  
  <style scoped>
  .custom-search-field {
    margin-top: 10px;
    position: relative;
  }
  
  .custom-search-field input {
    width: 100%;
    background-color: transparent;
    outline: unset;
    border: none;
    border-bottom: 1px solid #f8f9fa;
    padding: 10px;
    padding-left: 40px;
    margin-bottom: 20px;
    color: white;
    transition: 0.12s ease;
  }
  
  .custom-search-field input:focus {
    border-color: #C10C99;
  }
  
  .custom-search-field input:focus + .search-icon {
    color: #C10C99;
  }
  
  .custom-search-field input::placeholder {
    color: rgba(255, 255, 255, 0.75);
  }
  
  .search-icon {
    position: absolute;
    top: 14px;
    left: 10px;
    color: rgba(255, 255, 255, 0.75);
    transition: 0.12s ease;
  }
  </style>
  