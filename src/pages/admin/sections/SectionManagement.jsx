// src/pages/admin/sections/SectionManagement.jsx
import { useCallback, useEffect, useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import sectionApi from "../../../api/sectionApi";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import SectionFormModal from "../../../components/admin/sections/SectionFormModal";
import { sortSummary } from "../../../components/admin/sections/sectionConstants";

const SectionManagement = () => {
    const [sections, setSections] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // section being edited, or null for "add"
    const [togglingId, setTogglingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await sectionApi.getAll({ page, limit: 10 });
            setSections(data.sections || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load sections");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    const openAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (section) => {
        setEditing(section);
        setModalOpen(true);
    };

    const handleSaved = () => {
        setModalOpen(false);
        setEditing(null);
        load(); // reload so matchedProducts count + ordering reflect the change
    };

    const handleToggle = async (section) => {
        setTogglingId(section._id);
        try {
            const { data } = await sectionApi.toggle(section._id);
            setSections((prev) =>
                prev.map((s) =>
                    s._id === section._id ? { ...s, isActive: data.section.isActive } : s,
                ),
            );
            toast.success(data.section.isActive ? "Section activated" : "Section deactivated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update section");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await sectionApi.remove(deleteTarget._id);
            toast.success("Section deleted");
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete section");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Product Sections</h1>
                    <p className="text-sm text-gray-500">
                        Manage dynamic product sections for your homepage
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    Add Section
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Section</th>
                                <th className="px-4 py-3">Attribute</th>
                                <th className="px-4 py-3">Products</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Order</th>
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
                            ) : sections.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <LayoutGrid
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />
                                        No sections yet
                                    </td>
                                </tr>
                            ) : (
                                sections.map((s) => (
                                    <tr key={s._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{s.title}</p>
                                            {s.description && (
                                                <p className="max-w-70 truncate text-xs text-gray-400">
                                                    {s.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-gray-700">
                                                {s.attributeKey} = {s.attributeValue}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900">
                                                {s.matchedProducts ?? 0} products
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {sortSummary(s.sortBy, s.sortOrder)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    s.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {s.isActive ? "Active" : "Inactive"}
                                            </span>
                                            {!s.showInHomepage && (
                                                <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                                                    Hidden
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {s.displayOrder}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(s)}
                                                    disabled={togglingId === s._id}
                                                    className="text-gray-600 hover:underline disabled:opacity-50"
                                                >
                                                    {s.isActive ? "Deactivate" : "Activate"}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(s)}
                                                    className="text-red-600 hover:underline"
                                                >
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
            <p className="text-xs text-gray-400">{total} total section(s)</p>

            <SectionFormModal
                open={modalOpen}
                section={editing}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this section?"
                message={
                    deleteTarget
                        ? `"${deleteTarget.title}" will be removed from the homepage. The products themselves are not affected. This cannot be undone.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default SectionManagement;
