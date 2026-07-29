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
        items: [{ label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true }],
    },
    {
        label: "Catalog",
        items: [
            { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
            { label: "Categories", path: "/admin/categories", icon: FolderTree },
            { label: "Products", path: "/admin/products", icon: Package },
            { label: "Shipping", path: "/admin/shipping", icon: Truck },
        ],
    },
    {
        label: "Marketing",
        items: [
            { label: "Coupons", path: "/admin/coupons", icon: Ticket },
            { label: "Campaigns", path: "/admin/campaigns", icon: Megaphone },
            { label: "Cart Campaigns", path: "/admin/cart-campaigns", icon: ShoppingBag },
            { label: "Offer Popups", path: "/admin/offers", icon: FileText },
        ],
    },
    {
        label: "Storefront Content",
        items: [
            { label: "Navbar", path: "/admin/navbar", icon: ListTree },
            { label: "Product Sections", path: "/admin/sections", icon: LayoutGrid },
            { label: "Page Meta / SEO", path: "/admin/page-meta", icon: ListTree },
            // { label: "Hero Slides", path: "/admin/hero-items", icon: Image },
            // { label: "Hero Content", path: "/admin/hero-content", icon: PanelTop },
            // { label: "A+ Content", path: "/admin/aplus-content", icon: FileText },
        ],
    },
    {
        label: "Customers",
        items: [
            { label: "Users", path: "/admin/users", icon: Users },
            { label: "Reviews", path: "/admin/reviews", icon: Star },
        ],
    },
];

// Flat list — used by AppRoute.jsx to generate placeholder routes and by
// AdminLayout to resolve the current page title for the topbar.
export const adminNavFlat = adminNavGroups.flatMap((g) => g.items);
