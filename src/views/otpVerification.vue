<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import halfScreenBg from '@/components/halfScreenBg.vue';
import customInput from '@/components/customInput.vue';
import customButton from '@/components/customButton.vue';
import customModal from '@/components/customModal.vue';

const router = useRouter();
const route = useRoute();
const isModalVisible = ref(false);
const errorMessage = ref('');
const otp = ref('');
const email = ref('');
const sentOtp = ref(''); 
onMounted(() => {
  email.value = route.query.email || '';
  sentOtp.value = route.query.sentOtp || ''; // Lấy OTP từ query
  console.log('Sent OTP:', sentOtp.value);
  console.log('Sent OTP:', email.value);
});
const verifyOtp = async () => {
  errorMessage.value = '';
  // Kiểm tra nếu OTP chưa nhập hoặc không đủ 6 chữ số
  if (!otp.value || otp.value.length !== 6) {
    errorMessage.value = 'Vui lòng nhập đúng mã OTP 6 chữ số.';
    isModalVisible.value = true;
    return;
  }

  try {
    if (otp.value == sentOtp.value) {
      router.push('/passwordChanging');
    } else {
      throw new Error('Mã OTP không chính xác.');
    }
  } catch (error) {
    // Nếu lỗi xảy ra, hiển thị thông báo lỗi
    errorMessage.value = error.message || 'Đã xảy ra lỗi, vui lòng thử lại.';
    isModalVisible.value = true;
  }
};

// Hàm xử lý nhập OTP, chỉ cho phép nhập 6 ký tự số
const handleOtpInput = (e) => {
  otp.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6); // Giới hạn tối đa 6 số
};
</script>

<template>
  <div class="main">
    <halfScreenBg />

    <div class="otp-section">
      <div class="content">
        <h1>Xác minh OTP</h1>
        <p class="instructions">
          Nhập mã OTP 6 chữ số được gửi đến email của bạn.
        </p>
        <form @submit.prevent="verifyOtp" class="otp-form">
          <customInput
            id="otp"
            label="Mã OTP"
            type="text"
            placeholder="Nhập mã OTP 6 chữ số"
            maxlength="6"
            v-model="otp"
            icon="pi pi-envelope"
            @input="handleOtpInput"
          />
          <div class="content-util">
            <RouterLink class="back-to-login" to="/login">Quay lại trang đăng nhập</RouterLink>

            <customButton
              bgColor="#C10C99"
              textColor="#f8f9fa"
              borderColor="#C10C99"
              hoverColor="transparent"
              hoverTextColor="#C10C99"
              class="verifyBtn"
            >
              Xác nhận OTP
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
        <h3>Lỗi</h3>
      </template>
      <p>{{ errorMessage }}</p>
      <template #footer>
        <customButton
          bgColor="#C10C99"
          textColor="#f8f9fa"
          borderColor="#C10C99"
          hoverColor="transparent"
          hoverTextColor="#C10C99"
          @click="isModalVisible = false"
        >
          Đóng
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
  background-color: black;
}

.main {
  display: flex;
  height: 100vh;
  overflow-y: hidden;
  color: #f8f9fa;
  width: 100vw;
  background-color: black;
}

.otp-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.otp-section .content {
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

.otp-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.otp-form .content-util {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.verifyBtn {
  margin-top: 0;
  width: 50%;
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
