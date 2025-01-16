<script setup>
import { ref, onMounted } from 'vue';
import customInput from '@/components/customInput.vue';
import customSelect from '@/components/customSelect.vue';
import customButton from '@/components/customButton.vue';
import customSearchField from "@/components/customSearchField.vue";
import Swal from 'sweetalert2';

const isSidebarOpen = ref(true);

const refPassword = ref('');

const refModalHoten = ref('');
const refmodalNgaysinh = ref('');
const refModalDiachi = ref('');
const refModalSdt = ref('');
const refModalEmail = ref('');
const refModalPassword = ref('');

function validateForm() {
  // Lấy các giá trị từ form
  const hoten = document.getElementById('hoten').value;
  const ngaysinh = new Date(document.getElementById('ngaysinh').value);
  const sdt = document.getElementById('sdt').value;
  const password = document.getElementById('password').value;

  // Kiểm tra tên không chứa ký tự đặc biệt và số
  const namePattern = /^[a-zA-Z\s]+$/; // Chỉ cho phép chữ cái và khoảng trắng
  console.log(hoten.length);
  if (!namePattern.test(hoten)) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Tên không được chứa kí tự đặc biệt và số!",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      return false;
  } else if (hoten.length > 50) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Tên không được quá 50 ký tự!",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      return false;
  }

  // Kiểm tra ngày sinh (tuổi từ 16 đến 100)
  const today = new Date();
  let age = today.getFullYear() - ngaysinh.getFullYear();
  const m = today.getMonth() - ngaysinh.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < ngaysinh.getDate())) {
      age--;
  }
  if (age < 16) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Tuổi phải lớn hơn 16!",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      return false;
  }

  // Kiểm tra số điện thoại không chứa chữ
  const phonePattern = /^[0-9]{10,11}$/; // Số điện thoại phải là 10-11 chữ số
  if (!phonePattern.test(sdt)) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Số điện thoại phải là 10-11 chữ số!",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      return false;
  }

  // Kiểm tra mật khẩu phải có từ 6-20 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/;
  if (!passwordPattern.test(password)) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Mật khẩu phải có từ 6-20 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt!",
        background: '#1a202c',
        color: '#f8f9fa',
        confirmButtonColor: '#C10C99',
        cancelButtonColor: '#C10C99',
        iconColor: '#C10C99',
        buttonsStyling: true,
      });
      return false;
  }

  // Nếu tất cả các điều kiện đều hợp lệ
  return true;
}

const closeModalManual = async () => {
  document.getElementById("updateModal").style.display = "none";
  document.getElementById("createAccountModal").style.display = "none";
}

function addTogglePasswordEvents() {
    const toggleIcons = document.querySelectorAll(".toggle-password");
    toggleIcons.forEach(icon => {
        icon.addEventListener("click", function() {
            const passwordCell = this.parentElement;
            const passwordMask = passwordCell.querySelector(".password-mask");
            const passwordText = passwordCell.querySelector(".password-text");
            const isMasked = passwordText.style.display === "none";

            if (isMasked) {
                passwordMask.style.display = "none";
                passwordText.style.display = "inline";
                this.classList.remove("fa-eye");
                this.classList.add("fa-eye-slash");
            } else {
                passwordMask.style.display = "inline";
                passwordText.style.display = "none";
                this.classList.remove("fa-eye-slash");
                this.classList.add("fa-eye");
            }
        });
    });
}

function displayEmployeeList(data) {
            const tableBody = document.querySelector(".employee-list tbody");
            tableBody.innerHTML = "";
        
            data.forEach((employee, index) => {
                const row = document.createElement("tr");
                let statusText = employee.trangthai === 0 ? 'Hoạt động' : 'Dừng hoạt động';
                let isActive = employee.trangthai === 0;
                row.innerHTML = 
                    `<td>${index + 1}</td>
                    <td>${employee.hoten}</td>
                    <td>${new Date(employee.ngaysinh).toLocaleDateString('vi-VN')}</td>
                    <td>${employee.gioitinh }</td>
                    <td>${employee.email}</td>
                    <td>${employee.sdt}</td>
                        <td>${employee.diachi || 'Chưa cập nhật'}</td>
                    <td class="password-cell">
                        <span class="password-mask">****</span>
                        <span class="password-text" style="display: none;">${employee.password}</span>
                        <i class="fas fa-eye toggle-password"></i>
                    </td>
                    <td>${employee.role}</td>
                    <td class="${statusText}">${employee.trangthai}</td>
                    <td>
                        <div style="display: flex; align-items: center; justify-content: center;">
                          <label class="switch ${isActive ? 'active' : 'inactive'}">
                            <input type="checkbox" class="status-checkbox" data-id="${employee.id}" ${employee.trangthai === 0 ? "checked" : ""}>
                            <span class="slider"></span>
                          </label>
                        </div>
                    </td>
                        <td>
                        <button class="update-btn" data-id="${employee.id}" onclick="handleUpdate(${employee.id})">Cập nhật</button>
                    </td>`;
                ;

    
                tableBody.appendChild(row);
            });
            addTogglePasswordEvents();

            const statusCheckboxes = document.querySelectorAll('.status-checkbox');
            statusCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const employeeId = this.getAttribute('data-id');
                    updateStatus(employeeId);
                });
            });
        }

