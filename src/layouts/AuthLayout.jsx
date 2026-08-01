import { Link, Outlet } from "react-router-dom";

// Minimal shell for auth pages (login / register / verify / forgot / reset).
// No store header, cart, or announcement — auth should be distraction-free.
// The auth pages themselves render their own card; this just centres + brands.
const AuthLayout = () => {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10">
            {/* graph-paper signature, kept faint */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 paper-grid opacity-60"
            />

            <div className="relative w-full max-w-md">
                <Link to="/" className="mx-auto mb-8 block w-fit" aria-label="Elmate — home">
                    <img src="/logo.png" alt="Elmate Stationery" className="h-10 w-auto" />
                </Link>

                <Outlet />

                <Link
                    to="/"
                    className="mt-8 block text-center font-label text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-grass"
                >
                    ← Back to store
                </Link>
            </div>
        </div>
    );
};

export default AuthLayout;
