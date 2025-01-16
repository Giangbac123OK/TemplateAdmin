<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container my-4" style="margin: 0 !important; padding: 0 !important;">
        <div> <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Danh sách khách hàng</h1> <div class="text-end mb-4">
          <button
            class="btn btn-info"
            @click="goToRankPage"
            title="Quản lý Rank"
            style="background-color: #C10C99; color: white; border: none"
          >
            <i class="bi bi-bar-chart-line"></i> Quản lý Rank
          </button>
        </div></div>
      
        <div class="mb-4">
          <div class="card-header text-white" style="background-color: #C10C99; padding: 10px; border-radius: 12px 12px 0 0;">
      <h3 class="mb-0">Thống Kê Khách Hàng Mới</h3>
    </div>

          <div class="card-body">
            <div class="chart-container" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d); padding: 10px; color: #C10C99; padding-top: 20px;">
              <canvas ref="customerChart" :class="{customChartOpenWidth: !isSidebarOpen }" style="transition: .3s ease; max-width: 54%; min-width: 54%; margin-left: 23%;"></canvas>
            </div>
          </div>
        </div>
        <div class="mb-4" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d); padding: 10px; color: #C10C99;">
          <div class="card-body">
            <div class="row filter-box align-items-end g-3">
              <div class="col-md-2">
                <label for="searchCriteria" class="form-label fw-bold">Tìm theo</label>
                <select v-model="searchCriteria" class="form-select" id="searchCriteria">
                  <option value="ten">Họ tên</option>
                  <option value="sdt">Số điện thoại</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div class="col-md-3">
                <label for="searchInput" class="form-label fw-bold">Tìm kiếm</label>
                <div class="input-group">
                  <input
                    type="text"
                    v-model="searchInput"
                    class="form-control"
                    id="searchInput"
                    placeholder="Tìm kiếm..."
                  />
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                </div>
              </div>
              <div class="col-md-3">
                <label for="sortBy" class="form-label fw-bold">Sắp xếp</label>
                <select v-model="sortBy" class="form-select" id="sortBy">
                  <option value="all">Tất cả</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                  <option value="points_asc">Tích điểm (Tăng dần)</option>
                  <option value="points_desc">Tích điểm (Giảm dần)</option>
                </select>
              </div>
              <div class="col-md-3">
                <label for="status" class="form-label fw-bold">Trạng thái</label>
                <select v-model="statusFilter" class="form-select" id="status">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Dừng hoạt động</option>
                </select>
              </div>
              <div class="col-md-1 text-end">
                <button
                  class="btn btn-add-new mt-4"
                  @click="openAddModal"
                  title="Thêm Khách Hàng"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <div class="card-body p-0">
            <div class="table-responsive" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d); padding: 10px; color: #C10C99;">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="text-center">Stt</th>
                    <th>Tên</th>
                    <th>SĐT</th>
                    <th>Ngày sinh</th>
                    <th>Email</th>
                    <th>Địa chỉ</th>
                    <th>Ngày tạo</th>
                    <th>Tích điểm</th>
                    <th>Điểm sử dụng</th>
                    <th>Trạng thái</th>
                    <th>Rank</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(customer, index) in filteredCustomers" :key="customer.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>{{ customer.ten }}</td>
                    <td>{{ customer.sdt }}</td>
                    <td>{{ formatDate(customer.ngaysinh) }}</td>
                    <td>{{ customer.email }}</td>
                    <td>{{ customer.diachi }}</td>
                    <td>{{ formatDate(customer.ngaytaotaikhoan) }}</td>
                    <td>{{ customer.tichdiem }}</td>
                    <td>{{ customer.diemsudung }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="customer.trangthai === 0 ? 'bg-success' : 'bg-secondary'"
                      >
                        {{ customer.trangthai === 0 ? 'Hoạt động' : 'Dừng hoạt động' }}
                      </span>
                    </td>
                    <td>{{ getRankName(customer.idrank) }}</td>
                    <td>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :id="'statusSwitch' + customer.id"
                          v-model="customer.trangthai"
                          @change="toggleStatus(customer)"
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        class="btn btn-primary btn-sm me-2"
                        @click="openEditModal(customer)"
                        title="Sửa Khách Hàng"
                      >
                        <i class="bi bi-pencil-square"></i> Sửa
                      </button>
                      <button
                        class="btn btn-danger btn-sm"
                        @click="deleteCustomer(customer.id)"
                        title="Xóa Khách Hàng"
                      >
                        <i class="bi bi-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                  <!-- <tr>
                    <td class="text-center">1</td>
                    <td>ABC</td>
                    <td>ABC</td>
                    <td>ABC</td>
                    <td>ABC</td>
                    <td>ABC</td>
                    <td>ABC</td>
                    <td>ABC</td>
                    <td>ABC</td>
                    <td>
                      <span
                        class="badge bg-success"
                      >
                        Hoạt động
                      </span>
                    </td>
                    <td>ABC</td>
                    <td>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          @change="toggleStatus(customer)"
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        class="btn btn-primary btn-sm me-2"
                        @click="openEditModal(customer)"
                        title="Sửa Khách Hàng"
                      >
                        <i class="bi bi-pencil-square"></i> Sửa
                      </button>
                      <button
                        class="btn btn-danger btn-sm"
                        @click="deleteCustomer(customer.id)"
                        title="Xóa Khách Hàng"
                      >
                        <i class="bi bi-trash"></i> Xóa
                      </button>
                    </td>
                  </tr> -->
                  <tr v-if="filteredCustomers.length === 0">
                    <td colspan="13" class="text-center">Không tìm thấy khách hàng nào.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
          <div v-for="toast in toasts" :key="toast.id" class="toast align-items-center text-white" :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000" @hidden="removeToast(toast.id)">
            <div class="d-flex">
              <div class="toast-body">
                {{ toast.message }}
              </div>
              <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>

        <!-- Modal Thêm Khách Hàng -->
        <div class="modal fade" id="addCustomerModal" tabindex="-1" aria-labelledby="addCustomerModalLabel" aria-hidden="true" ref="addModal">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
              <form @submit.prevent="addCustomer">
                <div class="modal-header bg-success text-white">
                  <h5 class="modal-title" id="addCustomerModalLabel">
                    <i class="bi bi-person-plus-fill"></i> Thêm Khách Hàng Mới
                  </h5>
                  <button type="button" class="btn-close" @click="closeAddModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
      <!-- Hiển thị lỗi từ API (nếu có) -->
      <div v-if="apiError" class="alert alert-danger">
        {{ apiError }}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <label for="addCustomerName" class="form-label">Tên <span class="text-danger">*</span></label>
          <input
            type="text"
            v-model="newCustomer.ten"
            class="form-control"
            id="addCustomerName"
            pattern="^(?!\s*$)[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỳỵỷỹý\s]{1,50}$"
            required
            placeholder="Nhập tên khách hàng"
              data-bs-toggle="tooltip"
          title="Tên không được chứa số hoặc ký tự đặc biệt.Tên không được để trống và không được chứa toàn khoảng trắng."
          />

        </div>
        <div class="col-md-6">
          <label for="addCustomerPhone" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
          <input
            type="tel"
            v-model="newCustomer.sdt"
            class="form-control"
            id="addCustomerPhone"
            required
            pattern="^\d{10}$"
            title="Vui lòng nhập đúng định dạng số điện thoại (10 số)"
            placeholder="0123456789"
          />
          

        </div>
        <div class="col-md-6">
          <label for="addCustomerDob" class="form-label">Ngày sinh <span class="text-danger">*</span></label>
          <input
            type="date"
            v-model="newCustomer.ngaysinh"
            class="form-control"
            id="addCustomerDob"
            required
          
          />
        </div>
        <div class="col-md-6">
          <label for="addCustomerEmail" class="form-label">Email <span class="text-danger">*</span></label>
          <input
            type="email"
            v-model="newCustomer.email"
            class="form-control"
            id="addCustomerEmail"
            required
            placeholder="example@domain.com"
          />
        </div>
        <div class="col-12">
          <label for="addCustomerAddress" class="form-label">Địa chỉ <span class="text-danger">*</span></label>
          <input
            type="text"
            v-model="newCustomer.diachi"
            class="form-control"
            id="addCustomerAddress"
            required
            placeholder="Nhập địa chỉ khách hàng"
          />
        </div>
      </div>
    </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeAddModal">
                    <i class="bi bi-x-circle"></i> Đóng
                  </button>
                  <button type="submit" class="btn btn-success">
                    <i class="bi bi-save"></i> Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="modal fade" id="editCustomerModal" tabindex="-1" aria-labelledby="editCustomerModalLabel" aria-hidden="true" ref="editModal" >
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
              <form @submit.prevent="updateCustomer">
                <div class="modal-header bg-primary text-white">
                  <h5 class="modal-title" id="editCustomerModalLabel">
                    <i class="bi bi-pencil-square"></i> Sửa Thông Tin Khách Hàng
                  </h5>
                  <button type="button" class="btn-close" @click="closeEditModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="editCustomerName" class="form-label">Tên <span class="text-danger">*</span></label>
                      <input type="text" v-model="editCustomerData.ten" class="form-control" id="editCustomerName"pattern="^(?!\s*$)[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỳỵỷỹý\s]{1,50}$" required placeholder="Nhập tên khách hàng"  data-bs-toggle="tooltip" title="Tên không được chứa số hoặc ký tự đặc biệt.Tên không được để trống và không được chứa toàn khoảng trắng."/>
                    
                    </div>
                    <div class="col-md-6">
                      <label for="editCustomerPhone" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                      <input type="tel" v-model="editCustomerData.sdt" class="form-control" id="editCustomerPhone" required pattern="^\d{10}$" title="Vui lòng nhập đúng định dạng số điện thoại (10 số)" placeholder="0123456789"/>
                    
                    </div>
                    <div class="col-md-6">
                      <label for="editCustomerDob" class="form-label">Ngày sinh <span class="text-danger">*</span></label>
                      <input type="date"  v-model="editCustomerData.ngaysinh"  class="form-control"  id="editCustomerDob"  required/>
                    

                    </div>
                    <div class="col-md-6">
                      <label for="editCustomerEmail" class="form-label">Email <span class="text-danger">*</span></label>
                      <input type="email" v-model="editCustomerData.email" class="form-control" id="editCustomerEmail" required placeholder="example@domain.com" />
                    </div>
                    <div class="col-12">
                      <label for="editCustomerAddress" class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                      <input type="text"  v-model="editCustomerData.diachi"  class="form-control"  id="editCustomerAddress"  required  placeholder="Nhập địa chỉ khách hàng"
    />
                    </div>
                    <div class="col-md-6">
                      <label for="editCustomerStatus" class="form-label">Trạng thái</label>
                      <select v-model="editCustomerData.trangthai" class="form-select" id="editCustomerStatus" required>
                        <option value="0">Hoạt động</option>
                        <option value="1">Dừng hoạt động</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label for="editCustomerRank" class="form-label">Rank</label>
                      <select v-model="editCustomerData.idrank" class="form-select" id="editCustomerRank" disabled>
                        <option v-for="rank in ranks" :key="rank.id" :value="rank.id">
                          {{ rank.tenrank }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeEditModal">
                    <i class="bi bi-x-circle"></i> Đóng
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="bi bi-save"></i> Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Modal, Toast } from 'bootstrap';
import Chart from 'chart.js/auto';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useRouter } from "vue-router";
const router = useRouter();
const addModal = ref(null);
const editModal = ref(null);
const apiError = ref('');
const allCustomers = ref([]);
const ranks = ref([]);
const searchCriteria = ref('ten');
const searchInput = ref('');
const sortBy = ref('all');
const statusFilter = ref('all');
const newCustomer = reactive({
  ten: '',
  sdt: '',
  ngaysinh: '',
  email: '',
  diachi: '',
});

