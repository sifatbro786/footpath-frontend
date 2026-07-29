// src/layouts/admin/adminNavConfig.js
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Ticket,
    Megaphone,
    Tag,
    Image,
    PanelTop,
    FileText,
    ListTree,
    Users,
    ShoppingBag,
    Star,
    Truck,
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
            { label: "Categories", path: "/admin/categories", icon: FolderTree },
            { label: "Products", path: "/admin/products", icon: Package },
        ],
    },
    {
        label: "Sales",
        items: [
            { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
            { label: "Coupons", path: "/admin/coupons", icon: Ticket },
            { label: "Campaigns", path: "/admin/campaigns", icon: Megaphone },
            { label: "Promotions", path: "/admin/promotions", icon: Tag },
        ],
    },
    {
        label: "Storefront Content",
        items: [
            { label: "Hero Slides", path: "/admin/hero-items", icon: Image },
            { label: "Hero Content", path: "/admin/hero-content", icon: PanelTop },
            { label: "Offer Popups", path: "/admin/offers", icon: FileText },
            { label: "A+ Content", path: "/admin/aplus-content", icon: FileText },
            { label: "Page Meta / SEO", path: "/admin/page-meta", icon: ListTree },
            // { label: "Navbar", path: "/admin/navbar", icon: ListTree },
        ],
    },
    {
        label: "Customers",
        items: [
            { label: "Users", path: "/admin/users", icon: Users },
            { label: "Carts", path: "/admin/carts", icon: ShoppingBag },
            { label: "Reviews", path: "/admin/reviews", icon: Star },
        ],
    },
    {
        label: "Settings",
        items: [{ label: "Shipping", path: "/admin/shipping", icon: Truck }],
    },
];

// Flat list — used by AppRoute.jsx to generate placeholder routes and by
// AdminLayout to resolve the current page title for the topbar.
export const adminNavFlat = adminNavGroups.flatMap((g) => g.items);
