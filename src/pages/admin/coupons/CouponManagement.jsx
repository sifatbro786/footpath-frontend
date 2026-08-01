// src/pages/admin/coupons/CouponManagement.jsx
import { Pencil, Plus, Search, Ticket, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import couponApi from "../../../api/couponApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import Pagination from "../../../components/admin/common/Pagination";

const formatBDT = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;

const formatValue = (c) => {
    if (c.couponType === "percentage")
        return `${c.value}%${c.maxDiscountAmount ? ` (up to ${formatBDT(c.maxDiscountAmount)})` : ""}`;
    if (c.couponType === "fixed_amount") return formatBDT(c.value);
    return "Free Shipping";
};

const StatusPill = ({ coupon }) => {
    const now = new Date();
    const expired = new Date(coupon.expiryDate) < now;
    const notStarted = new Date(coupon.startDate) > now;
    const usedUp = coupon.maxUsage > 0 && (coupon.usedCount || 0) >= coupon.maxUsage;

    if (!coupon.isActive)
        return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Disabled
            </span>
        );
    if (expired)
        return (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                Expired
            </span>
        );
    if (usedUp)
        return (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                Used Up
            </span>
        );
    if (notStarted)
        return (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Scheduled
            </span>
        );
    return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Active
        </span>
    );
};

const CouponManagement = () => {
    const navigate = useNavigate();

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("all");

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await couponApi.getAll({
                page,
                limit: 20,
                search: debouncedSearch || undefined,
                status: status !== "all" ? status : undefined,
            });
            setCoupons(data.coupons || []);
            setTotal(data.total || 0);
            setTotalPages(data.pages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load coupons");
        } finally {
            setLoading(false);
        }
    }, [page, status, debouncedSearch]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [status, debouncedSearch]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await couponApi.remove(deleteTarget._id);
            toast.success("Coupon deleted");
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete coupon");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Coupons & Discounts</h1>
                    <p className="text-sm text-gray-500">
                        Manage discount codes and their usage rules
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/coupons/new")}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    New Coupon
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="min-w-55 flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Search</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Coupon code, description…"
                            className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Discount</th>
                                <th className="px-4 py-3">Applies To</th>
                                <th className="px-4 py-3">Usage</th>
                                <th className="px-4 py-3">Validity</th>
                                <th className="px-4 py-3">Status</th>
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
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <Ticket size={28} className="mx-auto mb-2 text-gray-300" />
                                        No coupons found
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-label font-semibold text-gray-900">
                                                {c.code}
                                            </p>
                                            {c.description && (
                                                <p className="text-xs text-gray-400">
                                                    {c.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">
                                            {formatValue(c)}
                                        </td>
                                        <td className="px-4 py-3 capitalize text-gray-500">
                                            {c.appliesTo}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {c.usedCount ?? 0}
                                            {c.maxUsage > 0 ? ` / ${c.maxUsage}` : " / \u221E"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(c.startDate).toLocaleDateString("en-GB")} –{" "}
                                            {new Date(c.expiryDate).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill coupon={c} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/coupons/${c._id}/edit`)
                                                    }
                                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="flex items-center gap-1 text-red-600 hover:underline"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            <p className="text-xs text-gray-400">{total} total coupons</p>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this coupon?"
                message={
                    deleteTarget
                        ? `"${deleteTarget.code}" will be permanently removed. Past orders that used it keep their recorded discount — this cannot be undone.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default CouponManagement;