const makeNewAccount = () => {
    const form = document.getElementById("createAccountForm");

    if(!validateForm()) {
      return;
    }

            const hoten = document.getElementById("hoten").value;
            const ngaysinh = document.getElementById("ngaysinh").value;
            const diachi = document.getElementById("diachi").value;
            const gioitinh = JSON.parse(document.getElementById("gioitinh").value);
            const sdt = document.getElementById("sdt").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
        
            const data = {
                hoten: hoten,
                ngaysinh: ngaysinh,
                diachi: diachi,
                gioitinh: gioitinh,
                sdt: sdt,
                email: email,
                password: password,
                trangthai: 0,
                role: 1
            };

            //DuongPH18
            // const data1 = {
            //   hoten: hoten,
            //   ngaysinh: ngaysinh,
            //   diachi: diachi,
            //   gioitinh: gioitinh ? "Nam" : "Nữ",
            //   sdt: sdt,
            //   email:email,
            //   password: password,
            //   trangthai: "Hoạt động",
            //   role: "Nhân viên"
            // };
    
            // if (!window.employeeList) {
            //     window.employeeList = [];
            // }
            // window.employeeList.unshift(data1); // Thêm vào đầu danh sách
            // displayEmployeeList(window.employeeList); 
            // refPassword.value = '';
            // form.reset();
            // Swal.fire({
            //   icon: "success",
            //   title: "Tạo tài khoản thành công!",
            //   background: '#1a202c',
            //   color: '#f8f9fa',
            //   confirmButtonColor: '#C10C99',
            //   cancelButtonColor: '#C10C99',
            //   iconColor: '#C10C99',
            //   buttonsStyling: true,
            // });
            //DuongPH18
            document.getElementById("createAccountModal").style.display = "none";

            fetch("https://localhost:7297/api/Nhanvien/Admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(async response => {
                if (!response.ok) {
                    const errorMessage = await response.text(); // Đọc thông báo lỗi từ server
                    throw new Error(errorMessage); // Ném lỗi nhưng vẫn kiểm soát được
                }
                return response.json();
            })
            .then(newEmployee => {
                console.log("Phản hồi từ API:", newEmployee);
                Swal.fire({
                  icon: "success",
                  title: "Tạo tài khoản",
                  text: "Tạo tài khoản thành công!",
                  background: '#1a202c',
                  color: '#f8f9fa',
                  confirmButtonColor: '#C10C99',
                  cancelButtonColor: '#C10C99',
                  iconColor: '#C10C99',
                  buttonsStyling: true,
                });
                const data1 = {
                    hoten: newEmployee.hoten,
                    ngaysinh: newEmployee.ngaysinh,
                    diachi: newEmployee.diachi,
                    gioitinh: newEmployee.gioitinh ? "Nam" : "Nữ",
                    sdt: newEmployee.sdt,
                    email:newEmployee.email,
                    password: newEmployee.password,
                    trangthai: "Hoạt động",
                    role: "Nhân viên"
                };
    
                if (!window.employeeList) {
                    window.employeeList = [];
                }
                window.employeeList.unshift(data1); // Thêm vào đầu danh sách
                displayEmployeeList(window.employeeList); 
                refPassword.value = '';
                form.reset(); // Reset form sau khi thêm thành công
                document.getElementById("createAccountModal").style.display = "none";
            })
            .catch(error => {
              Swal.fire({
                icon: "error",
                title: `Lỗi từ API: ${error.message}`,
                background: '#1a202c',
                color: '#f8f9fa',
                confirmButtonColor: '#C10C99',
                cancelButtonColor: '#C10C99',
                iconColor: '#C10C99',
                buttonsStyling: true,
              });
            });
  }

const handleMakeNewAccount = () => {
  document.getElementById("createAccountModal").style.display = "block";
}

