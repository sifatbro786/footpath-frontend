// src/layouts/admin/adminNavConfig.js
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Ticket,
    Megaphone,
    FileText,
    ListTree,
    Users,
    ShoppingBag,
    Star,
    Truck,
    LayoutGrid,
    // Aliased: a bare `Image` import shadows the global Image constructor.
    Image as ImageIcon,
    PanelTop,
    TrendingUp,
} from "lucide-react";

// Each `path` maps 1:1 to a backend admin route module (see server.js mounts):
// productAdminRoutes, categoryAdminRoutes, adminOrderRoutes, couponAdminRoutes,
// productCampaignAdminRoutes, promotionAdminRoutes, heroAdminRoutes,
// heroContentAdminRoutes, offerPopupAdminRoutes, aplusContentAdminRoutes,
// pageMetaAdminRoutes, navbarAdminRoutes, adminRoutes (users), adminCartRoutes,
// reviewAdminRoutes, adminShippingRoutes.
export const adminNavGroups = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
            // Phase 9: /api/admin/analytics/sales-report existed from the start
            // and had no UI calling it.
            { label: "Sales Report", path: "/admin/sales-report", icon: TrendingUp, built: true },
        ],
    },
    {
        label: "Catalog",
        items: [
            { label: "Orders", path: "/admin/orders", icon: ShoppingCart, built: true },
            { label: "Categories", path: "/admin/categories", icon: FolderTree, built: true },
            { label: "Products", path: "/admin/products", icon: Package, built: true },
            { label: "Shipping", path: "/admin/shipping", icon: Truck, built: true },
        ],
    },
    {
        label: "Marketing",
        items: [
            { label: "Coupons", path: "/admin/coupons", icon: Ticket, built: true },
            { label: "Campaigns", path: "/admin/campaigns", icon: Megaphone, built: true },
            // {
            //     label: "Cart Campaigns",
            //     path: "/admin/cart-campaigns",
            //     icon: ShoppingBag,
            //     built: true,
            // },
            // { label: "Offer Popups", path: "/admin/offers", icon: FileText, built: true },
        ],
    },
    {
        label: "Storefront Content",
        items: [
            { label: "Navbar", path: "/admin/navbar", icon: ListTree, built: true },
            { label: "Hero Slides", path: "/admin/hero-items", icon: ImageIcon, built: true },
            { label: "Hero Content", path: "/admin/hero-content", icon: PanelTop, built: true },
            { label: "Product Sections", path: "/admin/sections", icon: LayoutGrid, built: true },
            { label: "A+ Content", path: "/admin/aplus-content", icon: FileText, built: true },
            { label: "Page Meta / SEO", path: "/admin/page-meta", icon: ListTree, built: true },
        ],
    },
    {
        label: "Customers",
        items: [
            { label: "Users", path: "/admin/users", icon: Users, built: true },
            { label: "Reviews", path: "/admin/reviews", icon: Star, built: true },
        ],
    },
];

// Flat list — used by AppRoute.jsx to generate placeholder routes and by
// AdminLayout to resolve the current page title for the topbar.
export const adminNavFlat = adminNavGroups.flatMap((g) => g.items);
