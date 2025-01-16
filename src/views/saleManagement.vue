<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container">
        <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Bán hàng tại quầy</h1>
        
        <!-- Modal Chi Tiết Hóa Đơn -->
        <div
          class="modal fade"
          id="invoiceDetailsModal"
          tabindex="-1"
          aria-labelledby="invoiceDetailsLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="invoiceDetailsLabel">Chi Tiết Hóa Đơn</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p><strong>Họ tên NV:</strong> {{ selectedInvoiceDetails?.hoTenNV || "Không xác định" }}</p>
                <p><strong>Tên KH:</strong> {{ selectedInvoiceDetails?.tenKH || "Khách lẻ" }}</p>
                <p><strong>Thời gian đặt hàng:</strong> {{ formatDate(selectedInvoiceDetails?.thoiGianDatHang) }}</p>
                <p><strong>Tổng tiền sản phẩm:</strong> {{ formatCurrency(selectedInvoiceDetails?.tongTienSanPham || 0) }}</p>
                <p><strong>Tổng tiền trả lại:</strong> {{ formatCurrency(selectedInvoiceDetails?.tongTienCanTra || 0) }}</p>
                <p><strong>Tổng giảm giá:</strong> {{ formatCurrency(selectedInvoiceDetails?.tongGiamGia || 0) }}</p>
                <hr />
                <h6>Danh sách sản phẩm:</h6>
                <ul>
                  <li v-for="item in selectedInvoiceDetails?.sanphamDto_HDoffs" :key="item.tenSP">
                    {{ item.tenSP }} ({{ item.phanLoaiSP }}) - {{ formatCurrency(item.giaBan) }} - ({{ formatCurrency(item.giaGiam) }})
                  </li>
                </ul>
              </div>
              <div class="modal-footer">
                <button type="button" class="customCloseBtn" data-bs-dismiss="modal">Đóng</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Biểu đồ Doanh thu tại Quầy và Báo cáo trong ngày -->
        <div class="row mb-4">
          <!-- Biểu đồ -->
          <div class="col-md-6">
            <div class="card h-100" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #ca690e74);">
              <div class="card-header">
                <h5>Biểu đồ Doanh thu tại Quầy</h5>
              </div>
              <div class="card-body">
                <select v-model="chartTimeUnit" class="form-select w-50 mb-3">
                  <option value="day">Ngày</option>
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                </select>
                <canvas id="revenueChart"></canvas>
              </div>
            </div>
          </div>
    
          <!-- Báo cáo số lượng và tổng tiền -->
          <div class="col-md-6">
            <div class="card h-100" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #ca690e74); color: white;">
              <div class="card-header">
                <h5>Báo cáo trong ngày</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label for="reportDate" class="form-label">Chọn ngày:</label>
                  <input
                    id="reportDate"
                    type="date"
                    class="form-control"
                    v-model="reportDate"
                    @change="fetchDailyReport"
                  />
                </div>
                <p><strong>Ngày:</strong> {{ formatReportDate(dailyReport.date) || "Hôm nay" }}</p>

                <p><strong>Tổng số lượng đơn hàng:</strong> {{ dailyReport.tongSoLuongDonHang || 0 }}</p>
                <p><strong>Tổng tiền thanh toán:</strong> {{ formatCurrency(dailyReport.tongTienThanhToan || 0) }}</p>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Chức năng Thao tác -->
        <div class="row mb-4">
          <div class="col">
            <div class="card h-100" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #ca690e74); color: white;">
              <div class="card-header">
                <h5>Chức năng Thao tác</h5>
              </div>
              <div class="card-body">
                <div class="d-flex flex-wrap align-items-center gap-3">
                  <!-- Search Input -->
                  <div class="flex-grow-1 min-w-200">
                    <input 
                      v-model="searchQuery"
                      type="text"
                      class="form-control"
                      placeholder="Tìm kiếm hóa đơn..."
                    />
                  </div>
                  
                  <!-- Filter Select -->
                  <div class="min-w-150">
                    <select v-model="filterOption" class="form-select">
                      <option value="day">Hôm nay</option>
                      <option value="week">Tuần này</option>
                      <option value="month">Tháng này</option>
                      <option value="all">Tất cả</option>
                    </select>
                  </div>
                  
                  <!-- Sort Select -->
                  <div class="min-w-200">
                    <select v-model="sortOption" class="form-select">
                      <option value="total-desc">Tổng tiền giảm dần</option>
                      <option value="total-asc">Tổng tiền tăng dần</option>
                    </select>
                  </div>
                  
                  <!-- Add Invoice Button -->
                  <div class="min-w-150">
                    <button class="customAddBtn w-100" @click="redirectToAddInvoice">
                      <i class="bi bi-plus-circle me-2"></i> Thêm Hóa Đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Danh sách Hóa Đơn -->
        <div class="row gy-3">
          <div
            v-for="(invoice, index) in filteredInvoices"
            :key="invoice.id"
            class="col-md-6 col-lg-4"
          >
            <div class="card h-100 shadow-sm" style="background-color: transparent; background-image: linear-gradient(#cf4f0ea5, #1f1f1f); color: white;">
              <div class="card-body">
                <h5 class="card-title">
                  Hóa đơn #{{ index + 1 }} - {{ getCustomerName(invoice.idkh) }}
                </h5>
                <p class="card-text">
                  <strong>Thời gian mua:</strong> {{ formatDate(invoice.thoigiandathang) }}
                </p>
                <p class="card-text">
                  <strong>Tổng tiền:</strong> {{ formatCurrency(invoice.tongtiencantra) }}
                </p>
                <div class="d-flex justify-content-between mt-4">
                  <button class="btn btn-info btn-sm" @click="viewDetails(invoice.id)">
                    Xem Chi Tiết
                  </button>
                  <button class="btn btn-danger btn-sm" @click="deleteInvoice(invoice.id)">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm" style="background-color: transparent; background-image: linear-gradient(#cf4f0ea5, #1f1f1f); color: white;">
              <div class="card-body">
                <h5 class="card-title">
                  Hóa đơn #1
                </h5>
                <p class="card-text">
                  <strong>Thời gian mua:</strong> 14/03/2003
                </p>
                <p class="card-text">
                  <strong>Tổng tiền:</strong> $100
                </p>
                <div class="d-flex justify-content-between mt-4">
                  <button class="btn btn-info btn-sm">
                    Xem Chi Tiết
                  </button>
                  <button class="btn btn-danger btn-sm">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div> -->
        </div>
    
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Chart from "chart.js/auto";
import { useRouter } from "vue-router";
import Swal from "sweetalert2"; // Đảm bảo bạn đã cài đặt SweetAlert2

const router = useRouter();

// Hóa đơn
const invoices = ref([]);
const customerMap = ref({});
const searchQuery = ref("");
const filterOption = ref("day"); // Mặc định là "day" để hiển thị hóa đơn hôm nay
const sortOption = ref("total-desc"); // Mặc định sắp xếp giảm dần theo tổng tiền

// Biểu đồ doanh thu
const chartTimeUnit = ref("week"); // Mặc định là tuần
let revenueChart = null;

// Modal
const showDetailsModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('invoiceDetailsModal'));
  modal.show();
};

