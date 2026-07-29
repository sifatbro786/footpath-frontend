// src/pages/admin/pageMeta/PageMetaManagement.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Plus,
    RefreshCw,
    FileText,
    CheckCircle2,
    XCircle,
    Pencil,
    Trash2,
    Power,
    ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import pageMetaApi from "../../../api/pageMetaApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import PageMetaFormModal from "../../../components/admin/pageMeta/PageMetaFormModal";
import { statusMeta } from "../../../components/admin/pageMeta/pageMetaConstants";

const StatCard = ({ label, value, icon: Icon, tone = "gray" }) => {
    const toneCls = { gray: "text-gray-900", green: "text-green-600", red: "text-red-600" }[tone];
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

const PageMetaManagement = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // getAllPageMeta returns EVERYTHING (no server pagination). SEO pages are a
    // small, bounded set (one per storefront page), so we fetch once and do all
    // filtering client-side.
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await pageMetaApi.getAll();
            setPages(data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load page meta");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const stats = useMemo(() => {
        const total = pages.length;
        const active = pages.filter((p) => p.isActive).length;
        return { total, active, inactive: total - active };
    }, [pages]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return pages.filter((p) => {
            if (status === "active" && !p.isActive) return false;
            if (status === "inactive" && p.isActive) return false;
            if (!q) return true;
            return (
                p.pageName?.toLowerCase().includes(q) ||
                p.pageSlug?.toLowerCase().includes(q) ||
                p.metaTitle?.toLowerCase().includes(q)
            );
        });
    }, [pages, status, search]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const openEdit = (p) => {
        setEditing(p);
        setModalOpen(true);
    };

    const handleSaved = () => {
        setModalOpen(false);
        setEditing(null);
        load();
    };

    const handleToggle = async (p) => {
        setTogglingId(p._id);
        setPages((prev) =>
            prev.map((x) => (x._id === p._id ? { ...x, isActive: !x.isActive } : x)),
        );
        try {
            const { data } = await pageMetaApi.toggle(p._id);
            setPages((prev) => prev.map((x) => (x._id === p._id ? data.data : x)));
        } catch (err) {
            setPages((prev) =>
                prev.map((x) => (x._id === p._id ? { ...x, isActive: p.isActive } : x)),
            );
            toast.error(err.response?.data?.message || "Failed to toggle status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await pageMetaApi.remove(deleteTarget._id);
            toast.success("Page meta deleted");
            setPages((prev) => prev.filter((x) => x._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeleting(false);
        }
    };

    const kwCount = (str) =>
        str
            ? str
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean).length
            : 0;

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Page Meta / SEO</h1>
                    <p className="text-sm text-gray-500">
                        Manage per-page SEO metadata served to search crawlers
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    Create Page Meta
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total Pages" value={stats.total} icon={FileText} />
                <StatCard label="Active" value={stats.active} icon={CheckCircle2} tone="green" />
                <StatCard label="Inactive" value={stats.inactive} icon={XCircle} tone="red" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by page, slug or title…"
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
                        onClick={load}
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
                    <h2 className="text-sm font-semibold text-gray-900">All Pages</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Page</th>
                                <th className="px-4 py-3">Meta Title</th>
                                <th className="px-4 py-3">Canonical</th>
                                <th className="px-4 py-3">Keywords</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-gray-400"
                                    >
                                        Loading…
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <FileText
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />
                                        {pages.length === 0
                                            ? "No page meta created yet"
                                            : "No pages match this filter"}
                                        {pages.length === 0 && (
                                            <div>
                                                <button
                                                    onClick={openCreate}
                                                    className="mt-2 text-sm font-medium text-gray-700 underline hover:text-gray-900"
                                                >
                                                    Create your first page meta
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => {
                                    const sMeta = statusMeta(p.isActive);
                                    return (
                                        <tr key={p._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">
                                                    {p.pageName}
                                                </p>
                                                <code className="text-xs text-gray-400">
                                                    /{p.pageSlug}
                                                </code>
                                            </td>
                                            <td className="max-w-56 truncate px-4 py-3 text-gray-600">
                                                {p.metaTitle}
                                            </td>
                                            <td className="px-4 py-3">
                                                <a
                                                    href={p.canonicalUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex max-w-44 items-center gap-1 truncate text-emerald-700 hover:underline"
                                                    title={p.canonicalUrl}
                                                >
                                                    <ExternalLink size={12} className="shrink-0" />
                                                    <span className="truncate">
                                                        {p.canonicalUrl}
                                                    </span>
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {kwCount(p.metaKeywords)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sMeta.badge}`}
                                                >
                                                    {sMeta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggle(p)}
                                                        disabled={togglingId === p._id}
                                                        title={
                                                            p.isActive ? "Deactivate" : "Activate"
                                                        }
                                                        className={`rounded-md border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                                                            p.isActive
                                                                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                : "border-green-300 text-green-700 hover:bg-green-50"
                                                        }`}
                                                    >
                                                        <Power size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(p)}
                                                        title="Edit"
                                                        className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(p)}
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
            </div>
            <p className="text-xs text-gray-400">
                {filtered.length} of {pages.length} page(s) shown
            </p>

            <PageMetaFormModal
                open={modalOpen}
                page={editing}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this page meta?"
                message={
                    deleteTarget
                        ? `SEO metadata for "${deleteTarget.pageName}" (/${deleteTarget.pageSlug}) will be permanently removed. The storefront will fall back to default meta for this page. This cannot be undone.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default PageMetaManagement;
