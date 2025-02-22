<template> 
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container">
        <h1 class="invoice-title">Tạo hóa đơn bán hàng</h1>
        <div>
          <div class="card-body custom-card-body">
            <!-- Tabs for Invoices -->
            <ul class="nav nav-tabs mb-3" id="invoice-tabs" role="tablist">
              <li
                class="nav-item invoice-tab-item"
                v-for="(invoice, index) in invoices"
                :key="invoice.id"
              >
                <a
                  class="nav-link flex-grow-1 customNavlink"
                  :class="{ active: activeInvoiceId === invoice.id }"
                  href="#"
                  @click.prevent="setActiveInvoice(invoice.id)"
                  style="padding-right: 35px;"
                >
                  Hóa đơn {{ index + 1 }}
                </a>
                <button
                  class="btn btn-danger btn-sm close-btn ms-2 customCloseBtn"
                  @click.prevent="removeInvoice(invoice.id)"
                  title="Xóa Hóa đơn"
                >
                  <i class="pi pi-times" style="font-size: 12px;"></i>
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="btn custom-btn-success"
                  title="Thêm Hóa đơn"
                  @click="addInvoice"
                  :disabled="invoices.length >= maxInvoices"
                >
                  <i class="pi pi-plus" style="font-size: 16px;"></i>
                </button>
              </li>
            </ul>

            <!-- Main Content Row -->
            <div class="row">
              <!-- Customer Information Column -->
              <div class="col-lg-3 col-md-4 col-sm-12">
                <div class="card mb-4">
                  <div class="card-header custom-card-header-secondary d-flex justify-content-between align-items-center">
                    <span class="card-header-title" style="font-weight: 700;">Thông tin khách hàng</span>
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <div class="card-body">
                    <form>
                      <!-- Customer Type -->
                      <div class="mb-3">
                        <label for="customerType" class="form-label"><strong>Loại Khách Hàng:</strong></label>
                        <select
                          class="form-select"
                          id="customerType"
                          v-model="activeInvoice.customer.type"
                          @change="handleCustomerTypeChange(activeInvoice.id)"
                        >
                          <option value="regular">Khách Lẻ</option>
                          <option value="loyal">Khách Hàng Thân Thiết</option>
                        </select>
                      </div>

                      <!-- Customer Name for Regular Customers -->
                      <div class="mb-3" v-if="activeInvoice.customer.type === 'regular'">
                        <label for="customerName" class="form-label"><strong>Tên Khách Hàng:</strong></label>
                        <input
                          type="text"
                          class="form-control"
                          id="customerName"
                          v-model="activeInvoice.customer.name"
                          placeholder="Nhập tên khách hàng"
                          @input="updateCustomerName(activeInvoice.id)"
                        />
                      </div>

                      <!-- Customer Search for Loyal Customers -->
                      <div class="mb-3 position-relative" v-else>
                        <label for="customerSearch" class="form-label"><strong>Tìm Kiếm Khách Hàng:</strong></label>
                        <input
                          type="text"
                          class="form-control"
                          id="customerSearch"
                          v-model="activeInvoice.customer.searchQuery"
                          placeholder="Tìm kiếm tên, SĐT, email..."
                          @input="searchCustomer(activeInvoice.id)"
                          autocomplete="off"
                        />
                        <div v-if="activeInvoice.customer.searchResults.length" class="mt-1 search-results shadow">
                          <div
                            v-for="customer in activeInvoice.customer.searchResults"
                            :key="customer.id"
                            class="search-result-item p-2 border-bottom bg-white"
                            @click="selectCustomer(activeInvoice.id, customer)"
                          >
                            <strong>{{ customer.ten }}</strong> - {{ customer.sdt }} - {{ customer.email }}
                          </div>
                        </div>
                      </div>

                      <!-- Payment Method -->
                      <div class="mb-3">
                        <label for="paymentMethod" class="form-label"><strong>Phương Thức Thanh Toán:</strong></label>
                        <select
                          class="form-select"
                          id="paymentMethod"
                          v-model="activeInvoice.customer.paymentMethod"
                        >
                          <option value="cash">Tiền mặt</option>
                          <option value="bank-transfer">Chuyển khoản</option>
                        </select>
                      </div>

                      <!-- Vouchers for Loyal Customers -->
                      <div class="mb-3" v-if="activeInvoice.customer.type === 'loyal'">
                        <label for="selectedVoucher" class="form-label"><strong>Giảm Giá:</strong></label>
                        <select
                          class="form-select"
                          id="selectedVoucher"
                          v-model="activeInvoice.customer.selectedVoucher"
                          @change="calculateDiscount(activeInvoice.id)"
                        >
                          <option value="">Chọn giảm giá</option>
                          <option
                            v-for="voucher in activeInvoice.customer.vouchers"
                            :key="voucher.id"
                            :value="voucher"
                          >
                            {{ voucher.mota }}
                          </option>
                        </select>
                      </div>

                      <!-- Points Used for Loyal Customers -->
                      <div class="mb-3" v-if="activeInvoice.customer.type === 'loyal'">
                        <label for="pointsUsed" class="form-label"><strong>Điểm Sử Dụng:</strong></label>
                        <div class="d-flex justify-content-between align-items-center">
                          <span>Điểm có thể sử dụng: {{ activeInvoice.customer.availablePoints }}</span>
                          <input
                            type="number"
                            class="form-control w-50"
                            id="pointsUsed"
                            v-model.number="activeInvoice.customer.pointsUsed"
                            @input="applyPoints(activeInvoice.id)"
                            min="0"
                            :max="activeInvoice.customer.availablePoints"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </form>

                    <hr />

                    <!-- Invoice Totals and Submit Button -->
                    <div class="mt-3">
                      <p>
                        <strong>Tổng tiền hàng:</strong>
                        <span class="float-end">{{ formatCurrency(totalAmountBeforeDiscount) }}</span>
                      </p>
                      <p>
                        <strong>Tổng Giảm Giá:</strong>
                        <span class="float-end">{{ formatCurrency(totalDiscount) }}</span>
                      </p>
                      <p>
                        <strong>Tổng tiền thanh toán:</strong>
                        <span class="float-end">{{ formatCurrency(totalAmount) }}</span>
                      </p>
                      <div class="mb-3 mt-3">
                        <label for="cashGiven" class="form-label"><strong>Số Tiền Khách Đưa:</strong></label>
                        <input
                          type="text"
                          class="form-control"
                          id="cashGiven"
                          v-model="activeInvoice.customer.cashGivenFormatted"
                          placeholder="Nhập số tiền khách đưa"
                          @input="onCashGivenInput(activeInvoice.id)"
                        />
                      </div>
                      <p>
                        <strong>Tiền thừa:</strong>
                        <span class="float-end">{{ formatCurrency(changeAmount) }}</span>
                      </p>
                      <button
                        class="btn custom-btn-primary w-100 mt-3"
                        style="color: white; font-weight: 600;"
                        @click="submitInvoice"
                      >
                        Thanh toán
                      </button>
                    </div>
                  </div>
                </div> <!-- End of .row -->
              </div>
                  <!-- Product Area Column -->
                  <div class="col-lg-9 col-md-8 col-sm-12">
                    <!-- Product Search -->
                    <div class="row align-items-center mb-3">
                      <div class="position-relative w-100">
                        <input
                          type="text"
                          class="form-control"
                          v-model="activeInvoice.productSearchQuery"
                          placeholder="Tìm kiếm sản phẩm..."
                          @input="searchProduct"
                          autocomplete="off"
                          style="min-width: 100%;"
                        />
                        <p class="mb-2 customer-name" style="color: white; margin-top: 20px;">
                          <strong>Tên khách hàng:</strong> {{ activeInvoice.customer.selectedCustomerName || 'Chưa chọn' }}
                        </p>
                        <div v-if="activeInvoice.productSearchResults.length" class="search-results">
                          <div
                            v-for="product in activeInvoice.productSearchResults"
                            :key="product.id"
                            class="search-result-item"
                            @click="addProductToInvoice(product)"
                          >
                            <img :src="product.urlHinhanh" alt="Product Image" />
                            <div>
                              <strong>{{ product.tensp }}</strong>
                              <br />
                              {{ formatCurrency(product.giaban) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Products Table -->
                    <div class="table-responsive">
                      <table class="table table-hover">
                        <thead class="table-light">
                          <tr>
                            <th>Tên Sản Phẩm</th>
                            <th>Giá bán</th>
                            <th>Giá giảm</th>
                            <th>Phân loại</th>
                            <th>Số Lượng</th>
                            <th>Thành Tiền</th>
                            <th>Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in activeInvoice.products || []"
                            :key="item.id"
                          >
                            <td>{{ item.tensp }}</td>
                            <td>{{ formatCurrency(item.giaban) }}</td>
                            <td>{{ formatCurrency(item.giagiam) }}</td>
                            <td>
                              <select
                                class="form-select form-select-sm attribute-select"
                                v-model="item.selectedAttribute.idspct"
                                @change="updatePrice(activeInvoice.id, item)"
                                :disabled="item.isLocked" 
                              >
                                <option
                                  v-for="attr in getAvailableAttributesForProduct(item)"
                                  :key="attr.idspct"
                                  :value="attr.idspct"
                                >
                                  {{ attr.spctAttributes }}
                                </option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                class="form-control form-control-sm quantity-input"
                                v-model.number="item.quantity"
                                @input="updateTotal(activeInvoice.id)"
                                :max="item.selectedAttribute.soluong"
                                min="1"
                                style="width: 80px;"
                              />
                            </td>
                            <td>{{ formatCurrency(item.totalPrice) }}</td>
                            <td>
                              <button
                                class="btn btn-danger btn-sm"
                                @click="removeProduct(activeInvoice.id, item.id)"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                          <tr v-if="activeInvoice.products.length === 0">
                            <td colspan="7" class="text-center">Chưa có sản phẩm nào trong hóa đơn.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                </div> <!-- End of .row -->
              </div>
            </div>
          </div>
        </main>
      </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { globalState } from '../../store';

// Khởi tạo danh sách hóa đơn
const invoices = ref([
  {
    id: 1,
    products: [],
    productSearchQuery: '',
    productSearchResults: [],
    customer: {
      type: 'regular',
      name: '',
      selectedCustomerId: null,
      selectedCustomerName: '',
      searchQuery: '',
      searchResults: [],
      availablePoints: 0,
      pointsUsed: 0,
      maxPointsUsable: 0,
      vouchers: [],
      selectedVoucher: null,
      paymentMethod: 'cash',
      cashGiven: 0,
      cashGivenFormatted: '',
    }
  }
]);

const invoiceCount = ref(1);
const maxInvoices = 3;
const activeInvoiceId = ref(1);

// Computed property để lấy hóa đơn hiện tại
const activeInvoice = computed(() => {
  return invoices.value.find(inv => inv.id === activeInvoiceId.value);
});

// Tính tổng tiền trước giảm giá
const totalAmountBeforeDiscount = computed(() => {
  if (!activeInvoice.value) return 0;
  return activeInvoice.value.products.reduce((sum, product) => sum + product.totalPrice, 0);
});

// Tính tổng giảm giá
const totalDiscount = computed(() => {
  if (!activeInvoice.value) return 0;
  let discount = 0;
  const invoice = activeInvoice.value;
  if (invoice.customer.selectedVoucher) {
    const voucher = invoice.customer.selectedVoucher;
    if (voucher.donvi === 0) { // Giảm giá cố định
      discount += voucher.giatri;
    } else if (voucher.donvi === 1) { // Giảm giá theo %
      discount += (totalAmountBeforeDiscount.value * voucher.giatri) / 100;
    }
  }
  discount += invoice.customer.pointsUsed;
  return Math.min(discount, totalAmountBeforeDiscount.value);
});

// Tính tổng tiền thanh toán
const totalAmount = computed(() => {
  return totalAmountBeforeDiscount.value - totalDiscount.value;
});

// Tính tiền thừa
const changeAmount = computed(() => {
  if (!activeInvoice.value) return 0;
  return (activeInvoice.value.customer.cashGiven || 0) - totalAmount.value;
});

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm thêm sản phẩm vào hóa đơn với yêu cầu chọn phân loại
async function addProductToInvoice(product) {
  const invoice = activeInvoice.value;
  if (!invoice) {
    Swal.fire('Lỗi', 'Không tìm thấy hóa đơn hiện tại.', 'error');
    return;
  }

  try {
    const response = await fetch(`https://localhost:7297/api/Sanpham/active-products-with-attributes/Admin?id=${product.id}`);
    let attributesData = await response.json();

    // Lọc các phân loại đã được thêm vào hóa đơn
    const existingAttributes = invoice.products
      .filter(p => p.productId === product.id)
      .map(p => p.selectedAttribute.idspct);
    const availableAttributes = attributesData.filter(attr => !existingAttributes.includes(attr.idspct));

    if (availableAttributes.length === 0) {
      Swal.fire('Thông báo', 'Tất cả phân loại của sản phẩm này đã được thêm vào hóa đơn!', 'info');
      return;
    }

    // Tạo đối tượng cho lựa chọn phân loại
    const classificationOptions = availableAttributes.reduce((options, attr) => {
      options[attr.idspct] = attr.spctAttributes;
      return options;
    }, {});

    // Hiển thị hộp thoại chọn phân loại
    const { value: selectedId } = await Swal.fire({
      title: 'Chọn phân loại sản phẩm',
      input: 'select',
      inputOptions: classificationOptions,
      inputPlaceholder: 'Chọn phân loại',
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve();
          } else {
            resolve('Bạn cần chọn một phân loại!');
          }
        });
      },
    });

    if (!selectedId) {
      // Người dùng hủy bỏ hoặc không chọn phân loại
      return;
    }

    // Chuyển đổi selectedId từ string sang number
    const selectedAttribute = availableAttributes.find(attr => attr.idspct === Number(selectedId));

    if (!selectedAttribute) {
      Swal.fire('Lỗi', 'Phân loại không hợp lệ.', 'error');
      return;
    }

    const productPrice = selectedAttribute.giathoidiemhientai || product.giaban;

    const newProduct = {
      id: Date.now(), // ID duy nhất cho sản phẩm trong hóa đơn
      productId: product.id,
      tensp: product.tensp,
      giaban: product.giaban,
      giagiam: productPrice,
      attributes: availableAttributes,
      selectedAttribute: selectedAttribute,
      quantity: 1,
      totalPrice: productPrice,
        isLocked: true 
    };

    invoice.products.push(newProduct);
    invoice.productSearchQuery = '';
    invoice.productSearchResults = [];

    Swal.fire('Thành công', 'Đã thêm sản phẩm với phân loại đã chọn.', 'success');

  } catch (error) {
    console.error('Lỗi khi lấy thuộc tính sản phẩm:', error);
    Swal.fire('Lỗi', 'Không thể lấy thuộc tính của sản phẩm. Vui lòng thử lại sau.', 'error');
  }
}

