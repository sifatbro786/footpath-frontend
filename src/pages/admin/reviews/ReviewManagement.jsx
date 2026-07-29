// src/pages/admin/reviews/ReviewManagement.jsx
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Star, MessageSquareText, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import reviewApi from "../../../api/reviewApi";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import ReviewDetailsModal from "../../../components/admin/reviews/ReviewDetailsModal";
import { STATUSES, statusMeta } from "../../../components/admin/reviews/reviewConstants";

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
          })
        : "—";

const StatCard = ({ label, value, icon: Icon }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
            {Icon && <Icon size={14} />}
            {label}
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

const Stars = ({ rating }) => (
    <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
            <Star
                key={n}
                size={13}
                className={n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
            />
        ))}
    </span>
);

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [meta, setMeta] = useState({ totalAll: 0, pendingCount: 0, averageRating: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState("all");

    const [activeReview, setActiveReview] = useState(null);
    const [actionBusy, setActionBusy] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [status]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await reviewApi.getAll({
                page,
                limit: 10,
                status: status !== "all" ? status : undefined,
            });
            setReviews(data.reviews || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setMeta({
                totalAll: data.totalAll ?? 0,
                pendingCount: data.pendingCount ?? 0,
                averageRating: data.averageRating ?? 0,
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load reviews");
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        load();
    }, [load]);

    const patchLocal = (updated) => {
        setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        setActiveReview((prev) => (prev && prev._id === updated._id ? updated : prev));
    };

    const handleDecide = async (reviewId, nextStatus, adminNotes) => {
        setActionBusy(true);
        try {
            const { data } = await reviewApi.updateStatus(reviewId, {
                status: nextStatus,
                adminNotes,
            });
            patchLocal(data.review);
            toast.success(`Review ${nextStatus}`);
            if (status !== "all") load(); // filtered view — row may no longer belong here
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update review");
        } finally {
            setActionBusy(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await reviewApi.remove(deleteTarget._id);
            toast.success("Review deleted");
            setDeleteTarget(null);
            setActiveReview(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete review");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Review Management</h1>
                    <p className="text-sm text-gray-500">Manage and moderate customer reviews</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={load}
                        className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Reviews (All)"
                    value={meta.totalAll}
                    icon={MessageSquareText}
                />
                <StatCard label="Pending Moderation" value={meta.pendingCount} icon={Clock} />
                <StatCard
                    label="Average Rating (Approved)"
                    value={meta.averageRating ? `${meta.averageRating} / 5` : "—"}
                    icon={Star}
                />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">Customer Reviews</h2>
                    <p className="text-xs text-gray-500">
                        Manage and moderate customer reviews for your products
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Comment</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
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
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <MessageSquareText
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((r) => {
                                    const sMeta = statusMeta(r.status);
                                    const userName = r.user?.name || "Demo Customer";
                                    return (
                                        <tr key={r._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                                        {userName[0]?.toUpperCase() || "?"}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-gray-900">
                                                            {userName}
                                                        </p>
                                                        <p className="truncate text-xs text-gray-400">
                                                            {r.user?.email || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="max-w-40 truncate px-4 py-3 text-gray-600">
                                                {r.product?.name || "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Stars rating={r.rating} />
                                                    <span className="text-xs text-gray-400">
                                                        ({r.rating}/5)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="max-w-56 truncate px-4 py-3 text-gray-600">
                                                {r.comment || (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sMeta.badge}`}
                                                >
                                                    {sMeta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {fmtDate(r.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setActiveReview(r)}
                                                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(r)}
                                                        title="Delete"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            <p className="text-xs text-gray-400">{total} review(s) match this filter</p>

            <ReviewDetailsModal
                open={Boolean(activeReview)}
                review={activeReview}
                busy={actionBusy}
                onClose={() => setActiveReview(null)}
                onDecide={handleDecide}
                onDelete={(r) => setDeleteTarget(r)}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this review?"
                message={
                    deleteTarget
                        ? `This review by "${deleteTarget.user?.name || "Demo Customer"}" will be permanently removed. If it was approved, the product's rating will be recalculated. This cannot be undone.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default ReviewManagement;
