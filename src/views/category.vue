<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container">
      <!-- Card cho Form Nhập Số lượng và Mô tả -->
      <div class="card mb-4" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #c10c9a2d); color: white;">
        <div class="card-header">
          <h2 class="header">{{ formHeader }}</h2>
        </div>
        <div class="card-body">
          <div class="form-row">
            <!-- Nhập Số lượng -->
            <div class="form-group col-md-6">
              <label for="productQuantity">Số lượng</label>
              <input
                type="number"
                id="productQuantity"
                v-model.number="productQuantity"
                class="form-control"
                placeholder="Nhập số lượng"
                min="0"
                max="2000"
                required
              />
            </div>
            <!-- Nhập Mô tả -->
            <div class="form-group col-md-6">
              <label for="productDescription">Mô tả</label>
              <input
                type="text"
                id="productDescription"
                v-model="productDescription"
                class="form-control"
                placeholder="Nhập mô tả"
                maxlength="400"
              />
            </div>
          </div>
          <!-- Card cho Thuộc Tính -->
          <div class="card mt-4" style="background-color: #1f1f1f; color: white;">
            <div class="card-header" style="border-bottom: 2px solid #C10C99;">
              <h5 class="category-header" @click="toggleAttributeSection" style="margin-bottom: 0;">
                Thuộc Tính
                <span class="plus-icon-header">
                  <i class="pi" :class="isAttributeSectionOpen ? 'pi-minus' : 'pi-plus'"></i>
                </span>
              </h5>
            </div>
            <div v-if="isAttributeSectionOpen" class="card-body">
              <div class="category-options" id="attribute-options">
                <div
                  class="attribute-item"
                  v-for="attribute in attributes"
                  :key="attribute.id"
                >
                  <div class="attribute-name">
                    {{ attribute.tenthuoctinh }}
                    <span
                      class="add-detail-icon"
                      @click="addNewDetail(attribute.id, attribute)"
                      title="Thêm chi tiết"
                    >
                      <i class="pi pi-plus-circle"></i>
                    </span>
                  </div>
                  <div class="details">
                    <button
                      class="btn btn-outline-primary detail-button"
                      :class="{ selected: isDetailSelected(attribute.id, detail.tenthuoctinhchitiet) }"
                      v-for="detail in attribute.details"
                      :key="detail.id || detail.tenthuoctinhchitiet"
                      @click="selectDetail(attribute.id, detail.tenthuoctinhchitiet)"
                    >
                      {{ detail.tenthuoctinhchitiet }}
                    </button>
                  </div>
                </div>
                <div class="mt-3">
                  <button
                    class="btn-add-product"
                    @click="handleAddOrUpdateProduct"
                  >
                    {{ isEditing ? 'Cập nhật sản phẩm' : 'Thêm phân loại sản phẩm' }}
                  </button>
                  <button
                    v-if="isEditing"
                    class="btn btn-secondary"
                    id="btn-cancel-edit"
                    @click="cancelEdit"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Card cho Bảng Danh sách Sản phẩm -->
      <div class="card" style="background-color: transparent !important; background-image: linear-gradient(#c10c9a2d, #1f1f1f); color: white;">
        <div class="card-header">
          <h3>Danh Sách Sản Phẩm</h3>
        </div>
        <div class="card-body">
          <table class="table table-bordered product-table">
            <thead class="thead-dark">
              <tr>
                <th>Tên sản phẩm</th>
                <th>Phân loại</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
                <th>Chuyển trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" style="vertical-align: middle;">
                <td>{{ productName }}</td>
                <td>{{ product.categories }}</td>
                <td>{{ product.mota || 'Chưa có mô tả' }}</td>
                <td>{{ product.giathoidiemhientai || 'Chưa có giá' }}</td>
                <td>{{ product.soluong || 0 }}</td>
                <td>{{ getStatusText(product.trangthai) }}</td>
                <td>
                  <input
                    type="checkbox"
                    class="switch-toggle"
                    :checked="isStatusChecked(product.trangthai)"
                    @change="toggleProductStatus(product)"
                  />
                </td>
                <td style="display: flex; justify-content: center; gap: 20px;">
                  <button class="btn btn-info edit-icon" @click="editProduct(product.id)" style="color: white;">
                    <i class="fa fa-edit"></i> Sửa
                  </button>
                  <button class="btn btn-danger delete-icon" @click="deleteProduct(product.id)">
                    <i class="fa fa-trash"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

