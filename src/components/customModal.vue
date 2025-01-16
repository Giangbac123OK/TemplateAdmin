<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
show: {
    type: Boolean,
    required: true,
},
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};
</script>

<template>
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <slot name="header">
          <h3>Default Header</h3>
        </slot>
        <slot>
          <p>Default Body Content</p>
        </slot>
        <slot name="footer">
            <button 
                class="close-modal"
                @click="close"
            >
                Close
            </button>
        </slot>
      </div>
    </div>
  </template>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    position: relative;
    background-color: black;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 400px;
    border: 1px solid transparent;
  }

  .modal-content::after, .modal-content::before {
    content: "";
    position: absolute;
    border-radius: 8px;
    height: calc(100% + 5px);;
    width: calc(100% + 5px);;
    background-image: conic-gradient(#a30880, white, #a30880);
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    z-index: -1;
  }

  .modal-content::before {
    filter: blur(5px);
  }

  .close-modal {
    padding: 15px;
    font-size: 20px;
    font-weight: 600;
    border: 2px solid;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.12s;
    text-align: center;
    display: inline-block;
    width: 100%;
    margin-top: 20px;
  }
  
  .close-modal:hover {
    background: #a30880;
  }
  </style>
  