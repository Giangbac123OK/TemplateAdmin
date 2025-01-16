<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Swal from 'sweetalert2';

// Trạng thái đơn hàng với màu sắc và biểu tượng
const statusMapping = {
  0: { text: "Chờ xác nhận", color: "warning", icon: "fas fa-hourglass-half" },
  1: { text: "Đã xác nhận", color: "primary", icon: "fas fa-check-circle" },
  2: { text: "Đang giao", color: "info", icon: "fas fa-truck" },
  3: { text: "Thành công", color: "success", icon: "fas fa-check" },
  4: { text: "Đã hủy", color: "danger", icon: "fas fa-times-circle" },
  5: { text: "Trả hàng", color: "secondary", icon: "fas fa-undo" },
};

// Định nghĩa các trạng thái
const statuses = [
  { id: "all", name: "Tất cả", count: 0 },
  { id: 0, name: "Chờ xác nhận", count: 0 },
  { id: 1, name: "Đã xác nhận", count: 0 },
  { id: 2, name: "Đang giao", count: 0 },
  { id: 3, name: "Thành công", count: 0 },
  { id: 4, name: "Đã hủy", count: 0 },
  { id: 5, name: "Trả hàng", count: 0 },
];

// API URLs
const apiUrl = "https://localhost:7297/api/Hoadon/oln/Admin";
const chuyenTrangThaiApiUrl = "https://localhost:7297/api/Hoadon/ChuyenTrangThai/Admin";
const restoreApiUrl = "https://localhost:7297/api/Hoadon/RestoreState/Admin";
const setDeliveryDateApiUrl = "https://localhost:7297/api/Hoadon/ngaygiaodukien/Admin"; // API để đặt ngày giao dự kiến
const employeeApiUrl = "https://localhost:7297/api/Nhanvien";
const customerApiUrl = "https://localhost:7297/api/Khachhang";

// API URLs cho Trả Hàng (Trahang)
const trahangByHoadonApiUrl = "https://localhost:7297/api/Trahang/by-hoadon/Admin";
const trahangConfirmApiUrl = "https://localhost:7297/api/Trahang/confirm/Admin";
const trahangCancelApiUrl = "https://localhost:7297/api/Trahang/cancel/Admin";

// Dữ liệu đơn hàng và thông báo
const orders = ref([]);
const notifications = ref([]);
const showNotifications = ref(false);
const currentStatus = ref("all");

// Biến trạng thái mới cho trả hàng
const selectedReturn = ref(null);
const showReturnModal = ref(false);

// Biến để quản lý modal chọn ngày giao
const showDeliveryModal = ref(false);
const selectedOrderForDelivery = ref(null);
const selectedDeliveryDate = ref(""); // Ngày giao dự kiến được chọn
const deliveryDateError = ref(""); // Thông báo lỗi khi chọn ngày giao

// Đếm số thông báo chưa đọc
const unreadNotificationsCount = computed(() => {
  return notifications.value.filter((notification) => !notification.read).length;
});

// Đánh dấu thông báo đã đọc
const markNotificationsAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true;
  });
};

// Toggle menu thông báo và đánh dấu là đã đọc
const toggleNotificationMenu = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    markNotificationsAsRead();
  }
};

// Lưu trữ cache cho nhân viên và khách hàng
const employeeCache = ref({});
const customerCache = ref({});

// Lưu trữ trạng thái trước khi hủy và thời gian hủy
const orderHistory = ref({});

// Biến để lưu đơn hàng được chọn và hiển thị modal
const selectedOrder = ref(null);
const showModal = ref(false);

// Hàm định dạng ngày
const formatDate = (date) => {
  if (!date) return "Không có";
  const parsedDate = new Date(date);
  return isNaN(parsedDate) ? "Không có" : parsedDate.toLocaleDateString("vi-VN");
};

// Hàm định dạng ngày và giờ
const formatDateTime = (dateTime) => {
  if (!dateTime) return "Không có";
  const date = new Date(dateTime);
  return isNaN(date) ? "Không có" : date.toLocaleString("vi-VN");
};

// Hàm định dạng tiền tệ
const formatCurrency = (amount) =>
  amount
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    : "Không có";

