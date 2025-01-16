<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import halfScreenBg from '@/components/halfScreenBg.vue';
import customInput from '@/components/customInput.vue';
import customButton from '@/components/customButton.vue';

const email = ref('');
const errorMessage = ref('');
const router = useRouter();
const sentOtp = ref('');
const checkEmailAndSendOtp = async () => {
  // Reset lỗi trước khi bắt đầu
  errorMessage.value = '';
  if (!email.value) {
    errorMessage.value = 'Vui lòng nhập email';
    return;
  }

  try {
    // Kiểm tra email tồn tại trong cơ sở dữ liệu
    const response = await fetch(
      `https://localhost:7297/api/Nhanvien/find-by-email?email=${encodeURIComponent(email.value)}`
    );

    if (!response.ok) {
      throw new Error('Email không tồn tại trong cơ sở dữ liệu');
    }

    // Nếu email tồn tại, gửi OTP
    const sendOtpResponse = await fetch('https://localhost:7297/api/Nhanvien/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    });

    const otpResult = await sendOtpResponse.json();
    if (otpResult.success) {
      sentOtp.value = otpResult.otp;
      console.log(sentOtp.value);
      router.push({ path: '/otpVerification', query: { email: email.value,  sentOtp: otpResult.otp  } });
    } else {
      throw new Error('Không thể gửi OTP. Vui lòng thử lại sau.');
    }
  } catch (error) {
    // Hiển thị thông báo lỗi
    errorMessage.value = error.message || 'Đã xảy ra lỗi, vui lòng thử lại';
  }
};
</script>

<template>
  <div class="main">
    <halfScreenBg />

    <div class="forgot-password-section">
      <div class="content">
        <h1>Quên mật khẩu</h1>
        <p class="instructions">
          Nhập địa chỉ email của bạn để chúng tôi gửi mã OTP khôi phục mật khẩu.
        </p>
        <form @submit.prevent="checkEmailAndSendOtp" class="forgot-password-form">
          <customInput
            id="email"
            label="Email"
            type="email"
            placeholder="Nhập email"
            icon="pi pi-envelope"
            v-model="email"
          />
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <div class="content-util">
            <RouterLink class="back-to-login" to="/login">Quay lại trang đăng nhập</RouterLink>
            <customButton
              bgColor="#C10C99"
              textColor="#f8f9fa"
              borderColor="#C10C99"
              hoverColor="transparent"
              hoverTextColor="#C10C99"
              class="resetBtn"
            >
              Gửi yêu cầu
            </customButton>
          </div>
        </form>
      </div>
    </div>
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
  background-color: black;
  width: 100vw;
}

.forgot-password-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.forgot-password-section .content {
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

.forgot-password-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.forgot-password-form .content-util {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.resetBtn {
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

.error-message {
  color: #f72b4d;
}
</style>
