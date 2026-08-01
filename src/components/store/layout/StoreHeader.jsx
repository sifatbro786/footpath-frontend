import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingBag, User, ChevronRight } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useCart } from "../../../hooks/useCart";
import { navLinks } from "../../../data/store/navData";
import AccountMenu from "./AccountMenu";

const StoreHeader = () => {
    const { isAuthenticated } = useAuth();
    const { itemCount, openCart } = useCart();
    const navigate = useNavigate();

    const [drawer, setDrawer] = useState(false);
    const [query, setQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);

    // Subtle shadow once the page scrolls
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Lock body scroll while the mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = drawer ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [drawer]);

    // Esc closes the drawer
    useEffect(() => {
        if (!drawer) return;
        const onKey = (e) => e.key === "Escape" && setDrawer(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [drawer]);

    const submitSearch = (e) => {
        e.preventDefault();
        const term = query.trim();
        navigate(term ? `/shop?search=${encodeURIComponent(term)}` : "/shop");
        setDrawer(false);
    };

    const accountHref = isAuthenticated ? "/account" : "/login";

    return (
        <header
            className={`sticky top-0 z-40 bg-paper transition-shadow ${
                scrolled
                    ? "shadow-[0_1px_0_var(--color-line),0_10px_28px_-20px_rgba(22,21,50,0.55)]"
                    : "border-b border-line"
            }`}
        >
            {/* ── Top row ─────────────────────────────────────────────── */}
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5">
                <button
                    type="button"
                    onClick={() => setDrawer(true)}
                    aria-label="Open menu"
                    aria-expanded={drawer}
                    aria-controls="mobile-drawer"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line text-ink transition hover:bg-paper-dim lg:hidden"
                >
                    <Menu size={20} />
                </button>

                <Link to="/" className="shrink-0" aria-label="Home">
                    <img src="/logo.png" alt="Elmate Stationery" className="h-9 w-auto" />
                </Link>

                {/* Desktop / tablet search */}
                <form onSubmit={submitSearch} className="hidden flex-1 md:block" role="search">
                    <div className="relative mx-auto max-w-xl">
                        <Search
                            size={18}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search pens, notebooks, art supplies…"
                            aria-label="Search products"
                            className="w-full rounded-md border border-line bg-white py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-grass focus:outline-none focus:ring-2 focus:ring-grass/20"
                        />
                    </div>
                </form>

                {/* Right actions */}
                <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                    <AccountMenu />

                    <button
                        type="button"
                        onClick={openCart}
                        aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
                        className="relative flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-paper-dim"
                    >
                        <ShoppingBag size={20} />
                        <span className="hidden sm:inline">Cart</span>
                        {itemCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                                {itemCount > 99 ? "99+" : itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Desktop category nav ────────────────────────────────── */}
            <nav className="hidden border-t border-line lg:block" aria-label="Categories">
                <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4">
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                end={link.to === "/"}
                                className={({ isActive }) =>
                                    `group relative inline-flex items-center px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive ? "text-grass" : "text-ink-soft hover:text-grass"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {link.label}
                                        <span
                                            className={`absolute inset-x-3 bottom-1.5 h-0.5 origin-left rounded-full bg-grass transition-transform duration-200 ${
                                                isActive
                                                    ? "scale-x-100"
                                                    : "scale-x-0 group-hover:scale-x-100"
                                            }`}
                                        />
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* ── Mobile search (always visible under the top row) ───── */}
            <form
                onSubmit={submitSearch}
                className="border-t border-line px-4 py-2.5 md:hidden"
                role="search"
            >
                <div className="relative">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products…"
                        aria-label="Search products"
                        className="w-full rounded-md border border-line bg-white py-2 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                </div>
            </form>

            {/* ── Mobile drawer ───────────────────────────────────────── */}
            {/* Always mounted so it can never fail to render — visibility is
                purely a transform/opacity toggle, not a mount/unmount race. */}
            <div
                onClick={() => setDrawer(false)}
                aria-hidden="true"
                className={`fixed inset-0 z-90 bg-ink/50 transition-opacity duration-300 lg:hidden ${
                    drawer ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />
            <aside
                id="mobile-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                aria-hidden={!drawer}
                className={`fixed inset-y-0 left-0 z-100 flex w-[86%] max-w-sm flex-col border-r border-line bg-paper shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
                    drawer ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
                    <img src="/logo.png" alt="Elmate Stationery" className="h-8 w-auto" />
                    <button
                        type="button"
                        onClick={() => setDrawer(false)}
                        aria-label="Close menu"
                        className="grid h-10 w-10 place-items-center rounded-md border border-line text-ink transition hover:bg-paper-dim"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto" aria-label="Categories">
                    <ul className="divide-y divide-line">
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    end={link.to === "/"}
                                    onClick={() => setDrawer(false)}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between border-l-2 px-4 py-3.5 text-[15px] font-medium transition ${
                                            isActive
                                                ? "border-grass bg-paper-dim text-grass"
                                                : "border-transparent text-ink hover:bg-paper-dim"
                                        }`
                                    }
                                >
                                    {link.label}
                                    <ChevronRight size={16} className="text-muted" />
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="border-t border-line p-4">
                    <Link
                        to={accountHref}
                        onClick={() => setDrawer(false)}
                        className="flex items-center justify-center gap-2 rounded-md bg-grass px-4 py-3 text-sm font-semibold text-white transition hover:bg-grass/90"
                    >
                        <User size={18} />
                        {isAuthenticated ? "My account" : "Login / Register"}
                    </Link>
                </div>
            </aside>
        </header>
    );
};

export default StoreHeader;
