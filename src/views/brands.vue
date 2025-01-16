<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="brand-management">
    <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Quản lý thương hiệu</h1>

    <div class="controls">
      <div class="search-box">
        <input
          v-model="searchTerm"
          class="search-input"
          placeholder="Tìm kiếm theo tên thương hiệu"
        />
      </div>
      <button class="openNewBrandForm" type="button" @click="openAddBrandModal">
        <i class="pi pi-plus" style="font-size: 16px; margin-right: 5px;"></i>
        Thêm Thương Hiệu
      </button>
    </div>
    <div class="table-container-brand">
      <table class="brand-table">
        <thead>
          <tr>
            <th>Số Thứ Tự</th>
            <th>Tên Thương Hiệu</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(brand, index) in filteredBrands" :key="brand.id">
            <td>{{ index + 1 }}</td>
            <td>{{ brand.tenthuonghieu }}</td>
            <td>
              <span
                :class="{
                  'status-active': brand.tinhtrang === 0,
                  'status-inactive': brand.tinhtrang === 1
                }"
              >
                {{ brand.tinhtrang === 0 ? 'Hoạt động' : 'Dừng hoạt động' }}
              </span>
            </td>
            <td>
              <td>
                <button class="btn-action btn-edit" @click="editBrand(brand)">
                  <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn-action btn-delete" @click="deleteBrand(brand.id)">
                  <i class="fas fa-trash"></i> Xóa
                </button>
              </td>
            </td>
          </tr>
          <!-- <tr>
            <td>1</td>
            <td>Adidas</td>
            <td>
              <span class="status-active">
                Hoạt động
              </span>
            </td>
            <td>
              <td style="display: flex; justify-content: center;">
                <button class="btn-action btn-edit">
                  <i class="pi pi-pencil" style="font-size: 20px; margin-right: 10px;"></i>
                  Sửa
                </button>
                <button class="btn-action btn-delete">
                  <i class="pi pi-trash" style="font-size: 20px; margin-right: 10px;"></i>
                  Xóa
                </button>
              </td>
            </td>
          </tr> -->
        </tbody>
      </table>
    </div>
    <!-- Modal Thêm -->
    <div v-if="showAddModal" class="modal customModal">
      <div class="modal-content">
        <h3>Thêm Thương Hiệu</h3>
        <customInput
          label="Tên thương hiệu"
          type="text"
          placeholder="Nhập tên thương hiệu"
          icon="pi pi-tag"
          v-model="newBrandName"
        />
        <div class="modal-actions">
          <customButton
              bgColor="#C10C99"
              textColor="#f8f9fa"
              borderColor="#C10C99"
              hoverColor="transparent"
              hoverTextColor="#C10C99"
              @click="addBrand"
          >
            Lưu
          </customButton>
          <customButton
              bgColor="#CC4125"
              textColor="#f8f9fa"
              borderColor="#CC4125"
              hoverColor="transparent"
              hoverTextColor="#CC4125"
              @click="closeAddBrandModal"
          >
            Đóng
          </customButton>
        </div>
      </div>
    </div>

    <!-- Modal Sửa -->
    <div v-if="showEditModal" class="modal customModal">
      <div class="modal-content">
        <h3>Sửa Thương Hiệu</h3>
        <customInput
          label="Tên thương hiệu"
          type="text"
          placeholder="Nhập tên thương hiệu"
          icon="pi pi-tag"
          v-model="editedBrand.tenthuonghieu"
        />
        <customSelect
          label="Trạng thái"
          :options="[
            { value: '0', label: 'Hoạt động' },
            { value: '1', label: 'Dừng hoạt động' }
          ]"
          icon="pi pi-pencil"
          v-model="editedBrand.tinhtrang"
        />
        <div class="modal-actions">
          <customButton
              bgColor="#C10C99"
              textColor="#f8f9fa"
              borderColor="#C10C99"
              hoverColor="transparent"
              hoverTextColor="#C10C99"
              @click="saveBrandChanges"
          >
            Lưu thay đổi
          </customButton>
          <customButton
              bgColor="#CC4125"
              textColor="#f8f9fa"
              borderColor="#CC4125"
              hoverColor="transparent"
              hoverTextColor="#CC4125"
              @click="closeEditModal"
          >
            Đóng
          </customButton>
        </div>
      </div>
    </div>
  </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import customSearchField from '@/components/customSearchField.vue';
import customInput from '@/components/customInput.vue';
import customButton from '@/components/customButton.vue';
import customSelect from '@/components/customSelect.vue';
import Swal from 'sweetalert2';

const API_URL = 'https://localhost:7297/api/Thuonghieu';
const brands = ref([]);
const searchTerm = ref('');
const showAddModal = ref(false);
const showEditModal = ref(false);
const newBrandName = ref('');
const editedBrand = ref({ id: null, tenthuonghieu: '', tinhtrang: 0 });

