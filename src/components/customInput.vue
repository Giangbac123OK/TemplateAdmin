<template>
    <div class="custom-input">
      <label :for="id">
        <span>{{ label }}</span>
        <div class="icon" v-if="icon">
          <i :class="icon" style="font-size: 20px"></i>
          <i
            v-if="type === 'password'"
            class="pi show-pswd"
            :class="isPasswordVisible ? 'pi-eye-slash' : 'pi-eye'"
            :style="isPasswordVisible ? 'font-size: 20px; color: #C10C99' : 'font-size: 20px;'"
            @click="togglePasswordVisibility"
          ></i>
        </div>
      </label>
      <input
        :id="id"
        :type="isPasswordVisible && type === 'password' ? 'text' : type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        required
      />
    </div>
</template>
  
<script setup>
    import { ref } from 'vue';
    
    const props = defineProps({
        id: {
        type: String,
        },
        label: {
        type: String,
        required: true,
        },
        type: {
        type: String,
        default: 'text',
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
        type: String,
        },
        disabled: {
        type: Boolean,
        default: false,
        },
    });
    const emit = defineEmits(['update:modelValue']);
    
    const isPasswordVisible = ref(false);
    
    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value;
    };
</script>
  
<style scoped>
    .custom-input {
        margin-bottom: 15px;
        position: relative;
    }
    
    .custom-input label {
        margin-bottom: 5px;
        color: #f8f9fa;
        position: relative;
        display: block;
    }
    
    .custom-input label .icon {
        position: absolute;
        width: 100%;
        top: 42px;
        left: 10px;
        display: flex;
        justify-content: space-between;
        padding-right: 20px;
    }
    
    .custom-input input {
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
    }

    .custom-input input:disabled {
        background-color: rgb(47, 47, 47);
        color: #f8f9fa;
    }
    
    .custom-input input:focus {
        border-color: #ff05c9;
        box-shadow: 0 4px 4px -4px #C10C99;
    }
    
    .show-pswd {
        cursor: pointer;
    }
</style>
  