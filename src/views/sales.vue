<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Danh sách chương trình sale</h1>
      <button v-if="globalState.userRole == 'Admin'" @click="showAddSaleForm" class="customBtn">
        <i class="fas fa-plus"></i> Thêm chương trình Sale
      </button>
    </div>
    
    <!-- Alert Messages -->
    <div class="alert-position">
      <div v-for="alert in alerts" :key="alert.id" :class="`alert alert-${alert.type} alert-dismissible fade show customAlert`" role="alert">
        {{ alert.message }}
        <button type="button" class="close customCloseBtn" @click="removeAlert(alert.id)">
          <i class="pi pi-times" style="font-size: 16px;"></i>
        </button>
      </div>
    </div>

    <!-- Sales Cards -->
    <div class="row">
      <div class="col-md-4 mb-4" v-for="(sale, index) in sales" :key="sale.id">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">{{ sale.ten }}</h5>
            <span v-html="sale.trangthai"></span>
          </div>
          <div class="card-body">
            <p class="card-text"><strong>Mô tả:</strong> {{ sale.mota || 'Không có' }}</p>
            <p class="card-text"><strong>Ngày bắt đầu:</strong> {{ formatDate(sale.ngaybatdau) }}</p>
            <p class="card-text"><strong>Ngày kết thúc:</strong> {{ formatDate(sale.ngayketthuc) }}</p>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="action-icons">
              <i class="fas fa-eye text-primary mr-2" title="Xem" @click="viewSale(sale.id)"></i>
              <i class="fas fa-edit text-warning mr-2" title="Sửa" @click="editSale(sale.id)"></i>
              <i class="fas fa-trash-alt text-danger" title="Xóa" @click="deleteSale(sale.id)"></i>
            </div>
            <label class="toggle-switch mb-0">
              <input :disabled="globalState.userRole != 'Admin'" type="checkbox" :checked="sale.trangthai === 3" @change="stopSale(sale.id, $event.target.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
      <!-- <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center" style="color: white;">
            <h5 class="card-title mb-0">ABC</h5>
            <span>ABC</span>
          </div>
          <div class="card-body">
            <p class="card-text"><strong>Mô tả:</strong> Không có</p>
            <p class="card-text"><strong>Ngày bắt đầu:</strong> ABC</p>
            <p class="card-text"><strong>Ngày kết thúc:</strong> ABC</p>
            <span>ABC</span>

          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="action-icons">
              <i class="fas fa-eye text-primary mr-2" title="Xem"></i>
              <i class="fas fa-edit text-warning mr-2" title="Sửa"></i>
              <i class="fas fa-trash-alt text-danger" title="Xóa"></i>
            </div>
            <label class="toggle-switch mb-0">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div> -->
    </div>

    <!-- View Sale Modal -->
    <div v-if="showViewModal" class="modal fade show d-block" tabindex="-1" role="dialog" aria-labelledby="viewSaleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-75" role="document">
        <div class="modal-content bg-white">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết chương trình Sale</h5>
            <button type="button" class="close" @click="closeViewModal" aria-label="Đóng">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div>
              <div class="card-header" style="color: white; font-weight: 700; padding: 20px; font-size: 24px;">
                Thông tin chương trình Sale
              </div>
              <div class="card-body" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d); padding: 20px; color: white;">
                <p><strong>Tên:</strong> {{ currentSale.ten }}</p>
                <p><strong>Mô tả:</strong> {{ currentSale.mota || 'Không có mô tả' }}</p>
                <p><strong>Trạng thái:</strong> <span v-html="currentSale.trangthai"></span></p>
                <p><strong>Ngày bắt đầu:</strong> {{ formatDate(currentSale.ngaybatdau) }}</p>
                <p><strong>Ngày kết thúc:</strong> {{ formatDate(currentSale.ngayketthuc) }}</p>
              </div>
            </div>
            
            <!-- Kiểm tra nếu saleDetails rỗng -->
            <div v-if="saleDetails.length === 0" class="alert alert-info mt-3">
              Chưa có sản phẩm nào được thêm vào chương trình sale này.
            </div>
            
            <!-- Hiển thị bảng sản phẩm nếu saleDetails không rỗng -->
            <div v-else class="mt-3">
              <h5>Sản phẩm trong chương trình Sale</h5>
              <div class="table-responsive">
                <table class="table table-bordered table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th>Tên sản phẩm</th>
                      <th>Đơn vị</th>
                      <th>Giá gốc</th>
                      <th>Giảm giá</th>
                      <th>Giá bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in saleDetails" :key="product.idspct">
                      <td>{{ product.productName }}</td>
                      <td>{{ product.unit }}</td>
                      <td>{{ formatCurrency(product.price) }}</td>
                      <td>{{ formatCurrency(product.discount) }}</td>
                      <td>{{ formatCurrency(product.salePrice) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Sale Modal -->
    <div v-if="showAddEditModal" class="modal fade show d-block" tabindex="-1" role="dialog" aria-labelledby="addEditSaleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-75" role="document">
        <div class="modal-content bg-white">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Sửa chương trình Sale' : 'Thêm chương trình Sale' }}</h5>
            <button type="button" class="close" @click="closeAddEditModal" aria-label="Đóng">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <form @submit.prevent="saveSale">
            <div class="modal-body">
              <div class="mb-3">
                <div class="card-header" style="padding: 20px; color: white; font-weight: 700;">
                  Thông tin chương trình Sale
                </div>
                <div class="card-body" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d); padding: 20px;">
                  <div class="form-row">
                    <div class="form-group col-md-4">
                      <label for="ten">Tên chương trình <span style="color: #C10C99; font-weight: 700;">*</span>:</label>
                      <input type="text" v-model="form.ten" class="form-control" id="ten" required>
                    </div>
                    <div class="form-group col-md-4">
                      <label for="ngaybatdau">Ngày bắt đầu <span style="color: #C10C99; font-weight: 700;">*</span>:</label>
                      <input type="datetime-local" v-model="form.ngaybatdau" class="form-control" id="ngaybatdau" required>
                    </div>
                    <div class="form-group col-md-4">
                      <label for="ngayketthuc">Ngày kết thúc <span style="color: #C10C99; font-weight: 700;">*</span>:</label>
                      <input type="datetime-local" v-model="form.ngayketthuc" class="form-control" id="ngayketthuc" required>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="mota">Mô tả:</label>
                    <textarea v-model="form.mota" class="form-control" id="mota" rows="4"></textarea>
                  </div>
                </div>
              </div>

              <div>
                <div class="card-header d-flex justify-content-between align-items-center" style="padding: 20px;">
                  <h5 class="mb-0" style="color: white !important; font-weight: 700 !important;">Chọn sản phẩm cho chương trình Sale</h5>
                  <div>
                    <input type="text" v-model="searchQuery" class="form-control d-inline-block w-auto mr-2" style="border-radius: 12px 0 0 12px; border-right: 1px solid #C10C99;" placeholder="Tìm kiếm">
                    <select v-model="sortOption" class="form-control d-inline-block w-auto" style="border-radius: 0 12px 12px 0;">
                      <option value="">-- Sắp xếp --</option>
                      <option value="name-asc">Tên A-Z</option>
                      <option value="name-desc">Tên Z-A</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                    </select>
                  </div>
                </div>
                <div class="card-body" style="background-image: linear-gradient(#1f1f1f, #c10c9a2d); padding: 20px;">
                  <div class="table-responsive">
                    <table class="table table-bordered table-hover">
                      <thead class="thead-light">
                        <tr>
                          <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"></th>
                          <th>STT</th>
                          <th>Tên sản phẩm</th>
                          <th>Phân loại</th>
                          <th>Giá bán (VND)</th>
                          <!-- <th>Số lượng</th> -->
                          <th>Đơn vị</th>
                          <th>Giá trị giảm</th>
                          <th>Giá sale (VND)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(product, index) in filteredProducts" :key="product.idspct">
                          <td>
                            <!-- Không có điều kiện disabled và không dùng @change -->
                            <input 
                                  type="checkbox" 
                                  v-model="selectedProducts" 
                                  :value="product.idspct">
                          </td>
                          <td>{{ index + 1 }}</td>
                          <td>{{ product.tensp }}</td>
                          <td>{{ product.tenThuocTinhSpct }}</td>
                          <td>{{ formatCurrency(product.giaban) }}</td>
                          <!-- Bỏ cột "Số lượng" -->
                              <!--
                              <td>
                                <input type="number" v-model.number="product.soluong" :max="product.soluongMax" class="form-control" :disabled="!isSelected(product.idspct)">
                              </td>
                              -->
                          <td>
                            <select v-model="product.donvi" class="form-control" :disabled="!isSelected(product.idspct)">
                              <option :value="0">VND</option>
                              <option :value="1">%</option>
                            </select>
                          </td>
                          <td>
                            <input type="number" v-model.number="product.giatrigiam" :max="product.donvi === 0 ? product.giaban : 100" class="form-control" :disabled="!isSelected(product.idspct)">
                          </td>
                          <td>
                            <input type="text" :value="formatCurrency(calculateSalePrice(product))" class="form-control" readonly>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-if="errorMessage" class="alert alert-danger mt-3">
                    {{ errorMessage }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAddEditModal">Hủy</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Lưu
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
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { globalState } from '../../store';

// Reactive state
const sales = ref([]);
const saleDetails = ref([]);
const allProducts = ref([]);
const selectedProducts = ref([]);
const selectAll = ref(false);
const showViewModal = ref(false);
const showAddEditModal = ref(false);
const isEditMode = ref(false);
const currentSale = reactive({
  id: null,
  ten: '',
  mota: '',
  trangthai: '',
  ngaybatdau: '',
  ngayketthuc: ''
});
const form = reactive({
  ten: '',
  mota: '',
  ngaybatdau: '',
  ngayketthuc: ''
});
const searchQuery = ref('');
const sortOption = ref('');
const alerts = ref([]);
const errorMessage = ref('');

const isSidebarOpen = ref(true);
// Utility function to convert ISO string to 'YYYY-MM-DDTHH:mm' format for datetime-local input
const toDateTimeLocal = (isoString) => {
  const date = new Date(isoString);
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Fetch sales on mount
onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  getSales();
  updateAllSalesStatus();
  setInterval(updateAllSalesStatus, 300000); // 5 minutes
});

// Alert Management
const addAlert = (message, type = 'info') => { // Mặc định là 'info'
  const id = uuidv4();
  alerts.value.push({ id, message, type });
  setTimeout(() => {
    removeAlert(id);
  }, 5000);
};

const removeAlert = (id) => {
  alerts.value = alerts.value.filter(alert => alert.id !== id);
};

// Fetch Sales
const getSales = async () => {
  try {
    const response = await axios.get('https://localhost:7297/api/Sale/Admin');
    sales.value = response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sale:', error);
    addAlert('Không thể lấy danh sách chương trình Sale. Vui lòng thử lại sau.', 'danger');
  }
};

// View Sale
const viewSale = async (id) => {
  try {
    const saleResponse = await axios.get(`https://localhost:7297/api/Sale/${id}/Admin`);
    Object.assign(currentSale, saleResponse.data);
    
    try {
      const detailsResponse = await axios.get(`https://localhost:7297/api/Sale/details/${id}/Admin`);
      saleDetails.value = detailsResponse.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Nếu lỗi 404, gán saleDetails thành mảng rỗng
        saleDetails.value = [];
        addAlert('Chưa có sản phẩm nào được thêm vào chương trình sale này.', 'warning');
      } else {
        throw error; // Ném lại lỗi để xử lý ở catch bên ngoài
      }
    }
    
    showViewModal.value = true;
  } catch (error) {
    console.error('Error fetching sale data:', error);
    addAlert('Không thể lấy dữ liệu chương trình Sale.', 'danger');
  }
};

