<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { globalState } from "../../store";

const apiUrl = "https://localhost:7297/api/Rank";

const ranks = ref([]);
const searchKeyword = ref("");
const newRank = ref({ tenrank: "", minMoney: 0, maxMoney: 0 });
const editRank = ref({});
const addModal = ref(null);
const editModal = ref(null);

const filteredRanks = computed(() =>
  ranks.value.filter((rank) =>
    rank.tenrank.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
);
const isRangeOverlap = (min, max, excludeId = null) => {
  return ranks.value.some((rank) => {
    // Nếu là sửa, bỏ qua rank hiện tại đang chỉnh sửa
    if (excludeId && rank.id === excludeId) return false;

    // Kiểm tra trùng lặp khoảng
    return (
      (min >= rank.minMoney && min <= rank.maxMoney) || // min nằm trong khoảng của rank khác
      (max >= rank.minMoney && max <= rank.maxMoney) || // max nằm trong khoảng của rank khác
      (min <= rank.minMoney && max >= rank.maxMoney)    // Khoảng bao phủ khoảng của rank khác
    );
  });
};
const resetAddModal = () => {
  newRank.value = { tenrank: "", minMoney: 0, maxMoney: 0 };
};

const resetEditModal = () => {
  editRank.value = {};
};

const loadRanks = async () => {
  try {
    const response = await axios.get(apiUrl + "/Admin");
    ranks.value = response.data;
  } catch (error) {
    console.error("Error loading ranks:", error);
  }
};

const addRank = async () => {
  if (newRank.value.minMoney >= newRank.value.maxMoney) {
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Giá nhỏ nhất phải nhỏ hơn giá lớn nhất.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    return;
  }
  if (isRangeOverlap(newRank.value.minMoney, newRank.value.maxMoney)) {
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Khoảng giá trị bị trùng lặp với rank khác.",
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
    await axios.post(apiUrl + "/Admin", { ...newRank.value, trangthai: 0 });
    newRank.value = { tenrank: "", minMoney: 0, maxMoney: 0 };

    const modalInstance = bootstrap.Modal.getInstance(addModal.value);
    modalInstance.hide();

    loadRanks();

    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: "Thêm rank mới thành công.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  } catch (error) {
    console.error("Error adding rank:", error);

    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Thêm rank thất bại, vui lòng thử lại.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

const showAddModal = () => {
  const modalInstance = new bootstrap.Modal(addModal.value);
  modalInstance.show();
};

const showEditModal = (rank) => {
  editRank.value = { ...rank };
  const modalInstance = new bootstrap.Modal(editModal.value);
  modalInstance.show();
};

const updateRank = async () => {
  if (editRank.value.minMoney >= editRank.value.maxMoney) {
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Giá nhỏ nhất phải nhỏ hơn giá lớn nhất.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    return;
  }
  if (isRangeOverlap(editRank.value.minMoney, editRank.value.maxMoney, editRank.value.id)) {
    Swal.fire({
      icon: "error",
      title: "Thất bại!",
      text: "Khoảng giá trị bị trùng lặp với rank khác.",
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
    await axios.put(`${apiUrl}/${editRank.value.id}/Admin`, editRank.value);
    const modalInstance = bootstrap.Modal.getInstance(editModal.value);
    modalInstance.hide();
    loadRanks();
  } catch (error) {
    console.error("Error updating rank:", error);
  }
};

const deleteRank = async (id) => {
  try {
    await axios.delete(`${apiUrl}/${id}/Admin`);
    loadRanks();
  } catch (error) {
    console.error("Error deleting rank:", error);
  }
};

const toggleStatus = async (id, currentStatus) => {
  try {
    const newStatus = currentStatus === 0 ? 1 : 0;
    await axios.put(`${apiUrl}/Toggle/Admin?id=${id}`, { trangthai: newStatus });
    loadRanks();
  } catch (error) {
    console.error("Error toggling status:", error);
  }
};

const isSidebarOpen = ref(true);

onMounted(async () => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  await loadRanks();
});
</script>

<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container">
    <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Danh sách rank</h1>

    <!-- Card chứa ô tìm kiếm và nút thêm -->
    <div class="card p-3 mb-4 shadow-sm" style="background-color: transparent; padding: 0px !important;">
      <div class="d-flex justify-content-between align-items-center">
        <input
          type="text"
          v-model="searchKeyword"
          class="form-control rounded-pill me-2 search-bar"
          placeholder="Tìm kiếm..."
        />
        <button v-if="globalState.userRole == 'Admin'" class="btn btn-add px-4 rounded-pill" style="background-color: transparent; color: #c79708; border: 2px solid #c79708; font-weight: 600;" @click="showAddModal">
          <i class="pi pi-plus" style="font-size: 16px; margin-right: 5px;"></i>
          Thêm Rank
        </button>
      </div>
    </div>

    <!-- Bảng danh sách Rank -->
    <div class="table-container">
      <table class="table table-striped" style="border: none;">
        <thead class="table-light">
          <tr>
            <th>Tên Rank</th>
            <th>Giá nhỏ nhất</th>
            <th>Giá lớn nhất</th>
            <th>Trạng thái</th>
            <th>Chuyển trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rank in filteredRanks" :key="rank.id">
            <td>{{ rank.tenrank }}</td>
            <td>{{ rank.minMoney.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }}</td>
            <td>{{ rank.maxMoney.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }}</td>

            <td>
              <span :class="rank.trangthai === 0 ? 'badge bg-success' : 'badge bg-danger'">
                {{ rank.trangthai === 0 ? 'Hoạt động' : 'Dừng hoạt động' }}
              </span>
            </td>
            <td>
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="rank.trangthai === 0"
                  @change="toggleStatus(rank.id, rank.trangthai)"
                  :disabled="globalState.userRole != 'Admin'"
                />
              </div>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-info me-2" @click="showEditModal(rank)" :disabled="globalState.userRole != 'Admin'">
              Sửa
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteRank(rank.id)" :disabled="globalState.userRole != 'Admin'">
              Xóa
              </button>
            </td>
          </tr>
          <!-- <tr>
            <td>ABC</td>
            <td>ABC</td>
            <td>ABC</td>

            <td>
              <span class='badge bg-success'>
                Hoạt động
              </span>
            </td>
            <td>
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                  :disabled="globalState.userRole == 'Admin'"
                />
              </div>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-info me-2" :disabled="globalState.userRole == 'Admin'">
              Sửa
              </button>
              <button class="btn btn-sm btn-outline-danger" :disabled="globalState.userRole == 'Admin'">
              Xóa
              </button>
            </td>
          </tr> -->
          <!-- <tr>
            <td>ABC</td>
            <td>ABC</td>
            <td>ABC</td>

            <td>
              <span class='badge bg-success'>
                Hoạt động
              </span>
            </td>
            <td>
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                />
              </div>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-info me-2">
              Sửa
              </button>
              <button class="btn btn-sm btn-outline-danger">
              Xóa
              </button>
            </td>
          </tr> -->
        </tbody>
      </table>
    </div>

    <!-- Modal Thêm Rank -->
    <div class="modal fade" ref="addModal" tabindex="-1" aria-hidden="true" @hidden.bs.modal="resetAddModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary">Thêm Rank</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addRank">
              <div class="mb-3">
                <label class="form-label">Tên Rank</label>
                <input v-model="newRank.tenrank" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Giá nhỏ nhất</label>
                <input v-model.number="newRank.minMoney" type="number" class="form-control" required min="0" />
              </div>
              <div class="mb-3">
                <label class="form-label">Giá lớn nhất</label>
                <input v-model.number="newRank.maxMoney" type="number" class="form-control" required :min="newRank.minMoney + 1" />
              </div>

              <button type="submit" class="btn btn-primary w-100">Lưu</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Sửa Rank -->
    <div class="modal fade" ref="editModal" tabindex="-1" aria-hidden="true" @hidden.bs.modal="resetEditModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary">Sửa Rank</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateRank">
              <div class="mb-3">
                <label class="form-label">Tên Rank</label>
                <input v-model="editRank.tenrank" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Giá nhỏ nhất</label>
                <input v-model.number="editRank.minMoney" type="number" class="form-control" required min="0" />
              </div>
              <div class="mb-3">
                <label class="form-label">Giá lớn nhất</label>
                <input v-model.number="editRank.maxMoney" type="number" class="form-control" required :min="newRank.minMoney + 1" />
              </div>

              <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model.number="editRank.trangthai" class="form-control">
                  <option value="0">Hoạt động</option>
                  <option value="1">Dừng hoạt động</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100">Lưu</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
    </main>
  </div>
</template>

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
  color: #333;
  max-width: 100vw;
  margin: 0;
  padding: 0;
}

.card {
  border-radius: 10px;
}
.search-bar {
  max-width: 300px;
  height: 38px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 2px solid #ddd;
  padding-left: 15px;
  background-color: transparent;
  color: white;
}

.search-bar::placeholder {
  color: white;
}

.search-bar:focus {
  border-color: #c79708;
}

.btn-add {
  border-radius: 20px;
  padding: 8px 20px;
}

.btn-add:hover {
  box-shadow: 0 0 1px 1px #c79708;
}

.table {
  border: 1px solid #ddd;
}
.table thead {
  background-color: #f8f9fa;
}
.table-hover tbody tr:hover {
  background-color: #f1f1f1;
}
.badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
}
.btn {
  border-radius: 20px;
}

::v-deep .table-container {
  padding: 20px;
  border-radius: 10px;
  background-image: linear-gradient(#1f1f1f, #ffc1072e);
  min-height: 50vh;
}

::v-deep .table-container .table th {
  background-color: #a07e17;
  color: white;
  font-weight: 600;
  border-bottom: none;
}

::v-deep .table-container .table td {
  border-bottom-color: #a07e17;
}

::v-deep .table-container .table th:first-child {
  border-radius: 12px 0 0 0;
}

::v-deep .table-container .table th:last-child {
  border-radius: 0 12px 0 0;
}

::v-deep .form-check-input:checked {
  background-color: #C10C99;
  border: 2px solid transparent;
}

::v-deep .form-check-input:not(:checked) {
  border-color: #c10c9a80;
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

.modal button {
  background-color: #C10C99 !important;
  border: none;
}

.modal label {
  color: white;
}
</style>
