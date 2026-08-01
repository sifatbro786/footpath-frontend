import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LayoutDashboard, LogIn, UserPlus, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";

const AccountMenu = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const panelRef = useRef(null);
    const triggerRef = useRef(null);

    const isStaff = user?.role === "admin" || user?.role === "executive";
    const initial = (user?.name?.trim()?.[0] || "?").toUpperCase();

    const close = () => setOpen(false);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) close();
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    // Esc closes and returns focus to the trigger; move focus into panel on open
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") {
                close();
                triggerRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        // focus first item
        const first = panelRef.current?.querySelector("[data-menu-item]");
        first?.focus();
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // Arrow-key roving between items
    const onPanelKeyDown = (e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const items = [...panelRef.current.querySelectorAll("[data-menu-item]")];
        const idx = items.indexOf(document.activeElement);
        const next =
            e.key === "ArrowDown"
                ? items[(idx + 1) % items.length]
                : items[(idx - 1 + items.length) % items.length];
        next?.focus();
    };

    const handleLogout = async () => {
        close();
        await logout();
        toast.success("Logged out");
        navigate("/");
    };

    const itemCls =
        "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-paper-dim hover:text-grass focus:bg-paper-dim focus:text-grass focus:outline-none";

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={isAuthenticated ? `Account menu, ${user?.name || ""}` : "Account menu"}
                className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-ink-soft transition hover:bg-paper-dim sm:px-2.5"
            >
                {isAuthenticated ? (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-grass font-display text-sm font-semibold text-paper">
                        {initial}
                    </span>
                ) : (
                    <User size={20} />
                )}
                <span className="hidden text-sm font-medium sm:inline">
                    {isAuthenticated ? user?.name?.split(" ")[0] || "Account" : "Login"}
                </span>
            </button>

            {/* Panel — always crafted on paper with hairline dividers, no generic chrome */}
            <div
                ref={panelRef}
                onKeyDown={onPanelKeyDown}
                className={`absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-lg border border-line bg-paper shadow-[0_16px_40px_-16px_rgba(22,21,50,0.45)] transition duration-150 ${
                    open
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                }`}
            >
                {isAuthenticated ? (
                    <>
                        <div className="border-b border-line px-3.5 py-3">
                            <p className="mt-1 truncate text-sm font-semibold text-ink">
                                {user?.name || "Account"}
                            </p>
                            {user?.email && (
                                <p className="truncate text-xs text-muted">{user.email}</p>
                            )}
                        </div>

                        <div className="py-1">
                            <Link to="/profile" data-menu-item onClick={close} className={itemCls}>
                                <User size={16} />
                                Profile
                            </Link>
                            {isStaff && (
                                <Link
                                    to="/admin"
                                    data-menu-item
                                    onClick={close}
                                    className={itemCls}
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </Link>
                            )}
                        </div>

                        <div className="border-t border-line py-1">
                            <button
                                type="button"
                                data-menu-item
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-coral/10 hover:text-coral focus:bg-coral/10 focus:text-coral focus:outline-none"
                            >
                                <LogOut size={16} />
                                Log out
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="py-1">
                        <Link to="/login" data-menu-item onClick={close} className={itemCls}>
                            <LogIn size={16} />
                            Login
                        </Link>
                        <Link to="/register" data-menu-item onClick={close} className={itemCls}>
                            <UserPlus size={16} />
                            Create account
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountMenu;