const editCustomerData = reactive({
  id: null,
  ten: '',
  sdt: '',
  ngaysinh: '',
  email: '',
  diachi: '',
  trangthai: 0,
  idrank: null,
});
let customerChartInstance = null;
const toasts = ref([]);
const initializeChart = () => {
  const ctx = customerChart.value.getContext('2d');
  customerChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ],
      datasets: [],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Số lượng khách hàng',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Tháng',
          },
        },
      },
    },
  });
};
const goToRankPage = () => {
  router.push({ path: "/ranks" });
};
const customerChart = ref(null);
const loadCustomerData = async () => {
  try {
    const [customerData, rankData] = await Promise.all([
      fetch('https://localhost:7297/api/Khachhang/Admin').then((res) => res.json()),
      fetch('https://localhost:7297/api/Rank/Admin').then((res) => res.json()),
    ]);
    allCustomers.value = customerData;
    ranks.value = rankData;
    updateChart();
  } catch (error) {
    showToast('error', 'Lỗi khi lấy dữ liệu.');
    console.error('Lỗi khi lấy dữ liệu:', error);
  }
};


const getRankName = (rankId) => {
  const rank = ranks.value.find((r) => r.id === rankId);
  return rank ? rank.tenrank : 'Chưa xác định';
};
const filteredCustomers = computed(() => {
  let filtered = allCustomers.value.filter((customer) => {
    const searchValue = customer[searchCriteria.value]?.toLowerCase() || '';
    const matchesSearch = searchValue.includes(searchInput.value.toLowerCase());

    let matchesStatus = true;
    if (statusFilter.value === 'active') {
      matchesStatus = customer.trangthai === 0;
    } else if (statusFilter.value === 'inactive') {
      matchesStatus = customer.trangthai === 1;
    }

    return matchesSearch && matchesStatus;
  });

  if (sortBy.value === 'name_asc') {
    filtered.sort((a, b) => a.ten.localeCompare(b.ten));
  } else if (sortBy.value === 'name_desc') {
    filtered.sort((a, b) => b.ten.localeCompare(a.ten));
  } else if (sortBy.value === 'points_asc') {
    filtered.sort((a, b) => a.tichdiem - b.tichdiem);
  } else if (sortBy.value === 'points_desc') {
    filtered.sort((a, b) => b.tichdiem - a.tichdiem);
  }

  return filtered;
});
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) {
    console.error(`Ngày không hợp lệ: ${dateStr}`);
    return 'Không hợp lệ';
  }
  return date.toLocaleDateString('vi-VN');
};