// Hàm loại bỏ sản phẩm khỏi hóa đơn
function removeProduct(invoiceId, productId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    invoice.products = invoice.products.filter(p => p.id !== productId);
  }
}

// Hàm cập nhật giá và tổng tiền khi chọn phân loại
function updatePrice(invoiceId, product) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    const selectedAttr = invoice.products
      .find(p => p.id === product.id)
      .attributes.find(attr => attr.idspct === product.selectedAttribute.idspct);
    if (selectedAttr) {
      product.giagiam = selectedAttr.giathoidiemhientai || product.giaban;
      product.totalPrice = product.giagiam * product.quantity;
    }
  }
}

// Hàm cập nhật tổng tiền
function updateTotal(invoiceId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    invoice.products.forEach(product => {
      product.totalPrice = product.giagiam * product.quantity;
    });
  }
}

// Hàm lấy các phân loại khả dụng cho sản phẩm trong bảng
function getAvailableAttributesForProduct(product) {
  const existingAttributes = activeInvoice.value.products
    .filter(p => p.productId === product.productId && p.id !== product.id) // Loại bỏ chính sản phẩm hiện tại
    .map(p => p.selectedAttribute.idspct);
  return product.attributes.filter(attr => !existingAttributes.includes(attr.idspct));
}

// Hàm xử lý thay đổi loại khách hàng
function handleCustomerTypeChange(invoiceId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (!invoice) return;
  invoice.customer.selectedCustomerId = null;
  invoice.customer.selectedCustomerName = '';
  invoice.customer.selectedVoucher = null;
  invoice.customer.vouchers = [];
  invoice.customer.pointsUsed = 0;

  if (invoice.customer.type === 'regular') {
    invoice.customer.availablePoints = 0;
  } else if (invoice.customer.type === 'loyal') {
    // Bạn có thể thêm logic ở đây nếu cần
  }
}

