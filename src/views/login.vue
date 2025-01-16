<template> 
    <div class="main">
        <halfScreenBg />

        <div class="forgotPassword-section">
            <div class="content">
                <h1>Đăng nhập</h1>
                <form @submit.prevent="login" class="login-form">
                    <customInput
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Nhập email"
                        icon="pi pi-user"
                        v-model="email"
                        required
                    />
                    <customInput
                        id="password"
                        label="Mật khẩu"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        icon="pi pi-lock"
                        v-model="password"
                        required
                    />

                    <!-- Thêm lựa chọn vai trò -->
                    <div class="role-selection">
                        <label for="role">Vai trò</label>
                        <select id="role" v-model="selectedRole" required>
                            <option value="" disabled>Chọn vai trò</option>
                            <option value="Admin">Admin</option>
                            <option value="Employee">Employee</option>
                        </select>
                    </div>

                    <div class="misc">
                        <customCheckbox
                            id="remember-pswd"
                            label="Lưu thông tin đăng nhập"
                            v-model="rememberMe"
                        />
                        <RouterLink class="routerLink" to="/forgotPassword">Quên mật khẩu?</RouterLink>
                    </div>

                    <customButton
                        bgColor="#C10C99"
                        textColor="#f8f9fa"
                        borderColor="#C10C99"
                        hoverColor="transparent"
                        hoverTextColor="#C10C99"
                    >
                        Đăng nhập
                    </customButton>
                </form>
            </div>
        </div>

        <customNotif 
            v-if="showNotif" 
            :icon="notifIcon" 
            style="position: absolute; right: 5px; top: 5px;"
        >
            {{ notifMessage }}
        </customNotif>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import halfScreenBg from '@/components/halfScreenBg.vue';
import customInput from '@/components/customInput.vue';
import customButton from '@/components/customButton.vue';
import customCheckbox from '@/components/customCheckbox.vue';
import customNotif from '@/components/customNotif.vue';
import { globalState } from '../../store';

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const selectedRole = ref('Admin');
const route = useRoute();
const showNotif = ref(false);
const notifMessage = ref('');
const notifIcon = ref('pi pi-check'); // Có thể thay đổi icon dựa trên trạng thái
const router = useRouter();

const login = async () => {
    // localStorage.setItem('idNhanVien', 'ThaoDTP26');
    // localStorage.setItem('tenNhanvien', 'Thảo');
    // localStorage.setItem('vaiTro', 'Admin');
    // globalState.userId = 'ThaoDTP26';
    // globalState.userName = 'Thảo';
    // globalState.userRole = 'Admin';
    // router.push('/');
    if (email.value === '' || password.value === '' || selectedRole.value === '') {
        notifMessage.value = 'Vui lòng nhập đầy đủ email, mật khẩu và chọn vai trò.';
        notifIcon.value = 'pi pi-times';
        showNotif.value = true;
        setTimeout(() => {
            showNotif.value = false;
        }, 6000);
        return;
    }

    const loginData = {
        email: email.value,
        password: password.value
    };

    // Chọn endpoint dựa trên vai trò
    const endpoint = selectedRole.value === 'Admin' 
        ? 'https://localhost:7297/api/Nhanvien/login/Admin' 
        : 'https://localhost:7297/api/Nhanvien/login/Employee';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            // Xử lý các lỗi cụ thể dựa trên mã trạng thái HTTP
            if (response.status === 401) {
                throw new Error('Thông tin đăng nhập không chính xác.');
            } else {
                throw new Error('Có lỗi xảy ra khi kết nối đến server.');
            }
        }

        const data = await response.json();

        if (data.success) {
            // Lưu thông tin vào localStorage hoặc sessionStorage
            localStorage.setItem('idNhanVien', data.data.id);
            localStorage.setItem('tenNhanvien', data.data.hoten);
            localStorage.setItem('vaiTro', data.data.role == 0 ? "Admin" : "Employee");
            globalState.userId = data.data.id;
            globalState.userName = data.data.hoten;
            globalState.userRole = data.data.role == 0 ? "Admin" : "Employee";
            sessionStorage.setItem('authToken', 'DaDangNhap'); // Hoặc sử dụng token thực từ API

            notifMessage.value = 'Đăng nhập thành công!';
            notifIcon.value = 'pi pi-check';
            showNotif.value = true;

            // Chuyển hướng sau khi đăng nhập thành công
            setTimeout(() => {
                router.push('/');
            }, 2000); // Chờ 2 giây trước khi chuyển hướng
        } else {
            notifMessage.value = data.message || 'Email hoặc mật khẩu không đúng.';
            notifIcon.value = 'pi pi-times';
            showNotif.value = true;
        }
    } catch (error) {
        console.error('Có lỗi xảy ra:', error);
        notifMessage.value = error.message || 'Đã xảy ra lỗi khi kết nối đến server.';
        notifIcon.value = 'pi pi-times';
        showNotif.value = true;
    }

    // Ẩn thông báo sau 6 giây
    setTimeout(() => {
        showNotif.value = false;
    }, 6000);
};

onMounted(() => {
    if(route.query.showNotification) {
        showNotif.value = true;
        notifMessage.value = 'Password changed successfully!';
        notifIcon.value = 'pi pi-check';
        setTimeout(() => {
            showNotif.value = false;
        }, 6000);
    }
});
</script>

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
        background-color: black;
        width: 100vw;
        position: relative;
    }

    .forgotPassword-section {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }

    .forgotPassword-section .content {
        width: 70%;
    }

    .forgotPassword-section .content .misc {
        display: flex;
        justify-content: space-between;
        padding: 10px;
    }

    .forgotPassword-section .content .misc .routerLink {
        text-decoration: none;
        color: #f8f9fa;
        transition: 0.12s;
        font-size: 16px;
        font-weight: 600;
    }

    .forgotPassword-section .content .misc .routerLink:hover {
        text-decoration: none;
        color: #C10C99;
    }

    h1 {
        margin-bottom: 20px;
        color: #f8f9fa;
        font-weight: 600;
    }

    .login-form {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

/* Style cho phần chọn vai trò */
.role-selection {
    margin: 10px 0;
    display: flex;
    flex-direction: column;
}

.role-selection label {
    margin-bottom: 5px;
    color: #f8f9fa;
}

.role-selection select {
    background-color: transparent;
    color: #C10C99;
    padding: 8px;
    border: 2px solid #C10C99;
    border-radius: 4px;
}

.role-selection select:focus {
    outline: none;
    box-shadow: 0 0 2px 1px #C10C99;
}
</style>
