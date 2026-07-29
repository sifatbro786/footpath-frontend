// src/pages/admin/category/CategoriesManagement.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import categoryApi, { getCategoryError } from "../../../api/categoryApi";
import CategoryTable from "../../../components/admin/category/CategoryTable";
import ConfirmDialog from "../../../components/admin/category/ConfirmDialog";

// --- tree helpers -----------------------------------------------------------
const collectParentIds = (nodes, acc = new Set()) => {
    nodes.forEach((n) => {
        if (n.children?.length) {
            acc.add(n._id);
            collectParentIds(n.children, acc);
        }
    });
    return acc;
};

const countNodes = (nodes) => nodes.reduce((sum, n) => sum + 1 + countNodes(n.children || []), 0);

// Keep a node if it matches, or if any descendant matches (ancestors preserved).
const filterTree = (nodes, term) => {
    const q = term.trim().toLowerCase();
    if (!q) return nodes;
    const match = (n) =>
        n.name?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.slug?.toLowerCase().includes(q);

    return nodes.reduce((out, n) => {
        const kids = filterTree(n.children || [], term);
        if (match(n) || kids.length) out.push({ ...n, children: kids });
        return out;
    }, []);
};
// ---------------------------------------------------------------------------

const CategoriesManagement = () => {
    const navigate = useNavigate();
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState(new Set());
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await categoryApi.getTree();
            setTree(data);
        } catch (err) {
            toast.error(getCategoryError(err, "Failed to load categories"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const visibleTree = useMemo(() => filterTree(tree, search), [tree, search]);
    const total = useMemo(() => countNodes(tree), [tree]);

    // While searching, auto-expand so matched descendants are visible.
    useEffect(() => {
        if (search.trim()) setExpanded(collectParentIds(visibleTree));
    }, [search, visibleTree]);

    const toggle = (id) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const expandAll = () => setExpanded(collectParentIds(tree));
    const collapseAll = () => setExpanded(new Set());

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await categoryApi.remove(deleteTarget._id);
            toast.success(`"${deleteTarget.name}" deleted`);
            setDeleteTarget(null);
            await load();
        } catch (err) {
            // Backend returns 400 "Cannot delete category with subcategories"
            toast.error(getCategoryError(err, "Failed to delete category"));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage product categories and hierarchy for your store.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/categories/new")}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {/* Card */}
            <div className="rounded-lg border border-gray-200 bg-white">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
                    <div className="relative min-w-0 flex-1">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories by name or description…"
                            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">
                            Total: <span className="font-semibold text-gray-900">{total}</span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={expandAll}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Expand All
                        </button>
                        <button
                            onClick={collapseAll}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Collapse All
                        </button>
                    </div>
                </div>

                <CategoryTable
                    tree={visibleTree}
                    loading={loading}
                    expanded={expanded}
                    onToggle={toggle}
                    onEdit={(node) => navigate(`/admin/categories/${node._id}/edit`)}
                    onDelete={(node) => setDeleteTarget(node)}
                    onCreate={() => navigate("/admin/categories/new")}
                />
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete category?"
                message={
                    deleteTarget
                        ? `"${deleteTarget.name}" will be permanently removed. Categories with subcategories cannot be deleted.`
                        : ""
                }
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default CategoriesManagement;