// Hàm tìm kiếm khách hàng
function searchCustomer(invoiceId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  const searchQuery = invoice.customer.searchQuery.trim().toLowerCase();
  if (searchQuery === '') {
    invoice.customer.searchResults = [];
    return;
  }
  fetch(`https://localhost:7297/api/Khachhang/searchByEmailSdtTen/Admin?keyword=${encodeURIComponent(searchQuery)}`)
    .then(response => response.json())
    .then(data => {
      invoice.customer.searchResults = data || [];
    })
    .catch(error => {
      console.error('Lỗi khi tìm kiếm khách hàng:', error);
      invoice.customer.searchResults = [];
    });
}

// Hàm chọn khách hàng
function selectCustomer(invoiceId, customer) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    invoice.customer.selectedCustomerId = customer.id;
    invoice.customer.selectedCustomerName = customer.ten;
    invoice.customer.availablePoints = customer.diemsudung || 0; // Cập nhật điểm khả dụng từ khách hàng
    invoice.customer.pointsUsed = 0; // Reset điểm sử dụng khi chọn khách hàng mới
    
    loadDiscountVouchers(invoiceId, customer.id); // Tải lại voucher giảm giá

    // Xóa nội dung tìm kiếm khách hàng
    invoice.customer.searchQuery = '';
    invoice.customer.searchResults = [];
  }
}

