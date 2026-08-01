import { Route, Routes } from "react-router-dom";
import StoreLayout from "../layouts/StoreLayout.jsx";
import AdminLayout from "../layouts/admin/AdminLayout.jsx";
import { adminNavFlat } from "../layouts/admin/adminNavConfig.js";
import PrivateRoute from "./PrivateRoute.jsx";

import ForgotPasswordPage from "../pages/client/ForgotPasswordPage.jsx";
import HomePage from "../pages/store/HomePage.jsx";
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
import CartCampaignManager from "../pages/admin/carts/CartCampaignManager.jsx";
import ShippingManagement from "../pages/admin/shipping/ShippingManagement.jsx";
import UserManagement from "../pages/admin/users/UserManagement.jsx";
import ReviewManagement from "../pages/admin/reviews/ReviewManagement.jsx";
import SectionManagement from "../pages/admin/sections/SectionManagement.jsx";
import OfferManagement from "../pages/admin/offers/OfferManagement.jsx";
import PageMetaManagement from "../pages/admin/pageMeta/PageMetaManagement.jsx";
import NavbarConfiguration from "../pages/admin/navbar/NavbarConfiguration.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";

const AppRoute = () => {
    return (
        <Routes>
            {/* Client-facing site */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route element={<StoreLayout />}>
                <Route path="/" element={<HomePage />} />
                {/* /shop, /cart, /category/:slug ... পরে */}

                {/* logged-in account pages live inside the store shell */}
                <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            {/* Admin dashboard — role-gated (role === "admin") */}
            <Route element={<PrivateRoute allowedRoles={["admin", "executive"]} />}>
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

                    <Route path="/admin/cart-campaigns" element={<CartCampaignManager />} />
                    <Route path="/admin/shipping" element={<ShippingManagement />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/reviews" element={<ReviewManagement />} />
                    <Route path="/admin/sections" element={<SectionManagement />} />
                    <Route path="/admin/offers" element={<OfferManagement />} />
                    <Route path="/admin/page-meta" element={<PageMetaManagement />} />

                    <Route path="/admin/navbar" element={<NavbarConfiguration />} />

                    {/* Every other admin module — placeholder until built out step by step */}
                    {adminNavFlat
                        .filter((item) => !item.end && !item.built)
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
