// src/pages/admin/products/ProductManagement.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2, Boxes } from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "../../../api/productApi";
import categoryApi from "../../../api/categoryApi";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import StockAdjustModal from "../../../components/admin/products/StockAdjustModal";
import { formatPrice } from "../../../components/admin/products/productPricing";

// Supported by GET /admin/products/dashboard (see controller switch):
// displayOrder | purchaseCount | viewCount | name | price | newest.
const SORT_OPTIONS = [
    { label: "Display Order (low → high)", sortBy: "displayOrder", sortOrder: "asc" },
    { label: "Display Order (high → low)", sortBy: "displayOrder", sortOrder: "desc" },
    { label: "Most Purchased", sortBy: "purchaseCount", sortOrder: "desc" },
    { label: "Most Viewed", sortBy: "viewCount", sortOrder: "desc" },
    { label: "Name (A → Z)", sortBy: "name", sortOrder: "asc" },
    { label: "Name (Z → A)", sortBy: "name", sortOrder: "desc" },
    { label: "Price (low → high)", sortBy: "price", sortOrder: "asc" },
    { label: "Price (high → low)", sortBy: "price", sortOrder: "desc" },
    { label: "Newest", sortBy: "newest", sortOrder: "desc" },
];

const flattenCats = (nodes, depth = 0, acc = []) => {
    nodes.forEach((n) => {
        acc.push({ _id: n._id, name: n.name, depth });
        if (n.children?.length) flattenCats(n.children, depth + 1, acc);
    });
    return acc;
};

const StatusBadge = ({ active }) => (
    <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
    >
        {active ? "Active" : "Inactive"}
    </span>
);

const ProductManagement = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sortIndex, setSortIndex] = useState(0);
    const [categories, setCategories] = useState([]);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [stockTarget, setStockTarget] = useState(null);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        categoryApi
            .getTree()
            .then(({ data }) => setCategories(flattenCats(data)))
            .catch(() => {});
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { sortBy, sortOrder } = SORT_OPTIONS[sortIndex];
            const { data } = await productApi.getAdminList({
                page,
                limit: 20,
                search: debouncedSearch || undefined,
                category: category || undefined,
                sortBy,
                sortOrder,
            });
            setProducts(data.products || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, category, sortIndex]);

    useEffect(() => {
        load();
    }, [load]);

    // reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, category, sortIndex]);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await productApi.remove(deleteTarget._id);
            toast.success(`"${deleteTarget.name}" deleted`);
            setDeleteTarget(null);
            // if last row on the page, step back a page
            if (products.length === 1 && page > 1) setPage((p) => p - 1);
            else load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete product");
        } finally {
            setDeleting(false);
        }
    };

    const imgOf = (p) => p.imageGroups?.[0]?.images?.[0]?.url || null;

    const rows = useMemo(() => products, [products]);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Create, update, delete your products.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/products/new")}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} /> Add New Product
                </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-900">
                        Products <span className="text-gray-400">({total})</span>
                    </p>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filter by name or SKU…"
                                className="w-56 rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {`${"\u2014 ".repeat(c.depth)}${c.name}`}
                                </option>
                            ))}
                        </select>
                        <select
                            value={sortIndex}
                            onChange={(e) => setSortIndex(Number(e.target.value))}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            {SORT_OPTIONS.map((s, i) => (
                                <option key={i} value={i}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
                        <p className="mt-3 text-sm">Loading products…</p>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Boxes size={40} className="text-gray-300" />
                        <p className="mt-3 text-base font-semibold text-gray-900">
                            No products found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Try adjusting filters, or add your first product.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-205 border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Inventory</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((p) => (
                                    <tr
                                        key={p._id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {imgOf(p) ? (
                                                    <img
                                                        src={imgOf(p)}
                                                        alt={p.name}
                                                        className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 shrink-0 rounded-md border border-gray-200 bg-gray-100" />
                                                )}
                                                <div className="min-w-0">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/admin/products/${p._id}`)
                                                        }
                                                        className="block max-w-70 truncate text-left text-sm font-medium text-blue-600 hover:underline"
                                                    >
                                                        {p.name}
                                                    </button>
                                                    {p.sku && (
                                                        <p className="text-xs text-gray-400">
                                                            SKU: {p.sku}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge active={p.isActive} />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {p.stock} in stock
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {formatPrice(p.price)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {p.category?.name || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setStockTarget(p)}
                                                    className="text-xs font-medium text-gray-500 hover:text-gray-900"
                                                    title="Adjust stock"
                                                >
                                                    Stock
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/products/${p._id}`)
                                                    }
                                                    className="text-gray-400 hover:text-blue-600"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/products/${p._id}/edit`)
                                                    }
                                                    className="text-gray-400 hover:text-gray-900"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(p)}
                                                    className="text-gray-400 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete product?"
                message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed.` : ""}
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <StockAdjustModal
                open={!!stockTarget}
                product={stockTarget}
                onClose={() => setStockTarget(null)}
                onSaved={() => load()}
            />
        </div>
    );
};

export default ProductManagement;