// Hàm tải voucher giảm giá dựa trên khách hàng
function loadDiscountVouchers(invoiceId, customerId) {
  fetch(`https://localhost:7297/api/Giamgia/vouchers-by-customer/${customerId}/Admin`)
    .then(response => response.json())
    .then(data => {
      const invoice = invoices.value.find(inv => inv.id === invoiceId);
      if (invoice) {
        const activeVouchers = data.filter(voucher => voucher.trangthai === 0);
        invoice.customer.vouchers = activeVouchers;
        if (activeVouchers.length === 0) {
          invoice.customer.vouchers = [];
        }
      }
    })
    .catch(error => {
      console.error('Error fetching vouchers by customer:', error);
      const invoice = invoices.value.find(inv => inv.id === invoiceId);
      if (invoice) {
        invoice.customer.vouchers = [];
      }
    });
}

// Hàm tính toán giảm giá dựa trên voucher
function calculateDiscount(invoiceId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    const selectedVoucher = invoice.customer.selectedVoucher;
    if (selectedVoucher) {
      let discount = 0;
      if (selectedVoucher.donvi === 0) {
        discount = selectedVoucher.giatri;
      } else if (selectedVoucher.donvi === 1) {
        discount = (totalAmountBeforeDiscount.value * selectedVoucher.giatri) / 100;
      }
      invoice.customer.discount = Math.min(discount, totalAmountBeforeDiscount.value);
    }
  }
}

