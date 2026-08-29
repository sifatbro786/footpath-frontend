import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import AppRoute from "./router/AppRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { queryClient } from "./lib/queryClient.js";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import ScrollToTop from "./components/common/ScrollToTop.jsx";

/**
 * Provider order matters:
 *   ErrorBoundary  outermost, so it can catch a throw from any provider below
 *   QueryClient    above anything that may fetch
 *   BrowserRouter  above ScrollToTop and anything using router hooks
 *   Auth           above Cart — Phase 5's merge-on-login reads auth state
 *   Cart           app-wide, NOT inside StoreLayout (Phase 1 fix): scoping it to
 *                  the store layout meant navigating to /login unmounted the
 *                  provider and silently emptied a guest's cart
 */
function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ScrollToTop />
                    <AuthProvider>
                        <CartProvider>
                            <AppRoute />
                            <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
                        </CartProvider>
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