// Hàm lấy dữ liệu đơn hàng từ API
const fetchOrders = async (status = "all") => {
  currentStatus.value = status;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const filteredOrders =
      status === "all" ? data : data.filter((o) => o.trangthai === parseInt(status));

    // Lấy danh sách các ID nhân viên và khách hàng cần lấy, loại bỏ null
    const employeeIds = [...new Set(filteredOrders.map(order => order.idnv).filter(id => id != null))];
    const customerIds = [...new Set(filteredOrders.map(order => order.idkh).filter(id => id != null))];

    // Fetch nhân viên nếu chưa có trong cache
    const newEmployeeIds = employeeIds.filter(id => !employeeCache.value[id]);
    const employeePromises = newEmployeeIds.map(id =>
      fetch(`${employeeApiUrl}/${id}/Admin`)
        .then(res => res.json())
        .then(data => {
          employeeCache.value[id] = data && data.hoten ? data.hoten : "Không có";
        })
        .catch(() => {
          employeeCache.value[id] = "Không có";
        })
    );

    // Fetch khách hàng nếu chưa có trong cache
    const newCustomerIds = customerIds.filter(id => !customerCache.value[id]);
    const customerPromises = newCustomerIds.map(id =>
      fetch(`${customerApiUrl}/${id}/Admin`)
        .then(res => res.json())
        .then(data => {
          customerCache.value[id] = data && data.ten ? data.ten : "Không có";
        })
        .catch(() => {
          customerCache.value[id] = "Không có";
        })
    );

    // Chờ tất cả các yêu cầu API hoàn thành
    await Promise.all([...employeePromises, ...customerPromises]);

    // Gộp dữ liệu nhân viên và khách hàng vào đơn hàng
    orders.value = filteredOrders.map(order => ({
      ...order,
      employeeName: order.idnv ? (employeeCache.value[order.idnv] || "Không có") : "Không có",
      customerName: order.idkh ? (customerCache.value[order.idkh] || "Không có") : "Không có",
      diachiship: order.diachiship || "Không có",
      thoigiandathang: order.thoigiandathang || "Không có",
      tongtiencantra: order.tongtiencantra || 0,
      ngaygiaodukien: order.ngaygiaodukien || null, // Đảm bảo có trường ngày giao dự kiến
    }));

    updateBadges(data); // Cập nhật badges sau khi lấy dữ liệu
  } catch (error) {
    console.error("Error fetching orders:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi tải dữ liệu đơn hàng.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Hàm cập nhật badge số lượng đơn hàng theo trạng thái
const updateBadges = (data) => {
  statuses.forEach((status) => {
    if (status.id === "all") {
      status.count = data.length;
    } else {
      status.count = data.filter((order) => order.trangthai === parseInt(status.id)).length;
    }
  });
};

// Các hàm xử lý hành động đơn hàng (confirm, deliver, cancel, restore)
const changeOrderStatus = async (order, huy, newStatus = null) => {
  try {
    // Nếu newStatus được cung cấp, sử dụng nó thay vì huy
    let url = "";
    if (newStatus !== null) {
      url = `${chuyenTrangThaiApiUrl}?id=${order.id}&huy=0&newStatus=${newStatus}`;
    } else {
      url = `${chuyenTrangThaiApiUrl}?id=${order.id}&huy=${huy}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      let actionMessage = "";
      if (newStatus !== null) {
        if (newStatus === 3) {
          actionMessage = "đã được đánh dấu là thành công";
        }
      } else {
      if (huy === 1) {
        actionMessage = "đã được hủy";
        // Lưu trạng thái trước khi hủy và thời gian hủy
        orderHistory.value[order.id] = {
          previousTrangThai: order.trangthai,
          cancellationTime: new Date(),
        };
      } else {
        if (order.trangthai === 0) {
          actionMessage = "đã được xác nhận";
        } else if (order.trangthai === 1) {
          actionMessage = "đang được giao";
        }
      }
    }

      Swal.fire({
        icon: "success",
        title: `Đơn hàng ${order.id} ${actionMessage}.`,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      fetchOrders(currentStatus.value); // Làm mới danh sách đơn hàng
    } else {
      Swal.fire({
        icon: "error",
        title: "Không thể thực hiện hành động. Vui lòng thử lại.",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
    }
  } catch (error) {
    console.error(`Error changing status for order ${order.id}:`, error);
    Swal.fire({
      icon: "error",
      title: "Đã xảy ra lỗi. Vui lòng thử lại.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

const confirmOrder = (order) => {
  changeOrderStatus(order, 0); // huy=0
};

// Hàm deliverOrder bây giờ sẽ mở modal chọn ngày giao
const deliverOrder = (order) => {
  selectedOrderForDelivery.value = order;
  selectedDeliveryDate.value = ""; // Reset ngày giao dự kiến
  deliveryDateError.value = ""; // Reset thông báo lỗi
  showDeliveryModal.value = true;
};

const cancelOrder = (order) => {
  Swal.fire({
    title: `Bạn có chắc chắn muốn hủy đơn hàng ${order.id} không?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Có',
    cancelButtonText: 'Không',
    background: '#1a202c',
    color: '#f8f9fa',
    confirmButtonColor: '#C10C99',
    cancelButtonColor: '#C10C99',
  }).then((result) => {
    if (result.isConfirmed) {
      changeOrderStatus(order, 1); // huy=1
    }
  });
};

// Phương thức khôi phục đơn hàng
const restoreOrder = async (order) => {
  const history = orderHistory.value[order.id];
  if (!history) {
    Swal.fire({
      icon: "error",
      title: "Không tìm thấy thông tin khôi phục cho đơn hàng này.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    return;
  }

  const { previousTrangThai, cancellationTime } = history;

  const currentTime = new Date();
  const cancellationDate = new Date(cancellationTime);
  const timeDifference = (currentTime - cancellationDate) / (1000 * 60 * 60 * 24); // Chênh lệch thời gian tính bằng ngày

  if (previousTrangThai === 5 || timeDifference > 7) { // Điều chỉnh từ 3 giờ thành 7 ngày
    Swal.fire({
      icon: "error",
      title: "Đơn hàng đã quá thời gian khôi phục hoặc trạng thái trước hủy là Trả hàng. Không thể khôi phục.",
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
    const url = `${restoreApiUrl}?id=${order.id}&trangthai=${previousTrangThai}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: `Đơn hàng ${order.id} đã được khôi phục về trạng thái trước hủy.`,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      // Xóa thông tin lịch sử sau khi khôi phục
      delete orderHistory.value[order.id];
      fetchOrders(currentStatus.value); // Làm mới danh sách đơn hàng
    } else {
      Swal.fire({
        icon: "error",
        title: "Không thể khôi phục đơn hàng. Vui lòng thử lại.",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
    }
  } catch (error) {
    console.error(`Error restoring order ${order.id}:`, error);
    Swal.fire({
      icon: "error",
      title: "Đã xảy ra lỗi khi khôi phục đơn hàng. Vui lòng thử lại.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Phương thức để xem chi tiết đơn hàng
const viewOrderDetails = async (orderId) => {
  try {
    const response = await fetch(`https://localhost:7297/api/Hoadon/Admin?id=${orderId}`);
    if (!response.ok) {
      throw new Error("Không thể lấy chi tiết đơn hàng.");
    }
    const data = await response.json();

    // Xử lý tên nhân viên và khách hàng nếu có
    const employeeName = data.idnv ? (employeeCache.value[data.idnv] || "Không có") : "Không có";
    const customerName = data.idkh ? (customerCache.value[data.idkh] || "Không có") : "Không có";

    // Xử lý trạng thái thanh toán
    let paymentStatus = "Không xác định";
    if (data.trangthaithanhtoan === 0) {
      paymentStatus = "Chưa thanh toán";
    } else if (data.trangthaithanhtoan === 1) {
      paymentStatus = "Đã thanh toán";
    }

    // Gán dữ liệu vào selectedOrder
    selectedOrder.value = {
      id: data.id,
      employeeName,
      customerName,
      trangthaithanhtoan: paymentStatus,
      tiencoc: data.tiencoc || 0,
      thoigiandathang: data.thoigiandathang,
      diachiship: data.diachiship || "Không có",
      tongtiencantra: data.tongtiencantra || 0,
      sdt: data.sdt || "Không có",
      tonggiamgia: data.tonggiamgia || 0,
      trangthai: data.trangthai,
      ghichu: data.ghichu || "",
      ngaygiaodukien: data.ngaygiaodukien || null,
      tongtiensanpham: data.tongtiensanpham || 0,
    };
    
    // Nếu đơn hàng là trả hàng, lấy chi tiết trả hàng
    if (data.trangthai === 5) {
      const returnResponse = await fetch(`${trahangByHoadonApiUrl}/${orderId}/Admin`);
      if (returnResponse.ok) {
        const returnData = await returnResponse.json();
        selectedReturn.value = returnData;
      } else {
        selectedReturn.value = null;
      }
    } else {
      selectedReturn.value = null;
    }

    // Hiển thị modal
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching order details:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi lấy chi tiết đơn hàng.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Phương thức để đóng modal
const closeModal = () => {
  showModal.value = false;
  selectedOrder.value = null;
  selectedReturn.value = null;
};

// Phương thức để đóng modal giao hàng
const closeDeliveryModal = () => {
  showDeliveryModal.value = false;
  selectedOrderForDelivery.value = null;
  selectedDeliveryDate.value = "";
  deliveryDateError.value = ""; // Làm sạch thông báo lỗi khi đóng modal
};

// Hàm để gửi ngày giao dự kiến và cập nhật trạng thái đơn hàng
const submitDeliveryDate = async () => {
  // Làm sạch thông báo lỗi trước khi kiểm tra
  deliveryDateError.value = "";

  if (!selectedDeliveryDate.value) {
    deliveryDateError.value = "Vui lòng chọn ngày giao dự kiến.";
    return;
  }

  const selectedDate = new Date(selectedDeliveryDate.value);
  const now = new Date();

  // Đặt thời gian của ngày hiện tại và ngày chọn về đầu ngày để so sánh chính xác
  selectedDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // Kiểm tra nếu ngày giao dự kiến <= hiện tại
  if (selectedDate <= now) {
    deliveryDateError.value = "Ngày giao dự kiến phải lớn hơn ngày hiện tại.";
    return;
  }

  const order = selectedOrderForDelivery.value;
  const formattedDate = selectedDate.toISOString(); // Định dạng ISO cho API

  try {
    const url = `${setDeliveryDateApiUrl}?id=${order.id}&ngaygiaodukien=${formattedDate}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Sau khi đặt ngày giao dự kiến thành công, cập nhật trạng thái đơn hàng
      await changeOrderStatus(order, 0); // huy=0 để chuyển trạng thái

      Swal.fire({
        icon: "success",
        title: `Đã đặt ngày giao dự kiến cho đơn hàng ${order.id}.`,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        buttonsStyling: true,
      });

      closeDeliveryModal();
    } else {
      deliveryDateError.value = "Không thể đặt ngày giao dự kiến. Vui lòng thử lại.";
    }
  } catch (error) {
    console.error(`Error setting delivery date for order ${order.id}:`, error);
    deliveryDateError.value = "Đã xảy ra lỗi khi đặt ngày giao dự kiến. Vui lòng thử lại.";
  }
};

// Hàm kiểm tra điều kiện hiển thị nút Đơn hàng thành công
const shouldShowSuccessButton = (order) => {
  if (order.trangthai !== 2 || !order.ngaygiaodukien) return false;

  const deliveryDate = new Date(order.ngaygiaodukien);
  const now = new Date();

  // Tính số ngày chênh lệch
  const diffTime = now - deliveryDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays > 7;
};

// Hàm để đánh dấu đơn hàng là thành công
const markOrderAsSuccess = async (order) => {
  try {
    const url = `${chuyenTrangThaiApiUrl}?id=${order.id}&huy=0&newStatus=3`; // Thêm tham số newStatus=3
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: `Đơn hàng ${order.id} đã được đánh dấu là thành công.`,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        buttonsStyling: true,
      });
      fetchOrders(currentStatus.value); // Làm mới danh sách đơn hàng
    } else {
      Swal.fire({
        icon: "error",
        title: "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        buttonsStyling: true,
      });
    }
  } catch (error) {
    console.error(`Error marking order ${order.id} as success:`, error);
    Swal.fire({
      icon: "error",
      title: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};

// Hàm kiểm tra đơn hàng mới
let previousOrders = { pending: 0, success: 0, returned: 0 };

const checkForNewOrders = async () => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Lọc đơn hàng theo trạng thái
    const newOrdersPending = data.filter((order) => order.trangthai === 0); // Chờ xác nhận
    const newOrdersSuccess = data.filter((order) => order.trangthai === 3); // Thành công
    const newOrdersReturned = data.filter((order) => order.trangthai === 5); // Trả hàng

    // So sánh với trạng thái cũ
    if (newOrdersPending.length !== previousOrders.pending) {
      // Xóa thông báo cũ
      notifications.value = notifications.value.filter((n) => n.type !== "pendingOrders");

      // Thêm thông báo mới
      if (newOrdersPending.length > 0) {
        notifications.value.push({
          type: "pendingOrders",
          message: `Có ${newOrdersPending.length} đơn hàng mới đang chờ xác nhận.`,
          read: false,
        });
      }

      previousOrders.pending = newOrdersPending.length; // Cập nhật trạng thái
    }

    if (newOrdersSuccess.length !== previousOrders.success) {
      notifications.value = notifications.value.filter((n) => n.type !== "successfulOrders");

      if (newOrdersSuccess.length > 0) {
        notifications.value.push({
          type: "successfulOrders",
          message: `Có ${newOrdersSuccess.length} đơn hàng mới đã thành công.`,
          read: false,
        });
      }

      previousOrders.success = newOrdersSuccess.length;
    }

    if (newOrdersReturned.length !== previousOrders.returned) {
      notifications.value = notifications.value.filter((n) => n.type !== "returnedOrders");

      if (newOrdersReturned.length > 0) {
        notifications.value.push({
          type: "returnedOrders",
          message: `Có ${newOrdersReturned.length} đơn hàng mới đã trả hàng.`,
          read: false,
        });
      }

      previousOrders.returned = newOrdersReturned.length;
    }
  } catch (error) {
    console.error("Error fetching new orders:", error);
  }
};

// Biến điều khiển sidebar
const isSidebarOpen = ref(true);

// Watch selectedDeliveryDate để làm sạch thông báo lỗi khi người dùng chọn ngày mới
watch(selectedDeliveryDate, (newVal) => {
  if (newVal) {
    deliveryDateError.value = "";
  }
});

const viewReturnDetails = async (order) => {
  try {
    const response = await fetch(`https://localhost:7297/api/Trahang/by-hoadon/${order.id}/Admin`);
    if (!response.ok) {
      throw new Error("Không thể lấy chi tiết trả hàng.");
    }
    const data = await response.json();
    selectedReturn.value = data;
    showReturnModal.value = true;
  } catch (error) {
    console.error("Error fetching return details:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi lấy chi tiết trả hàng.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
  }
};
// Hàm đóng modal trả hàng
const closeReturnModal = () => {
  showReturnModal.value = false;
  selectedReturn.value = null;
};

// Hàm xác nhận trả hàng
const confirmReturn = async (returnInfo) => {
  try {
    const url = `${trahangConfirmApiUrl}?id=${returnInfo.id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: `Trả hàng cho hóa đơn ${returnInfo.id} đã được xác nhận thành công.`,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
      });
      fetchOrders(currentStatus.value); // Làm mới danh sách đơn hàng
      closeReturnModal();
    } else {
      throw new Error("Không thể xác nhận trả hàng.");
    }
  } catch (error) {
    console.error("Error confirming return:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi xác nhận trả hàng.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
    });
  }
};

// Hàm hủy trả hàng
const cancelReturn = async (returnInfo) => {
  try {
    const url = `${trahangCancelApiUrl}?id=${returnInfo.id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: `Trả hàng cho hóa đơn ${returnInfo.id} đã bị hủy.`,
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
      });
      fetchOrders(currentStatus.value); // Làm mới danh sách đơn hàng
      closeReturnModal();
    } else {
      throw new Error("Không thể hủy trả hàng.");
    }
  } catch (error) {
    console.error("Error canceling return:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi hủy trả hàng.",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
    });
  }
};

// Tải dữ liệu ban đầu và chạy polling
onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
  fetchOrders(); // Lấy danh sách đơn hàng
  setInterval(checkForNewOrders, 10000); // Kiểm tra đơn hàng mới mỗi 10 giây
});
</script>

<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="container" id="mainContent">
      <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Quản lý bán hàng online</h1>
  
      <!-- Icon thông báo -->
      <div class="notification-icon" @click="toggleNotificationMenu">
        <i class="fas fa-bell"></i>
        <span v-if="unreadNotificationsCount > 0" class="badge bg-danger rounded-pill">
          {{ unreadNotificationsCount }}
        </span>
        <!-- Menu thông báo -->
        <div v-if="showNotifications" class="notification-menu shadow-lg">
          <p v-if="notifications.length === 0" class="text-center text-muted">Không có thông báo mới.</p>
          <ul v-else class="list-unstyled">
            <li
              v-for="(notification, index) in notifications"
              :key="index"
              :class="['d-flex align-items-center p-2', { 'bg-light': !notification.read }]"
            >
              <i class="fas fa-info-circle me-2"></i>
              <span>{{ notification.message }}</span>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- Tabs -->
      <ul class="nav nav-tabs" id="orderTabs" role="tablist">
        <li
          v-for="status in statuses"
          :key="status.id"
          class="nav-item"
          role="presentation"
        >
          <button
            class="nav-link"
            :class="{ active: currentStatus === status.id }"
            :id="`status-${status.id}-tab`"
            :data-status="status.id"
            type="button"
            role="tab"
            style="color: #C10C99; font-weight: 700;"
            :aria-controls="`status-${status.id}`"
            :aria-selected="currentStatus === status.id"
            @click="fetchOrders(status.id)"
          >
            {{ status.name }}
            <span :id="`badge-status-${status.id}`" class="badge bg-secondary ms-2">
              {{ status.count }}
            </span>
          </button>
        </li>
      </ul>
  
      <!-- Danh sách đơn hàng -->
      <div class="orders-container">
        <div v-if="orders.length === 0" class="no-orders">
          Không có đơn hàng nào phù hợp.
        </div>
        <div v-for="order in orders" :key="order.id" class="order-card" style="background-color: transparent !important; background-image: linear-gradient(#1f1f1f, #c10c9a2d); color: white;">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title">Mã Đơn Hàng: {{ order.id }}</h5>
            <span class="status d-flex align-items-center">
              <i :class="statusMapping[order.trangthai].icon" class="me-2" style="color: white;"></i>
              <span :class="`badge bg-${statusMapping[order.trangthai].color}`">
                {{ statusMapping[order.trangthai].text }}
              </span>
            </span>
          </div>
          <div class="card-body">
            <p><strong>Nhân Viên:</strong> {{ order.employeeName }}</p>
            <p><strong>Khách Hàng:</strong> {{ order.customerName }}</p>
            <p><strong>Địa Chỉ Ship:</strong> {{ order.diachiship }}</p>
            <p>
              <strong>Thời Gian Đặt Hàng:</strong>
              {{ order.thoigiandathang === "Không có" ? "Không có" : formatDateTime(order.thoigiandathang) }}
            </p>
            <p><strong>Tổng Tiền:</strong> {{ formatCurrency(order.tongtiencantra) }}</p>
          </div>
          <!-- Nút hành động -->
          <div class="card-actions d-flex flex-wrap gap-2" style="margin-top: 20px;">
            <button
              v-if="order.trangthai === 0"
              class="btn btn-success"
              @click="confirmOrder(order)"
            >
              <i class="pi pi-check me-1"></i> Xác nhận
            </button>
            <button
              v-if="order.trangthai === 1"
              class="btn btn-primary"
              @click="deliverOrder(order)"
            >
              <i class="fas fa-car me-1"></i> Giao hàng
            </button>
            <button
              v-if="[0,1,2].includes(order.trangthai)"
              class="btn btn-danger"
              @click="cancelOrder(order)"
            >
              <i class="pi pi-times me-1"></i> Hủy
            </button>
            <button
              v-if="order.trangthai === 4"
              class="btn btn-warning"
              @click="restoreOrder(order)"
            >
              <i class="pi pi-undo me-1"></i> Khôi phục
            </button>
            <button
                v-if="order.trangthai === 5"
                class="btn btn-secondary"
                @click="viewReturnDetails(order)"
              >
                <i class="fas fa-info-circle me-1"></i> Xem Chi Tiết Trả Hàng
              </button>
              <!-- Nút Chi tiết cho tất cả đơn hàng -->
            <button
              class="btn btn-info"
              @click="viewOrderDetails(order.id)"
            >
              <i class="pi pi-info-circle me-1"></i> Chi tiết
            </button>
            
              <!-- Nút Đơn hàng thành công -->
              <button
                v-if="shouldShowSuccessButton(order)"
                class="btn btn-success"
                @click="markOrderAsSuccess(order)"
              >
                <i class="fas fa-thumbs-up me-1"></i> Đơn hàng thành công
              </button>
          </div>
        </div>
      </div>
  
      <!-- Modal Chi tiết Đơn hàng -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết Đơn Hàng: {{ selectedOrder.id }}</h5>
            <button type="button" class="close-button" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <p><strong>Nhân Viên:</strong> {{ selectedOrder.employeeName }}</p>
            <p><strong>Khách Hàng:</strong> {{ selectedOrder.customerName }}</p>
            <p><strong>Địa Chỉ Ship:</strong> {{ selectedOrder.diachiship }}</p>
            <p><strong>Số Điện Thoại:</strong> {{ selectedOrder.sdt }}</p>
            <p><strong>Thời Gian Đặt Hàng:</strong> {{ formatDateTime(selectedOrder.thoigiandathang) }}</p>
            <p><strong>Ngày Giao Dự Kiến:</strong> {{ formatDate(selectedOrder.ngaygiaodukien) }}</p>
            <p><strong>Tổng Tiền Sản Phẩm:</strong> {{ formatCurrency(selectedOrder.tongtiensanpham) }}</p>
            <p><strong>Tổng Giảm Giá:</strong> {{ formatCurrency(selectedOrder.tonggiamgia) }}</p>
            <p><strong>Tổng Tiền Cần Trả:</strong> {{ formatCurrency(selectedOrder.tongtiencantra) }}</p>
            <p><strong>Trạng Thái Thanh Toán:</strong> {{ selectedOrder.trangthaithanhtoan }}</p>
            <p><strong>Tiền Cọc:</strong> {{ formatCurrency(selectedOrder.tiencoc) }}</p>
            <p><strong>Trạng Thái Đơn Hàng:</strong>
              <span :class="`badge bg-${statusMapping[selectedOrder.trangthai].color}`">
                {{ statusMapping[selectedOrder.trangthai].text }}
              </span>
            </p>
            <p><strong>Ghi Chú:</strong> {{ selectedOrder.ghichu || "Không có" }}</p>
            
              <!-- Hiển thị thông tin trả hàng nếu đơn hàng có trả hàng -->
              <div v-if="selectedReturn">
                <h5>Trả Hàng</h5>
                <p><strong>Lý Do Trả Hàng:</strong> {{ selectedReturn.lydotrahang }}</p>
                <!-- Các thông tin khác về trả hàng -->
                <p><strong>Trạng Thái Trả Hàng:</strong> {{ selectedReturn.trangthaiStr }}</p>
                <p><strong>Phương Thức Hoàn Tiền:</strong> {{ selectedReturn.phuongthuchoantien }}</p>
                <p><strong>Ngày Trả Hàng Dự Kiến:</strong> {{ formatDate(selectedReturn.ngaytrahangdukien) }}</p>
                <p><strong>Ngày Trả Hàng Thực Tế:</strong> {{ formatDate(selectedReturn.ngaytrahangthucte) }}</p>
                <!-- Hình ảnh -->
                <div v-if="selectedReturn.hinhanhs && selectedReturn.hinhanhs.length">
                  <strong>Hình Ảnh:</strong>
                  <div class="images">
                    <img v-for="(img, index) in selectedReturn.hinhanhs" :key="index" :src="img" alt="Hình trả hàng" class="return-image"/>
                  </div>
                </div>
                <!-- Chi tiết trả hàng -->
                <div v-if="selectedReturn.trahangchitiets && selectedReturn.trahangchitiets.length">
                  <strong>Chi Tiết Trả Hàng:</strong>
                  <ul>
                    <li v-for="detail in selectedReturn.trahangchitiets" :key="detail.id">
                      Sản Phẩm: {{ detail.hoadonchitietInfo.tensp }}, Số Lượng: {{ detail.soluong }}, Tình Trạng: {{ detail.tinhtrang }}, Ghi Chú: {{ detail.ghichu }}, Hình Thức Xử Lý: {{ detail.hinhthucxuly }}
                    </li>
                  </ul>
                </div>
                <!-- Nút hành động trả hàng -->
                <div class="modal-footer" v-if="selectedReturn.trangthaiStr === 'Đơn hàng chờ trả hàng'">
                  <button class="btn btn-success" @click="confirmReturn(selectedReturn)">
                    <i class="fas fa-check me-1"></i> Xác Nhận Trả Hàng
                  </button>
                  <button class="btn btn-danger" @click="cancelReturn(selectedReturn)">
                    <i class="fas fa-times me-1"></i> Từ Chối
                  </button>
                </div>

              </div>
          </div>
          <div class="modal-footer">
            <button class="customCloseBtn" @click="closeModal">Đóng</button>
          </div>
        </div>
      </div>

      <!-- Modal Chọn Ngày Giao Dự Kiến -->
      <div v-if="showDeliveryModal" class="modal-overlay" @click="closeDeliveryModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h5 class="modal-title">Chọn Ngày Giao Dự Kiến cho Đơn Hàng: {{ selectedOrderForDelivery.id }}</h5>
              <button type="button" class="close-button" @click="closeDeliveryModal">&times;</button>
            </div>
            <div class="modal-body">
              <label for="deliveryDate" class="form-label"><strong>Ngày Giao Dự Kiến:</strong></label>
              <input type="date" id="deliveryDate" v-model="selectedDeliveryDate" class="form-control" />
              <!-- Hiển thị thông báo lỗi nếu có -->
              <div v-if="deliveryDateError" class="text-danger mt-2">
                {{ deliveryDateError }}
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDeliveryModal">Hủy</button>
              <button class="btn btn-primary" @click="submitDeliveryDate">Xác nhận</button>
            </div>
          </div>
        </div>

        <!-- Modal Chi tiết Trả Hàng (Nếu cần) -->
        <div v-if="showReturnModal" class="modal-overlay" @click="closeReturnModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết Trả Hàng: {{ selectedReturn.id }}</h5>
              <button type="button" class="close-button" @click="closeReturnModal">&times;</button>
            </div>
            <div class="modal-body">
              <p><strong>Nhân Viên:</strong> {{ selectedReturn.nhanvienName }}</p>
              <p><strong>Khách Hàng:</strong> {{ selectedReturn.khachhangName }}</p>
              <p><strong>Số Tiền Hoàn:</strong> {{ formatCurrency(selectedReturn.sotienhoan) }}</p>
              <p><strong>Lý Do Trả Hàng:</strong> {{ selectedReturn.lydotrahang }}</p>
              <p><strong>Trạng Thái:</strong> {{ selectedReturn.trangthaiStr }}</p>
              <p><strong>Phương Thức Hoàn Tiền:</strong> {{ selectedReturn.phuongthuchoantien }}</p>
              <p><strong>Ngày Trả Hàng Dự Kiến:</strong> {{ formatDate(selectedReturn.ngaytrahangdukien) }}</p>
              <p><strong>Ngày Trả Hàng Thực Tế:</strong> {{ formatDate(selectedReturn.ngaytrahangthucte) }}</p>
              <!-- Hình ảnh -->
              <div v-if="selectedReturn.hinhanhs && selectedReturn.hinhanhs.length">
                <strong>Hình Ảnh:</strong>
                <div class="images">
                  <img v-for="(img, index) in selectedReturn.hinhanhs" :key="index" :src="img" alt="Hình trả hàng" class="return-image"/>
                </div>
              </div>
              <!-- Chi tiết trả hàng -->
              <div v-if="selectedReturn.trahangchitiets && selectedReturn.trahangchitiets.length">
                <strong>Chi Tiết Trả Hàng:</strong>
                <ul>
                  <li v-for="detail in selectedReturn.trahangchitiets" :key="detail.id">
                    Sản Phẩm: {{ detail.hoadonchitietInfo.tensp }}, Số Lượng: {{ detail.soluong }}, Tình Trạng: {{ detail.tinhtrang }}, Ghi Chú: {{ detail.ghichu }}, Hình Thức Xử Lý: {{ detail.hinhthucxuly }}
                  </li>
                </ul>
              </div>
            </div>
            <!-- Hiển thị các nút hành động nếu trạng thái trả hàng là 0 -->
            <div class="modal-footer" v-if="selectedReturn.trangthaiStr === 0">
              <button class="btn btn-success" @click="confirmReturn(selectedReturn)">
                <i class="fas fa-check me-1"></i> Xác Nhận Trả Hàng
              </button>
              <button class="btn btn-danger" @click="cancelReturn(selectedReturn)">
                <i class="fas fa-times me-1"></i> Từ Chối
              </button>
            </div>
            <!-- Chỉ hiển thị nút Đóng nếu trạng thái trả hàng không phải là 0 -->
            <div class="modal-footer" v-else>
              <button class="btn btn-secondary" @click="closeReturnModal">Đóng</button>
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

.nav-tabs {
  margin-bottom: 20px;
}

.orders-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.order-card {
  flex: 1 1 calc(33.333% - 20px);
  background-color: transparent !important;
  background-image: linear-gradient(#1f1f1f, #c10c9a2d);
  color: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  margin: 0;
  font-size: 1.2em;
}

.status {
  font-size: 0.9em;
  color: #555;
}

.card-body p {
  margin: 8px 0;
}

.notification-icon {
  position: fixed;
  top: 96px;
  right: 20px;
  font-size: 1.8em;
  color: white;
  cursor: pointer;
  z-index: 1000;
  border-radius: 50%;
}

.notification-icon::after {
  content: "";
  height: 5px;
  width: 5px;
  background: white;
  border-radius: 50%;
  position: fixed;
  top: 115px;
  right: 30px;
  opacity: 0;
}

.notification-icon:hover {
  color: #ddd;
}

.notification-icon:hover::after {
  animation: ping 800ms linear infinite;
}

@keyframes ping {
  0% {
    opacity: 0;
  }
  50% {
    opacity: .25;
    transform: scale(5);
  }
  100% {
    opacity: .1;
    transform: scale(10);
  }
}

.notification-menu {
  position: absolute;
  top: 40px;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 10px;
  z-index: 1001;
}

.notification-menu ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.notification-menu li {
  padding: 10px 5px;
  border-bottom: 1px solid #ddd;
  font-size: 0.9em;
}

.notification-menu li:last-child {
  border-bottom: none;
}

.notification-menu p {
  margin: 0;
  text-align: center;
  font-size: 0.9em;
  color: #888;
}

.no-orders {
  text-align: center;
  font-size: 1.1em;
  color: #666;
  width: 100%;
}

.order-card .card-actions {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  align-items: center;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

/* Kiểu cho modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background-color: #1f1f1f !important;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  padding: 25px;
  position: relative;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  margin: 0;
  font-size: 1.5em;
}

.close-button {
  background: #C10C99;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.close-button:hover {
  background: #cc4bb0;
}

.modal-body p {
  margin: 10px 0;
}

/* Kiểu cho hình ảnh trả hàng */
.return-image {
  max-width: 100px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.images {
  display: flex;
  flex-wrap: wrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

@media (max-width: 992px) {
  .order-card {
    flex: 1 1 calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .order-card {
    flex: 1 1 100%;
  }

  .modal-content {
    width: 95%;
  }
}

.customCloseBtn {
  background-color: #C10C99;
  color: white;
  padding: 10px;
  border-radius: 12px;
  transition: .12s ease;
  border: 2px solid #C10C99;
  font-weight: 600;
}

.customCloseBtn:hover {
  background-color: transparent;
  border-color: #cc4bb0;
  color: #cc4bb0;
}
</style>