// Hàm áp dụng điểm sử dụng
function applyPoints(invoiceId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    const totalPayment = totalAmount.value; // Tổng tiền thanh toán
    const availablePoints = invoice.customer.availablePoints; // Điểm có thể sử dụng

    if (totalPayment <= availablePoints) {
      invoice.customer.pointsUsed = totalPayment; // Điểm sử dụng = Tổng tiền thanh toán
    } else {
      invoice.customer.pointsUsed = availablePoints; // Điểm sử dụng = Điểm khả dụng
    }
  }
}

// Hàm xử lý nhập số tiền khách đưa
function onCashGivenInput(invoiceId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  // Lấy giá trị số tiền nhập vào, bỏ đi các ký tự không phải số
  let value = invoice.customer.cashGivenFormatted.replace(/\D/g, '');

  if (value.length === 0) {
    invoice.customer.cashGiven = 0;
    invoice.customer.cashGivenFormatted = ''; // Làm rỗng trường nhập liệu
    return;
  }

  const numericValue = parseInt(value, 10) || 0;
  invoice.customer.cashGiven = numericValue;
  invoice.customer.cashGivenFormatted = numericValue.toLocaleString('vi-VN');
}

// Hàm gửi yêu cầu tạo hóa đơn
async function submitInvoice() {
  const invoice = activeInvoice.value;

  if (!invoice) {
    Swal.fire('Lỗi', 'Không tìm thấy hóa đơn hiện tại.', 'error');
    return;
  }
  if (!invoice.products || invoice.products.length === 0) {
    Swal.fire('Lỗi', 'Hóa đơn chưa có sản phẩm nào. Vui lòng thêm sản phẩm trước khi thanh toán.', 'warning');
    return;
  }
  if (invoice.customer.type === 'loyal' && !invoice.customer.selectedCustomerId) {
    Swal.fire('Lỗi', 'Vui lòng chọn thông tin khách hàng thân thiết.', 'warning');
    return;
  }
  if (invoice.customer.cashGiven < totalAmount.value) {
    Swal.fire('Lỗi', 'Số tiền khách đưa không đủ để thanh toán.', 'error');
    return;
  }

  // Dữ liệu chi tiết sản phẩm
  const productDetails = invoice.products.map(product => ({
    idspct: product.selectedAttribute.idspct,
    soluong: product.quantity,
    giasp: product.giaban,
    giamgia: product.selectedAttribute.giathoidiemhientai,
  }));

  // Kiểm tra loại khách hàng
  let requestData;
  let apiUrl;
  if (invoice.customer.type === 'loyal') {
    const customerData = await fetchCustomerById(invoice.customer.selectedCustomerId);
    console.log(customerData);
    if (!customerData) {
      Swal.fire('Lỗi', 'Không thể lấy thông tin khách hàng thân thiết.', 'error');
      return;
    }

    const diemSuDung = invoice.customer.pointsUsed || 0; 
    apiUrl = `https://localhost:7297/api/Hoadon/create/khtt?diemSuDung=${diemSuDung}`;

    requestData = {
      idnv: globalState.userId, // ID nhân viên
      idkh: invoice.customer.selectedCustomerId || 0, // ID khách hàng thân thiết
      tongtiencantra: totalAmount.value, // Tổng tiền cần trả
      tongtiensanpham: totalAmountBeforeDiscount.value, // Tổng tiền sản phẩm trước giảm giá
      sdt: customerData || '', // Số điện thoại của khách hàng
      tonggiamgia: totalDiscount.value, 
      idgg: invoice.customer.selectedVoucher ? invoice.customer.selectedVoucher.id : null, // ID giảm giá
      ghichu: '', 
      sanPhamChiTiet: productDetails, // Danh sách chi tiết sản phẩm
    };
  } else {
    apiUrl = 'https://localhost:7297/api/Hoadon/create';
    requestData = {
      idnv: globalState.userId, // ID nhân viên
      tongtiencantra: totalAmount.value, // Tổng tiền cần trả
      tongtiensanpham: totalAmountBeforeDiscount.value, // Tổng tiền sản phẩm trước giảm giá
      ghichu: '', // Ghi chú (nếu có)
      sanPhamChiTiet: productDetails, // Danh sách chi tiết sản phẩm
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json();
      Swal.fire('Lỗi', error.message || 'Không thể tạo hóa đơn. Vui lòng thử lại sau.', 'error');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Tạo hóa đơn thành công!',
      text: 'Hóa đơn đã được lưu.',
      confirmButtonText: 'Đóng',
    }).then(() => {
      resetInvoice(activeInvoiceId.value);
    });
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu:', error);
    Swal.fire('Lỗi', 'Không thể gửi yêu cầu. Vui lòng kiểm tra lại API.', 'error');
  }
}

