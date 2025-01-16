<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import halfScreenBg from '@/components/halfScreenBg.vue';
import customInput from '@/components/customInput.vue';
import customButton from '@/components/customButton.vue';
import customModal from '@/components/customModal.vue';

const newPassword = ref('');
const confirmPassword = ref('');
const isModalVisible = ref(false);
const router = useRouter();

const changePassword = () => {
    if (!newPassword.value || !confirmPassword.value) {
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        isModalVisible.value = true;
        return;
    }
    console.log('Password Changed:', newPassword.value);
    router.push({ path: '/login', query: { showNotification: true } });
};
</script>

<template>
  <div class="main">
    <halfScreenBg />

    <div class="change-password-section">
      <div class="content">
        <h1>Change Password</h1>
        <p class="instructions">
          Please enter and confirm your new password below.
        </p>
        <form @submit.prevent="changePassword" class="change-password-form">
          <customInput
            id="new-password"
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            icon="pi pi-lock"
            v-model="newPassword"
          />
          <customInput
            id="confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your new password"
            icon="pi pi-lock"
            v-model="confirmPassword"
          />

          <div class="content-util">
            <RouterLink class="back-to-login" to="/">Back to Login</RouterLink>

            <customButton
              bgColor="#C10C99"
              textColor="#f8f9fa"
              borderColor="#C10C99"
              hoverColor="transparent"
              hoverTextColor="#C10C99"
              class="changeBtn"
            >
              Change Password
            </customButton>
          </div>
        </form>
      </div>
    </div>

    <customModal
      :show="isModalVisible"
      @close="isModalVisible = false"
    >
      <template #header>
        <h3>Error</h3>
      </template>
      <p>Passwords do not match. Please try again.</p>
      <template #footer>
        <customButton
          bgColor="#C10C99"
          textColor="#f8f9fa"
          borderColor="#C10C99"
          hoverColor="transparent"
          hoverTextColor="#C10C99"
          @click="isModalVisible = false"
        >
          Close
        </customButton>
      </template>
    </customModal>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.main {
  display: flex;
  height: 100vh;
  overflow-y: hidden;
  color: #f8f9fa;
  width: 100vw;
  background-color: black;
}

.change-password-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.change-password-section .content {
  width: 70%;
}

h1 {
  margin-bottom: 20px;
  color: #f8f9fa;
  font-weight: 600;
}

.instructions {
  margin-bottom: 20px;
  color: #d3d3d3;
  font-size: 16px;
}

.change-password-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.change-password-form .content-util {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.changeBtn {
    margin-top: 0;
    width: 70%;
}

.back-to-login {
    text-decoration: none;
    color: #f8f9fa;
    transition: 0.12s;
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: 600;
}

.back-to-login:hover {
    text-decoration: none;
    color: #C10C99;
}

</style>