// Lấy thông tin từ localStorage
const productId = localStorage.getItem('selectedProductId');
const productName = localStorage.getItem('selectedProductName');

// Reactive state
const formHeader = ref('PHÂN LOẠI SẢN PHẨM');
const productQuantity = ref('');
const productDescription = ref('');
const attributes = reactive([]);
const products = reactive([]);
const isEditing = ref(false);
const currentEditingProductId = ref(null);
const isAttributeSectionOpen = ref(true);

// Định nghĩa temporaryDetails là một đối tượng phản ứng
const temporaryDetails = reactive({});

// Cache attributes
let cachedAttributes = null;

// Helper function to fetch ID by attribute name
const getIdttByName = async (tenthuoctinh) => {
  try {
    if (!cachedAttributes) {
      const response = await fetch('https://localhost:7297/api/Thuoctinh/Admin');
      cachedAttributes = await response.json();
    }
    const attribute = cachedAttributes.find(
      (attr) => attr.tenthuoctinh.toLowerCase() === tenthuoctinh.toLowerCase()
    );
    return attribute ? attribute.id : null;
  } catch (error) {
    console.error('Lỗi khi lấy idtt:', error);
    return null;
  }
};

// Fetch product categories
const fetchProductCategories = async (Id) => {
  try {
    const response = await fetch('https://localhost:7297/api/Thuoctinhsanphamchitiet/Admin');
    const details = await response.json();
    const categories = details.filter((danhgia) => danhgia.idspct == Id);
    const categoryNames = categories.map((category) => category.tenthuoctinhchitiet);
    return categoryNames.join(', ') || 'Chưa có phân loại';
  } catch (error) {
    console.error('Lỗi khi lấy phân loại sản phẩm:', error);
    return 'Chưa có phân loại';
  }
};

