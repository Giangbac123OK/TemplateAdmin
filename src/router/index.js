import { createRouter, createWebHistory } from "vue-router";
import login from "@/views/login.vue";
import forgotPswd from "@/views/forgotPassword.vue";
import otpVerification from "@/views/otpVerification.vue";
import passwordChanging from "@/views/passwordChanging.vue";
import mainMenu from "@/views/mainMenu.vue";
import employees from "@/views/employees.vue";
import products from "@/views/products.vue";
import brands from "@/views/brands.vue";
import customers from "@/views/customers.vue";
import ranks from "@/views/ranks.vue";
import vouchers from "@/views/vouchers.vue";
import sales from "@/views/sales.vue";
import statistic from "@/views/statistic.vue";
import saleManagement from "@/views/saleManagement.vue";
import invoice from "@/views/invoice.vue";
import invoiceAdding from "@/views/invoiceAdding.vue";
import category from "@/views/category.vue";

const isAuthenticated = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? true : false;
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/mainMenu',
            name: 'Main Menu',
            component: mainMenu,
            meta: { requiresAuth: true, title: 'Trang chủ' }
        },
        {
            path: '/forgotPassword',
            name: 'Forgot Password',
            component: forgotPswd,
            meta: { requiresAuth: true, title: 'Quên mật khẩu' }
        },
        {
            path: '/otpVerification',
            name: 'OTP Verification',
            component: otpVerification,
            meta: { requiresAuth: true, title: 'Xác minh OTP' }
        },
        {
            path: '/passwordChanging',
            name: 'Password Changing',
            component: passwordChanging,
            meta: { requiresAuth: true, title: 'Đổi mật khẩu' }
        },
        {
            path: '/login',
            name: 'Login',
            component: login,
            meta: { requiresAuth: true, title: 'Đăng nhập' }
        },
        {
            path: '/employees',
            name: 'Employees',
            component: employees,
            meta: { requiresAuth: true, title: 'Nhân viên' }
        },
        {
            path: '/',
            name: 'Products',
            component: products,
            meta: { requiresAuth: true, title: 'Sản phẩm' }
        },
        {
            path: '/brands',
            name: 'Brands',
            component: brands,
            meta: { requiresAuth: true, title: 'Thương hiệu' }
        },
        {
            path: '/customers',
            name: 'Customers',
            component: customers,
            meta: { requiresAuth: true, title: 'Khách hàng' }
        },
        {
            path: '/ranks',
            name: 'Ranks',
            component: ranks,
            meta: { requiresAuth: true, title: 'Rank' }
        },
        {
            path: '/vouchers',
            name: 'Vouchers',
            component: vouchers,
            meta: { requiresAuth: true, title: 'Voucher' }
        },
        {
            path: '/sales',
            name: 'Sales',
            component: sales,
            meta: { requiresAuth: true, title: 'Sale' }
        },
        {
            path: '/saleManagement',
            name: 'Sale Management',
            component: saleManagement,
            meta: { requiresAuth: true, title: 'Bán hàng' }
        },
        {
            path: '/invoice',
            name: 'Invoice',
            component: invoice,
            meta: { requiresAuth: true, title: 'Hóa đơn' }
        },
        {
            path: '/invoiceAdding',
            name: 'Invoice Adding',
            component: invoiceAdding,
            meta: { requiresAuth: true, title: 'Thêm hóa đơn' }
        },
        {
            path: '/statistic',
            name: 'Statistic',
            component: statistic,
            meta: { requiresAuth: true, title: 'Thống kê' }
        },
        {
            path: '/category',
            name: 'Category',
            component: category,
            meta: { requiresAuth: true, title: 'Phân loại' }
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        const defaultTitle = 'My App';
        document.title = to.meta.title || defaultTitle;
        next('/login');
        next();
    } else {
        const defaultTitle = 'My App';
        document.title = to.meta.title || defaultTitle;
        next();
    }
});

export default router;