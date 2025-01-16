<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container">
    <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Danh sách Voucher</h1>
    
    <!-- Card cho Tìm kiếm và Bộ lọc -->
    <div class="mb-4" style="background-image: linear-gradient(#1f1f1f, #078bff38); padding: 10px; border-radius: 12px;">
      <div class="card-body">
        <div class="d-flex gap-2 mt-2">
          <input
            type="text"
            v-model="currentFilters.search"
            class="form-control"
            placeholder="Tìm kiếm voucher..."
            @input="applyFilters"
            id="searchInput"
          >

          <select v-model="currentFilters.status" class="form-select" @change="applyFilters" style="width: 200px;">
            <option value="">Lọc theo Trạng Thái</option>
            <option value="0">Đang phát hành</option>
            <option value="1">Chuẩn bị phát hành</option>
            <option value="2">Dừng phát hành</option>
            <option value="3">Đã phát hành</option>
          </select>
          
          <select v-model="currentFilters.donvi" class="form-select" @change="applyFilters" style="width: 150px;">
            <option value="">Lọc theo Đơn vị</option>
            <option value="0">VND</option>
            <option value="1">%</option>
          </select>
          
          <select v-model="currentFilters.sort" class="form-select" @change="applyFilters" style="width: 200px;">
            <option value="">Sắp xếp</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
            <option value="percent-vnd">VND → %</option>
            <option value="vnd-percent">% → VND</option>
          </select>
          <button v-if="globalState.userRole == 'Admin'" class="btn btn-add-new col-3" @click="openVoucherForm">Thêm mới voucher</button>
        </div>
      </div>
    </div>

    <!-- Card cho Bảng Voucher -->
    <div style="background-image: linear-gradient(#1f1f1f, #078bff38); padding: 20px 10px; border-radius: 12px 12px 0 0 ;">
      <div class="card-body">
        <table class="table table-striped" id="voucherTable">
          <thead>
            <tr>
              <th>Mô tả</th>
              <th>Đơn vị</th>
              <th>Giá trị</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Số lượng</th>
              <th>Dừng phát hành</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(voucher, index) in paginatedVouchers" :key="voucher.id">
              <td>{{ voucher.mota }}</td>
              <td>{{ voucher.donvi === 0 ? 'VND' : '%' }}</td>
              <td>{{ voucher.giatri }}</td>
              <td>{{ formatDateTime(voucher.ngaybatdau) }}</td>
              <td>{{ formatDateTime(voucher.ngayketthuc) }}</td>
              <td>{{ interpretStatus(voucher.trangthai) }}</td>
              <td>{{ voucher.soluong || 0 }}</td>
              <td>
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="voucher.trangthai === 2"
                    @change="toggleStatus(index, $event.target.checked)"
                    :disabled="globalState.userRole != 'Admin'"
                  >
                  <span class="slider"></span>
                </label>
              </td>
              <td>
                <button class="btn btn-warning btn-sm" @click="editVoucher(index)" :disabled="globalState.userRole != 'Admin'">Sửa</button>
                <button class="btn btn-danger btn-sm" @click="deleteVoucher(index)" :disabled="globalState.userRole != 'Admin'">Xóa</button>
              </td>
            </tr>
            <!-- <tr>
              <td>ABC</td>
              <td>VND</td>
              <td>ABC</td>
              <td>ABC</td>
              <td>ABC</td>
              <td>ABC</td>
              <td>999</td>
              <td>
                <label class="switch">
                  <input
                    type="checkbox"
                    checked
                  >
                  <span class="slider"></span>
                </label>
              </td>
              <td>
                <button class="btn btn-warning btn-sm">Sửa</button>
                <button class="btn btn-danger btn-sm">Xóa</button>
              </td>
            </tr> -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Card cho Phân trang -->
    <div class="mb-4" style="background-image: linear-gradient(#078bff38, #1f1f1f); padding: 10px 10px 0 10px; border-radius: 0 0 12px 12px;">
      <div class="card-body d-flex justify-content-center">
        <nav aria-label="Page navigation">
          <ul class="pagination" id="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Trang trước</a>
            </li>
            <li
              class="page-item"
              v-for="page in totalPages"
              :key="page"
              :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Trang sau</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Modal Thêm/Sửa Voucher -->
    <div
      class="modal fade"
      tabindex="-1"
      aria-labelledby="voucherModalLabel"
      aria-hidden="true"
      ref="voucherModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content custom-modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="voucherModalLabel">
              {{ currentEditIndex === null ? 'Thêm Mới Voucher' : 'Sửa Voucher' }}
            </h5>
            <button type="button" class="btn-close" @click="cancelForm" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="mb-3 col">
                  <label for="mota" class="form-label">Mô tả</label>
                  <input
                    type="text"
                    id="mota"
                    v-model="form.mota"
                    class="form-control"
                    required
                  >
                  <div v-if="errors.mota" class="text-danger mt-1">
                    {{ errors.mota }}
                  </div>
                </div>

                <div class="mb-3 col">
                  <label for="donvi" class="form-label">Đơn vị</label>
                  <select v-model="form.donvi" id="donvi" class="form-select" required>
                    <option value="0">VND</option>
                    <option value="1">%</option>
                  </select>
                </div>

                <div class="mb-3 col">
                  <label for="giatri" class="form-label">Giá trị</label>
                  <input
                    type="number"
                    id="giatri"
                    v-model.number="form.giatri"
                    class="form-control"
                    :min="form.donvi === '0' ? 0 : 0"
                    :max="form.donvi === '0' ? 2000000 : 100"
                    required
                  >
                  <div v-if="errors.giatri" class="text-danger mt-1">
                    {{ errors.giatri }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="soluong" class="form-label">Số lượng</label>
                <input
                  type="number"
                  id="soluong"
                  v-model.number="form.soluong"
                  class="form-control"
                  min="0"
                  max="1000"
                  placeholder="Nhập số lượng"
                >
                <div v-if="errors.soluong" class="text-danger mt-1">
                  {{ errors.soluong }}
                </div>
              </div>

              <div class="row">
                <div class="mb-3 col">
                  <label for="ngaybatdau" class="form-label">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    id="ngaybatdau"
                    v-model="form.ngaybatdau"
                    class="form-control"
                    required
                  >
                  <div v-if="errors.ngaybatdau" class="text-danger mt-1">
                    {{ errors.ngaybatdau }}
                  </div>
                </div>

                <div class="mb-3 col">
                  <label for="ngayketthuc" class="form-label">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    id="ngayketthuc"
                    v-model="form.ngayketthuc"
                    class="form-control"
                    required
                  >
                  <div v-if="errors.ngayketthuc" class="text-danger mt-1">
                    {{ errors.ngayketthuc }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Chọn Rank</label>
                <div>
                  <input
                    type="checkbox"
                    id="selectAllRanks"
                    v-model="selectAllRanks"
                    @change="toggleSelectAllRanks"
                  >
                  <label for="selectAllRanks">Chọn tất cả</label>
                </div>
                <div
                  id="rankList"
                  class="rank-list"
                >
                  <div
                    class="form-check"
                    v-for="rank in allRanks"
                    :key="rank.id"
                  >
                    <input
                      class="form-check-input rank-checkbox"
                      type="checkbox"
                      :value="rank.tenrank"
                      :id="'rank_' + rank.id"
                      v-model="form.rankNames"
                    >
                    <label class="form-check-label" :for="'rank_' + rank.id">
                      {{ rank.tenrank }}
                    </label>
                  </div>
                </div>
                <div v-if="errors.rankNames" class="text-danger mt-2">
                  {{ errors.rankNames }}
                </div>
              </div>

              <button type="submit" class="btn btn-success w-100">
                {{ currentEditIndex === null ? 'Lưu' : 'Cập nhật' }}
              </button>
              <button type="button" class="btn btn-danger w-100 mt-2" @click="cancelForm">Hủy</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    
  </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { DateTime } from 'luxon'; // Import Luxon
import Swal from "sweetalert2";
import { globalState } from '../../store';

// State Variables
const vouchers = ref([]);
const allRanks = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const currentFilters = reactive({
  search: '',
  status: '',
  donvi: '',
  sort: ''
});
const showForm = ref(false);
const currentEditIndex = ref(null);
const form = reactive({
  mota: '',
  donvi: '0',
  giatri: 0,
  soluong: 0,
  ngaybatdau: '',
  ngayketthuc: '',
  rankNames: []
});
const errors = reactive({
  mota: '',
  giatri: '',
  soluong: '',
  ngaybatdau: '',
  ngayketthuc: '',
  rankNames: ''
});
const selectAllRanks = ref(false);

// Reference to the modal DOM element
const voucherModal = ref(null);
let voucherModalInstance = null;

// Computed Properties
const filteredVouchers = computed(() => {
  let result = [...vouchers.value];

  // Tìm kiếm
  if (currentFilters.search) {
    const query = currentFilters.search.toLowerCase();
    result = result.filter(voucher => voucher.mota.toLowerCase().includes(query));
  }

  // Lọc theo Trạng Thái
  if (currentFilters.status !== '') {
    result = result.filter(voucher => voucher.trangthai.toString() === currentFilters.status);
  }

  // Lọc theo Đơn vị
  if (currentFilters.donvi !== '') {
    result = result.filter(voucher => voucher.donvi.toString() === currentFilters.donvi);
  }

  // Sắp xếp
  if (currentFilters.sort) {
    switch (currentFilters.sort) {
      case 'a-z':
        result.sort((a, b) => a.mota.localeCompare(b.mota));
        break;
      case 'z-a':
        result.sort((a, b) => b.mota.localeCompare(a.mota));
        break;
      case 'percent-vnd':
        result.sort((a, b) => a.donvi - b.donvi);
        break;
      case 'vnd-percent':
        result.sort((a, b) => b.donvi - a.donvi);
        break;
      default:
        break;
    }
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredVouchers.value.length / itemsPerPage));

const paginatedVouchers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredVouchers.value.slice(start, start + itemsPerPage);
});

// Methods

// Fetch Vouchers
const fetchVouchers = async () => {
  try {
    const response = await fetch('https://localhost:7297/api/Giamgia/Admin');
    if (!response.ok) throw new Error('Không thể tải dữ liệu từ API');
    const data = await response.json();
    vouchers.value = data;
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error);
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Fetch Ranks
const fetchRanks = async () => {
  try {
    const response = await fetch('https://localhost:7297/api/Rank/Admin');
    if (!response.ok) throw new Error('Không thể tải danh sách Rank');
    const data = await response.json();
    allRanks.value = data.filter(rank => rank.trangthai === 0);
  } catch (error) {
    console.error('Lỗi khi tải Rank:', error);
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Không thể tải danh sách Rank.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Format Date Time với Luxon
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  
  // Phân tích cú pháp ngày giờ theo múi giờ Asia/Ho_Chi_Minh mà không chuyển đổi sang múi giờ khác
  return DateTime.fromISO(dateTimeStr, { zone: 'Asia/Ho_Chi_Minh' })
    .toLocaleString(DateTime.DATETIME_SHORT);
};

// Interpret Status
const interpretStatus = (status) => {
  switch(status) {
    case 0:
      return 'Đang phát hành';
    case 1:
      return 'Chuẩn bị phát hành';
    case 2:
      return 'Dừng phát hành';
    case 3:
      return 'Đã phát hành';
    default:
      return 'Không xác định';
  }
};

// Apply Filters
const applyFilters = () => {
  currentPage.value = 1;
};

// Go to Page
const goToPage = (pageNumber) => {
  if (pageNumber < 1 || pageNumber > totalPages.value) return;
  currentPage.value = pageNumber;
};

// Validate Form
const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '');

  // Validate Mô tả
  if (!form.mota.trim()) {
    errors.mota = 'Mô tả không được để trống.';
    isValid = false;
  } else if (form.mota.length > 200) {
    errors.mota = 'Mô tả không được vượt quá 200 ký tự.';
    isValid = false;
  }

  // Validate Giá trị
  if (form.donvi === '0') { // VND
    if (isNaN(form.giatri) || form.giatri < 0 || form.giatri > 2000000) {
      errors.giatri = 'Giá trị VND phải nằm trong khoảng 0 ≤ Giá trị ≤ 2,000,000.';
      isValid = false;
    }
  } else if (form.donvi === '1') { // %
    if (isNaN(form.giatri) || form.giatri < 0 || form.giatri > 100) {
      errors.giatri = 'Giá trị % phải nằm trong khoảng 0 ≤ Giá trị ≤ 100.';
      isValid = false;
    }
  } else {
    errors.giatri = 'Đơn vị không hợp lệ.';
    isValid = false;
  }

  // Validate Số lượng
  if (isNaN(form.soluong) || form.soluong < 0 || form.soluong > 1000) {
    errors.soluong = 'Số lượng phải nằm trong khoảng 0 ≤ Số lượng ≤ 1000.';
    isValid = false;
  }

  // Validate Ngày
  const ngaybatdau = DateTime.fromISO(form.ngaybatdau, { zone: 'Asia/Ho_Chi_Minh' });
  const ngayketthuc = DateTime.fromISO(form.ngayketthuc, { zone: 'Asia/Ho_Chi_Minh' });
  
  if (!ngaybatdau.isValid) {
    errors.ngaybatdau = 'Ngày bắt đầu không hợp lệ.';
    isValid = false;
  }
  if (!ngayketthuc.isValid || ngayketthuc <= ngaybatdau) {
    errors.ngayketthuc = 'Ngày kết thúc phải lớn hơn ngày bắt đầu.';
    isValid = false;
  }

  // Validate Rank
  if (form.rankNames.length === 0) {
    errors.rankNames = 'Vui lòng chọn ít nhất một Rank.';
    isValid = false;
  }

  return isValid;
};

// Handle Submit Form (Create or Update)
const handleSubmit = async () => {
  if (!validateForm()) return;

  if (currentEditIndex.value === null) {
    await createVoucher();
  } else {
    await updateVoucher();
  }
};

// Open Form
const openVoucherForm = () => {
  currentEditIndex.value = null;
  resetForm();
  showForm.value = true;
  voucherModalInstance.show();
};

// Reset Form
const resetForm = () => {
  form.mota = '';
  form.donvi = '0';
  form.giatri = 0;
  form.soluong = 0;
  form.ngaybatdau = '';
  form.ngayketthuc = '';
  form.rankNames = [];
  selectAllRanks.value = false;
  Object.keys(errors).forEach(key => errors[key] = '');
};

// Cancel Form
const cancelForm = () => {
  showForm.value = false;
  resetForm();
  if (voucherModalInstance) {
    voucherModalInstance.hide();
  }
};

// Toggle Select All Ranks
const toggleSelectAllRanks = () => {
  if (selectAllRanks.value) {
    form.rankNames = allRanks.value.map(rank => rank.tenrank);
  } else {
    form.rankNames = [];
  }
};

// Create Voucher
const createVoucher = async () => {
  const ngaybatdau = DateTime.fromISO(form.ngaybatdau, { zone: 'Asia/Ho_Chi_Minh' });
  const ngayketthuc = DateTime.fromISO(form.ngayketthuc, { zone: 'Asia/Ho_Chi_Minh' });

  const newVoucher = {
    mota: form.mota,
    donvi: parseInt(form.donvi),
    giatri: parseInt(form.giatri),
    soluong: parseInt(form.soluong) || 0,
    ngaybatdau: ngaybatdau.toISO(), // Không chuyển sang UTC
    ngayketthuc: ngayketthuc.toISO(),
    trangthai: 0,
    rankNames: form.rankNames
  };

  try {
    const response = await fetch('https://localhost:7297/api/Giamgia/AddRankToGiamgia/Admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVoucher),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi khi gửi yêu cầu: ${errorText}`);
    }

    const responseData = await response.json();

    if (responseData.message && responseData.message.includes("Rank added to Giảm Giá thành công.")) {
      Swal.fire({
        icon: "warning",
        title: responseData.message,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Voucher được tạo thành công!",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
    }

    await fetchVouchers();
    cancelForm();
  } catch (error) {
    console.error('Lỗi khi tạo voucher mới:', error);
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Không thể tạo voucher mới. Vui lòng thử lại sau.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Edit Voucher
const editVoucher = async (index) => {
  const voucher = paginatedVouchers.value[index];
  currentEditIndex.value = index;

  // Load voucher data vào form
  form.mota = voucher.mota;
  form.donvi = voucher.donvi.toString();
  form.giatri = voucher.giatri;
  form.soluong = voucher.soluong || 0;
  
  // Phân tích cú pháp ngày giờ theo múi giờ địa phương mà không chuyển đổi sang UTC
  form.ngaybatdau = DateTime.fromISO(voucher.ngaybatdau, { zone: 'Asia/Ho_Chi_Minh' })
    .toFormat("yyyy-MM-dd'T'HH:mm");
  form.ngayketthuc = DateTime.fromISO(voucher.ngayketthuc, { zone: 'Asia/Ho_Chi_Minh' })
    .toFormat("yyyy-MM-dd'T'HH:mm");
  
  form.rankNames = [];

  try {
    const response = await fetch(`https://localhost:7297/api/Giamgia/${voucher.id}/Ranks/Admin`);
    if (response.ok) {
      const selectedRanks = await response.json();
      form.rankNames = selectedRanks;
      selectAllRanks.value = selectedRanks.length === allRanks.value.length;
    }
  } catch (error) {
    console.warn('Không có Rank nào được chọn hoặc API lỗi, tiếp tục với danh sách rỗng.');
  }

  showForm.value = true;
  voucherModalInstance.show();
};

// Update Voucher
const updateVoucher = async () => {
  const voucher = paginatedVouchers.value[currentEditIndex.value];

  // Phân tích cú pháp ngày giờ theo múi giờ địa phương
  const ngaybatdau1 = DateTime.fromFormat(form.ngaybatdau, "yyyy-MM-dd'T'HH:mm", { zone: 'Asia/Ho_Chi_Minh' });
  const ngayketthuc2 = DateTime.fromFormat(form.ngayketthuc, "yyyy-MM-dd'T'HH:mm", { zone: 'Asia/Ho_Chi_Minh' });

  const updatedVoucher = {
    mota: form.mota,
    donvi: parseInt(form.donvi),
    giatri: parseInt(form.giatri),
    soluong: parseInt(form.soluong) || 0,
    ngaybatdau: ngaybatdau1.toISO(), // Không chuyển sang UTC
    ngayketthuc: ngayketthuc2.toISO(),
    trangthai: 0, 
    rankNames: form.rankNames
  };

  try {
    const response = await fetch(`https://localhost:7297/api/Giamgia/${voucher.id}/Admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedVoucher),
    });

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật voucher thành công.",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      await fetchVouchers();
      cancelForm();
    } else {
      const errorText = await response.text();
      throw new Error(`Lỗi khi gửi yêu cầu: ${errorText}`);
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật voucher:', error);
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: `Không thể cập nhật voucher. Lỗi: ${error.message}`,
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Delete Voucher
const deleteVoucher = async (index) => {
  if (!confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;

  const voucher = paginatedVouchers.value[index];

  try {
    const response = await fetch(`https://localhost:7297/api/Giamgia/${voucher.id}/Admin`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const contentType = response.headers.get('Content-Type');
      let errorMessage = 'Không thể xóa voucher';

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: 'Xóa voucher thành công.',
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    await fetchVouchers();
  } catch (error) {
    console.error('Lỗi khi xóa voucher:', error);
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: `Không thể xóa voucher. Lỗi: ${error.message}`,
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Toggle Status
const toggleStatus = async (index, isChecked) => {
  const voucher = paginatedVouchers.value[index];
  try {
    const response = await fetch(`https://localhost:7297/api/Giamgia/change-status/${voucher.id}/Admin`, {
      method: 'PUT',
    });

    const responseText = await response.text();

    try {
      const responseJson = JSON.parse(responseText);
      if (responseJson.message && responseJson.message === "Trạng thái giảm giá đã được cập nhật") {
        voucher.trangthai = responseJson.voucher.trangthai;
        await fetchVouchers();
      } else {
        throw new Error(`Không thể thay đổi trạng thái. Lỗi: ${responseJson.message || responseText}`);
      }
    } catch (jsonError) {
      if (responseText.trim() !== "Trạng thái giảm giá đã được cập nhật") {
        throw new Error(`Không thể thay đổi trạng thái. Lỗi: ${responseText}`);
      }
      await fetchVouchers();
    }
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái:', error);
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: 'Không thể thay đổi trạng thái. Vui lòng thử lại sau.',
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    // Revert checkbox state
    paginatedVouchers.value[index].trangthai = isChecked ? 2 : 0;
  }
};

// Update Voucher Status Periodically
const updateVoucherStatus = async () => {
  try {
    const response = await fetch('https://localhost:7297/api/Giamgia/update-trangthai/Admin', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'newStatus', // Cần điều chỉnh nếu cần
      })
    });

    if (!response.ok) {
      throw new Error('Cập nhật trạng thái không thành công');
    }

    console.log('Cập nhật trạng thái thành công');
    await fetchVouchers();
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
  }
};

const isSidebarOpen = ref(true);

// Lifecycle Hooks
onMounted(async () => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  await fetchVouchers();
  await fetchRanks();
  // Initialize Bootstrap Modal
  voucherModalInstance = new bootstrap.Modal(voucherModal.value);
  // Set interval to update voucher status every 6 seconds
  setInterval(updateVoucherStatus, 6000);
});

// Watchers
watch(currentFilters, applyFilters, { deep: true });
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

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #007bff;
  color: white;
  border-bottom: none;
}

button {
  margin-right: 5px;
}

button:hover {
  opacity: 0.8;
}

/* Chỉnh lại chiều rộng các form input */
input[type="text"], input[type="number"], input[type="datetime-local"], select {
  width: 100%;
}

/* Điều chỉnh khoảng cách các input form */
.form-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.mb-3 {
  margin-bottom: 15px;
}

/* Cải thiện độ hiển thị của form tìm kiếm */
#searchInput {
  font-size: 1rem;
}

#searchInput::placeholder {
  color: #888;
}

.btn-primary:hover, .btn-danger:hover, .btn-warning:hover, .btn-success:hover {
  opacity: 0.8;
}

.toast {
  position: fixed;
  top: 10%;
  right: 10px;
  z-index: 999;
  display: none;
}

.toast.show {
  display: block;
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}

/* Custom Styles for Rank List */
.rank-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ced4da;
  padding: 10px;
}

/* Toggle Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px; width: 16px;
  left: 2px; bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #0c79c1;
}

input:checked + .slider:before {
  transform: translateX(20px);
}
.custom-modal-content {
  background-color: #ffffff !important;
}

.container {
  margin: 0;
  padding: 0;
  max-width: 100vw;
}

.btn-add-new {
  background-color: transparent;
  color: #0c79c1;
  border: 2px solid #0c79c1;
}

.btn-add-new:hover {
  box-shadow: 0px 0px 1px 1px #0c79c1;
}

th {
  background-color: #042a43;
  color: white;
  font-weight: 600;
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
</style>