const updateChart = () => {
  if (!customerChartInstance) {
    initializeChart();
  }

  if (allCustomers.value.length === 0) {
    customerChartInstance.data.datasets = [];
    customerChartInstance.update();
    return;
  }

  const customerData = {};
  allCustomers.value.forEach((customer) => {
    const ngaytaotaikhoan = new Date(customer.ngaytaotaikhoan);
    const year = ngaytaotaikhoan.getFullYear();
    const month = ngaytaotaikhoan.getMonth(); // 0-11

    if (!customerData[year]) {
      customerData[year] = Array(12).fill(0);
    }
    customerData[year][month]++;
  });

  customerChartInstance.data.datasets = [];
  Object.keys(customerData).forEach((year) => {
    customerChartInstance.data.datasets.push({
      label: `Khách hàng mới ${year}`,
      data: customerData[year],
      borderColor: getRandomColor(),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
    });
  });

  customerChartInstance.update();
};
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
const openAddModal = () => {
  apiError.value = '';
  const modal = new Modal(addModal.value);
  modal.show();
};
const closeAddModal = () => {
  const modalInstance = Modal.getInstance(addModal.value);
  if (modalInstance) {
    modalInstance.hide();
  }
  resetNewCustomer();
};
const addCustomer = async () => {

 

  try {
    const response = await fetch('https://localhost:7297/api/Khachhang/Admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCustomer),
    });
    if (!response.ok) {
      const errorMessage = await response.text(); // Lấy thông báo lỗi từ API
      apiError.value = errorMessage;
      throw new Error(errorMessage); 
    }
    const addedCustomer = await response.json();
    showToast('success', 'Thêm khách hàng mới thành công!');
    closeAddModal(); // Đóng modal thêm khách hàng
    loadCustomerData(); 
  } catch (error) {
    console.error('Lỗi khi thêm khách hàng:', error);
  }
};

