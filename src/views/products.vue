<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container">
        <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Danh sách sản phẩm</h1>

    <!-- ========== CARD: TÌM KIẾM & SẮP XẾP ========== -->
    <div class="card mb-4" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #c10c9a2d); color: white;">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <!-- Tìm kiếm -->
          <input
            type="text"
            v-model="searchTerm"
            class="form-control me-3"
            placeholder="Tìm kiếm sản phẩm..."
            style="flex: 1;"
          />

          <!-- Sắp xếp -->
          <select
            v-model="sortOrder"
            class="form-control me-3"
            style="width: 200px;"
          >
            <option value="none">Sắp xếp</option>
            <option value="asc">Tên: A-Z</option>
            <option value="desc">Tên: Z-A</option>
            <option value="priceAsc">Giá: Tăng dần</option>
            <option value="priceDesc">Giá: Giảm dần</option>
          </select>

          <!-- Thêm sản phẩm -->
          <button
            class="customAddBtn"
            @click="openAddProductModal"
          >
            <i class="pi pi-plus-circle" style="font-size: 16px; margin-right: 5px;"></i>
            Thêm sản phẩm
          </button>
        </div>
      </div>
    </div>

    <!-- ========== CARD: LỌC TRẠNG THÁI SẢN PHẨM ========== -->
    <div class="card mb-4" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #c10c9a2d); color: white;">
      <div class="card-body">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'all' }"
              href="#"
              @click.prevent="activeTab = 'all'"
            >
              Tất cả
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'selling' }"
              href="#"
              @click.prevent="activeTab = 'selling'"
            >
              Đang bán
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'outOfStock' }"
              href="#"
              @click.prevent="activeTab = 'outOfStock'"
            >
              Hết hàng
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'stopped' }"
              href="#"
              @click.prevent="activeTab = 'stopped'"
            >
              Dừng bán
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- ========== CARD: DANH SÁCH SẢN PHẨM ========== -->
    <div class="card" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #c10c9a2d); color: white;">
      <div class="card-body">
        <div class="row">
          <div
            class="col-md-4 mb-4"
            v-for="product in filteredAndSortedProducts"
            :key="product.id"
          >
            <div class="card h-100" style="background-color: #1f1f1f; color: white;">
              <!-- Hình ảnh sản phẩm -->
              <img
                :src="product.urlHinhanh || defaultImage"
                class="card-img-top"
                alt="Hình ảnh sản phẩm"
                style="height: 200px; object-fit: cover;"
              />

              <!-- Thông tin sản phẩm -->
              <div class="card-body">
                <h5 class="card-title">{{ product.tensp }}</h5>
                <p class="card-text">
                  <strong>Trạng thái:</strong> {{ getStatusText(product.trangthai) }}<br />
                  <strong>Số lượng:</strong> {{ product.soluong }}<br />
                  <strong>Giá bán:</strong> {{ formatPrice(product.giaban) }}
                </p>
              </div>

              <!-- Hành động sản phẩm -->
              <div class="card-footer d-flex flex-column">
                <div class="mb-2">
                  <button
                    class="btn btn-secondary btn-sm me-1 mb-1"
                    @click="async () => { 
                      await categorizeProduct(product.id, product.tensp); 
                      toCategorizeProduct(); 
                    }"
                  >
                    Phân loại hàng
                  </button>
                  <button
                    class="btn btn-warning btn-sm me-1 mb-1"
                    @click="viewProductDetail(product.id)"
                  >
                    Chi tiết
                  </button>
                  <button
                    class="btn btn-info btn-sm me-1 mb-1"
                    @click="openEditProductModal(product)"
                  >
                    Sửa
                  </button>
                  <button
                    class="btn btn-danger btn-sm me-1 mb-1"
                    @click="deleteProduct(product.id)"
                    :disabled="deletingIds.includes(product.id)"
                  >
                    Xóa
                  </button>
                  <button
                    class="btn btn-primary btn-sm me-1 mb-1"
                    @click="viewProductReviews(product.id)"
                  >
                    Xem đánh giá
                  </button>
                </div>

                <!-- Switch Dừng bán -->
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'switch-' + product.id"
                    v-model="product.isStopped"
                    @change="toggleStopSale(product)"
                  />
                  <label
                    class="form-check-label"
                    :for="'switch-' + product.id"
                  >
                    Dừng bán
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hiển thị thông báo khi không có sản phẩm -->
        <div
          v-if="filteredAndSortedProducts.length === 0"
          class="text-center" style="font-weight: 700;"
        >
          Không có sản phẩm nào được tìm thấy.
        </div>
      </div>
    </div>

    <!-- ========== MODALS ========== -->

    <!-- ========== Modal: Thêm Sản Phẩm ========== -->
    <div
      class="modal fade"
      id="addProductModal"
      tabindex="-1"
      aria-labelledby="addProductLabel"
      aria-hidden="true"
      ref="addProductModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addProductLabel">Thêm Sản Phẩm Mới</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeAddProductModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Ảnh preview -->
            <img
              :src="addForm.imagePreview || defaultImage"
              alt="Hình ảnh sản phẩm"
              class="img-fluid mb-3"
              style="width: 100%; height: auto; object-fit: cover; border-radius: 5px;"
            />

            <!-- Form thêm sản phẩm -->
            <form @submit.prevent="saveProduct" novalidate>
              <div class="mb-3">
                <label for="productName" class="form-label">Tên sản phẩm</label>
                <input
                  type="text"
                  id="productName"
                  v-model="addForm.tensp"
                  class="form-control"
                  :class="{ 'is-invalid': addForm.errors.tensp }"
                  required
                />
                <div class="invalid-feedback">
                  {{ addForm.errors.tensp }}
                </div>
              </div>

              <div class="mb-3">
                <label for="productDescription" class="form-label">Mô tả</label>
                <textarea
                  id="productDescription"
                  v-model="addForm.mota"
                  class="form-control"
                  maxlength="200"
                  :class="{ 'is-invalid': addForm.errors.mota }"
                ></textarea>
                <small class="form-text">Tối đa 200 ký tự.</small>
                <div class="invalid-feedback">
                  {{ addForm.errors.mota }}
                </div>
              </div>

              <div class="mb-3">
                <label for="productPrice" class="form-label">Giá bán</label>
                <input
                  type="number"
                  id="productPrice"
                  v-model.number="addForm.giaban"
                  class="form-control"
                  :class="{ 'is-invalid': addForm.errors.giaban }"
                  required
                />
                <div class="invalid-feedback">
                  {{ addForm.errors.giaban }}
                </div>
              </div>

              <div class="mb-3">
                <label for="productBrand" class="form-label">Thương hiệu</label>
                <select
                  id="productBrand"
                  v-model="addForm.idth"
                  class="form-control"
                  :class="{ 'is-invalid': addForm.errors.idth }"
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  <option
                    v-for="brand in activeBrands"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.tenthuonghieu }}
                  </option>
                </select>
                <div class="invalid-feedback">
                  {{ addForm.errors.idth }}
                </div>
              </div>

              <div class="mb-3">
                <label for="productImage" class="form-label">Hình ảnh</label>
                <input
                  type="file"
                  id="productImage"
                  @change="handleImageUpload('add')"
                  accept="image/*"
                  class="form-control"
                  :class="{ 'is-invalid': addForm.errors.urlHinhanh }"
                  required
                />
                <div class="invalid-feedback">
                  {{ addForm.errors.urlHinhanh }}
                </div>
              </div>

              <button type="submit" class="customBtn">
                Lưu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== Modal: Sửa Sản Phẩm ========== -->
    <div
      class="modal fade"
      id="editProductModal"
      tabindex="-1"
      aria-labelledby="editProductLabel"
      aria-hidden="true"
      ref="editProductModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editProductLabel">Chỉnh sửa Sản Phẩm</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeEditProductModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Ảnh preview -->
            <img
              :src="editForm.imagePreview || defaultImage"
              alt="Hình ảnh sản phẩm"
              class="img-fluid mb-3"
              style="width: 100%; height: auto; object-fit: cover; border-radius: 5px;"
            />

            <!-- Form sửa sản phẩm -->
            <form @submit.prevent="saveEditedProduct" novalidate>
              <div class="mb-3">
                <label for="editProductName" class="form-label">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  id="editProductName"
                  v-model="editForm.tensp"
                  class="form-control"
                  :class="{ 'is-invalid': editForm.errors.tensp }"
                  required
                />
                <div class="invalid-feedback">
                  {{ editForm.errors.tensp }}
                </div>
              </div>

              <div class="mb-3">
                <label for="editProductDescription" class="form-label">
                  Mô tả
                </label>
                <textarea
                  id="editProductDescription"
                  v-model="editForm.mota"
                  class="form-control"
                  maxlength="200"
                  :class="{ 'is-invalid': editForm.errors.mota }"
                ></textarea>
                <small class="form-text">
                  Tối đa 200 ký tự.
                </small>
                <div class="invalid-feedback">
                  {{ editForm.errors.mota }}
                </div>
              </div>

              <div class="mb-3">
                <label for="editProductPrice" class="form-label">
                  Giá bán
                </label>
                <input
                  type="number"
                  id="editProductPrice"
                  v-model.number="editForm.giaban"
                  class="form-control"
                  :class="{ 'is-invalid': editForm.errors.giaban }"
                  required
                />
                <div class="invalid-feedback">
                  {{ editForm.errors.giaban }}
                </div>
              </div>

              <div class="mb-3">
                <label for="editProductBrand" class="form-label">
                  Thương hiệu
                </label>
                <select
                  id="editProductBrand"
                  v-model="editForm.idth"
                  class="form-control"
                  :class="{ 'is-invalid': editForm.errors.idth }"
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  <option
                    v-for="brand in activeBrands"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.tenthuonghieu }}
                  </option>
                </select>
                <div class="invalid-feedback">
                  {{ editForm.errors.idth }}
                </div>
              </div>

              <div class="mb-3">
                <label for="editProductImage" class="form-label">
                  Thay đổi hình ảnh
                </label>
                <input
                  type="file"
                  id="editProductImage"
                  @change="handleImageUpload('edit')"
                  accept="image/*"
                  class="form-control"
                  :class="{ 'is-invalid': editForm.errors.urlHinhanh }"
                />
                <div class="invalid-feedback">
                  {{ editForm.errors.urlHinhanh }}
                </div>
                <small class="form-text">
                  Nếu không thay đổi, để trống.
                </small>
              </div>

              <button type="submit" class="customBtn">
                Lưu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== Modal: Chi Tiết Sản Phẩm ========== -->
    <div
      class="modal fade"
      id="productDetailModal"
      tabindex="-1"
      aria-labelledby="productDetailLabel"
      aria-hidden="true"
      ref="productDetailModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="productDetailLabel">
              Thông tin chi tiết sản phẩm
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeProductDetailModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>Tên sản phẩm:</strong>
              {{ detailProduct.tensp }}
            </p>
            <p>
              <strong>Mô tả:</strong>
              {{ detailProduct.mota || 'Không có mô tả' }}
            </p>
            <p>
              <strong>Trạng thái:</strong>
              {{ getStatusText(detailProduct.trangthai) }}
            </p>
            <p>
              <strong>Số lượng:</strong>
              {{ detailProduct.soluong }}
            </p>
            <p>
              <strong>Giá bán:</strong>
              {{ formatPrice(detailProduct.giaban) }}
            </p>
            <p>
              <strong>Thương hiệu:</strong>
              {{ detailProduct.thuonghieu?.tenthuonghieu || 'Không xác định' }}
            </p>
            <img
              :src="detailProduct.urlHinhanh || defaultImage"
              alt="Hình ảnh sản phẩm"
              class="img-fluid"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="customBtn"
              @click="closeProductDetailModal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== Modal: Xem Đánh Giá Sản Phẩm ========== -->
    <div
      class="modal fade"
      id="productReviewsModal"
      tabindex="-1"
      aria-labelledby="productReviewsLabel"
      aria-hidden="true"
      ref="productReviewsModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Đánh Giá Sản Phẩm: {{ reviewsProductName }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeProductReviewsModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Nếu không có đánh giá -->
            <div v-if="reviews.length === 0" class="text-center">
              Không có đánh giá nào cho sản phẩm này.
            </div>

            <!-- Danh sách đánh giá -->
            <div v-else>
              <div
                class="review-item mb-4 p-3 border rounded"
                v-for="review in reviews"
                :key="review.id"
              >
                <div class="row">
                  <div class="col-md-8">
                    <h5>
                      {{ review.khachhangTen || 'Người dùng' }}
                      <small>
                        - {{ formatDate(review.ngaydanhgia) }}
                      </small>
                    </h5>
                    <p>
                      <strong>Nội dung đánh giá:</strong>
                      {{ review.noidungdanhgia || 'Không có nội dung đánh giá' }}
                    </p>
                  </div>
                  <div
                    class="col-md-4 text-right"
                    v-if="review.urlHinhanh"
                  >
                    <img
                      :src="review.urlHinhanh"
                      alt="Hình ảnh đánh giá"
                      class="img-fluid rounded"
                      style="max-width: 150px; height: auto; object-fit: cover;"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="customBtn"
              @click="closeProductReviewsModal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useRouter } from "vue-router";

