<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import customSearchField from "./customSearchField.vue";
import { globalState } from '../../store';

const isSidebarOpen = ref(true);
const customerCollapseOpen = ref(true);
const discountCollapseOpen = ref(true);
const saleCollapseOpen = ref(true);
const router = useRouter();

const isActiveLink = (routePath) => {
    const route = useRoute();
    return route.path === routePath;
}

const logout = () => {
  sessionStorage.removeItem('authToken');
  router.push('/login');
};

const handleSearch = (query) => {
  console.log("Search query:", query);
};

onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });

  document.getElementsByClassName('customerBtn')[0].addEventListener('click', () => {
    if (customerCollapseOpen.value) {
      customerCollapseOpen.value = false;
    } else {
      customerCollapseOpen.value = true;
    }
  });

  document.getElementsByClassName('discountBtn')[0].addEventListener('click', () => {
    if (discountCollapseOpen.value) {
      discountCollapseOpen.value = false;
    } else {
      discountCollapseOpen.value = true;
    }
  });

  document.getElementsByClassName('saleBtn')[0].addEventListener('click', () => {
    if (saleCollapseOpen.value) {
      saleCollapseOpen.value = false;
    } else {
      saleCollapseOpen.value = true;
    }
  });
});
</script>

<template>
  <aside :class="{ open: isSidebarOpen }" class="sidebar">
    <ul>
      <div class="web-logo" :class="{ open: !isSidebarOpen }">
        <img src="../assets/logo-magenta.png" alt="web logo" />
      </div>
      <li>
        <customSearchField
          id="sidebar-search"
          placeholder="Tìm kiếm"
          @search="handleSearch"
        />
      </li>
      <li :class="{ isActive: isActiveLink('/') }">
        <RouterLink class="routerLink" to="/">
            <i class="pi pi-shopping-bag" style="font-size: 20px; margin-right: 10px;"></i>
            Sản phẩm
        </RouterLink>
      </li>
      <li v-if="globalState.userRole == 'Admin'" :class="{ isActive: isActiveLink('/employees') }">
        <RouterLink class="routerLink" to="/employees">
            <i class="pi pi-user" style="font-size: 20px; margin-right: 10px;"></i>
            Nhân viên
        </RouterLink>
      </li>
      <li :class="{ isActive: isActiveLink('/brands') }">
        <RouterLink class="routerLink" to="/brands">
            <i class="pi pi-tag" style="font-size: 20px; margin-right: 10px;"></i>
            Thương Hiệu
        </RouterLink>
      </li>
      <button :class="{ btnIsActive: isActiveLink('/customers') || isActiveLink('/ranks'), iconActive: customerCollapseOpen }" class="customerBtn" type="button">
        <i class="pi pi-chevron-down" style="font-size: 20px; margin-left: 10px;"></i>
        Khách hàng
      </button>
      <li :class="{ isActive: isActiveLink('/customers'), customShow: customerCollapseOpen }" class="customerCollapse">
        <RouterLink class="routerLink" to="/customers">
            <i class="pi pi-users" style="font-size: 20px; margin-right: 10px;"></i>
            Khách hàng
        </RouterLink>
      </li>
      <li :class="{ isActive: isActiveLink('/ranks'), customShow: customerCollapseOpen }" class="customerCollapse">
        <RouterLink class="routerLink" to="/ranks">
            <i class="pi pi-star" style="font-size: 20px; margin-right: 10px;"></i>
            Rank
        </RouterLink>
      </li>
      <button :class="{ btnIsActive: isActiveLink('/vouchers') || isActiveLink('/sales'), iconActive: discountCollapseOpen }" class="discountBtn" type="button">
        <i class="pi pi-chevron-down" style="font-size: 20px; margin-left: 10px;"></i>
        Khuyến mại
      </button>
      <li :class="{ isActive: isActiveLink('/vouchers'), customShow: discountCollapseOpen }" class="discountCollapse">
        <RouterLink class="routerLink" to="/vouchers">
            <i class="pi pi-ticket" style="font-size: 20px; margin-right: 10px;"></i>
            Voucher
        </RouterLink>
      </li>
      <li :class="{ isActive: isActiveLink('/sales'), customShow: discountCollapseOpen }" class="discountCollapse">
        <RouterLink class="routerLink" to="/sales">
            <i class="pi pi-percentage" style="font-size: 20px; margin-right: 10px;"></i>
            Sale
        </RouterLink>
      </li>
      <li v-if="globalState.userRole == 'Admin'" :class="{ isActive: isActiveLink('/statistic') }">
        <RouterLink class="routerLink" to="/statistic">
            <i class="pi pi-chart-bar" style="font-size: 20px; margin-right: 10px;"></i>
            Thống kê
        </RouterLink>
      </li>
      <button :class="{ btnIsActive: isActiveLink('/saleManagement') || isActiveLink('/invoice'), iconActive: saleCollapseOpen }" class="saleBtn" type="button">
        <i class="pi pi-chevron-down" style="font-size: 20px; margin-left: 10px;"></i>
        Bán hàng
      </button>
      <li :class="{ isActive: isActiveLink('/saleManagement'), customShow: saleCollapseOpen }" class="saleCollapse">
        <RouterLink class="routerLink" to="/saleManagement">
            <i class="pi pi-dollar" style="font-size: 20px; margin-right: 10px;"></i>
            Bán hàng
        </RouterLink>
      </li>
      <li :class="{ isActive: isActiveLink('/invoice'), customShow: saleCollapseOpen }" class="saleCollapse">
        <RouterLink class="routerLink" to="/invoice">
            <i class="pi pi-print" style="font-size: 20px; margin-right: 10px;"></i>
            Hóa đơn
        </RouterLink>
      </li>
      <div class="divider"></div>
    </ul>
    <ul>
      <li>
        <button @click="logout" style="display: flex; align-items: center;">
          <i class="pi pi-sign-out" style="font-size: 20px; margin-right: 10px;"></i>
          Đăng Xuất
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  width: 250px;
  background: linear-gradient(180deg, hsla(314, 86%, 9%, 1) 0%, hsla(186, 46%, 13%, 1) 100%);
  color: #f8f9fa;
  transition: transform 0.3s ease;
  transform: translateX(-100%);
  position: fixed;
  left: 0;
  height: 100%;
  z-index: 1001;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #66405e #1f1f1f;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  transition: 0.2s ease-in-out;
  cursor: pointer;
  padding-left: 10px;
  border-left: 4px solid transparent;
  border-radius: 4px;
  margin-top: 10px;
}

