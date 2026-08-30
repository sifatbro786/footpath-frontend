import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

import Eyebrow from "../components/store/ui/Eyebrow";
import Breadcrumbs from "../components/store/ui/Breadcrumbs";
import { useAuth } from "../hooks/useAuth";

/**
 * Account shell.
 *
 * Nested inside StoreLayout, so the header, footer and cart drawer stay put.
 * Navigation is a plain hairline separated list rather than tabs or cards: this
 * is a settings area, and it should read like an index page.
 */
const LINKS = [
    { to: "/account/orders", label: "Orders" },
    { to: "/account/wishlist", label: "Saved items" },
    { to: "/account/addresses", label: "Addresses" },
    { to: "/account/reviews", label: "Reviews" },
    { to: "/account/profile", label: "Profile" },
    { to: "/account/password", label: "Password" },
];

export default function AccountLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Signed out");
        navigate("/");
    };

    return (
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:pt-10">
            <Breadcrumbs items={[{ label: "Account", href: "/account/orders" }]} className="mb-7" />

            <header>
                <Eyebrow>Your account</Eyebrow>
                <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    {user?.name || "Account"}
                </h1>
                {user?.email && (
                    <p className="mt-2 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                        {user.email}
                    </p>
                )}
            </header>

            <div className="mt-10 grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-14">
                <nav aria-label="Account" className="lg:sticky lg:top-28 lg:self-start">
                    {/* Horizontal scroll strip on mobile, stacked index on desktop */}
                    <ul className="no-scrollbar -mx-4 flex overflow-x-auto border-y border-line px-4 lg:mx-0 lg:flex-col lg:border-y-0 lg:px-0">
                        {LINKS.map((link) => (
                            <li key={link.to} className="shrink-0 lg:border-b lg:border-line">
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `block whitespace-nowrap py-3 pr-6 text-sm transition-colors lg:pr-0 ${
                                            isActive
                                                ? "font-medium text-ink"
                                                : "text-ink-soft hover:text-ink"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <span
                                            className={
                                                isActive
                                                    ? "border-b-2 border-marigold pb-1 lg:border-b-0 lg:pb-0"
                                                    : ""
                                            }
                                        >
                                            {link.label}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-5 hidden items-center gap-2 font-label text-[11px] uppercase
                                   tracking-[0.16em] text-ink/50 transition-colors hover:text-coral lg:inline-flex"
                    >
                        <LogOut size={13} />
                        Sign out
                    </button>
                </nav>

                <div className="min-w-0">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