// Close View Modal
const closeViewModal = () => {
  showViewModal.value = false;
  saleDetails.value = [];
};

// Edit Sale
const editSale = async (id) => {
  try {
    const saleResponse = await axios.get(`https://localhost:7297/api/Sale/${id}/Admin`);
    Object.assign(currentSale, saleResponse.data);
    
    // Chuyển đổi các trường ngày từ ISO sang định dạng datetime-local
    form.ten = currentSale.ten;
    form.mota = currentSale.mota;
    form.ngaybatdau = toDateTimeLocal(currentSale.ngaybatdau);
    form.ngayketthuc = toDateTimeLocal(currentSale.ngayketthuc);

    isEditMode.value = true;
    
    try {
      const detailsResponse = await axios.get(`https://localhost:7297/api/Sale/details/${id}/Admin`);
      selectedProducts.value = detailsResponse.data.map(detail => detail.idspct);
      await loadProducts(selectedProducts.value);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        selectedProducts.value = [];
        addAlert('Chưa có sản phẩm nào được thêm vào chương trình sale này.', 'warning');
        await loadProducts();
      } else {
        throw error;
      }
    }
    
    showAddEditModal.value = true;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sale:', error);
    addAlert('Không thể lấy dữ liệu chương trình Sale.', 'danger');
  }
};