// Fetch all product details
const fetchProductDetails = async () => {
  try {
    const response = await fetch('https://localhost:7297/api/Sanphamchitiet/Admin');
    const allProducts = await response.json();
    const filteredProducts = allProducts.filter((product) => product.idsp == productId);

    if (filteredProducts.length > 0) {
      for (const product of filteredProducts) {
        const categories = await fetchProductCategories(product.id);
        products.push({
          ...product,
          categories,
        });
      }
    } else {
      alert(`Không có sản phẩm nào phù hợp với sản phẩm ${productName}.`);
      console.log(productName);
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
  }
};

// Fetch attributes and their details
const fetchAttributesAndDetails = async () => {
  try {
    const attributesResponse = await fetch('https://localhost:7297/api/Thuoctinh/Admin');
    const fetchedAttributes = await attributesResponse.json();
    cachedAttributes = fetchedAttributes; // Lưu trữ vào cache

    for (const attribute of fetchedAttributes) {
      const attributeObj = {
        id: attribute.id,
        tenthuoctinh: attribute.tenthuoctinh,
        details: [],
      };

      const detailsResponse = await fetch(
        `https://localhost:7297/api/Thuoctinhsanphamchitiet/getbyidtt/${attribute.id}/Admin`
      );
      const details = await detailsResponse.json();

      if (details.length === 0) {
        attributeObj.details.push({
          id: null,
          tenthuoctinhchitiet: 'Không có chi tiết thuộc tính',
          selected: false,
        });
      } else {
        const uniqueDetails = new Set();
        details.forEach((detail) => {
          if (!uniqueDetails.has(detail.tenthuoctinhchitiet.toLowerCase())) {
            uniqueDetails.add(detail.tenthuoctinhchitiet.toLowerCase());
            attributeObj.details.push({
              ...detail,
              selected: false,
            });
          }
        });
      }

      attributes.push(attributeObj);
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
  }
};

// Phương thức thêm chi tiết mới
const addNewDetail = (attributeId, attributeObj) => {
  const tenthuoctinhchitiet = prompt('Nhập tên thuộc tính chi tiết mới:');

  if (tenthuoctinhchitiet) {
    const newDetailName = tenthuoctinhchitiet.trim();
    if (newDetailName === '') {
      alert('Tên thuộc tính chi tiết không được để trống.');
      return;
    }

    // Kiểm tra xem chi tiết đã tồn tại chưa (không phân biệt hoa thường)
    const existingDetails = attributeObj.details.map(detail =>
      detail.tenthuoctinhchitiet.toLowerCase()
    );
    if (existingDetails.includes(newDetailName.toLowerCase())) {
      alert('Tên thuộc tính chi tiết đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }

    // Thêm vào temporaryDetails
    if (!temporaryDetails[attributeId]) {
      temporaryDetails[attributeId] = [];
    }
    temporaryDetails[attributeId].push(newDetailName);

    attributeObj.details.push({
      id: null, // Hoặc gán ID tạm thời nếu cần
      tenthuoctinhchitiet: newDetailName,
      selected: false,
    });
  }
};

// Toggle attribute section visibility
const toggleAttributeSection = () => {
  isAttributeSectionOpen.value = !isAttributeSectionOpen.value;
};

// Select a detail
const selectDetail = (attributeId, detailName) => {
  const attribute = attributes.find((attr) => attr.id === attributeId);
  if (!attribute) return;

  attribute.details.forEach((detail) => {
    if (detail.tenthuoctinhchitiet === detailName) {
      detail.selected = !detail.selected;
    } else {
      detail.selected = false;
    }
  });
};

// Check if a detail is selected
const isDetailSelected = (attributeId, detailName) => {
  const attribute = attributes.find((attr) => attr.id === attributeId);
  if (!attribute) return false;
  const detail = attribute.details.find(
    (d) => d.tenthuoctinhchitiet === detailName
  );
  return detail ? detail.selected : false;
};

// Handle adding or updating product
const handleAddOrUpdateProduct = async () => {
  if (isEditing.value) {
    await updateProduct();
  } else {
    await addNewProduct();
  }
};

// Add new product with validation
const addNewProduct = async () => {
  try {
    const mota = productDescription.value.trim();
    const soluong = parseInt(productQuantity.value) || 0;
    const trangthai = soluong > 0 ? 0 : 1;
    const selectedAttributes = getSelectedAttributes();
    const thuoctinhchitiets = [];

    // Thu thập các lỗi
    const errorMessages = [];

    // Kiểm tra số lượng
    if (soluong < 0 || soluong > 2000) {
      errorMessages.push('Số lượng sản phẩm phải nằm trong khoảng từ 0 đến 2000.');
    }

    // Kiểm tra mô tả
    if (mota.length > 400) {
      errorMessages.push('Mô tả sản phẩm không được vượt quá 400 ký tự.');
    }

    if (mota.length === 0) {
      errorMessages.push('Vui lòng nhập mô tả sản phẩm.');
    }

    // Kiểm tra rằng mỗi thuộc tính đều có ít nhất một chi tiết được chọn
    const attributesWithoutSelection = attributes.filter(attr => {
      return !selectedAttributes.some(selected => selected.name === attr.tenthuoctinh);
    });

    if (attributesWithoutSelection.length > 0) {
      const names = attributesWithoutSelection.map(attr => attr.tenthuoctinh).join(', ');
      errorMessages.push(`Vui lòng chọn ít nhất một chi tiết cho các thuộc tính: ${names}.`);
    }

    // Nếu có bất kỳ lỗi nào, hiển thị thông báo và dừng xử lý
    if (errorMessages.length > 0) {
      alert(errorMessages.join('\n'));
      return;
    }

    for (const attribute of selectedAttributes) {
      const tenthuoctinhchitiet = attribute.detail;
      const tenThuocTinh = attribute.name;
      const idtt = await getIdttByName(tenThuocTinh);

      if (idtt) {
        thuoctinhchitiets.push({ idtt, tenthuoctinhchitiet: tenthuoctinhchitiet });
      } else {
        errorMessages.push(`Không tìm thấy ID cho thuộc tính chi tiết: ${tenthuoctinhchitiet}`);
        alert(errorMessages.join('\n'));
        return;
      }
    }

    if (!mota || thuoctinhchitiets.length === 0) {
      alert('Vui lòng nhập đầy đủ thông tin và chọn ít nhất một thuộc tính chi tiết.');
      return;
    }

    // Validation: Kiểm tra phân loại thuộc tính đã tồn tại
    const newClassification = thuoctinhchitiets
      .map(d => d.tenthuoctinhchitiet.trim().toLowerCase())
      .sort()
      .join(', ');

    const isDuplicate = products.some(product => {
      const existingClassification = product.categories
        .split(',')
        .map(c => c.trim().toLowerCase())
        .sort()
        .join(', ');
      return existingClassification === newClassification;
    });

    if (isDuplicate) {
      alert('Phân loại thuộc tính đã tồn tại cho sản phẩm này. Vui lòng chọn phân loại khác.');
      return;
    }

    // Lấy thông tin sản phẩm để lấy giá
    let giaban = 0;
    try {
      const response = await fetch(`https://localhost:7297/api/Sanpham/${productId}/Admin`, {
        method: 'GET',
      });
      const result = await response.json();
      giaban = result.giaban || 0;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sản phẩm:', error);
      alert('Có lỗi xảy ra khi lấy thông tin sản phẩm.');
      return;
    }

    const data = {
      mota,
      trangthai,
      giathoidiemhientai: giaban,
      soluong,
      idsp: productId,
      thuoctinhchitiets,
    };

    // Gửi yêu cầu thêm mới phân loại sản phẩm
    const response = await fetch(
      'https://localhost:7297/api/Thuoctinhsanphamchitiet/AddThuoctinhToSanphamchitiet/Admin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      alert('Phân loại sản phẩm đã được thêm thành công!');
      // Cập nhật số lượng sản phẩm
      const updateQuantityResponse = await fetch(
        `https://localhost:7297/api/Sanpham/${productId}/add-soluong/Admin`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ SoluongThem: soluong }),
        }
      );

      if (updateQuantityResponse.ok) {
        alert('Số lượng sản phẩm đã được cập nhật thành công!');
        resetForm();
        products.splice(0, products.length); // Xóa danh sách hiện tại
        await fetchProductDetails(); // Làm mới danh sách sản phẩm
      } else {
        let errorMessage = 'Lỗi khi cập nhật số lượng sản phẩm!';
        try {
          const errorResult = await updateQuantityResponse.json();
          errorMessage = errorResult.message || errorMessage;
        } catch (e) {
          console.error('Không thể phân tích JSON lỗi từ cập nhật số lượng.');
        }
        alert(errorMessage);
        console.error(await updateQuantityResponse.text());
      }
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.message || 'Vui lòng thử lại.';
      alert(`Lỗi sản phẩm chi tiết: ${errorMessage}`);
      console.error('Chi tiết lỗi:', errorData);
    }

    
  } catch (error) {
    alert('Lỗi kết nối với API.');
    console.error(error);
  }
};



// Get selected attributes
const getSelectedAttributes = () => {
  const selected = [];
  attributes.forEach((attribute) => {
    attribute.details.forEach((detail) => {
      if (detail.selected) {
        selected.push({
          name: attribute.tenthuoctinh,
          detail: detail.tenthuoctinhchitiet,
        });
      }
    });
  });
  return selected;
};

// Update existing product
const updateProduct = async () => {
try {
  const mota = productDescription.value.trim();
  const soluong = parseInt(productQuantity.value);
  const trangthai = soluong > 0 ? 0 : 1;
  const selectedAttributes = getSelectedAttributes();
  const thuoctinhchitiets = [];

  // Thu thập các lỗi
  const errorMessages = [];

  if (soluong < 0 || soluong > 2000) {
    errorMessages.push('Số lượng sản phẩm phải nằm trong khoảng từ 0 đến 2000.');
  }

  // Kiểm tra mô tả
  if (mota.length > 400) {
    errorMessages.push('Mô tả sản phẩm không được vượt quá 400 ký tự.');
  }

  // Kiểm tra rằng mỗi thuộc tính đều có ít nhất một chi tiết được chọn
  const attributesWithoutSelection = attributes.filter(attr => {
    return !selectedAttributes.some(selected => selected.name === attr.tenthuoctinh);
  });

  if (attributesWithoutSelection.length > 0) {
    const names = attributesWithoutSelection.map(attr => attr.tenthuoctinh).join(', ');
    errorMessages.push(`Vui lòng chọn ít nhất một chi tiết cho các thuộc tính: ${names}.`);
  }

  // Nếu có bất kỳ lỗi nào, hiển thị thông báo và dừng xử lý
  if (errorMessages.length > 0) {
    alert(errorMessages.join('\n'));
    return;
  }

  for (const attribute of selectedAttributes) {
    const tenthuoctinhchitiet = attribute.detail;
    const tenThuocTinh = attribute.name;
    const idtt = await getIdttByName(tenThuocTinh);

    if (idtt) {
      thuoctinhchitiets.push({ idtt, tenthuoctinhchitiet: tenthuoctinhchitiet });
    } else {
      errorMessages.push(`Không tìm thấy ID cho thuộc tính chi tiết: ${tenthuoctinhchitiet}`);
      alert(errorMessages.join('\n'));
      return;
    }
  }

  if (!mota || thuoctinhchitiets.length === 0) {
    alert('Vui lòng nhập đầy đủ thông tin và chọn ít nhất một thuộc tính chi tiết.');
    return;
  }

  // Tạo phân loại mới để kiểm tra trùng lặp
  const newClassification = thuoctinhchitiets
    .map(d => d.tenthuoctinhchitiet.trim().toLowerCase())
    .sort()
    .join(', ');

  // Kiểm tra trùng lặp, loại trừ sản phẩm hiện tại đang chỉnh sửa
  if (isClassificationDuplicate(newClassification, currentEditingProductId.value)) {
    alert('Phân loại thuộc tính đã tồn tại cho sản phẩm khác. Vui lòng chọn phân loại khác.');
    return;
  }

  const data = {
    soluong,
    mota,
    thuoctinhsanphamchitiets: thuoctinhchitiets,
  };

  const idspct = currentEditingProductId.value;
  if (!idspct) {
    alert('Không xác định được sản phẩm cần cập nhật.');
    return;
  }

  const response = await fetch(
    `https://localhost:7297/api/Sanphamchitiet/${idspct}/Admin/Thao`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (response.ok || response.status === 204) {
    alert('Sản phẩm đã được cập nhật thành công!');
    resetForm();
    products.splice(0, products.length); // Xóa danh sách hiện tại
    await fetchProductDetails(); // Làm mới danh sách sản phẩm
  } else {
    const errorText = await response.text();
    console.error('Lỗi từ server:', errorText);
    alert(`Lỗi khi cập nhật sản phẩm: ${response.status} - ${response.statusText}`);
  }
} catch (error) {
  console.error('Lỗi khi cập nhật sản phẩm:', error);
  alert('Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.');
}
};

// Update product status
const updateProductStatus = async (id, status) => {
  try {
    const response = await fetch(
      `https://localhost:7297/api/Sanphamchitiet/${id}/updatetrangthai/Admin`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trangthai: status }),
      }
    );

    if (!response.ok) {
      throw new Error('Lỗi khi cập nhật trạng thái sản phẩm');
    }

    alert('Trạng thái sản phẩm đã được cập nhật thành công!');
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái sản phẩm:', error);
    alert('Có lỗi xảy ra khi cập nhật trạng thái sản phẩm.');
  }
};

