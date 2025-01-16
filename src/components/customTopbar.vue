<script setup>
import { ref, onMounted } from 'vue';
import { globalState } from '../../store';

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  const sidebarEvent = new Event('toggle-sidebar');
  window.dispatchEvent(sidebarEvent);
};

onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    const menuBars = document.getElementsByClassName('menu-bars');
    if (isSidebarOpen.value) {
      menuBars[0].style.transform = 'rotate(0) translate(0, 0)';
      menuBars[2].style.transform = 'rotate(0) translate(0, 0)';
      menuBars[0].style.width = '24px';
      menuBars[2].style.width = '24px';
      menuBars[1].style.opacity = '1';
      document.getElementsByClassName('web-logo')[0].style.opacity = '1';
    } else {
      menuBars[0].style.transform = 'rotate(45deg) translate(7.5px, 10px)';
      menuBars[2].style.transform = 'rotate(-45deg) translate(7.5px, -10px)';
      menuBars[0].style.width = '14px';
      menuBars[2].style.width = '14px';
      menuBars[1].style.opacity = '0';
      document.getElementsByClassName('web-logo')[0].style.opacity = '0';
    }
    isSidebarOpen.value = !isSidebarOpen.value;
  });
});
</script>

<template>
  <div class="top-bar">
    <div class="web-logo" :class="{ open: !isSidebarOpen }">
        <img src="../assets/logo.png" alt="web logo" />
    </div>
    <div class="sidebar-btn">
        <button @click="toggleSidebar" :class="{ open: !isSidebarOpen }" class="menu-toggle">
            <div class="menu-bars"></div>
            <div class="menu-bars"></div>
            <div class="menu-bars"></div>
        </button>
    </div>
    <a href="#">
        <i class="pi pi-exclamation-circle" style="font-size: 20px;"></i>
        Hỗ trợ
    </a>
    <a href="#">
        <i class="pi pi-envelope" style="font-size: 20px;"></i>
        Tin Nhắn
    </a>
    <div class="user-avatar">
      <img src="../assets/Avatar.jpg" alt="User Avatar" />
      <div style="display: flex; flex-direction: column">
        <span>{{ globalState.userName }}</span>
        <span style="font-size: 12px">{{ globalState.userRole }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: linear-gradient(#95227c, #C10C99);
  padding: 10px 20px;
  z-index: 1000;
}

.sidebar-btn {
  flex: 1;
  padding-left: 10px;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transform: translate(190px);
  transition: 0.3s ease;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  padding: 10px;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.menu-toggle:hover {
  background-color: rgba(255, 255, 255, 0.75);
}

.menu-toggle .menu-bars {
  min-height: 3px;
  background-color: rgba(255, 255, 255, 0.75);
  transition: transform 0.5s ease, background-color 0.12s ease, opacity 0.12s ease;
}

.menu-toggle:hover .menu-bars {
  background-color: #95227c;
}

.menu-bars:nth-child(1) {
  transform: rotate(45deg) translate(7.5px, 10px);
  width: 14px;
}

.menu-bars:nth-child(2) {
  width: 24px;
  opacity: 0;
}

.menu-bars:nth-child(3) {
  transform: rotate(-45deg) translate(7.5px, -10px);
  width: 14px;
}

.menu-toggle.open {
  transform: translate(0px);
}

a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  margin-right: 35px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  position: relative;
}

a::before {
  content: "";
  background-color: transparent;
  position: absolute  ;
  width: 100%;
  height: 2px;
  top: 45px;
  transition: .12s ease;
}

a:hover::before {
  background-color: white;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
}

.user-avatar:hover img {
  box-shadow: 1px 1px 12px 1px rgb(145, 63, 175);
  border-color: transparent;
}

.user-avatar span {
  font-size: 20px;
  font-weight: 600;
}

.user-avatar img {
  background-color: rgba(255, 255, 255, 0.85);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px ridge #4f8bca;
  transition: 0.12s ease;
}

.web-logo {
  transition: 0.3s ease;
  opacity: 0;
  border-right: 1px solid white;
  margin-left: -10px;
  padding-right: 10px;
}

.web-logo img {
  width: 50px;
  height: 50px;
}

</style>