export default {
  name: 'Products',
  data() {
    return {
      isSidebarOpen: true,
      // Danh sách sản phẩm
      sanphamList: [],
      // Các biến cho tìm kiếm & sắp xếp
      searchTerm: '',
      sortOrder: 'none',
      // Tab đang chọn: all, selling, outOfStock, stopped
      activeTab: 'all',
      // Danh sách thương hiệu
      activeBrands: [],
      // Ảnh mặc định
      defaultImage: 'default_image.jpg',
      // Danh sách ID sản phẩm đang xóa (để disable nút Xóa)
      deletingIds: [],

      // Form Thêm sản phẩm
      addForm: {
        tensp: '',
        mota: '',
        giaban: null,
        idth: '',
        urlHinhanh: '',
        imagePreview: '',
        errors: {},
      },

      // Form Sửa sản phẩm
      editForm: {
        id: null,
        tensp: '',
        mota: '',
        giaban: null,
        idth: '',
        urlHinhanh: '',
        imagePreview: '',
        errors: {},
      },

      // Thông tin chi tiết sản phẩm
      detailProduct: {},

      // Danh sách đánh giá + tên sản phẩm
      reviews: [],
      reviewsProductName: '',
    };
  },
  computed: {
    filteredAndSortedProducts() {
      let products = this.sanphamList;

      // Lọc theo tab
      if (this.activeTab === 'selling') {
        products = products.filter((p) => p.trangthai === 0);
      } else if (this.activeTab === 'outOfStock') {
        products = products.filter((p) => p.trangthai === 1);
      } else if (this.activeTab === 'stopped') {
        products = products.filter((p) => p.trangthai === 2);
      }

      // Lọc theo từ khóa
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        products = products.filter(
          (p) =>
            p.tensp.toLowerCase().includes(term) ||
            (p.mota && p.mota.toLowerCase().includes(term))
        );
      }

      // Sắp xếp
      if (this.sortOrder === 'asc') {
        products = products.sort((a, b) => a.tensp.localeCompare(b.tensp));
      } else if (this.sortOrder === 'desc') {
        products = products.sort((a, b) => b.tensp.localeCompare(a.tensp));
      } else if (this.sortOrder === 'priceAsc') {
        products = products.sort((a, b) => a.giaban - b.giaban);
      } else if (this.sortOrder === 'priceDesc') {
        products = products.sort((a, b) => b.giaban - a.giaban);
      }

      return products;
    },
  },
  methods: {
    // ======================== UTILITIES ========================

    getStatusText(status) {
      if (status === 0) return 'Đang bán';
      if (status === 1) return 'Hết hàng';
      if (status === 2) return 'Dừng bán';
      return 'Không xác định';
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    toCategorizeProduct() {
      this.$router.push({ path: "/category" });
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    },
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('vi-VN', options);
    },

    // ======================== FETCH DATA ========================

    async fetchSanpham() {
      try {
        const response = await axios.get('https://localhost:7297/api/Sanpham/Admin');
        // Thêm trường isStopped để điều khiển switch Dừng bán
        this.sanphamList = response.data.map((product) => ({
          ...product,
          isStopped: product.trangthai === 2,
        }));
      } catch (error) {
        console.error('Có lỗi khi lấy danh sách sản phẩm:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi lấy danh sách sản phẩm.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      }
    },

    /**
     * Hàm lấy danh sách thương hiệu còn hoạt động và thêm thương hiệu hiện tại nếu nó không còn hoạt động.
     * @param {Number|null} selectedBrandId - ID của thương hiệu được chọn (nếu có)
     */
    async fetchActiveBrands(selectedBrandId = null) {
      try {
        const response = await axios.get('https://localhost:7297/api/Thuonghieu/Admin');
        const brandsList = response.data;

        // Lọc những thương hiệu còn hoạt động
        let activeBrands = brandsList.filter((brand) => brand.tinhtrang === 0);

        if (selectedBrandId !== null) {
          const currentBrand = brandsList.find((brand) => brand.id === selectedBrandId);
          if (currentBrand && currentBrand.tinhtrang !== 0) {
            activeBrands.push(currentBrand);
          }
        }

        // Sắp xếp theo tên thương hiệu
        activeBrands.sort((a, b) => a.tenthuonghieu.localeCompare(b.tenthuonghieu));

        this.activeBrands = activeBrands;
      } catch (error) {
        console.error("Có lỗi khi tải thương hiệu:", error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi tải danh sách thương hiệu.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      }
    },

    // ======================== XỬ LÝ HÌNH ẢNH ========================

    async uploadImage(file) {
      // Chuẩn bị formData để gửi file lên API
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          'https://localhost:7297/api/Images/upload',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        // Giả sử API trả về { url: '...' }
        return response.data.url;
      } catch (error) {
        console.error('Có lỗi khi upload hình ảnh:', error);
        throw new Error('Upload hình ảnh thất bại.');
      }
    },

    handleImageUpload(formType) {
      const fileInput =
        formType === 'add'
          ? this.$refs.addProductModal.querySelector('#productImage')
          : this.$refs.editProductModal.querySelector('#editProductImage');

      const file = fileInput.files[0];
      if (file) {
        this.uploadImage(file)
          .then((url) => {
            if (formType === 'add') {
              this.addForm.urlHinhanh = url;
              this.addForm.imagePreview = url;
            } else {
              this.editForm.urlHinhanh = url;
              this.editForm.imagePreview = url;
            }
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: error.message,
              background: '#1a202c',
              color: '#f8f9fa',
              confirmButtonColor: '#C10C99',
              cancelButtonColor: '#C10C99',
              iconColor: '#C10C99',
              buttonsStyling: true,
            });
            // Reset giá trị input file
            fileInput.value = '';
          });
      }
    },

    // ======================== MODAL THÊM SẢN PHẨM ========================

    openAddProductModal() {
      this.resetAddForm();
      this.fetchActiveBrands(); // Lấy danh sách thương hiệu hoạt động
      const modal = new bootstrap.Modal(this.$refs.addProductModal);
      modal.show();
    },
    closeAddProductModal() {
      const modal = bootstrap.Modal.getInstance(this.$refs.addProductModal);
      modal.hide();
    },
    resetAddForm() {
      this.addForm = {
        tensp: '',
        mota: '',
        giaban: null,
        idth: '',
        urlHinhanh: '',
        imagePreview: '',
        errors: {},
      };
    },
    async saveProduct() {
      // Validation thủ công
      this.addForm.errors = {};
      let isValid = true;

      if (!this.addForm.tensp.trim()) {
        this.addForm.errors.tensp = 'Vui lòng nhập tên sản phẩm.';
        isValid = false;
      }
      if (this.addForm.mota && this.addForm.mota.length > 200) {
        this.addForm.errors.mota = 'Mô tả không được vượt quá 200 ký tự.';
        isValid = false;
      }
      if (this.addForm.giaban === null || this.addForm.giaban < 0) {
        this.addForm.errors.giaban = 'Vui lòng nhập giá bán (không được nhỏ hơn 0).';
        isValid = false;
      }
      if (!this.addForm.idth) {
        this.addForm.errors.idth = 'Vui lòng chọn thương hiệu.';
        isValid = false;
      }
      if (!this.addForm.urlHinhanh) {
        this.addForm.errors.urlHinhanh = 'Vui lòng chọn ảnh sản phẩm.';
        isValid = false;
      }

      if (!isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Vui lòng kiểm tra lại thông tin nhập.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
        return;
      }

      // Tạo đối tượng sản phẩm
      const newProduct = {
        tensp: this.addForm.tensp,
        mota: this.addForm.mota,
        soluong: 0, // mặc định 0
        giaban: this.addForm.giaban,
        idth: this.addForm.idth,
        urlHinhanh: this.addForm.urlHinhanh,
      };

      try {
        const response = await axios.post(
          'https://localhost:7297/api/Sanpham/Admin',
          newProduct,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm sản phẩm thành công!',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });

        // Cập nhật danh sách hiển thị
        this.sanphamList.unshift({
          ...response.data,
          isStopped: response.data.trangthai === 2,
        });
        this.closeAddProductModal();
      } catch (error) {
        console.error('Có lỗi khi thêm sản phẩm:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi thêm sản phẩm.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      }
    },

    // ======================== MODAL SỬA SẢN PHẨM ========================

    async openEditProductModal(id) {
      try {
        // Gọi API để lấy thông tin sản phẩm
        const response = await axios.get(`https://localhost:7297/api/Sanpham/${id.id}/Admin`);
        const product = response.data;

        // Gán thông tin sản phẩm vào `editForm`
        this.editForm = {
          id: id,
          tensp: product.tensp,
          mota: product.mota,
          giaban: product.giaban,
          idth: product.idth,
          urlHinhanh: product.urlHinhanh,
          imagePreview: product.urlHinhanh || this.defaultImage,
          errors: {},
        };

        // Lấy danh sách thương hiệu, bao gồm cả thương hiệu hiện tại nếu nó không hoạt động
        await this.fetchActiveBrands(product.idth);

        // Hiển thị modal
        const modal = new bootstrap.Modal(this.$refs.editProductModal);
        modal.show();
      } catch (error) {
        console.error('Có lỗi khi lấy thông tin sản phẩm:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể lấy thông tin sản phẩm.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      }
    },

    closeEditProductModal() {
      const modal = bootstrap.Modal.getInstance(this.$refs.editProductModal);
      modal.hide();
    },
    async saveEditedProduct() {
      // Validation thủ công
      this.editForm.errors = {};
      let isValid = true;

      if (!this.editForm.tensp.trim()) {
        this.editForm.errors.tensp = 'Vui lòng nhập tên sản phẩm.';
        isValid = false;
      }
      if (this.editForm.mota && this.editForm.mota.length > 200) {
        this.editForm.errors.mota = 'Mô tả không được vượt quá 200 ký tự.';
        isValid = false;
      }
      if (this.editForm.giaban === null || this.editForm.giaban < 0) {
        this.editForm.errors.giaban = 'Vui lòng nhập giá bán (không được nhỏ hơn 0).';
        isValid = false;
      }
      if (!this.editForm.idth) {
        this.editForm.errors.idth = 'Vui lòng chọn thương hiệu.';
        isValid = false;
      }
      if (!this.editForm.urlHinhanh) {
        this.editForm.errors.urlHinhanh = 'Vui lòng chọn ảnh sản phẩm.';
        isValid = false;
      }

      if (!isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Vui lòng kiểm tra lại thông tin nhập.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
        return;
      }

      // Chuẩn bị dữ liệu để gửi
      const updatedProduct = {
        id: this.editForm.id.id,
        tensp: this.editForm.tensp,
        mota: this.editForm.mota,
        giaban: this.editForm.giaban,
        idth: this.editForm.idth,
        urlHinhanh: this.editForm.urlHinhanh,
      };

      try {
        // Gửi dữ liệu cập nhật lên API
        await axios.put(`https://localhost:7297/api/Sanpham/${this.editForm.id.id}/Admin`, updatedProduct);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật sản phẩm thành công!',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
        const modal = bootstrap.Modal.getInstance(this.$refs.editProductModal);
        modal.hide();

        // Cập nhật danh sách sản phẩm
        const index = this.sanphamList.findIndex(p => p.id === this.editForm.id);
        if (index !== -1) {
          this.sanphamList[index] = {
            ...this.sanphamList[index],
            ...updatedProduct,
            isStopped: updatedProduct.trangthai === 2, // Nếu có thuộc tính 'trangthai'
          };
        }

        // Hoặc nếu bạn muốn tái tải toàn bộ danh sách sản phẩm
        // this.fetchSanpham();
      } catch (error) {
        console.error('Có lỗi khi cập nhật sản phẩm:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể cập nhật sản phẩm.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      }
    },

    // ======================== PHÂN LOẠI & XÓA SẢN PHẨM ========================

    async categorizeProduct(id, name) {
      // Lưu thông tin tạm để chuyển sang trang phân loại
      localStorage.setItem('selectedProductId', id);
      localStorage.setItem('selectedProductName', name);
    },

    async deleteProduct(id) {
      // Sử dụng SweetAlert2 cho hộp thoại xác nhận
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Có, xóa nó!',
        cancelButtonText: 'Không, hủy bỏ',
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });

      if (!result.isConfirmed) return;

      // Thêm vào danh sách đang xóa để disable nút
      this.deletingIds.push(id);
      try {
        await axios.delete(`https://localhost:7297/api/Sanpham/${id}/Admin`);
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa',
          text: 'Xóa sản phẩm thành công!',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
        // Xóa khỏi danh sách
        this.sanphamList = this.sanphamList.filter((p) => p.id !== id);
      } catch (error) {
        console.error('Có lỗi khi xóa sản phẩm:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi xóa sản phẩm.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      } finally {
        // Bỏ ID khỏi danh sách đang xóa
        this.deletingIds = this.deletingIds.filter((itemId) => itemId !== id);
      }
    },

    // ======================== STOP SALE (DỪNG BÁN) ========================

    async toggleStopSale(product) {
      const newStatus = product.isStopped ? 2 : (product.soluong > 0 ? 0 : 1);

      try {
        await axios.put(
          `https://localhost:7297/api/Sanpham/${product.id}/update-status-load/Admin`,
          { trangthai: newStatus }
        );

        // Đồng bộ trạng thái với server
        product.trangthai = newStatus;
        product.isStopped = newStatus === 2;

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật trạng thái thành công!',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      } catch (error) {
        console.error('Có lỗi khi cập nhật trạng thái:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi cập nhật trạng thái.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });

        // Hoàn tác trạng thái nếu lỗi xảy ra
        product.isStopped = !product.isStopped;
      }
    },

    // ======================== XEM CHI TIẾT SẢN PHẨM ========================

    async viewProductDetail(id) {
      try {
        const response = await axios.get(
          `https://localhost:7297/api/Sanpham/${id}/Admin`
        );
        const product = response.data;

        // Lấy thêm thông tin thương hiệu
        const brandResponse = await axios.get(
          `https://localhost:7297/api/Thuonghieu/${product.idth}/Admin`
        );
        product.thuonghieu = brandResponse.data;

        this.detailProduct = product;
        const modal = new bootstrap.Modal(this.$refs.productDetailModal);
        modal.show();
      } catch (error) {
        console.error('Có lỗi khi lấy thông tin chi tiết sản phẩm:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi khi lấy thông tin chi tiết sản phẩm.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      }
    },
    closeProductDetailModal() {
      const modal = bootstrap.Modal.getInstance(this.$refs.productDetailModal);
      modal.hide();
    },

    // ======================== XEM ĐÁNH GIÁ SẢN PHẨM ========================

    async viewProductReviews(productId) {
      try {
        const response = await axios.get(
          `https://localhost:7297/api/Danhgia/ByProduct/${productId}/Admin`
        );
        this.reviews = response.data;

        // Lấy tên sản phẩm từ danh sách
        const product = this.sanphamList.find((p) => p.id === productId);
        this.reviewsProductName = product ? product.tensp : 'Không xác định';

        const modal = new bootstrap.Modal(this.$refs.productReviewsModal);
        modal.show();
      } catch (error) {
        console.error('Có lỗi khi lấy danh sách đánh giá:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi lấy danh sách đánh giá.',
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
      }
    },
    closeProductReviewsModal() {
      const modal = bootstrap.Modal.getInstance(this.$refs.productReviewsModal);
      modal.hide();
    },
  },
  mounted() {
    // Gọi API lấy dữ liệu khi component sẵn sàng
    window.addEventListener("toggle-sidebar", this.toggleSidebar);
    this.fetchSanpham();
    this.fetchActiveBrands(); // Lấy danh sách thương hiệu hoạt động cho mục thêm sản phẩm
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

.container {
  max-width: 100vw;
  margin: 0;
  padding: 0;
}

.modal-content {
  background-color: #1f1f1f !important;
  width: 100% !important;
  color: white;
}

.modal-content small {
  color: #C10C99;
}

.modal-header {
  border-color: #C10C99;
}

.modal-footer {
  border-color: #C10C99;
}

.card-footer .form-check {
  margin-left: auto;
}

.customAddBtn {
  background-color: transparent;
  color: #C10C99;
  padding: 6px 10px;
  border-radius: 12px;
  transition: .12s ease;
  border: 2px solid #C10C99;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.customAddBtn:hover {
  box-shadow: 0 0 2px 1px #C10C99;
}

.nav-link {
  color: #C10C99;
  font-weight: 600;
}

.nav-link:hover {
  color: #C10C99;
}

.form-check-input:checked {
  background-color: #C10C99;
  border-color: #C10C99;
}

.btn-close {
  background-color: #C10C99;
  border-radius: 50%;
  transition: .12s ease;
}

.btn-close:hover {
  background-color: #c252a9;
}

.customBtn {
  background-color: transparent;
  color: #C10C99;
  padding: 6px 10px;
  border-radius: 12px;
  transition: .12s ease;
  border: 2px solid #C10C99;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.customBtn:hover {
  box-shadow: 0 0 2px 1px #C10C99;
}
</style>
