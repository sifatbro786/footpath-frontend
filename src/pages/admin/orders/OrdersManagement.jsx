/* eslint-disable no-unused-vars */
// src/pages/admin/orders/OrdersManagement.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Eye, Package, Clock, CheckCircle2, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "../../../api/orderApi";
import Pagination from "../../../components/admin/common/Pagination";
import OrderStatusBadge from "../../../components/admin/orders/OrderStatusBadge";
import PaymentStatusBadge from "../../../components/admin/orders/PaymentStatusBadge";

// Order.js `orderStatus` enum — exact 7 values, in schema order
const ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded",
];
// Order.js `paymentStatus` enum
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

const formatBDT = (n) =>
    `\u09F3${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;

const StatCard = ({ icon: Icon, label, value, tint }) => (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="truncate text-lg font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const OrdersManagement = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [paymentStatus, setPaymentStatus] = useState("all");

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        orderApi
            .getStats()
            .then(({ data }) => setStats(data.stats))
            .catch(() => {});
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await orderApi.getAll({
                page,
                limit: 10,
                status: status !== "all" ? status : undefined,
                paymentMethod: paymentMethod !== "all" ? paymentMethod : undefined,
                paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
                search: debouncedSearch || undefined,
            });
            setOrders(data.orders || []);
            setTotal(data.total || 0);
            setTotalPages(data.pages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [page, status, paymentMethod, paymentStatus, debouncedSearch]);

    useEffect(() => {
        load();
    }, [load]);

    // reset to page 1 whenever a filter changes
    useEffect(() => {
        setPage(1);
    }, [status, paymentMethod, paymentStatus, debouncedSearch]);

    const refresh = () => {
        load();
        orderApi
            .getStats()
            .then(({ data }) => setStats(data.stats))
            .catch(() => {});
    };

    return (
        <div className="space-y-5 pb-10">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
                <p className="text-sm text-gray-500">Manage and track all customer orders</p>
            </div>

            {/* Stats — from GET /admin/orders/stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                    icon={Package}
                    label="Total Orders"
                    value={stats?.totalOrders ?? "—"}
                    tint="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    icon={Clock}
                    label="Pending"
                    value={stats?.pendingOrders ?? "—"}
                    tint="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Delivered"
                    value={stats?.deliveredOrders ?? "—"}
                    tint="bg-green-100 text-green-600"
                />
                <StatCard
                    icon={Wallet}
                    label="Revenue (Delivered)"
                    value={formatBDT(stats?.totalRevenue)}
                    tint="bg-purple-100 text-purple-600"
                />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Search</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Order #, Name, Phone…"
                            className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                        Payment Method
                    </label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="all">All Methods</option>
                        <option value="COD">COD</option>
                        <option value="SSLCommerz">SSLCommerz</option>
                    </select>
                </div>
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Payment Status
                        </label>
                        <select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                        >
                            <option value="all">All Status</option>
                            {PAYMENT_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-gray-400"
                                    >
                                        Loading…
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-gray-400"
                                    >
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">
                                                {o.orderNumber}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {o.isGuest ? "Guest" : "Registered"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900">
                                                {o.shippingAddress?.name || "—"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {o.shippingAddress?.phone}
                                            </p>
                                            {o.isGuest && o.guestEmail && (
                                                <p className="text-xs text-gray-400">
                                                    {o.guestEmail}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">
                                                {formatBDT(o.totalPrice)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {o.orderItems?.length || 0} items
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <OrderStatusBadge status={o.orderStatus} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <PaymentStatusBadge status={o.paymentStatus} />
                                            <p className="mt-1 text-xs text-gray-400">
                                                {o.paymentMethod}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(o.createdAt).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/admin/orders/${o._id}`)}
                                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            <p className="text-xs text-gray-400">{total} total orders</p>
        </div>
    );
};

export default OrdersManagement;