const isClassificationDuplicate = (newClassification, excludeProductId = null) => {
return products.some(product => {
  if (excludeProductId && product.id === excludeProductId) {
    // Loại trừ sản phẩm hiện tại đang được chỉnh sửa
    return false;
  }
  const existingClassification = product.categories
    .split(',')
    .map(c => c.trim().toLowerCase())
    .sort()
    .join(', ');
  return existingClassification === newClassification;
});
};
const toggleProductStatus = async (product) => {
  let updatedStatus;
  if (product.trangthai === 0 || product.trangthai === 1) {
    updatedStatus = 2; // Chuyển sang "Dừng hoạt động"
  } else {
    updatedStatus = 0; // Trạng thái hoạt động
  }
  await updateProductStatus(product.id, updatedStatus);
  products.splice(0, products.length); // Xóa danh sách hiện tại
  await fetchProductDetails(); // Làm mới danh sách sản phẩm
};

// Get status text
const getStatusText = (status) => {
  if (status === 0) return 'Hoạt động';
  if (status === 1) return 'Hết hàng';
  if (status === 2) return 'Dừng hoạt động';
  return 'Unknown';
};

// Check if status should be checked
const isStatusChecked = (status) => {
  return status === 0 || status === 1;
};

// Edit product
const editProduct = async (idspct) => {
  try {
    resetForm();
    const response = await fetch(
      `https://localhost:7297/api/Sanphamchitiet/${idspct}/Admin`
    );
    if (!response.ok) {
      throw new Error('Lỗi khi lấy thông tin chi tiết sản phẩm');
    }
    const product = await response.json();
    console.log('Thông tin sản phẩm cần sửa:', product);
    productQuantity.value = product.soluong || 0;
    productDescription.value = product.mota || '';

    const thuoctinhsResponse = await fetch('https://localhost:7297/api/Thuoctinh/Admin');
    if (!thuoctinhsResponse.ok) {
      throw new Error('Lỗi khi lấy danh sách thuộc tính');
    }
    const thuoctinhs = await thuoctinhsResponse.json();
    console.log('Danh sách thuộc tính:', thuoctinhs);

    for (const thuoctinh of thuoctinhs) {
      const idtt = thuoctinh.id;

      const thuoctinhspctResponse = await fetch(
        `https://localhost:7297/api/Thuoctinhsanphamchitiet/${idtt}/${product.id}/Admin`
      );
      if (!thuoctinhspctResponse.ok) {
        throw new Error('Lỗi khi lấy thuộc tính chi tiết sản phẩm');
      }
      let thuoctinhspcts = await thuoctinhspctResponse.json();

      if (!Array.isArray(thuoctinhspcts)) {
        thuoctinhspcts = [thuoctinhspcts];
      }

      thuoctinhspcts.forEach((thuoctinhspct) => {
        const tenthuoctinhspct = thuoctinhspct.tenthuoctinhchitiet;
        const attribute = attributes.find((attr) => attr.id === idtt);
        if (attribute) {
          const detail = attribute.details.find(
            (d) => d.tenthuoctinhchitiet === tenthuoctinhspct
          );
          if (detail) {
            detail.selected = true;
          }
        }
      });
    }

    formHeader.value = 'SỬA PHÂN LOẠI SẢN PHẨM';
    isEditing.value = true;
    currentEditingProductId.value = idspct;
  } catch (error) {
    console.error('Lỗi khi sửa sản phẩm:', error);
    alert('Có lỗi xảy ra khi sửa sản phẩm. Vui lòng thử lại.');
  }
};