// Delete Sale
const deleteSale = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa chương trình Sale này?')) {
    try {
      await axios.delete(`https://localhost:7297/api/Sale/${id}/Admin`);
      addAlert('Đã xóa chương trình Sale thành công.', 'success');
      getSales();
    } catch (error) {
      console.error('Lỗi khi xóa chương trình Sale:', error);
      addAlert('Không thể xóa chương trình Sale. Vui lòng thử lại sau.', 'danger');
    }
  }
};

// Stop Sale
const stopSale = async (id, isChecked) => {
  const url = isChecked 
    ? `https://localhost:7297/api/Sale/${id}/cancel/Admin` 
    : `https://localhost:7297/api/Sale/${id}/update-status/Admin`;

  try {
    await axios.put(url);
    const action = isChecked ? 'dừng phát hành' : 'cập nhật trạng thái';
    addAlert(`Đã ${action} cho chương trình Sale.`, 'success');
    getSales();
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    addAlert('Không thể cập nhật trạng thái. Vui lòng thử lại.', 'danger');
  }
};

// Load Products
const loadProducts = async (selectedIdspct = []) => {
  try {
    const response = await axios.get('https://localhost:7297/api/Sanpham/details/Admin');
    allProducts.value = response.data.map(product => ({
      ...product,
      // Đặt số lượng mặc định bằng 1
      soluong: 1,
      donvi: 0, // Đặt đơn vị mặc định nếu cần
      giatrigiam: 0,
      // Mark as selected if in selectedIdspct
      isSelected: selectedIdspct.includes(product.idspct)
    }));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    addAlert('Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.', 'danger');
  }
};

