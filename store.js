import { reactive } from 'vue';

export const globalState = reactive({
  isSidebarOpen: true,
  userId: localStorage.getItem('idNhanVien') || "DuongPH18",
  userName: localStorage.getItem('tenNhanvien') || "Dương",
  userRole: localStorage.getItem('vaiTro') == 'Admin' ? 'Admin' : 'Employee',
  // userRole: 'Admin',
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  },
});
