import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import StoreLayout from "../layouts/StoreLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import AdminLayout from "../layouts/admin/AdminLayout.jsx";
import { adminNavFlat } from "../layouts/admin/adminNavConfig.js";
import PrivateRoute from "./PrivateRoute.jsx";
import { PageLoader } from "../components/common/Skeleton.jsx";

// ─── Storefront (eager) ──────────────────────────────────────────────────────
// Small, and on the critical path for a first visit — keep in the main bundle.
import HomePage from "../pages/store/HomePage.jsx";
import NotFoundPage from "../pages/client/NotFoundPage.jsx";
import ShopPage from "../pages/store/ShopPage.jsx";
import CategoryPage from "../pages/store/CategoryPage.jsx";
import SearchPage from "../pages/store/SearchPage.jsx";
import ProductDetailPage from "../pages/store/ProductDetailPage.jsx";
import CartPage from "../pages/store/CartPage.jsx";
import CheckoutPage from "../pages/store/CheckoutPage.jsx";
import OrderSuccessPage from "../pages/store/order/OrderSuccessPage.jsx";
import OrderFailPage from "../pages/store/order/OrderFailPage.jsx";
import OrderCancelPage from "../pages/store/order/OrderCancelPage.jsx";
import OrderTrackPage from "../pages/store/order/OrderTrackPage.jsx";