// Computed: Filtered and Sorted Products
const filteredProducts = computed(() => {
  let products = allProducts.value.slice();

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    products = products.filter(product => 
      product.tensp.toLowerCase().includes(query) ||
      product.tenThuocTinhSpct.toLowerCase().includes(query)
    );
  }

  if (sortOption.value) {
    switch(sortOption.value) {
      case 'name-asc':
        products.sort((a, b) => a.tensp.localeCompare(b.tensp));
        break;
      case 'name-desc':
        products.sort((a, b) => b.tensp.localeCompare(a.tensp));
        break;
      case 'price-asc':
        products.sort((a, b) => a.giaban - b.giaban);
        break;
      case 'price-desc':
        products.sort((a, b) => b.giaban - a.giaban);
        break;
      default:
        break;
    }
  }

  return products;
});

// Toggle Select All
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedProducts.value = allProducts.value.map(product => product.idspct);
  } else {
    selectedProducts.value = [];
  }
};

// Toggle Individual Product Selection
const toggleProductSelection = (idspct) => {
  if (selectedProducts.value.includes(idspct)) {
    selectedProducts.value = selectedProducts.value.filter(id => id !== idspct);
  } else {
    selectedProducts.value.push(idspct);
  }
};

// Check if Product is Selected
const isSelected = (idspct) => {
  return selectedProducts.value.includes(idspct);
};