const openEditModal = (customer) => {
  Object.assign(editCustomerData, { 
    ...customer,
    ngaysinh: customer.ngaysinh ? customer.ngaysinh.split('T')[0] : '', // Lấy phần ngày và bỏ thời gian
  });
  const modal = new Modal(editModal.value);
  modal.show();
};

const closeEditModal = () => {
  const modalInstance = Modal.getInstance(editModal.value);
  if (modalInstance) {
    modalInstance.hide();
  }
  resetEditCustomerData();
};
const updateCustomer = async () => {
 
  
  try {
    const { id, ...updatedFields } = editCustomerData;
    const response = await fetch(`https://localhost:7297/api/Khachhang/${id}/Admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFields),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi cập nhật khách hàng.');
    }
    showToast('success', 'Cập nhật thành công!');
    closeEditModal();
    loadCustomerData();
  } catch (error) {
    showToast('error', `Lỗi khi cập nhật khách hàng: ${error.message || 'Vui lòng thử lại sau.'}`);
    console.error('Lỗi khi cập nhật khách hàng:', error);
  }
};

const deleteCustomer = async (customerId) => {
  if (!confirm('Bạn có muốn xóa khách hàng này không?')) return;

  try {
    const response = await fetch(`https://localhost:7297/api/Khachhang/${customerId}/Admin`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Lỗi khi xóa khách hàng.');
    }
    showToast('success', 'Khách hàng đã được xóa thành công!');
    loadCustomerData();
  } catch (error) {
    showToast('error', `Lỗi khi xóa khách hàng: ${error.message || 'Vui lòng thử lại sau.'}`);
    console.error('Lỗi khi xóa khách hàng:', error);
  }
};