// Hàm để lấy tên khách hàng, bao gồm cả "Khách lẻ"
const getCustomerName = (idkh) => {
  return customerMap.value[idkh] || "Khách lẻ";
};

// Lọc và sắp xếp hóa đơn
const filteredInvoices = computed(() => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Từ thứ Hai
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let filtered = invoices.value.filter((invoice) => {
    const invoiceDate = new Date(invoice.thoigiandathang);
    switch (filterOption.value) {
      case "day":
        return invoiceDate.toDateString() === new Date().toDateString();
      case "week":
        return invoiceDate >= startOfWeek;
      case "month":
        return invoiceDate >= startOfMonth;
      case "all":
      default:
        return true;
    }
  });

  if (sortOption.value === "total-asc") {
    filtered.sort((a, b) => a.tongtiencantra - b.tongtiencantra);
  } else if (sortOption.value === "total-desc") {
    filtered.sort((a, b) => b.tongtiencantra - a.tongtiencantra);
  }

  return filtered.filter((invoice) => {
    const customerName = getCustomerName(invoice.idkh);
    return customerName.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// Báo cáo trong ngày
const dailyReport = ref({});
const reportDate = ref(new Date().toISOString().slice(0, 10)); // Mặc định là hôm nay

// Gọi API báo cáo
const fetchDailyReport = async () => {
  try {
    const response = await fetch(
      `https://localhost:7297/api/Hoadon/daily-report/Admin?date=${reportDate.value}`
    );
    if (response.ok) {
      const data = await response.json();
      dailyReport.value = data;
    } else {
      console.error("Failed to fetch daily report");
    }
  } catch (error) {
    console.error("Error fetching daily report:", error);
  }
};

// Lấy dữ liệu khi tải trang
onMounted(fetchDailyReport);

// Hàm format tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const isSidebarOpen = ref(true);

// Lấy dữ liệu khi tải trang
onMounted(async () => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  await fetchInvoices();
  await fetchRevenueData();
});

// Gọi API hóa đơn
const fetchInvoices = async () => {
  try {
    const response = await fetch("https://localhost:7297/api/Hoadon/Admin/Off");
    const data = await response.json();
    // Thêm '0' cho hóa đơn không có idkh
    invoices.value = data
      .filter((invoice) => invoice.donvitrangthai === 1)
      .map(invoice => ({
        ...invoice,
        idkh: invoice.idkh || '0' // Sử dụng '0' để đại diện cho "Khách lẻ"
      }));

    const uniqueIdkh = [...new Set(invoices.value.map((item) => item.idkh))];
    await fetchCustomers(uniqueIdkh);
  } catch (error) {
    console.error("Error fetching invoices:", error);
  }
};

// Gọi API khách hàng
const fetchCustomers = async (ids) => {
  // Đặt "Khách lẻ" trước
  customerMap.value['0'] = "Khách lẻ";

  const promises = ids.map(async (id) => {
    if (id === '0') {
      // Đã đặt tên "Khách lẻ"
      return;
    }
    try {
      const response = await fetch(`https://localhost:7297/api/Khachhang/${id}/Admin`);
      if (response.ok) {
        const customer = await response.json();
        customerMap.value[id] = customer.ten || "Khách lẻ";
      } else {
        console.error(`Failed to fetch customer with id ${id}`);
        customerMap.value[id] = "Khách lẻ";
      }
    } catch (error) {
      console.error(`Error fetching customer with id ${id}:`, error);
      customerMap.value[id] = "Khách lẻ";
    }
  });
  await Promise.all(promises);
};

// Gọi API doanh thu
const fetchRevenueData = async () => {
  try {
    const response = await fetch(`https://localhost:7297/api/Hoadon/order-summary/Admin?timeUnit=${chartTimeUnit.value}`);
    const data = await response.json();
    updateChart(data);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
  }
};

// Cập nhật biểu đồ
const updateChart = (data) => {
  const labels = data.map((item) => formatDate(item.thoiGian));
  const revenues = data.map((item) => item.tongTienThanhToan);

  if (revenueChart) {
    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].data = revenues;
    revenueChart.update();
  } else {
    const ctx = document.getElementById("revenueChart").getContext("2d");
    revenueChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Doanh thu (VND)",
            data: revenues,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Sử dụng định dạng 24 giờ
  });
};