onMounted(async () => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });

  async function fetchEmployeeListFirst() {
            
    fetch("https://localhost:7297/hoatdong/Admin")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            window.employeeList = data;
            displayEmployeeList(data);
        })
        .catch(error => {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
            Swal.fire({
              icon: "error",
              title: "Lỗi khi tải danh sách nhân viên. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
              background: '#1a202c',
              color: '#f8f9fa',
              confirmButtonColor: '#C10C99',
              cancelButtonColor: '#C10C99',
              iconColor: '#C10C99',
              buttonsStyling: true,
            });
        });
  }

  await fetchEmployeeListFirst();
});

document.addEventListener("DOMContentLoaded", async () => {
  // Define the handleUpdate function after the DOM is fully loaded
  window.closeModal = async function () {
    document.getElementById("updateModal").style.display = "none";
    document.getElementById("createAccountModal").style.display = "none";
  }

  window.handleUpdate = async function (employeeId) {
    const employee = window.employeeList.find(emp => emp.id === employeeId);
    const ngaysinh = new Date(employee.ngaysinh);
    const ngaysinhFormatted = ngaysinh.getFullYear() + '-' + 
      (ngaysinh.getMonth() + 1).toString().padStart(2, '0') + '-' + 
      ngaysinh.getDate().toString().padStart(2, '0');
      
    refmodalNgaysinh.value = ngaysinhFormatted;
    refModalHoten.value = employee.hoten;
    document.getElementById("modalGioitinh").value = employee.gioitinh === "Nam" ? "true" : "false";
    refModalEmail.value = employee.email;
    refModalSdt.value = employee.sdt;
    refModalDiachi.value = employee.diachi || '';
    refModalPassword.value = employee.password;
    document.getElementById("modalRole").value = employee.role === "Nhân viên" ? "1" : "0";
    document.getElementById("modalTrangthai").value = employee.trangthai === "Hoạt động" ? "0" : "1";

    const isInactive = employee.trangthai === "Dừng hoạt động";
    const inputsToDisable = ["modalHoten", "modalNgaysinh", "modalGioitinh", "modalSdt", "modalDiachi", "modalRole", "modalTrangthai"];
    
    inputsToDisable.forEach(inputId => {
      document.getElementById(inputId).disabled = isInactive;
    });

    document.querySelector("#updateForm button[type='submit']").style.display = isInactive ? "none" : "inline-block";

    try {
      const response = await fetch(`https://localhost:7297/api/Nhanvien/check-foreign-key/${employeeId}/Admin`);
      
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const data = await response.json();
      document.getElementById("deleteButton").style.display = data.message === "Nhân viên không có ràng buộc khóa ngoại." 
        ? "inline-block" 
        : "inline-block";
    } catch (error) {
      console.error("Lỗi kiểm tra ràng buộc khóa ngoại:", error.message);
    }

    document.getElementById("updateModal").style.display = "block";
    document.getElementById("updateForm").setAttribute("data-id", employeeId);
  };
});

    document.addEventListener("DOMContentLoaded", function() {
        const form = document.getElementById("createAccountForm");
        let isShowingDeactivated = false;
        

        function fetchEmployeeList() {
            
            fetch("https://localhost:7297/hoatdong/Admin")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    window.employeeList = data;
                    displayEmployeeList(data);
                })
                .catch(error => {
                    console.error("Lỗi khi lấy danh sách nhân viên:", error);
                    Swal.fire({
                      icon: "error",
                      title: "Lỗi khi tải danh sách nhân viên. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
                      background: '#1a202c',
                      color: '#f8f9fa',
                      confirmButtonColor: '#C10C99',
                      cancelButtonColor: '#C10C99',
                      iconColor: '#C10C99',
                      buttonsStyling: true,
                    });
                });
        }

        function fetchDeactivatedEmployeeList() {
            fetch("https://localhost:7297/dunghoatdong/Admin")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    window.employeeList = data;
                    displayEmployeeList(data);
                })
                .catch(error => {
                    console.error("Lỗi khi lấy danh sách nhân viên dừng hoạt động:", error);
                    Swal.fire({
                      icon: "error",
                      title: "Lỗi khi tải danh sách nhân viên dừng hoạt động. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
                      background: '#1a202c',
                      color: '#f8f9fa',
                      confirmButtonColor: '#C10C99',
                      cancelButtonColor: '#C10C99',
                      iconColor: '#C10C99',
                      buttonsStyling: true,
                    });
                });
        }


        function displayEmployeeList(data) {
            const tableBody = document.querySelector(".employee-list tbody");
            tableBody.innerHTML = "";
        
            data.forEach((employee, index) => {
                const row = document.createElement("tr");
                let statusText = employee.trangthai === 0 ? 'Hoạt động' : 'Dừng hoạt động';
                let isActive = employee.trangthai === 0;
                row.innerHTML = 
                    `<td>${index + 1}</td>
                    <td>${employee.hoten}</td>
                    <td>${new Date(employee.ngaysinh).toLocaleDateString('vi-VN')}</td>
                    <td>${employee.gioitinh }</td>
                    <td>${employee.email}</td>
                    <td>${employee.sdt}</td>
                        <td>${employee.diachi || 'Chưa cập nhật'}</td>
                    <td class="password-cell">
                        <span class="password-mask">****</span>
                        <span class="password-text" style="display: none;">${employee.password}</span>
                        <i class="fas fa-eye toggle-password"></i>
                    </td>
                    <td>${employee.role}</td>
                    <td class="${statusText}">${employee.trangthai}</td>
                    <td style="vertical-align: middle;">
                        <label class="switch ${isActive ? 'active' : 'inactive'}">
                            <input type="checkbox" class="status-checkbox" data-id="${employee.id}" ${employee.trangthai === 0 ? "checked" : ""}>
                            <span class="slider"></span>
                        </label>
                    </td>
                        <td>
                        <button class="update-btn" data-id="${employee.id}" onclick="handleUpdate(${employee.id})">Cập nhật</button>
                    </td>`;
                ;

    
                tableBody.appendChild(row);
            });
            addTogglePasswordEvents();

            const statusCheckboxes = document.querySelectorAll('.status-checkbox');
            statusCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const employeeId = this.getAttribute('data-id');
                    updateStatus(employeeId);
                });
            });
        }

        document.getElementById("updateForm").addEventListener("submit", function(event) {
event.preventDefault();
const employeeId = parseInt(this.getAttribute("data-id")); 

const employee = window.employeeList.find(emp => emp.id === employeeId);
if (!employee) {
    Swal.fire({
      icon: "error",
      title: "Không tìm thấy nhân viên!",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    return;
}


const updatedData = {
    hoten: document.getElementById("modalHoten").value,
    ngaysinh: document.getElementById("modalNgaysinh").value,
    gioitinh: document.getElementById("modalGioitinh").value === "true", // true/false
    sdt: document.getElementById("modalSdt").value,
    email: document.getElementById("modalEmail").value,
    password:  document.getElementById("modalPassword").value,
    diachi: document.getElementById("modalDiachi").value,
    role: parseInt(document.getElementById("modalRole").value), // 0 hoặc 1
    trangthai: parseInt(document.getElementById("modalTrangthai").value) // 0 hoặc 1
};

fetch(`https://localhost:7297/api/Nhanvien/${employeeId}/Admin`, {
method: "PUT",
headers: {
    "Content-Type": "application/json"
},
body: JSON.stringify(updatedData)
})
.then(response => {
    console.log("Response status:", response.status);

    if (!response.ok) {
        return response.text().then(text => {
            throw new Error(`Lỗi ${response.status}: ${text}`);
        });
    }
    if (response.status === 204) {
        return null;
    }

    return response.json(); 
})
.then(data => {
    Swal.fire({
      icon: "success",
      title: "Cập nhật thành công!",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    console.log("Phản hồi từ API:", data || "No content");
    closeModal(); 
    
    fetchEmployeeList(); // Tải lại danh sách nhân viên
})
.catch(error => {
    console.error("Lỗi khi cập nhật:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi cập nhật: " + error.message,
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
});

});
function updateStatus(id) {
    fetch(`https://localhost:7297/api/Nhanvien/update-status/${id}/Admin`, {
        method: "PUT"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Trạng thái nhân viên đã được cập nhật:", data);
        if (isShowingDeactivated) {
            fetchDeactivatedEmployeeList();  // Tải lại danh sách nhân viên dừng hoạt động
        } else {
            fetchEmployeeList();  // Tải lại danh sách nhân viên hoạt động
        }
    })
    .catch(error => {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi khi cập nhật trạng thái. Vui lòng thử lại.",
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
    });
}

let debounceTimeout;
const searchCriteria = document.getElementById("searchCriteria");
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
clearTimeout(debounceTimeout);
debounceTimeout = setTimeout(() => {
    const selectedCriteria = searchCriteria.value;
    const searchValue = searchInput.value.trim();

    if (!searchValue) {
        if (isShowingDeactivated) {
            fetchDeactivatedEmployeeList();
        } else {
            fetchEmployeeList();
        }
        return;
    }

    let apiUrl = "";

    if (selectedCriteria === "hoten") {
        apiUrl = `https://localhost:7297/api/Nhanvien/search-by-name/Admin?name=${encodeURIComponent(searchValue)}`;
    } else if (selectedCriteria === "sdt") {
        apiUrl = `https://localhost:7297/api/Nhanvien/search-by-phone/Admin?phoneNumber=${encodeURIComponent(searchValue)}/`;
    } else if (selectedCriteria === "email") {
        apiUrl = `https://localhost:7297/api/Nhanvien/search-by-email/Admin?email=${encodeURIComponent(searchValue)}`;
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
        
                if (isShowingDeactivated) {
                data = data.filter(employee => employee.trangthai === "Dừng hoạt động");
            } else {
                data = data.filter(employee => employee.trangthai === "Hoạt động");
            }

            displayEmployeeList(data); 
        })
        .catch(error => {
            console.error("Lỗi khi tìm kiếm nhân viên:", error);
            Swal.fire({
              icon: "error",
              title: "Lỗi khi thực hiện tìm kiếm. Vui lòng thử lại.",
              background: '#1a202c',
              color: '#f8f9fa',
              confirmButtonColor: '#C10C99',
              cancelButtonColor: '#C10C99',
              iconColor: '#C10C99',
              buttonsStyling: true,
            });
        });
}, 300); 
});
        document.getElementById("sortDropdown").addEventListener("change", function() {
            const sortOrder = this.value;
            sortEmployeeList(sortOrder);
        });

        function sortEmployeeList(order) {
            const sortedList = [...window.employeeList].sort((a, b) => {
                if (order === "asc") {
                    return a.hoten.localeCompare(b.hoten);
                } else {
                    return b.hoten.localeCompare(a.hoten);
                }
            });
            displayEmployeeList(sortedList);
        }
        document.getElementById("toggleStatus").addEventListener("click", function() {
            isShowingDeactivated = !isShowingDeactivated;

            if (isShowingDeactivated) {
                fetchDeactivatedEmployeeList();
                this.textContent = "Danh sách hoạt động";
                this.classList.add("active");
                this.classList.remove("inactive");
            } else {
                fetchEmployeeList();
                this.textContent = "Danh sách dừng hoạt động";
                this.classList.remove("active");
                this.classList.add("inactive");
            }
        });

        async function deleteEmployee() {
const employeeId = parseInt(document.getElementById("updateForm").getAttribute("data-id"));

if (!employeeId) {
    Swal.fire({
      icon: "error",
      title: "Không tìm thấy nhân viên để xóa!",
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
    return;
}

const confirmDelete = confirm("Bạn có chắc chắn muốn xóa nhân viên này?");
if (!confirmDelete) return;

try {
    const checkResponse = await fetch(`https://localhost:7297/api/Nhanvien/check-foreign-key/${employeeId}/Admin`);
    if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        throw new Error(`Lỗi ${checkResponse.status}: ${errorText}`);
    }

    const checkData = await checkResponse.json();
    const message = checkData.message || checkData.Message || ""; 

    if (message.includes("Nhân viên không có ràng buộc khóa ngoại.")) {
        const deleteResponse = await fetch(`https://localhost:7297/api/Nhanvien/${employeeId}/Admin`, {
            method: "DELETE",
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            throw new Error(`Lỗi ${deleteResponse.status}: ${errorText}`);
        }

        Swal.fire({
          icon: "success",
          title: "Xóa nhân viên thành công!",
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
    } else if (message.includes("Nhân viên có ràng buộc khóa ngoại.")) {
        const updateResponse = await fetch(`https://localhost:7297/api/Nhanvien/delete/${employeeId}/Admin`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ trangthai: 2 }) // Tùy chỉnh dữ liệu gửi đi theo API yêu cầu
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Lỗi ${updateResponse.status}: ${errorText}`);
        }

        Swal.fire({
          icon: "success",
          title: "Xóa nhân viên thành công!",
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
    } else {
        Swal.fire({
          icon: "error",
          title: "Phản hồi không xác định từ máy chủ.",
          background: '#1a202c',
          color: '#f8f9fa',
          confirmButtonColor: '#C10C99',
          cancelButtonColor: '#C10C99',
          iconColor: '#C10C99',
          buttonsStyling: true,
        });
    }
    closeModal();
    fetchEmployeeList();
} catch (error) {
    console.error("Lỗi khi xử lý yêu cầu:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi xử lý yêu cầu: " + error.message,
      background: '#1a202c',
      color: '#f8f9fa',
      confirmButtonColor: '#C10C99',
      cancelButtonColor: '#C10C99',
      iconColor: '#C10C99',
      buttonsStyling: true,
    });
}
}
    window.deleteEmployee = deleteEmployee;
        fetchEmployeeList();
    });
    // function validateForm() {
    // // Lấy các giá trị từ form
    // const hoten = document.getElementById('hoten').value;
    // const ngaysinh = new Date(document.getElementById('ngaysinh').value);
    // const sdt = document.getElementById('sdt').value;
    // const password = document.getElementById('password').value;

    // // Kiểm tra tên không chứa ký tự đặc biệt và số
    // const namePattern = /^[a-zA-Z\s]+$/; // Chỉ cho phép chữ cái và khoảng trắng
    // if (!namePattern.test(hoten)) {
    //     alert("Tên không được chứa kí tự đặc biệt và số!");
    //     return false;
    // }

    // // Kiểm tra ngày sinh (tuổi từ 16 đến 100)
    // const today = new Date();
    // const age = today.getFullYear() - ngaysinh.getFullYear();
    // const m = today.getMonth() - ngaysinh.getMonth();
    // if (m < 0 || (m === 0 && today.getDate() < ngaysinh.getDate())) {
    //     age--;
    // }
    // if (age < 16 || age > 100) {
    //     alert("Tuổi phải từ 16 đến 100!");
    //     return false;
    // }

    // // Kiểm tra số điện thoại không chứa chữ
    // const phonePattern = /^[0-9]{10,11}$/; // Số điện thoại phải là 10-11 chữ số
    // if (!phonePattern.test(sdt)) {
    //     alert("Số điện thoại không hợp lệ!");
    //     return false;
    // }

    // // Kiểm tra mật khẩu phải có từ 6-20 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt
    // const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/;
    // if (!passwordPattern.test(password)) {
    //     alert("Mật khẩu phải có từ 6-20 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt!");
    //     return false;
    // }

    // // Nếu tất cả các điều kiện đều hợp lệ
    // return true;
    // }

</script>

<template>
  <div class="main">
    <main :class="{ open: !isSidebarOpen }" class="main-content">
      <div class="main-container">
        <div class="employee-list">
            <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Danh sách nhân viên</h1>
            <div class="search-filters">
                <customSelect
                  id="searchCriteria"
                  :options="[
                    { value: 'hoten', label: 'Họ tên' },
                    { value: 'sdt', label: 'Số điện thoại' },
                    { value: 'email', label: 'Email' }
                  ]"
                  placeholder="Nội dung tìm kiếm"
                  modelValue="hoten"
                />
                <customSearchField
                  id="searchInput"
                  placeholder="Tìm kiếm..."
                />
                <customSelect
                  id="sortDropdown"
                  :options="[
                    { value: 'asc', label: 'Sắp xếp từ A-Z' },
                    { value: 'desc', label: 'Sắp xếp từ Z-A' }
                  ]"
                  placeholder="Thứ tự sắp xếp"
                  modelValue="asc"
                />
                <button id="toggleStatus" class="sort-button inactive" style="padding: 8px 16px;">Danh sách dừng hoạt động</button>
                <div style="flex: 1;">
                  <button 
                    class="openNewAccountForm" 
                    type="button" 
                    @click="handleMakeNewAccount"
                    style="
                      float: right;
                      border-radius: 20px;
                      background-color: transparent;
                      border: 1px solid #C10C99;
                      padding: 8px 16px;
                      color: #C10C99;
                      font-weight: 600;
                      transition: .12s ease;
                      margin-right: 0;
                    "
                  >
                    <i class="pi pi-plus" style="font-size: 16px; margin-right: 5px;"></i>
                    Tạo tài khoản
                  </button>
                </div>
            </div>
            <!-- modal sửa -->

            <div id="updateModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <div class="modal-header">
                      <h2>Cập nhật thông tin nhân viên</h2>
                      <span class="close" @click="closeModalManual">&times;</span>
                    </div>
                    <form id="updateForm">
                        <customInput
                          id="modalHoten"
                          label="Họ tên"
                          type="text"
                          placeholder="Họ tên của nhân viên"
                          icon="pi pi-user"
                          v-model="refModalHoten"
                        />
                        <customInput
                          id="modalNgaysinh"
                          label="Ngày sinh"
                          type="date"
                          icon="pi pi-calendar"
                          v-model="refmodalNgaysinh"
                        />
                        <customInput
                          id="modalDiachi"
                          label="Địa chỉ"
                          type="text"
                          placeholder="Địa chỉ của nhân viên"
                          icon="pi pi-map-marker"
                          v-model="refModalDiachi"
                        />
                        <customSelect
                          id="modalGioitinh"
                          label="Giới tính"
                          :options="[
                            { value: 'true', label: 'Nam' },
                            { value: 'false', label: 'Nữ' }
                          ]"
                          icon="pi pi-pencil"
                          placeholder="Giới tính"
                        />
                        <customInput
                          id="modalSdt"
                          label="Số điện thoại"
                          type="tel"
                          placeholder="Số điện thoại của nhân viên"
                          icon="pi pi-phone"
                          v-model="refModalSdt"
                        />
                        <customInput
                          id="modalEmail"
                          label="Email"
                          type="email"
                          placeholder="Email của nhân viên"
                          icon="pi pi-at"
                          :disabled="true"
                          v-model="refModalEmail"
                        />
                        <customInput
                          id="modalPassword"
                          label="Mật khẩu"
                          type="password"
                          placeholder="Mật khẩu của nhân viên"
                          icon="pi pi-lock"
                          :disabled="true"
                          v-model="refModalPassword"
                        />
                        <customSelect
                          id="modalRole"
                          label="Vai trò"
                          :options="[
                            { value: '0', label: 'Quản lý' },
                            { value: '1', label: 'Nhân viên' }
                          ]"
                          icon="pi pi-cog"
                          placeholder="Vai trò"
                        />
                        <customSelect
                          id="modalTrangthai"
                          label="Trạng thái"
                          :options="[
                            { value: '0', label: 'Hoạt động' },
                            { value: '1', label: 'Dừng hoạt động' }
                          ]"
                          icon="pi pi-exclamation-circle"
                          placeholder="Trạng thái"
                        />
                        <div class="button-part" style="display: flex; justify-content: space-between;">
                          <button id="updateButton" type="submit" 
                            style="
                              background-color: #C10C99;
                              color: #f8f9fa;
                              display:none; 
                              width: 40%; 
                              margin-top: 20px; 
                              padding: 15px;
                              font-size: 20px;
                              font-weight: 600;
                              border: 2px solid #C10C99;
                              border-radius: 20px;
                              cursor: pointer;
                              transition: background-color 0.12s, color 0.12s, border-color 0.12s;
                              text-align: center;
                              display: inline-block;
                              margin-top: 20px;
                            "
                          >
                            Cập nhật
                          </button>
                          <button id="deleteButton" onclick="deleteEmployee()" type="button" 
                            style="
                              background-color: #f72b4d;
                              color: #f8f9fa;
                              display:none; 
                              width: 40%; 
                              margin-top: 20px; 
                              padding: 15px;
                              font-size: 20px;
                              font-weight: 600;
                              border: 2px solid #f72b4d;
                              border-radius: 20px;
                              cursor: pointer;
                              transition: background-color 0.12s, color 0.12s, border-color 0.12s;
                              text-align: center;
                              display: inline-block;
                              margin-top: 20px;
                            "
                          >
                            Xóa
                          </button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="table-container-emp">
              <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Họ tên</th>
                        <th>Ngày sinh</th>
                        <th>Giới tính</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Địa chỉ</th>
                        <th>Mật khẩu</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Chuyển trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Dữ liệu nhân viên sẽ được điền ở đây -->
                </tbody>
              </table>
            </div>
        </div>

        <div id="createAccountModal" class="modal" style="display: none;">
          <div class="modal-content">
              <div class="modal-header">
                <h2>Tạo tài khoản</h2>
                <span class="close" @click="closeModalManual">&times;</span>
              </div>
              <form id="createAccountForm" @submit.prevent="makeNewAccount">
                  <customInput
                      id="hoten"
                      label="Họ tên"
                      type="text"
                      placeholder="Họ tên của nhân viên"
                      icon="pi pi-user"
                  />
                  <customInput
                      id="ngaysinh"
                      label="Ngày sinh"
                      type="date"
                      icon="pi pi-calendar"
                  />
                  <customInput
                      id="diachi"
                      label="Địa chỉ"
                      type="text"
                      placeholder="Địa chỉ của nhân viên"
                      icon="pi pi-map-marker"
                  />
                  <customSelect
                    id="gioitinh"
                    label="Giới tính"
                    :options="[
                      { value: 'true', label: 'Nam' },
                      { value: 'false', label: 'Nữ' }
                    ]"
                    icon="pi pi-pencil"
                    placeholder="Giới tính"
                  />
                  <customInput
                      id="sdt"
                      label="Số điện thoại"
                      type="tel"
                      placeholder="Số điện thoại của nhân viên"
                      icon="pi pi-phone"
                  />
                  <customInput
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="Email của nhân viên"
                      icon="pi pi-at"
                  />
                  <customInput
                      id="password"
                      label="Mật khẩu"
                      type="password"
                      placeholder="Mật khẩu của nhân viên"
                      icon="pi pi-lock"
                      v-model="refPassword"
                  />
                  <customButton
                      bgColor="#C10C99"
                      textColor="#f8f9fa"
                      borderColor="#C10C99"
                      hoverColor="transparent"
                      hoverTextColor="#C10C99"
                      type="submit"
                  >
                    Tạo tài khoản
                  </customButton>
                </form>
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

::v-deep .sort-button {
  border-radius: 20px;
  padding: 5px;
  font-weight: 600;
  transition: .12s ease;
  background-color: transparent;
}

::v-deep .search-filters .inactive {
  border: 1px solid #CC4125;
  color: #CC4125;
}

::v-deep .search-filters .inactive:hover,
::v-deep .search-filters .inactive:focus {
  box-shadow: 0 0 1px 1px #CC4125;
}

::v-deep .search-filters .active {
  border: 1px solid #6AA84F;
  color: #6AA84F;
}

::v-deep .search-filters .active:hover,
::v-deep .search-filters .active:focus {
  box-shadow: 0 0 1px 1px #6AA84F;
}

::v-deep .main-container {
  display: flex;
  flex-wrap: wrap;
  color: white;
  flex-direction: column;
}
::v-deep .employee-list {
  flex: 1 1 45%;
}
::v-deep .input-group {
  margin-bottom: 15px;
}
::v-deep .input-group input, ::v-deep .input-group select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
::v-deep .employee-list table {
  width: 100%;
  border-collapse: collapse;
}
::v-deep .employee-list th, ::v-deep .employee-list td {
  padding: 8px;
}

::v-deep .employee-list th {
  background-color: #C10C99;
  text-align: left;
  color: rgba(255, 255, 255, 0.75);
}

::v-deep .employee-list td {
  background-color: #b6a2b2;
  color: #C10C99;
  font-weight: 600;
}

::v-deep .employee-list th:first-child {
  border-radius: 12px 0 0 0;
}

::v-deep .employee-list th:last-child {
  border-radius: 0 12px 0 0;
}

::v-deep .search-filters {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}
::v-deep .search-filters select, ::v-deep .search-filters input, ::v-deep .search-filters button {
  margin-right: 10px;
}
::v-deep .password-cell {
  position: relative;
}
::v-deep .password-cell .toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
::v-deep .switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}
::v-deep .switch input { display: none; }
::v-deep .slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}
::v-deep .slider:before {
  position: absolute;
  content: "";
  height: 16px; width: 16px;
  left: 2px; bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
::v-deep .update-btn {
  background-color: #4f8bca;
  color: white;
  border: 2px solid #4f8bca;
  border-radius: 8px;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  transition: .12s ease;
  width: 100%;
}
/* Modal styles */
::v-deep .modal {
  display: none;
  position: fixed;
  z-index: 1009;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

::v-deep .modal-header {
  display: flex;
  justify-content: space-between;
  border-bottom: none !important;
  padding-left: 0;
  margin-bottom: 20px !important;
  align-items: center;
}

::v-deep .modal-content {
  background-color: #1f1f1f !important;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 40% !important;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

::v-deep .modal-content .close {
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  width: fit-content;
}

::v-deep .modal-content .close:hover {
  color: #C10C99;
}

::v-deep .update-btn:hover {
  background-color: transparent;
  color: #4f8bca;
}
::v-deep input:checked + .slider {
  background-color: #C10C99;
}
::v-deep input:checked + .slider:before {
  transform: translateX(20px);
}

::v-deep #deleteButton:hover {
  background-color: transparent !important;
  color: #f72b4d !important;
}

::v-deep #updateButton:hover {
  background-color: transparent !important;
  color: #C10C99 !important;
}

::v-deep .openNewAccountForm:hover {
  box-shadow: 0 0 1px 1px #C10C99;
}

::v-deep .table-container-emp {
  padding: 20px;
  border-radius: 10px;
  background-image: linear-gradient(#1f1f1f, #c10c9a2d);
  min-height: 50vh;
}
</style>