// Show Add Sale Form
const showAddSaleForm = async () => {
  isEditMode.value = false;
  Object.assign(form, {
    ten: '',
    mota: '',
    ngaybatdau: '',
    ngayketthuc: ''
  });
  selectedProducts.value = [];
  errorMessage.value = '';
  await loadProducts();
  showAddEditModal.value = true;
};

// Close Add/Edit Modal
const closeAddEditModal = () => {
  showAddEditModal.value = false;
  errorMessage.value = '';
};

// Save Sale
const saveSale = async () => {
  // Reset error message
  errorMessage.value = '';

  // Validate form
  if (!form.ten || !form.ngaybatdau || !form.ngayketthuc) {
    errorMessage.value = 'Vui lòng điền đầy đủ các trường bắt buộc.';
    return;
  }

  if (new Date(form.ngaybatdau) >= new Date(form.ngayketthuc)) {
    errorMessage.value = 'Ngày kết thúc phải sau ngày bắt đầu.';
    return;
  }

  // Check overlapping dates
  try {
    const existingSales = await axios.get('https://localhost:7297/api/Sale/Admin');
    const isOverlap = existingSales.data.some(sale => {
      const existingStart = new Date(sale.ngaybatdau);
      const existingEnd = new Date(sale.ngayketthuc);
      const newStart = new Date(form.ngaybatdau);
      const newEnd = new Date(form.ngayketthuc);

      return (newStart <= existingEnd && newEnd >= existingStart) && (!isEditMode.value || sale.id !== currentSale.id);
    });

    if (isOverlap) {
      errorMessage.value = 'Ngày bắt đầu hoặc kết thúc trùng với chương trình Sale đã tồn tại. Vui lòng chọn ngày khác.';
      return;
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra trùng ngày:', error);
    errorMessage.value = 'Có lỗi xảy ra khi kiểm tra ngày trùng lặp. Vui lòng thử lại.';
    return;
  }

  // Prepare sale data
  const saleData = {
    ten: form.ten.trim(),
    mota: form.mota.trim(),
    trangthai: isEditMode.value ? parseInt(currentSale.trangthai) : 0, // Nếu chỉnh sửa, giữ nguyên trạng thái; nếu thêm mới, thiết lập là 0
    ngaybatdau: form.ngaybatdau, // Không sử dụng toISOString()
    ngayketthuc: form.ngayketthuc, // Không sử dụng toISOString()
    saleDetails: selectedProducts.value.map(idspct => {
      const product = allProducts.value.find(p => p.idspct === idspct);
      return {
        idspct: product.idspct,
        donvi: parseInt(product.donvi),
        // Đặt số lượng mặc định bằng 1
        soluong: 1,
        giatrigiam: parseFloat(product.giatrigiam)
      };
    })
  };

  // Save sale data
  try {
    if (isEditMode.value) {
      // Nếu đang ở chế độ chỉnh sửa, gọi API cập nhật
      await axios.put(`https://localhost:7297/api/Sale/${currentSale.id}/update-sale-with-details/Admin`, saleData);
      addAlert('Cập nhật chương trình Sale thành công.', 'success');
    } else {
      // Nếu đang ở chế độ thêm mới, gọi API thêm
      await axios.post('https://localhost:7297/api/Sale/add-sale-with-details/Admin', saleData);
      addAlert('Thêm mới chương trình Sale thành công.', 'success');
    }

    closeAddEditModal();
    getSales();
  } catch (error) {
    console.error('Lỗi khi lưu Sale:', error);
    errorMessage.value = isEditMode.value 
      ? 'Có lỗi xảy ra khi cập nhật chương trình Sale.'
      : 'Có lỗi xảy ra khi thêm chương trình Sale.';
  }
};

// Calculate Sale Price
const calculateSalePrice = (product) => {
  let giasale = product.giaban;
  if (product.donvi === 0) { // VND
    giasale = product.giaban - product.giatrigiam;
    if (giasale < 0) giasale = 0;
  } else { // %
    giasale = product.giaban * (100 - product.giatrigiam) / 100;
  }
  return giasale;
};

// Format Currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Format Date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

// Get Status Badge
const getStatusBadge = (trangthai) => {
  let badgeClass = 'badge-secondary';
  switch(trangthai) {
    case 'Đang diễn ra':
      badgeClass = 'badge-success';
      break;
    case 'Chuẩn bị diễn ra':
      badgeClass = 'badge-warning';
      break;
    case 'Đã diễn ra':
      badgeClass = 'badge-info';
      break;
    case 'Dừng phát hành':
      badgeClass = 'badge-danger';
      break;
    default:
      badgeClass = 'badge-secondary';
  }
  return `<span class="badge ${badgeClass}">${trangthai}</span>`;
};

// Update All Sales Status
const updateAllSalesStatus = async () => {
  try {
    const sales = await axios.get('https://localhost:7297/api/Sale/Admin');
    for (const sale of sales.data) {
      await updateSaleStatus(sale.id);
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái các chương trình Sale:', error);
    addAlert('Không thể cập nhật trạng thái các chương trình Sale. Vui lòng thử lại sau.', 'danger');
  }
};

// Update Sale Status
const updateSaleStatus = async (saleId) => {
  try {
    await axios.put(`https://localhost:7297/api/Sale/${saleId}/update-status-load/Admin`);
    getSales();
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái cho sale ID ${saleId}:`, error);
    addAlert('Không thể cập nhật trạng thái chương trình Sale.', 'danger');
  }
};
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

.alert-position {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
}

/* Thêm một số kiểu dáng cho các icon hành động */
.action-icons i {
  margin-right: 10px;
  cursor: pointer;
}

/* Kiểu dáng cho toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Custom Modal Size: 75% width */
.modal-75 {
  max-width: 90%;
}

/* Đảm bảo modal luôn nằm giữa màn hình */
.modal-dialog {
  margin: 1.75rem auto;
}

/* Tùy chỉnh để modal có chiều cao tự động và scroll khi cần */
.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}

/* Tùy chỉnh cho các card */
.card-header h5 {
  margin: 0;
}
.card-header {
  background-color: #C10C99 !important;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-75 {
    max-width: 95%;
  }

  .action-icons i {
    margin-right: 5px;
  }
}

.container {
  max-width: 100vw;
  margin: 0;
  padding: 0;
}

.customBtn {
  border: 2px solid #C10C99;
  color: #C10C99;
  background-color: transparent;
  padding: 8px;
  border-radius: 16px;
}

.customBtn:hover {
  box-shadow: 0 0 1px 1px #C10C99;
}

.customAlert {
  border: none;
  border-radius: 12px;
  background-color: #620a4f;
  color: white;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-right: 5px;
}

.customCloseBtn {
  border: none;
  font-weight: 700;
  color: white;
  width: 40px;
  height: 40px;
  background-color: transparent;
}

.customCloseBtn:hover i{
  color: #C10C99;
}

.modal .modal-content {
  background-color: #1f1f1f !important;
}

.modal .close {
  background-color: transparent !important;
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.modal .close:hover span {
  color: #C10C99;
}

.modal h5 {
  color: #C10C99 !important;
}

.modal button {
  background-color: #C10C99 !important;
  border: none;
}

.modal label {
  color: white;
}

.table-responsive th:first-child {
  border-radius: 16px 0 0 0;
}

.table-responsive table {
  border: none;
}

.table-responsive th:last-child {
  border-radius: 0 16px 0 0;
}

::v-deep input:checked + .slider {
  background-color: #C10C99;
}

</style>
