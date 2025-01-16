<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="thong-ke-container">
      <!-- Tiêu đề trang -->
      <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Thống kê</h1>
  
      <!-- Row chứa các card -->
      <div class="card-row" style="margin-bottom: 20px;">
        <!-- Thẻ: Thống kê trạng thái đơn hàng -->
        <div class="card" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d);">
          <h3 class="card-title">Thống kê trạng thái đơn hàng</h3>
          <canvas id="invoiceChart" style="flex: 1;"></canvas>
          <div id="statusInvoice" class="error-message">{{ statusInvoice }}</div>
        </div>
  
        <!-- Thẻ: Thống kê sản phẩm bán chạy -->
        <div class="card" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d);">
          <h3 class="card-title">Thống kê sản phẩm bán chạy</h3>
          <div class="filter">
            <label for="startDate">Ngày bắt đầu:</label>
            <input type="date" id="startDate" @change="onDateChange" style="border-radius: 12px; padding: 0 12px; outline: none; border: none;" />
            <label for="endDate">Ngày kết thúc:</label>
            <input type="date" id="endDate" @change="onDateChange" style="border-radius: 12px; padding: 0 12px; outline: none; border: none;" />
          </div>
          <canvas id="productChart"></canvas>
          <div id="statusProduct" class="error-message">{{ statusProduct }}</div>
        </div>
      </div>
  
      <!-- Biểu đồ OLN và OFF -->
      <div class="card-row">
        <div class="card" style="background-image: linear-gradient(#c10c9a2d, #1f1f1f);">
          <h3 class="card-title">Thống kê OLN và OFF</h3>
          <canvas id="orderChart"></canvas>
          <div id="statusOrder" class="error-message">{{ statusOrder }}</div>
        </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';

const statusInvoice = ref('');
const statusProduct = ref('');
const statusOrder = ref('');
let productChart = null;
let orderChart = null;

const data = ref({
  weeks: [],
  olnOrders: [],
  offOrders: [],
  totalAmounts: [],
});

// Lấy ngày hôm nay
const today = new Date().toISOString().split('T')[0];

// Tạo biểu đồ trạng thái đơn hàng
const renderInvoiceChart = async () => {
  statusInvoice.value = 'Đang tải dữ liệu...';

  try {
    const response = await fetch('https://localhost:7297/api/Hoadon/all/Admin');
    if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

    const data = await response.json();
    const statuses = { success: 0, returned: 0, canceled: 0 };

    data.forEach(invoice => {
      if (invoice.trangthai === 3) statuses.success++;
      if (invoice.trangthai === 5) statuses.returned++;
      if (invoice.trangthai === 4) statuses.canceled++;
    });

    const total = statuses.success + statuses.returned + statuses.canceled;
    const percentages = Object.values(statuses).map(count =>
      total ? ((count / total) * 100).toFixed(2) : 0
    );

    const ctx = document.getElementById('invoiceChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Thành công', 'Trả hàng', 'Hủy'],
        datasets: [
          {
            data: percentages,
            backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'top' },
        },
      },
    });

    statusInvoice.value = '';
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    statusInvoice.value = 'Có lỗi xảy ra, vui lòng thử lại!';
  }
};

// Tạo biểu đồ sản phẩm bán chạy
const fetchTopSellingProducts = async (startDate, endDate) => {
  statusProduct.value = 'Đang tải dữ liệu...';

  try {
    const response = await fetch(
      `https://localhost:7297/api/Thongke/top-selling-products/Admin?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

    const data = await response.json();

    if (productChart) productChart.destroy();

    const productNames = data.map(product => product.tensp);
    const productSales = data.map(product => product.totalSales);

    const ctx = document.getElementById('productChart').getContext('2d');
    productChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: productNames,
        datasets: [
          {
            label: 'Doanh số',
            data: productSales,
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Tên sản phẩm' },
          },
          y: {
            title: { display: true, text: 'Số lượng bán' },
            beginAtZero: true,
          },
        },
      },
    });

    statusProduct.value = '';
  } catch (error) {
    console.error('Error fetching top-selling products:', error);
    statusProduct.value = 'Có lỗi xảy ra, vui lòng thử lại!';
  }
};

const renderOrderChart = async () => {
  statusOrder.value = 'Đang tải dữ liệu...';

  try {
    const olnResponse = await fetch('https://localhost:7297/api/Hoadon/oln-orders/Admin');
    const offResponse = await fetch('https://localhost:7297/api/Hoadon/off-orders/Admin');

    if (!olnResponse.ok || !offResponse.ok) throw new Error('Lỗi khi gọi API.');

    const olnData = await olnResponse.json();
    const offData = await offResponse.json();

    // Sắp xếp và lấy tối đa 10 tuần gần nhất
    const sortedOlnData = olnData.sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.week - a.week
    ).slice(0, 10);
    const sortedOffData = offData.sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.week - a.week
    ).slice(0, 10);

// Gộp dữ liệu
data.value.weeks = sortedOlnData.map(item => `Week ${item.week} - ${item.year}`);
data.value.olnOrders = sortedOlnData.map(item => item.totalOrders);
data.value.offOrders = sortedOffData.map(item => item.totalOrders || 0);

data.value.totalAmounts = sortedOlnData.map((item) => {
const offDataForWeek = sortedOffData.find(
(offItem) => offItem.week === item.week && offItem.year === item.year
);
console.log(item.totalAmount);
console.log(offDataForWeek?.totalAmount);
return (item.totalAmount || 0) + (offDataForWeek?.totalAmount || 0);
});


    // Vẽ biểu đồ
    const ctx = document.getElementById('orderChart').getContext('2d');
    if (orderChart) orderChart.destroy();

    orderChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.value.weeks,
        datasets: [
          {
            label: 'OLN Orders',
            data: data.value.olnOrders,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'OFF Orders',
            data: data.value.offOrders,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Total Amount (Line)',
            data: data.value.totalAmounts.map(amount => amount / 1000),
            type: 'line',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Số lượng đơn hàng' },
          },
          y2: {
            beginAtZero: true,
            position: 'right',
            title: { display: true, text: 'Tổng tiền (triệu đồng)' },
            grid: { drawOnChartArea: false },
          },
          x: { title: { display: true, text: 'Tuần' } },
        },
      },
    });

    statusOrder.value = '';
  } catch (error) {
    console.error('Error fetching OLN and OFF data:', error);
    statusOrder.value = 'Có lỗi xảy ra, vui lòng thử lại!';
  }
};

// Khi thay đổi ngày
const onDateChange = () => {
  const startDate = document.getElementById('startDate').value || today;
  const endDate = document.getElementById('endDate').value || today;

  if (new Date(startDate) > new Date(endDate)) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi ngày',
      text: 'Ngày bắt đầu không được lớn hơn ngày kết thúc!',
    });
    return;
  }

  fetchTopSellingProducts(startDate, endDate);
};

const isSidebarOpen = ref(true);


// Gọi hàm khi component được mount
onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  console.log("testing1");
  renderInvoiceChart();
  renderOrderChart();
  fetchTopSellingProducts(today, today);
  console.log("testing2");
});
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

.thong-ke-container {
  max-width: 100vw;
  margin: 0;
}

.card-row {
  display: flex;
  gap: 20px;
}

.card {
  flex: 1;
  padding: 20px;
  border: 1px solid #ddd;
  color: white;
  border-radius: 8px;
  background-color: transparent !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.filter {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.error-message {
  color: #C10C99;
  margin-top: 10px;
}

canvas {
  margin-top: 20px;
  max-width: 100%;
}
</style>
