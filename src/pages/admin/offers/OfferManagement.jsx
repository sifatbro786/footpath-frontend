// src/pages/admin/offers/OfferManagement.jsx
import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    RefreshCw,
    Megaphone,
    CheckCircle2,
    XCircle,
    Pencil,
    Trash2,
    ExternalLink,
    ImageOff,
    Power,
} from "lucide-react";
import toast from "react-hot-toast";
import offerPopupApi from "../../../api/offerPopupApi";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import OfferFormModal from "../../../components/admin/offers/OfferFormModal";
import {
    frequencyMeta,
    scheduleState,
    statusMeta,
} from "../../../components/admin/offers/offerConstants";

const PAGE_SIZE = 10;

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "—";

const StatCard = ({ label, value, icon: Icon, tone = "gray" }) => {
    const toneCls = {
        gray: "text-gray-900",
        green: "text-green-600",
        red: "text-red-600",
    }[tone];
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                {Icon && <Icon size={14} />}
                {label}
            </div>
            <p className={`mt-2 text-2xl font-bold ${toneCls}`}>{value}</p>
        </div>
    );
};

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // debounced value actually sent

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // Debounce search input -> searchTerm
    useEffect(() => {
        const t = setTimeout(() => setSearchTerm(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [status, searchTerm]);

    const loadStats = useCallback(async () => {
        try {
            // Two cheap count-only reads (limit=1, read pagination.total).
            // There is no dedicated stats endpoint on the backend, so we derive:
            //   total    = unfiltered count
            //   active   = status=active count
            //   inactive = total - active
            const [all, active] = await Promise.all([
                offerPopupApi.getAll({ page: 1, limit: 1 }),
                offerPopupApi.getAll({ page: 1, limit: 1, status: "active" }),
            ]);
            const totalCount = all.data.pagination?.total ?? 0;
            const activeCount = active.data.pagination?.total ?? 0;
            setStats({
                total: totalCount,
                active: activeCount,
                inactive: Math.max(0, totalCount - activeCount),
            });
        } catch {
            // Stats are secondary — silently ignore, the list still loads.
        }
    }, []);

    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await offerPopupApi.getAll({
                page,
                limit: PAGE_SIZE,
                status: status !== "all" ? status : undefined,
                search: searchTerm || undefined,
            });
            setOffers(data.data || []);
            setTotal(data.pagination?.total ?? 0);
            setTotalPages(data.pagination?.pages ?? 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load offers");
        } finally {
            setLoading(false);
        }
    }, [page, status, searchTerm]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const refresh = () => {
        loadList();
        loadStats();
    };

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const openEdit = (offer) => {
        setEditing(offer);
        setModalOpen(true);
    };

    const handleSaved = () => {
        setModalOpen(false);
        setEditing(null);
        refresh();
    };

    const handleToggle = async (offer) => {
        setTogglingId(offer._id);
        // Optimistic flip
        setOffers((prev) =>
            prev.map((o) => (o._id === offer._id ? { ...o, isActive: !o.isActive } : o)),
        );
        try {
            const { data } = await offerPopupApi.toggle(offer._id);
            setOffers((prev) => prev.map((o) => (o._id === offer._id ? data.data : o)));
            loadStats();
        } catch (err) {
            // Roll back on failure
            setOffers((prev) =>
                prev.map((o) => (o._id === offer._id ? { ...o, isActive: offer.isActive } : o)),
            );
            toast.error(err.response?.data?.message || "Failed to toggle status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await offerPopupApi.remove(deleteTarget._id);
            toast.success("Offer deleted");
            setDeleteTarget(null);
            // If we just removed the last row on a page > 1, step back a page.
            if (offers.length === 1 && page > 1) setPage((p) => p - 1);
            else refresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete offer");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Popup Offer Manager</h1>
                    <p className="text-sm text-gray-500">
                        Create and manage promotional popup offers
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    Create New Offer
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total Offers" value={stats.total} icon={Megaphone} />
                <StatCard
                    label="Active Offers"
                    value={stats.active}
                    icon={CheckCircle2}
                    tone="green"
                />
                <StatCard
                    label="Inactive Offers"
                    value={stats.inactive}
                    icon={XCircle}
                    tone="red"
                />
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title…"
                    className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">All Offers</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Offer</th>
                                <th className="px-4 py-3">Link</th>
                                <th className="px-4 py-3">Frequency</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Schedule</th>
                                <th className="px-4 py-3">Status</th>
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
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <Megaphone
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />
                                        No offers created yet
                                        <div>
                                            <button
                                                onClick={openCreate}
                                                className="mt-2 text-sm font-medium text-gray-700 underline hover:text-gray-900"
                                            >
                                                Create your first offer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                offers.map((o) => {
                                    const sMeta = statusMeta(o.isActive);
                                    const sched = scheduleState(o);
                                    const freq = frequencyMeta(o.displayFrequency);
                                    return (
                                        <tr key={o._id} className="hover:bg-gray-50">
                                            {/* Offer (thumb + title + desc) */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {o.thumbnailImage ? (
                                                        <img
                                                            src={o.thumbnailImage}
                                                            alt=""
                                                            className="h-10 w-10 shrink-0 rounded object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-300">
                                                            <ImageOff size={16} />
                                                        </span>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-gray-900">
                                                            {o.title}
                                                        </p>
                                                        <p className="max-w-56 truncate text-xs text-gray-400">
                                                            {o.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Link */}
                                            <td className="px-4 py-3">
                                                <span className="inline-flex max-w-40 items-center gap-1 truncate text-gray-600">
                                                    <ExternalLink
                                                        size={12}
                                                        className="shrink-0 text-gray-400"
                                                    />
                                                    <span className="truncate">{o.buttonLink}</span>
                                                </span>
                                            </td>
                                            {/* Frequency */}
                                            <td className="px-4 py-3 text-gray-600">
                                                {freq.label}
                                            </td>
                                            {/* Priority */}
                                            <td className="px-4 py-3 text-gray-600">
                                                {o.priority}
                                            </td>
                                            {/* Schedule */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">
                                                        {fmtDate(o.startDate)} →{" "}
                                                        {o.endDate ? fmtDate(o.endDate) : "∞"}
                                                    </span>
                                                    {sched && (
                                                        <span
                                                            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${sched.badge}`}
                                                        >
                                                            {sched.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sMeta.badge}`}
                                                >
                                                    {sMeta.label}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggle(o)}
                                                        disabled={togglingId === o._id}
                                                        title={
                                                            o.isActive ? "Deactivate" : "Activate"
                                                        }
                                                        className={`rounded-md border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                                                            o.isActive
                                                                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                : "border-green-300 text-green-700 hover:bg-green-50"
                                                        }`}
                                                    >
                                                        <Power size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(o)}
                                                        title="Edit"
                                                        className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(o)}
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
            <p className="text-xs text-gray-400">{total} offer(s) match this filter</p>

            {/* Create / Edit modal */}
            <OfferFormModal
                open={modalOpen}
                offer={editing}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSaved={handleSaved}
            />

            {/* Delete confirm */}
            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this offer?"
                message={
                    deleteTarget
                        ? `"${deleteTarget.title}" will be permanently removed and will no longer appear on the storefront. This cannot be undone.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default OfferManagement;
