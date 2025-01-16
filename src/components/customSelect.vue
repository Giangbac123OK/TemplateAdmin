<template>
  <div class="custom-select">
    <label :for="id">
      <span>{{ label }}</span>
      <div class="icon" v-if="icon">
        <i :class="icon" style="font-size: 20px"></i>
      </div>
    </label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      required
    >
      <!-- Placeholder Option -->
      <option value="" disabled selected hidden>
        {{ placeholder || 'Select an option' }}
      </option>
      <option v-for="(option, index) in options" :key="index" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
  },
  label: {
    type: String,
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '', // Ensure no default selection
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
/* Styling remains the same */
.custom-select {
  margin-bottom: 15px;
  position: relative;
}

.custom-select label {
  margin-bottom: 5px;
  color: #f8f9fa;
  position: relative;
  display: block;
}

.custom-select label .icon {
  position: absolute;
  width: 100%;
  top: 37px;
  left: 10px;
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
}

.custom-select select {
  width: 100%;
  padding: 10px;
  padding-left: 40px;
  border: none;
  border-bottom: 1px solid #f8f9fa;
  font-size: 16px;
  background-color: transparent;
  color: #f8f9fa;
  outline: unset;
  transition: 0.12s;
  appearance: none;
}

.custom-select select:focus {
  border-color: #ff05c9;
  box-shadow: 0 4px 4px -4px #C10C99;
}

.custom-select select option {
  background-color: black;
  color: #f8f9fa;
}

.custom-select select:focus-visible {
  outline: none;
}
</style>