// Hàm lấy khách hàng theo ID
async function fetchCustomerById(idkh) {
  try {
    const response = await fetch(`https://localhost:7297/api/Khachhang/${idkh}/Admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Lỗi khi lấy thông tin khách hàng:', error);
      return null;
    }

    const customerData = await response.json();
    
    return customerData.sdt;
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
    return null;
  }
}

// Hàm cập nhật tên khách hàng
function updateCustomerName(invoiceId) {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    invoice.customer.selectedCustomerName = invoice.customer.name;
  }
}

// Hàm tìm kiếm sản phẩm
function searchProduct() {
  const invoice = activeInvoice.value;
  if (!invoice) return;

  const searchQuery = invoice.productSearchQuery.trim().toLowerCase();
  if (searchQuery === '') {
    invoice.productSearchResults = [];
    return;
  }

  fetch(`https://localhost:7297/api/Sanpham/searchhd/Admin?name=${encodeURIComponent(searchQuery)}`)
    .then(response => response.json())
    .then(data => {
      invoice.productSearchResults = data || [];
    })
    .catch(error => {
      console.error('Lỗi khi tìm kiếm:', error);
      invoice.productSearchResults = [];
    });
}

// Hàm thêm hóa đơn mới
function addInvoice() {
  if (invoices.value.length >= maxInvoices) {
    Swal.fire('Thông báo', 'Chỉ được tạo tối đa 3 hóa đơn.', 'warning');
    return;
  }
  const newId = Date.now();
  invoices.value.push({
    id: newId,
    products: [],
    productSearchQuery: '', 
    productSearchResults: [],
    customer: {
      type: 'regular',
      name: '',
      selectedCustomerId: null,
      selectedCustomerName: '',
      searchQuery: '',
      searchResults: [],
      availablePoints: 0,
      pointsUsed: 0,
      maxPointsUsable: 0,
      vouchers: [],
      selectedVoucher: null,
      paymentMethod: 'cash',
      cashGiven: 0,
      cashGivenFormatted: '',
    }
  });
  activeInvoiceId.value = newId;
  invoiceCount.value++;
}

// Hàm loại bỏ hóa đơn
function removeInvoice(invoiceId) {
  invoices.value = invoices.value.filter(inv => inv.id !== invoiceId);
  if (activeInvoiceId.value === invoiceId && invoices.value.length > 0) {
    activeInvoiceId.value = invoices.value[0].id;
  }
  invoiceCount.value--;
}

// Hàm thiết lập hóa đơn hoạt động
function setActiveInvoice(invoiceId) {
  activeInvoiceId.value = invoiceId;
}

// Hàm reset hóa đơn sau khi thanh toán thành công
function resetInvoice(invoiceId) {
  const invoiceIndex = invoices.value.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex !== -1) {
    invoices.value.splice(invoiceIndex, 1, {
      id: Date.now(), // Tạo ID mới cho hóa đơn
      products: [],
      productSearchQuery: '',
      productSearchResults: [],
      customer: {
        type: 'regular',
        name: '',
        selectedCustomerId: null,
        selectedCustomerName: '',
        searchQuery: '',
        searchResults: [],
        availablePoints: 0,
        pointsUsed: 0,
        maxPointsUsable: 0,
        vouchers: [],
        selectedVoucher: null,
        paymentMethod: 'cash',
        cashGiven: 0,
        cashGivenFormatted: '',
      },
    });
    activeInvoiceId.value = invoices.value[invoiceIndex].id;
  }
}

const isSidebarOpen = ref(true);

// Lifecycle hook
onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  handleCustomerTypeChange(invoices.value[0].id);
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('input', () => {
      const max = parseInt(input.max, 10);
      const value = parseInt(input.value, 10);

      if (value > max) {
        input.value = max;
      }
    });
  });
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