const selectedInvoiceDetails = ref(null);

const viewDetails = async (id) => {
  try {
    const response = await fetch(`https://localhost:7297/api/Hoadon/${id}/Admin/hoadondetaisl`);
    if (response.ok) {
      selectedInvoiceDetails.value = await response.json();
      // Hiển thị modal hoặc giao diện chi tiết
      showDetailsModal();
    } else {
      console.error(`Failed to fetch details for invoice ID: ${id}`);
    }
  } catch (error) {
    console.error(`Error fetching details for invoice ID: ${id}`, error);
  }
};

const deleteInvoice = async (id) => {
  const userConfirmed = confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?");
  if (!userConfirmed) return;

  try {
    const response = await fetch(`https://localhost:7297/api/Hoadon/${id}/Admin/hdtq`, {
      method: "DELETE",
    });
    if (response.ok) {
      // Xóa thành công
      Swal.fire({
        icon: "success",
        title: "Xóa hóa đơn thành công.",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      invoices.value = invoices.value.filter((invoice) => invoice.id !== id); // Cập nhật danh sách hóa đơn
    } else {
      console.error(`Failed to delete invoice ID: ${id}`);
      Swal.fire({
        icon: "error",
        title: "Không thể xóa hóa đơn. Vui lòng thử lại.",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
    }
  } catch (error) {
    console.error(`Error deleting invoice ID: ${id}`, error);
    Swal.fire({
      icon: "error",
      title: "Đã xảy ra lỗi khi xóa hóa đơn.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};
const formatReportDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN"); // Định dạng "dd/mm/yyyy"
};
const redirectToAddInvoice = () => {
  router.push({ path: "/invoiceAdding" });
};

// Lắng nghe thay đổi timeUnit của biểu đồ
watch(chartTimeUnit, () => fetchRevenueData());
</script>

<style scoped>
.main {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(225deg, hsla(198, 87%, 6%, 1) 0%, hsla(312, 92%, 5%, 1) 42%, hsla(57, 45%, 8%, 1) 100%);
}

.main-content {
  margin-top: 60px;
  margin-left: 250px;
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.main-content.open {
  margin-left: 0;
}

.container {
  max-width: 100vw;
  margin: 0;
  padding: 0;
}

.card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.card-header {
  background-color: #ca690e;
  border-bottom: 1px solid #dee2e6;
  color: white;
}

.card-header h5 {
  margin-bottom: 0;
}

.form-control {
  max-width: 100%;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.card-text {
  font-size: 0.9rem;
}

canvas {
  max-height: 200px;
  width: 100%;
}

.modal-content {
  border-radius: 8px;
  background-color: #1f1f1f !important;
  color: white;
  width: 100% !important;
}

.modal-content .btn-close{
  background-color: #C10C99;
}

.modal-title {
  font-weight: bold;
}

.d-flex.gap-3 {
  gap: 1rem;
}

/* Đảm bảo các phần tử có kích thước tối thiểu */
.min-w-150 {
  min-width: 150px;
}

.min-w-200 {
  min-width: 200px;
}

@media (max-width: 768px) {
  canvas {
    max-height: 150px;
  }
}

.customAddBtn {
  background-color: transparent;
  border: 2px solid #f67b09;
  color: #f67b09;
  padding: 6px;
  border-radius: 8px;
}

.customAddBtn:hover {
  box-shadow: 0 0 2px 1px #f67b09;
}

.customCloseBtn {
  padding: 8px;
  border-radius: 16px;
  background-color: transparent;
  border: 2px solid #C10C99;
  color: #C10C99;
}

.customCloseBtn:hover {
  box-shadow: 0 0 2px 1px #C10C99;
}
</style>
