import { Route, Routes } from "react-router-dom";
import FrontendLayout from "../layouts/FrontendLayout.jsx";
import AdminLayout from "../layouts/admin/AdminLayout.jsx";
import { adminNavFlat } from "../layouts/admin/adminNavConfig.js";
import PrivateRoute from "./PrivateRoute.jsx";

import ForgotPasswordPage from "../pages/client/ForgotPasswordPage.jsx";
import HomePage from "../pages/client/HomePage.jsx";
import LoginPage from "../pages/client/LoginPage.jsx";
import NotFoundPage from "../pages/client/NotFoundPage.jsx";
import ProfilePage from "../pages/client/ProfilePage.jsx";
import RegisterPage from "../pages/client/RegisterPage.jsx";
import ResetPasswordPage from "../pages/client/ResetPasswordPage.jsx";
import VerifyEmailPage from "../pages/client/VerifyEmailPage.jsx";

import CategoriesManagement from "../pages/admin/category/CategoriesManagement.jsx";
import CategoryForm from "../pages/admin/category/CategoryForm.jsx";
import AdminDashboardPage from "../pages/admin/dashboard/AdminDashboardPage.jsx";
import AdminPlaceholderPage from "../pages/admin/dashboard/AdminPlaceholderPage.jsx";
import OrdersManagement from "../pages/admin/orders/OrdersManagement.jsx";
import ProductForm from "../pages/admin/products/ProductForm.jsx";
import ProductManagement from "../pages/admin/products/ProductManagement.jsx";
import ProductView from "../pages/admin/products/ProductView.jsx";
import OrderDetail from "../pages/admin/orders/OrderDetail.jsx";
import CouponManagement from "../pages/admin/coupons/CouponManagement.jsx";
import CouponForm from "../pages/admin/coupons/CouponForm.jsx";
import CampaignManagement from "../pages/admin/campaigns/CampaignManagement.jsx";
import CampaignForm from "../pages/admin/campaigns/CampaignForm.jsx";

// Paths with a real page built out — excluded from the auto-generated placeholder routes below
const BUILT_ADMIN_PATHS = ["/admin/categories", "/admin/products", "/admin/orders"];

const AppRoute = () => {
    return (
        <Routes>
            {/* Client-facing site */}
            <Route element={<FrontendLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            {/* Admin dashboard — role-gated (role === "admin") */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="/admin/categories" element={<CategoriesManagement />} />
                    <Route path="/admin/categories/new" element={<CategoryForm />} />
                    <Route path="/admin/categories/:id/edit" element={<CategoryForm />} />
                    <Route path="/admin/products" element={<ProductManagement />} />
                    <Route path="/admin/products/new" element={<ProductForm />} />
                    <Route path="/admin/products/:id" element={<ProductView />} />
                    <Route path="/admin/products/:id/edit" element={<ProductForm />} />
                    <Route path="orders" element={<OrdersManagement />} />
                    <Route path="orders/:id" element={<OrderDetail />} />
                    <Route path="/admin/coupons" element={<CouponManagement />} />
                    <Route path="/admin/coupons/new" element={<CouponForm />} />
                    <Route path="/admin/coupons/:id/edit" element={<CouponForm />} />

                    <Route path="/admin/campaigns" element={<CampaignManagement />} />
                    <Route path="/admin/campaigns/new" element={<CampaignForm />} />
                    <Route path="/admin/campaigns/:id/edit" element={<CampaignForm />} />

                    {/* Every other admin module — placeholder until built out step by step */}
                    {adminNavFlat
                        .filter((item) => !item.end && !BUILT_ADMIN_PATHS.includes(item.path))
                        .map((item) => (
                            <Route
                                key={item.path}
                                path={item.path.replace("/admin/", "")}
                                element={<AdminPlaceholderPage title={item.label} />}
                            />
                        ))}
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRoute;
