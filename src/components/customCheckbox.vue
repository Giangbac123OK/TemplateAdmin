<script setup>
    import { defineEmits, ref } from 'vue';

    const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    modelValue: {
        type: Boolean,
        default: false,
    },
    });

    const emit = defineEmits(['update:modelValue']);

    const toggleCheckbox = () => {
    emit('update:modelValue', !props.modelValue);
    };
</script>

<template>
  <div class="custom-checkbox">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      @change="toggleCheckbox"
    />
    <label :for="id">{{ label }}</label>
  </div>
</template>

<style scoped>
    .custom-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    }

    input[type='checkbox'] {
    padding: 10px;
    appearance: none;
    border: 2px solid #f8f9fa;
    border-radius: 4px;
    background-color: transparent;
    cursor: pointer;
    position: relative;
    transition: 0.12s;
    }

    input[type='checkbox']:checked {
    background-color: #c10c99;
    border-color: #c10c99;
    }

    input[type='checkbox']:checked::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 7px;
    width: 6px;
    height: 10px;
    border: solid #f8f9fa;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    }

    label {
    color: #f8f9fa;
    font-size: 16px;
    cursor: pointer;
    }
</style>