// Reset form to initial state
const resetForm = () => {
  productQuantity.value = '';
  productDescription.value = '';
  attributes.forEach((attribute) => {
    attribute.details.forEach((detail) => {
      detail.selected = false;
    });
  });
  formHeader.value = 'PHÂN LOẠI SẢN PHẨM';
  isEditing.value = false;
  currentEditingProductId.value = null;
};

// Delete product
const deleteProduct = async (productIdToDelete) => {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
    return;
  }
  try {
    const response = await fetch(
      `https://localhost:7297/api/Sanphamchitiet/${productIdToDelete}/Admin`,
      {
        method: 'DELETE',
      }
    );
    if (response.ok) {
      alert('Sản phẩm đã được xóa thành công');
      products.splice(0, products.length); // Xóa danh sách hiện tại
      await fetchProductDetails(); // Làm mới danh sách sản phẩm
    } else {
      alert('Lỗi khi xóa sản phẩm');
    }
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    alert('Có lỗi xảy ra khi xóa sản phẩm.');
  }
};

// Cancel edit
const cancelEdit = () => {
  resetForm();
};

const isSidebarOpen = ref(true);

// Lifecycle hook
onMounted(async () => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  await fetchAttributesAndDetails();
  await fetchProductDetails();
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

.header {
  text-align: center;
  margin: 20px 0;
}
.category-group {
  margin-bottom: 20px;
}
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.detail-button {
  margin: 5px;
}
.detail-button.selected {
  background-color: #4caf50;
  color: white;
  border: 2px solid #4caf50;
}
.btn-toggle {
  cursor: pointer;
}
#btn-cancel-edit {
  display: none;
  margin-left: 10px;
}
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  background-color: #ddd; /* Màu đỏ khi tắt (dừng hoạt động) */
  border-radius: 20px;
  transition: background-color 0.3s ease;
}
.switch-toggle:checked {
  background-color: #C10C99; /* Xanh cho trạng thái 0 và 1 */
}
.switch-toggle::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 2px;
  left: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}
.switch-toggle:checked::before {
  transform: translateX(14px); /* Dịch chuyển sang phải khi bật */
}
.add-detail-icon {
  cursor: pointer;
  margin-left: 10px;
  color: #007bff;
}
.add-detail-icon:hover {
  color: #0056b3;
}
.attribute-item {
  margin-bottom: 15px;
}
.attribute-name {
  font-weight: bold;
  display: flex;
  align-items: center;
}

.btn-add-product {
  padding: 8px;
  border-radius: 12px;
  background-color: transparent;
  border: 2px solid #C10C99;
  color: #C10C99;
  font-weight: 600;
  transition: .12s ease;
}

.btn-add-product:hover {
  box-shadow: 0 0 2px 1px #C10C99;
}

.btn-add-product:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-add-product:disabled:hover {
  box-shadow: none;
}
</style>