.invoice-title {
  color: white;
  margin-bottom: 15px;
  font-weight: 700;
}

.invoice-tab-item {
  display: flex;
  align-items: center;
  position: relative;
  margin-right: 10px;
}

.invoice-tab-item .nav-link {
  flex-grow: 1;
  padding-right: 10px;
}

.invoice-tab-item .close-btn {
  padding: 0;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  line-height: 1;
}

.invoice-tab-item .close-btn:hover {
  background-color: #c82333;
}

.nav-tabs .nav-item {
  display: flex;
  align-items: center;
}

.nav-tabs .nav-link {
  padding-right: 25px; /* Đảm bảo có đủ không gian cho nút "Xóa" */
  position: relative;
}

/* Card tổng thể */
.custom-card-body {
  padding: 20px;
  background-image: linear-gradient(#1f1f1f, #c10c9a2d);
}

.custom-card-header-secondary {
  background-color: #C10C99; /* Màu hồng tím */
  color: white;
}

.custom-btn-primary {
  background-color: #C10C99; /* Màu hồng tím */
  border-color: #C10C99;
}

.custom-btn-primary:hover {
  background-color: #a00b85;
  border-color: #a00b85;
}

.custom-btn-success {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-btn-success:hover {
  color: #C10C99;
  background-color: white;
}

.custom-btn-success:disabled {
  color: #585257;
}

.row.align-items-center {
  margin-top: 1rem;
}

.row .form-control {
  width: calc(100% - 1rem);
  display: inline-block;
}

p.mb-0.customer-name {
  margin-left: 10px;
  display: inline-block;
  color: white;
}

.search-results {
  max-width: 100%; /* Đảm bảo không vượt quá khung */
  width: 300px; /* Đặt chiều rộng cụ thể */
  position: absolute;
  background-color: #fff;
  border: 1px solid #ddd;
  z-index: 1000;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 5px;
  cursor: pointer;
}

.search-result-item:hover {
  background-color: #f0f0f0;
}

.search-result-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 5px;
}

.search-result-item div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-light th {
  background-color: #f8f9fa !important; /* Đảm bảo màu nền của tiêu đề bảng */
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

/* Thẻ card thông tin khách hàng */
.card-header.custom-card-header-secondary {
  background-color: #C10C99;
  color: white;
}

.card {
  margin-bottom: 1rem;
}

.card-body {
  padding: 1rem;
}

.row.align-items-start {
  margin-bottom: 1rem;
}

.container {
  max-width: 100vw;
  margin: 0;
  padding: 0;
}

.customCloseBtn{
  position: absolute;
  right: 10px;
  top: 13px;
  background-color: transparent !important;
  color: #C10C99 !important;
}

.customNavlink {
  color: #C10C99;
}

.attribute-select {
  width: 100%;
}

.quantity-input {
  width: 80px;
}
</style>