const toggleStatus = async (customer) => {
  try {
    const newStatus = customer.trangthai === 0 ? 1 : 0;
    const response = await fetch(`https://localhost:7297/api/Khachhang/Toggle/Admin?id=${customer.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi cập nhật trạng thái.');
    }
    const data = await response.json();
    showToast('success', data.message || 'Cập nhật trạng thái thành công!');
    loadCustomerData();
  } catch (error) {
    showToast('error', `Lỗi khi cập nhật trạng thái: ${error.message || 'Vui lòng thử lại sau.'}`);
    console.error('Lỗi khi cập nhật trạng thái:', error);
    customer.trangthai = customer.trangthai === 0 ? 1 : 0;
  }
};

const resetNewCustomer = () => {
  Object.assign(newCustomer, {
    ten: '',
    sdt: '',
    ngaysinh: '',
    email: '',
    diachi: '',
  });
};

const resetEditCustomerData = () => {
  Object.assign(editCustomerData, {
    id: null,
    ten: '',
    sdt: '',
    ngaysinh: '',
    email: '',
    diachi: '',
    trangthai: 0,
    idrank: null,
  });
};
const showToast = (type, message) => {
  const id = Date.now();
  toasts.value.push({ id, type, message });
  setTimeout(() => {
    removeToast(id);
  }, 3000);
};
const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

const isSidebarOpen = ref(true);

onMounted(async () => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  await loadCustomerData();
  initializeChart();
});
</script>

<style scoped>
.main {
  display: flex;
  background: linear-gradient(225deg, hsla(198, 87%, 6%, 1) 0%, hsla(312, 92%, 5%, 1) 42%, hsla(57, 45%, 8%, 1) 100%);
  min-height: 100vh;
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
}

.modal-content {
     background-color: white !important; 
    margin: 10% auto;
    padding: 20px;
    width: 70% !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.status-btn {
  width: 120px;
}

.table-responsive {
  overflow-x: auto;
}

.badge {
  font-size: 0.9em;
}

.toast {
  min-width: 250px;
}

.btn-info {
  font-weight: 600;
  border: 2px solid #C10C99 !important;
}

th {
  background-color: #c10c9a77;
  color: white;
  font-weight: 600;
}

.btn-info:hover {
  color: #C10C99 !important;
  background-color: transparent !important;
}

::v-deep .form-check-input:checked {
  background-color: #C10C99;
  border: 2px solid transparent;
}

::v-deep .form-check-input:not(:checked) {
  border-color: #c10c9a80;
}

.btn-add-new {
  background-color: transparent;
  color: #C10C99;
  border: 2px solid #C10C99;
}

.btn-add-new:hover {
  box-shadow: 0px 0px 1px 1px #C10C99;
}

.modal .modal-content {
  background-color: #1f1f1f !important;
}

.modal .btn-close {
  background-color: white;
}

.modal h5 {
  color: #C10C99 !important;
}

.modal .modal-header {
  background-color: transparent !important;
}

.modal button {
  background-color: #C10C99 !important;
  border: none;
}

.modal label {
  color: white;
}

.customChartOpenWidth {
  max-width: 44% !important;
  min-width: 44% !important;
  margin-left: 28% !important;
}
</style>