const filteredBrands = computed(() => 
  searchTerm.value
    ? brands.value.filter((brand) =>
        brand.tenthuonghieu.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    : brands.value
);

const fetchBrands = async () => {
  try {
    const response = await fetch(`${API_URL}/Admin`);
    if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu');
    brands.value = await response.json();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: error.message,
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

const addBrand = async () => {
  if (!newBrandName.value.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Vui lòng nhập tên thương hiệu",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    return;
  }

  try {
    const response = await fetch(`${API_URL}/Admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenthuonghieu: newBrandName.value, tinhtrang: 0 }),
    });

    if (!response.ok) throw new Error('Có lỗi xảy ra khi thêm thương hiệu');
    Swal.fire({
      icon: "success",
      title: "Thêm thương hiệu thành công",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    fetchBrands();
    closeAddBrandModal();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: error.message,
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

const editBrand = (brand) => {
  editedBrand.value = { ...brand };
  showEditModal.value = true;
};

const saveBrandChanges = async () => {
  try {
    const response = await fetch(`${API_URL}/${editedBrand.value.id}/Admin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedBrand.value),
    });

    if (!response.ok) throw new Error('Có lỗi khi cập nhật thương hiệu');
    Swal.fire({
      icon: "success",
      title: "Cập nhật thương hiệu thành công",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    fetchBrands();
    closeEditModal();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: error.message,
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

const deleteBrand = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này không?')) {
    try {
      const response = await fetch(`${API_URL}/${id}/Admin`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Có lỗi khi xóa thương hiệu');
      Swal.fire({
        icon: "success",
        title: "Xóa thương hiệu thành công",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      fetchBrands();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.message,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
    }
  }
};

const openAddBrandModal = () => {
  showAddModal.value = true;
  newBrandName.value = '';
};

const closeAddBrandModal = () => {
  showAddModal.value = false;
};

const isSidebarOpen = ref(true);

const closeEditModal = () => {
  showEditModal.value = false;
};

onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  fetchBrands();
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

::v-deep .brand-management {
  margin: 0 auto;
  border-radius: 8px;
}

::v-deep .controls {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

::v-deep .search-box {
  display: flex;
}
/* Thêm khoảng cách giữa các nút */
::v-deep td > .btn-action {
  margin-right: 10px; /* Khoảng cách giữa các nút */
  border-radius: 20px;
}

::v-deep td > .btn-action:last-child {
  margin-right: 0; /* Xóa khoảng cách sau nút cuối cùng */
}

::v-deep .brand-table {
  width: 100%;
  border-collapse: collapse;
}

::v-deep .brand-table th,
::v-deep .brand-table td {
  padding: 10px;
  text-align: center;
}

::v-deep .brand-table th:first-child {
  border-radius: 12px 0 0 0;
}

::v-deep .brand-table th:last-child {
  border-radius: 0 12px 0 0;
}

::v-deep .brand-table th {
  background-color: #2c3e50;
  color: #fff;
}

::v-deep .status-active {
  color: #27ae60;
  font-weight: bold;
}

::v-deep .status-inactive {
  color: #c0392b;
  font-weight: bold;
}

::v-deep button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

::v-deep .search-input {
  color: white;
  min-width: 500px;
  padding: 10px;
  background-color: transparent;
  background-image: linear-gradient(#1f1f1f, #0c88c12d);
  border: none;
  border-radius: 2px;
  border-bottom: 2px solid transparent;
  outline: none;
}

::v-deep .search-input:focus {
  border-color: #0c88c1 !important;
}

::v-deep .openNewBrandForm {
  float: right;
  border-radius: 20px;
  background-color: transparent;
  border: 1px solid #0c88c1a6;
  padding: 8px 16px;
  color: #0c88c1a6;
  font-weight: 600;
  transition: .12s ease;
  margin-right: 0;
}

::v-deep .openNewBrandForm:hover {
  box-shadow: 0 0 1px 1px #0c88c1a6;
}

::v-deep .btn-secondary {
  background-color: #95a5a6;
  color: white;
}

::v-deep .btn-edit {
  background-color: #f39c12;
  color: white;
  border: 2px solid #f39c12;
  font-weight: 600;
  transition: .12s ease;
}

::v-deep .btn-delete {
  background-color: #e74c3c;
  color: white;
  border: 2px solid #e74c3c;
  font-weight: 600;
  transition: .12s ease;
}

::v-deep .btn-edit:hover {
  background-color: transparent;
  color: #f39c12;
}

::v-deep .btn-delete:hover {
  background-color: transparent;
  color: #e74c3c;
}

::v-deep button:hover {
  opacity: 0.9;
}

::v-deep .modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

::v-deep .modal-content {
  background-color: #1f1f1f !important;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

::v-deep .modal-content h3 {
  color: white;
}

::v-deep .modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

::v-deep .table-container-brand {
  padding: 20px;
  border-radius: 10px;
  background-image: linear-gradient(#1f1f1f, #0c88c12d);
  min-height: 50vh;
}

::v-deep .table-container-brand td {
  background-color: #dbe8ee;
  color: #0c88c1;
  font-weight: 600;
}

::v-deep .customModal .modal-actions {
  display: flex;
  gap: 40%;
  margin-top: 0;
}

::v-deep .customModal .custom-button {
  padding: 8px 12px;
  font-size: 16px;
}
</style>
