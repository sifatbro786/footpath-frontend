// src/layouts/StoreLayout.jsx
import { Outlet } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import AnnouncementBar from "../components/store/layout/AnnouncementBar";
import StoreHeader from "../components/store/layout/StoreHeader";
import StoreFooter from "../components/store/layout/StoreFooter";
import CartDrawer from "../components/store/cart/CartDrawer";

// Storefront shell. Cart state + drawer are scoped here (not app-wide) so the
// cart UI never appears on admin/auth routes.
const StoreLayout = () => {
    return (
        <CartProvider>
            <div className="flex min-h-screen flex-col">
                <AnnouncementBar />
                <StoreHeader />
                <main className="flex-1">
                    <Outlet />
                </main>
                <StoreFooter />

                <CartDrawer />
            </div>
        </CartProvider>
    );
};

export default StoreLayout;
