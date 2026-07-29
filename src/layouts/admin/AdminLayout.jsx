/* eslint-disable no-unused-vars */
// src/layouts/admin/AdminLayout.jsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { adminNavGroups, adminNavFlat } from "./adminNavConfig";

const SIDEBAR_COLLAPSE_KEY = "admin:sidebarCollapsed";

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true",
    );

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
            return next;
        });
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const currentTitle =
        adminNavFlat.find((item) =>
            item.end ? location.pathname === item.path : location.pathname.startsWith(item.path),
        )?.label || "Admin";

    // `forceExpanded` = true for the mobile drawer, which should never show icon-only mode
    const sidebarContent = (forceExpanded = false) => {
        const isCollapsed = collapsed && !forceExpanded;

        return (
            <>
                <div
                    className={`flex items-center border-b border-gray-200 px-5 py-4 ${
                        isCollapsed ? "justify-center px-2" : "justify-between"
                    }`}
                >
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-lg font-bold text-gray-900">
                                Footpath Admin
                            </p>
                            <p className="truncate text-xs text-gray-500">{user?.email}</p>
                        </div>
                    )}
                    {!forceExpanded && (
                        <button
                            onClick={toggleCollapsed}
                            className="hidden shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 lg:flex"
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {adminNavGroups.map((group) => (
                        <div key={group.label} className="mb-5">
                            {!isCollapsed && (
                                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    {group.label}
                                </p>
                            )}
                            <div className="flex flex-col gap-0.5">
                                {group.items.map(({ label, path, icon: Icon, end }) => (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        end={end}
                                        title={isCollapsed ? label : undefined}
                                        onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                                isCollapsed ? "justify-center px-0" : ""
                                            } ${
                                                isActive
                                                    ? "bg-gray-900 text-white"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            }`
                                        }
                                    >
                                        <Icon size={16} strokeWidth={2} className="shrink-0" />
                                        {!isCollapsed && label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-gray-200 p-3">
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? "Logout" : undefined}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 ${
                            isCollapsed ? "justify-center px-0" : ""
                        }`}
                    >
                        <LogOut size={16} className="shrink-0" />
                        {!isCollapsed && "Logout"}
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop sidebar */}
            <aside
                className={`hidden shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 lg:flex ${
                    collapsed ? "w-16" : "w-64"
                }`}
            >
                {sidebarContent()}
            </aside>

            {/* Mobile sidebar (drawer) — always full width, never collapsed */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-64 flex-col bg-white">
                        {sidebarContent(true)}
                    </aside>
                </div>
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
                    <button
                        className="text-gray-500 lg:hidden"
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">{currentTitle}</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