// ─── Auth (lazy) ─────────────────────────────────────────────────────────────
// Most visitors never sign in; no reason to ship these on first paint.
const LoginPage = lazy(() => import("../pages/client/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../pages/client/RegisterPage.jsx"));
const VerifyEmailPage = lazy(() => import("../pages/client/VerifyEmailPage.jsx"));
const ForgotPasswordPage = lazy(() => import("../pages/client/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("../pages/client/ResetPasswordPage.jsx"));

// ─── Account (lazy) ──────────────────────────────────────────────────────────
// Signed-in area only, so it never ships to a browsing shopper.
const AccountLayout = lazy(() => import("../layouts/AccountLayout.jsx"));
const AccountOrdersPage = lazy(() => import("../pages/account/OrdersPage.jsx"));
const AccountOrderDetailPage = lazy(() => import("../pages/account/OrderDetailPage.jsx"));
const AccountWishlistPage = lazy(() => import("../pages/account/WishlistPage.jsx"));
const AccountAddressesPage = lazy(() => import("../pages/account/AddressesPage.jsx"));
const AccountReviewsPage = lazy(() => import("../pages/account/MyReviewsPage.jsx"));
const AccountProfilePage = lazy(() => import("../pages/account/ProfilePage.jsx"));
const AccountPasswordPage = lazy(() => import("../pages/account/PasswordPage.jsx"));

// ─── Admin (lazy) ────────────────────────────────────────────────────────────
// PHASE 1: the admin dashboard is the single biggest chunk in the app (21 pages
// plus recharts) and is reachable by a handful of staff accounts. Shipping it to
// every shopper was the largest avoidable cost in the bundle.
const AdminDashboardPage = lazy(() => import("../pages/admin/dashboard/AdminDashboardPage.jsx"));
const AdminPlaceholderPage = lazy(() => import("../pages/admin/dashboard/AdminPlaceholderPage.jsx"));
const CategoriesManagement = lazy(() => import("../pages/admin/category/CategoriesManagement.jsx"));
const CategoryForm = lazy(() => import("../pages/admin/category/CategoryForm.jsx"));
const ProductManagement = lazy(() => import("../pages/admin/products/ProductManagement.jsx"));
const ProductForm = lazy(() => import("../pages/admin/products/ProductForm.jsx"));
const ProductView = lazy(() => import("../pages/admin/products/ProductView.jsx"));
const OrdersManagement = lazy(() => import("../pages/admin/orders/OrdersManagement.jsx"));
const OrderDetail = lazy(() => import("../pages/admin/orders/OrderDetail.jsx"));
const CouponManagement = lazy(() => import("../pages/admin/coupons/CouponManagement.jsx"));
const CouponForm = lazy(() => import("../pages/admin/coupons/CouponForm.jsx"));
const CampaignManagement = lazy(() => import("../pages/admin/campaigns/CampaignManagement.jsx"));
const CampaignForm = lazy(() => import("../pages/admin/campaigns/CampaignForm.jsx"));
const CartCampaignManager = lazy(() => import("../pages/admin/carts/CartCampaignManager.jsx"));
const ShippingManagement = lazy(() => import("../pages/admin/shipping/ShippingManagement.jsx"));
const UserManagement = lazy(() => import("../pages/admin/users/UserManagement.jsx"));
const ReviewManagement = lazy(() => import("../pages/admin/reviews/ReviewManagement.jsx"));
const SectionManagement = lazy(() => import("../pages/admin/sections/SectionManagement.jsx"));
const OfferManagement = lazy(() => import("../pages/admin/offers/OfferManagement.jsx"));
const PageMetaManagement = lazy(() => import("../pages/admin/pageMeta/PageMetaManagement.jsx"));
const NavbarConfiguration = lazy(() => import("../pages/admin/navbar/NavbarConfiguration.jsx"));
// Phase 9: modules whose backends already existed but had no interface.
const HeroSlidesManagement = lazy(() => import("../pages/admin/hero/HeroSlidesManagement.jsx"));
const HeroContentManagement = lazy(() => import("../pages/admin/hero/HeroContentManagement.jsx"));
const AplusContentManagement = lazy(() => import("../pages/admin/aplus/AplusContentManagement.jsx"));
const SalesReportPage = lazy(() => import("../pages/admin/analytics/SalesReportPage.jsx"));

const AppRoute = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* ─── Auth ─────────────────────────────────────────────── */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* ─── Storefront ───────────────────────────────────────── */}
                <Route element={<StoreLayout />}>
                    <Route path="/" element={<HomePage />} />

                    {/* PHASE 1: every route the storefront links to is now
                        registered. Before this, /shop, /cart, /checkout,
                        /category/:slug and /products/:slug all fell through to
                        NotFound — eight dead links across the home page alone.
                        Naming follows productMapper's href (/products/:slug),
                        which was already the de-facto contract. */}
                    {/* Catalogue (Phase 3). All three run the same CatalogView
                        over getProducts; they differ only in scope and heading. */}
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/search" element={<SearchPage />} />

                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />

                    {/* Payment gateway lands here. paymentController redirects to
                        these exact paths, so they must stay in sync with
                        buildOrderResultUrl() on the backend. Public by design —
                        guest orders authenticate with a ?token= capability
                        param, not a session. */}
                    <Route path="/order/success" element={<OrderSuccessPage />} />
                    <Route path="/order/fail" element={<OrderFailPage />} />
                    <Route path="/order/cancel" element={<OrderCancelPage />} />

                    {/* Friendlier permalink for the same receipt. /order/success
                        stays canonical because the BACKEND hardcodes it in
                        buildOrderResultUrl; this is an alias, not a replacement,
                        so both keep working. */}
                    <Route path="/order-confirmation/:orderId" element={<OrderSuccessPage />} />

                    {/* Public guest lookup: order number plus phone, for anyone
                        who no longer has their confirmation link. */}
                    <Route path="/order/track" element={<OrderTrackPage />} />

                    {/* Account area, inside the store shell so header, footer
                        and cart drawer stay put. */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/account" element={<AccountLayout />}>
                            <Route index element={<AccountOrdersPage />} />
                            <Route path="orders" element={<AccountOrdersPage />} />
                            <Route
                                path="orders/:orderNumber"
                                element={<AccountOrderDetailPage />}
                            />
                            <Route path="wishlist" element={<AccountWishlistPage />} />
                            <Route path="addresses" element={<AccountAddressesPage />} />
                            <Route path="reviews" element={<AccountReviewsPage />} />
                            <Route path="profile" element={<AccountProfilePage />} />
                            <Route path="password" element={<AccountPasswordPage />} />
                        </Route>

                        {/* Kept so older links and the header menu keep working;
                            the account area is the real home for this now. */}
                        <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
                    </Route>
                </Route>

                {/* ─── Admin — role gated ───────────────────────────────── */}
                <Route element={<PrivateRoute allowedRoles={["admin", "executive"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />

                        <Route path="categories" element={<CategoriesManagement />} />
                        <Route path="categories/new" element={<CategoryForm />} />
                        <Route path="categories/:id/edit" element={<CategoryForm />} />

                        <Route path="products" element={<ProductManagement />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/:id" element={<ProductView />} />
                        <Route path="products/:id/edit" element={<ProductForm />} />

                        <Route path="orders" element={<OrdersManagement />} />
                        <Route path="orders/:id" element={<OrderDetail />} />

                        <Route path="coupons" element={<CouponManagement />} />
                        <Route path="coupons/new" element={<CouponForm />} />
                        <Route path="coupons/:id/edit" element={<CouponForm />} />

                        <Route path="campaigns" element={<CampaignManagement />} />
                        <Route path="campaigns/new" element={<CampaignForm />} />
                        <Route path="campaigns/:id/edit" element={<CampaignForm />} />

                        <Route path="cart-campaigns" element={<CartCampaignManager />} />
                        <Route path="shipping" element={<ShippingManagement />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="reviews" element={<ReviewManagement />} />
                        <Route path="sections" element={<SectionManagement />} />
                        <Route path="offers" element={<OfferManagement />} />
                        <Route path="page-meta" element={<PageMetaManagement />} />
                        <Route path="navbar" element={<NavbarConfiguration />} />

                        {/* Phase 9 */}
                        <Route path="hero-items" element={<HeroSlidesManagement />} />
                        <Route path="hero-content" element={<HeroContentManagement />} />
                        <Route path="aplus-content" element={<AplusContentManagement />} />
                        <Route path="sales-report" element={<SalesReportPage />} />

                        {/* Modules with a backend but no UI yet — Phase 9 */}
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
        </Suspense>
    );
};

export default AppRoute;
