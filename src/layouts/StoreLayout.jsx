// src/layouts/StoreLayout.jsx
import { Outlet } from "react-router-dom";
import AnnouncementBar from "../components/store/layout/AnnouncementBar";
import StoreHeader from "../components/store/layout/StoreHeader";
import StoreFooter from "../components/store/layout/StoreFooter";
import CartDrawer from "../components/store/cart/CartDrawer";
import OfferPopup from "../components/store/layout/OfferPopup";

// Storefront shell.
//
// PHASE 1: CartProvider moved out of here and up to App.jsx. Cart *state* must
// outlive this layout — /login renders under AuthLayout, and unmounting the
// provider on the way there wiped a guest's cart. The cart *UI* (drawer) still
// lives here, so it never appears on admin or auth routes.
const StoreLayout = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <AnnouncementBar />
            <StoreHeader />
            <main className="flex-1">
                <Outlet />
            </main>
            <StoreFooter />

            <CartDrawer />
            <OfferPopup />
        </div>
    );
};

export default StoreLayout;