.sidebar li i {
  color: #66405e;
}

.sidebar ul:first-child li:not(:nth-child(2)):hover,
.sidebar ul:nth-child(2) li:hover,
.sidebar .isActive {
  border-left-color: #C10C99;
  background-color: rgb(47, 47, 47);
}

.sidebar ul:first-child li:not(:nth-child(2)):hover i,
.sidebar ul:nth-child(2) li:hover i,
.sidebar .isActive i {
  color: #C10C99;
}

.sidebar .routerLink:hover,
.sidebar button:hover,
.sidebar .isActive .routerLink {
  color: white;
}

.sidebar .isActive .routerLink {
  font-weight: 700;
}

.divider {
  width: 90%;
  height: 2px;
  background-color: #66405e;
  margin-top: 25px;
  margin-left: 5%;
  margin-right: 5%;
}

.sidebar .search-field {
  position: relative;
}

.sidebar .search-field i {
  position: absolute;
  top: 14px;
  left: 10px;
  color: rgba(255, 255, 255, 0.75);
}

.sidebar .routerLink,
.sidebar button {
  display: flex;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  height: 50px;
  text-align: center;
  align-items: center;
  padding-left: 0;
  transition: 0.2s ease-in-out;
}

.sidebar input {
    width: 100%;
    background-color: #1f1f1f;
    outline: unset;
    border: none;
    border-bottom: 2px solid rgba(255, 255, 255, 0.75);
    padding: 10px;
    padding-left: 40px;
    margin-bottom: 20px;
    color: white;
    transition: 0.12s ease;
}

.custom-search-field {
  margin-left: -10px;
}

.sidebar input:focus {
    border-color: #C10C99;
}

.sidebar .search-field input:focus + i {
    color: #C10C99;
}

.sidebar .search-field i {
    transition: 0.12s ease;
}

.sidebar input::placeholder {
    color: rgba(255, 255, 255, 0.75);
}

.web-logo {
    transition: 0.3s ease;
}

.web-logo img {
  width: 60px;
  height: 60px;
}

.customerBtn,
.discountBtn,
.saleBtn {
  padding-left: 2px !important;
  color: #66405e !important;
  display: flex;
  gap: 10px;
  margin-bottom: -10px;
}

.customerBtn i,
.discountBtn i,
.saleBtn i{
  transform: rotate(-90deg);
  transition: .12s ease;
}

.customerBtn:hover,
.discountBtn:hover,
.saleBtn:hover,
.customerBtn.btnIsActive,
.discountBtn.btnIsActive,
.saleBtn.btnIsActive {
  color: #C10C99 !important;
}

.customerBtn.btnIsActive,
.discountBtn.btnIsActive,
.saleBtn.btnIsActive {
  font-weight: 700;
}

.customerCollapse,
.discountCollapse,
.saleCollapse {
  position: relative;
  transition: .12s ease;
  height: 0;
  opacity: 0;
  z-index: -1;
}

.customShow {
  margin-left: 30px;
  opacity: 1;
  height: 50px;
  z-index: 1001;
}

.customerCollapse::before,
.discountCollapse::before,
.saleCollapse::before {
  content: "";
  display: block;
  height: 130%;
  width: 1.5px;
  background-color: #66405e;
  position: absolute;
  left: -12px;
  top: -12px;
  transition: .12s ease;
}

.customerBtn:hover ~ .customerCollapse::before,
.discountBtn:hover ~ .discountCollapse::before,
.saleBtn:hover ~ .discountCollapse::before,
.customerBtn.btnIsActive ~ .customerCollapse::before,
.discountBtn.btnIsActive ~ .discountCollapse::before,
.saleBtn.btnIsActive ~ .discountCollapse::before {
  background-color: #C10C99;
}

.customerBtn.iconActive i,
.discountBtn.iconActive i,
.saleBtn.iconActive i{
  transform: rotate(0deg);
}

</style>
